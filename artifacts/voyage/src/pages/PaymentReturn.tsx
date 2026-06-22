/**
 * /payment/success — Landing page after returning from YooKassa.
 *
 * Full flow:
 *  1. Read session_id from URL (injected by server into return_url).
 *  2. Wait for auth session to be ready.
 *  3. Poll GET /api/payment/status?session_id=… every 3 s up to 10 times.
 *  4. On "succeeded":
 *       a) Mark user premium (server already did it; refresh client state)
 *       b) Restore ALL trip params from localStorage into PlanContext
 *       c) Call POST /api/voyage/plan-async → get jobId
 *       d) Show "Оплата прошла успешно. Генерируем ваш маршрут…" UI
 *       e) Poll job until done → setResult → navigate to /results
 *       f) Clear localStorage AFTER route is saved to context
 *       g) On generation error: keep params, show retry
 *  5. On "canceled": keep params, navigate to /paywall
 *  6. On timeout: manual-retry UI
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, CheckCircle2, XCircle, Loader2, Plane,
  RefreshCw, AlertCircle, MapPin,
} from 'lucide-react';
import { usePlanContext, STORAGE, type VoyagePlanResult, type SavedTripParams } from '@/lib/plan-context';
import { useAuth } from '@/lib/auth-context';

// ── Types ─────────────────────────────────────────────────────────────────────
type Phase =
  | 'waiting_auth'     // waiting for useAuth to resolve
  | 'checking_payment' // polling YooKassa status
  | 'generating'       // route generation in progress
  | 'succeeded'        // navigating to /results
  | 'canceled'         // payment canceled → back to paywall
  | 'payment_timeout'  // payment check exhausted
  | 'gen_error';       // route generation failed

interface StatusResponse {
  status?: string;
  isPremium?: boolean;
  isCanceled?: boolean;
  isSucceeded?: boolean;
  isPending?: boolean;
  error?: string;
}

interface JobResponse {
  status: string;
  result?: Record<string, unknown>;
  message?: string;
}

// ── LocalStorage helpers ──────────────────────────────────────────────────────
function lsRead<T>(key: string): T | null {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) as T : null; }
  catch { return null; }
}
function lsClear(...keys: string[]) {
  try { keys.forEach(k => localStorage.removeItem(k)); } catch { /* ignore */ }
}
function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem('voyage_auth');
    return stored ? (JSON.parse(stored) as { token?: string }).token ?? null : null;
  } catch { return null; }
}

// ── Context restore ───────────────────────────────────────────────────────────
function restoreParamsIntoContext(ctx: ReturnType<typeof usePlanContext>, params: SavedTripParams) {
  if (params.language) ctx.setLanguage(params.language);
  ctx.setDestination(params.destination ?? '');
  ctx.setCity(params.city ?? '');
  ctx.setTravelLevel(params.travelLevel ?? '');
  ctx.setTripTypes(params.tripTypes ?? []);
  ctx.setHotelPrefs(params.hotelPrefs ?? []);
  ctx.setRestaurantPrefs(params.restaurantPrefs ?? []);
  ctx.setDuration(params.duration ?? '');
  ctx.setBudget(params.budget ?? '');
  ctx.setGuests(params.guests ?? '2');
  ctx.setRooms(params.rooms ?? '1');
  ctx.setRoomType(params.roomType ?? 'standard');
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PaymentReturn() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const ctx = usePlanContext();
  const { user, loading: authLoading, refreshPremiumStatus } = useAuth();

  const urlParams = new URLSearchParams(search);
  const sessionId = urlParams.get('session_id') ?? lsRead<string>(STORAGE.sessionId) ?? '';
  const paymentId = urlParams.get('payment_id') ?? lsRead<string>(STORAGE.paymentId) ?? '';

  // Read saved language early so even the loading copy is in the right language
  const savedParams = lsRead<SavedTripParams>(STORAGE.tripParams);
  const lang = savedParams?.language ?? ctx.language ?? 'ru';

  const [phase, setPhase] = useState<Phase>('waiting_auth');
  const [payAttempt, setPayAttempt] = useState(0);
  const [genProgress, setGenProgress] = useState(0); // cosmetic 0-100
  const [genError, setGenError] = useState('');

  const cancelled = useRef(false);
  const hasFired = useRef(false);

  // ── Step 1: wait for auth to settle ─────────────────────────────────────────
  useEffect(() => {
    if (!authLoading && phase === 'waiting_auth') {
      setPhase('checking_payment');
    }
  }, [authLoading, phase]);

  // ── Step 2: poll payment status ──────────────────────────────────────────────
  const startPaymentCheck = useCallback(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    cancelled.current = false;

    const MAX = 10;
    let attempt = 0;

    const buildQuery = () => {
      if (sessionId) return `session_id=${encodeURIComponent(sessionId)}`;
      if (paymentId) return `payment_id=${encodeURIComponent(paymentId)}`;
      return '';
    };

    const tick = async () => {
      if (cancelled.current) return;
      const q = buildQuery();
      const url = q ? `/api/payment/status?${q}` : '/api/payment/status';

      try {
        const res = await fetch(url, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json() as StatusResponse;
          if (data.isSucceeded || data.status === 'succeeded' || data.isPremium) {
            if (!cancelled.current) setPhase('generating');
            return;
          }
          if (data.isCanceled || data.status === 'canceled') {
            if (!cancelled.current) setPhase('canceled');
            return;
          }
        }
      } catch { /* ignore */ }

      attempt++;
      if (!cancelled.current) setPayAttempt(attempt);
      if (attempt >= MAX) { if (!cancelled.current) setPhase('payment_timeout'); return; }
      if (!cancelled.current) setTimeout(tick, 3000);
    };

    tick();
  }, [sessionId, paymentId]);

  useEffect(() => {
    if (phase === 'checking_payment') startPaymentCheck();
  }, [phase, startPaymentCheck]);

  // ── Step 3: generate route ───────────────────────────────────────────────────
  const runGeneration = useCallback(async () => {
    if (cancelled.current) return;

    // Refresh premium flag in auth context
    refreshPremiumStatus().catch(() => {});

    // Restore trip params into context
    const params = lsRead<SavedTripParams>(STORAGE.tripParams);
    if (params) restoreParamsIntoContext(ctx, params);

    const body = {
      destination: params?.destination ?? ctx.destination,
      city: params?.city ?? ctx.city ?? undefined,
      travelLevel: params?.travelLevel ?? ctx.travelLevel,
      tripTypes: params?.tripTypes ?? ctx.tripTypes,
      hotelPrefs: params?.hotelPrefs ?? ctx.hotelPrefs,
      restaurantPrefs: params?.restaurantPrefs ?? ctx.restaurantPrefs,
      duration: params?.duration ?? ctx.duration,
      budget: params?.budget ?? ctx.budget,
      language: params?.language ?? ctx.language ?? 'ru',
      guests: params?.guests ?? ctx.guests ?? '2',
      rooms: params?.rooms ?? ctx.rooms ?? '1',
      roomType: params?.roomType ?? ctx.roomType ?? 'standard',
    };

    // Cosmetic progress animation
    const progressInterval = setInterval(() => {
      setGenProgress(p => (p < 85 ? p + Math.random() * 4 : p));
    }, 800);

    // 60-second safety timeout
    const safetyTimer = setTimeout(() => {
      clearInterval(progressInterval);
      if (!cancelled.current) {
        setGenError(lang === 'ru' ? 'Превышено время ожидания. Попробуйте ещё раз.' : 'Generation timed out. Please retry.');
        setPhase('gen_error');
      }
    }, 60000);

    try {
      const token = getAuthToken();
      const startRes = await fetch('/api/voyage/plan-async', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!startRes.ok) throw new Error(`HTTP ${startRes.status}`);
      const { jobId } = await startRes.json() as { jobId: string };

      // Poll job
      const pollJob = () => {
        if (cancelled.current) return;
        fetch(`/api/voyage/job/${jobId}`)
          .then(r => r.ok ? r.json() as Promise<JobResponse> : null)
          .then(job => {
            if (!job || cancelled.current) return;
            if (job.status === 'done' && job.result) {
              clearInterval(progressInterval);
              clearTimeout(safetyTimer);
              setGenProgress(100);
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ctx.setResult(job.result as any);
              lsClear(STORAGE.tripParams, STORAGE.generatedRoute, STORAGE.sessionId, STORAGE.paymentId);
              if (!cancelled.current) {
                setPhase('succeeded');
                setTimeout(() => { if (!cancelled.current) setLocation('/results'); }, 900);
              }
            } else if (job.status === 'error') {
              clearInterval(progressInterval);
              clearTimeout(safetyTimer);
              if (!cancelled.current) {
                setGenError(job.message ?? (lang === 'ru' ? 'Ошибка генерации маршрута.' : 'Route generation failed.'));
                setPhase('gen_error');
              }
            } else {
              setTimeout(pollJob, 3000);
            }
          })
          .catch(() => { if (!cancelled.current) setTimeout(pollJob, 3000); });
      };

      setTimeout(pollJob, 3000);
    } catch (err) {
      clearInterval(progressInterval);
      clearTimeout(safetyTimer);
      if (!cancelled.current) {
        setGenError(lang === 'ru' ? 'Не удалось запустить генерацию маршрута.' : 'Could not start route generation.');
        setPhase('gen_error');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  useEffect(() => {
    if (phase === 'generating') runGeneration();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ── Step 4: handle terminal phases ───────────────────────────────────────────
  useEffect(() => {
    if (phase === 'canceled') {
      // Restore params so paywall can show destination, then go back
      const params = lsRead<SavedTripParams>(STORAGE.tripParams);
      if (params) restoreParamsIntoContext(ctx, params);
      setTimeout(() => { if (!cancelled.current) setLocation('/paywall'); }, 1200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => () => { cancelled.current = true; }, []);

  // ── Retry payment check ───────────────────────────────────────────────────────
  const retryPaymentCheck = () => {
    hasFired.current = false;
    setPayAttempt(0);
    setPhase('checking_payment');
  };

  // ── Retry generation ──────────────────────────────────────────────────────────
  const retryGeneration = () => {
    setGenProgress(0);
    setGenError('');
    setPhase('generating');
  };

  // ── UI copy ───────────────────────────────────────────────────────────────────
  const copy = {
    waitingAuth:   lang === 'ru' ? 'Инициализация…'                              : 'Initializing…',
    checkingPay:   lang === 'ru' ? 'Проверяем статус платежа…'                   : 'Checking payment status…',
    checkSub:      lang === 'ru' ? `Попытка ${payAttempt + 1} из 10`             : `Attempt ${payAttempt + 1} of 10`,
    paySuccess:    lang === 'ru' ? 'Оплата прошла успешно'                        : 'Payment successful',
    generating:    lang === 'ru' ? 'Генерируем ваш маршрут…'                     : 'Generating your itinerary…',
    genSub:        lang === 'ru' ? 'Это займёт около 30 секунд'                  : 'This takes about 30 seconds',
    done:          lang === 'ru' ? 'Маршрут готов! Открываем…'                   : 'Itinerary ready! Opening…',
    canceled:      lang === 'ru' ? 'Платёж отменён'                              : 'Payment cancelled',
    cancelSub:     lang === 'ru' ? 'Возвращаемся к оплате…'                      : 'Returning to payment…',
    timeout:       lang === 'ru' ? 'Платёж ещё обрабатывается'                   : 'Payment still processing',
    timeoutSub:    lang === 'ru' ? 'Банк обрабатывает платёж. Попробуйте снова.' : 'The bank is still processing. Please retry.',
    genError:      lang === 'ru' ? 'Оплата прошла успешно, но маршрут не удалось создать.' : 'Payment successful, but route generation failed.',
    genRetry:      lang === 'ru' ? 'Попробовать снова'                           : 'Try again',
    retryCheck:    lang === 'ru' ? 'Проверить снова'                             : 'Check again',
    backToPay:     lang === 'ru' ? 'Вернуться к оплате'                          : 'Back to payment',
    openRoute:     lang === 'ru' ? 'Открыть маршрут'                             : 'Open itinerary',
  };

  const isLoading = phase === 'waiting_auth' || phase === 'checking_payment' || phase === 'generating' || phase === 'succeeded';
  const isCanceled = phase === 'canceled';
  const isPayTimeout = phase === 'payment_timeout';
  const isGenError = phase === 'gen_error';
  const isGenerating = phase === 'generating' || phase === 'succeeded';

  // Destination for display
  const dest = savedParams?.city || savedParams?.destination || ctx.city || ctx.destination || '';

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center relative overflow-hidden px-4 py-16">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-20%,rgba(212,175,55,0.10),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_80%,rgba(212,175,55,0.04),transparent)]" />
      <div className="pointer-events-none absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center text-center">

        {/* ── Icon area ── */}
        <motion.div
          key={phase}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 relative"
        >
          {isLoading && (
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                {isGenerating ? (
                  <MapPin className="w-10 h-10 text-primary" />
                ) : (
                  <Crown className="w-10 h-10 text-primary" />
                )}
              </div>
              {/* Spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary/60"
              />
            </div>
          )}
          {(phase === 'succeeded') && (
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </div>
          )}
          {isCanceled && (
            <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-400/80" />
            </div>
          )}
          {(isPayTimeout || isGenError) && (
            <div className="w-24 h-24 rounded-full bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-amber-400/80" />
            </div>
          )}
        </motion.div>

        {/* ── Content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="w-full"
          >

            {/* WAITING / CHECKING PAYMENT */}
            {(phase === 'waiting_auth' || phase === 'checking_payment') && (
              <>
                <h1 className="text-3xl font-serif mb-3">
                  {phase === 'waiting_auth' ? copy.waitingAuth : copy.checkingPay}
                </h1>
                {phase === 'checking_payment' && (
                  <p className="text-sm text-muted-foreground mb-6">{copy.checkSub}</p>
                )}
                {/* Animated dots */}
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  {[0,1,2].map(i => (
                    <motion.span key={i}
                      className="w-2 h-2 rounded-full bg-primary/40"
                      animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1, 0.8] }}
                      transition={{ duration: 1.4, delay: i * 0.3, repeat: Infinity }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* GENERATING */}
            {phase === 'generating' && (
              <>
                <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-primary/70 mb-3 font-medium">
                  {copy.paySuccess}
                </div>
                <h1 className="text-3xl font-serif mb-3">{copy.generating}</h1>
                <p className="text-sm text-muted-foreground mb-6">{copy.genSub}</p>

                {dest && (
                  <p className="text-sm text-primary/80 font-medium mb-6 flex items-center justify-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />{dest}
                  </p>
                )}

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-border/50 rounded-full overflow-hidden mb-6">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full"
                    animate={{ width: `${genProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>

                {/* Status card */}
                <div className="w-full rounded-2xl border border-primary/20 bg-card/50 px-5 py-4 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground/50 uppercase tracking-widest mb-0.5">Voyage AI</p>
                    <p className="text-sm text-foreground/80">
                      {lang === 'ru'
                        ? 'Подбираем отели, активности и маршрут…'
                        : 'Selecting hotels, activities and route…'}
                    </p>
                  </div>
                </div>
              </>
            )}

            {/* SUCCEEDED (brief, then auto-redirect) */}
            {phase === 'succeeded' && (
              <>
                <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-emerald-400 mb-3 font-medium">
                  {copy.paySuccess}
                </div>
                <h1 className="text-3xl font-serif mb-3">{copy.done}</h1>
                <p className="text-sm text-muted-foreground">
                  {lang === 'ru' ? 'Маршрут сгенерирован. Открываем страницу результатов…' : 'Route generated. Opening results…'}
                </p>
              </>
            )}

            {/* CANCELED */}
            {isCanceled && (
              <>
                <h1 className="text-3xl font-serif mb-3">{copy.canceled}</h1>
                <p className="text-sm text-muted-foreground">{copy.cancelSub}</p>
              </>
            )}

            {/* PAYMENT TIMEOUT */}
            {isPayTimeout && (
              <>
                <h1 className="text-3xl font-serif mb-3">{copy.timeout}</h1>
                <p className="text-sm text-muted-foreground mb-6">{copy.timeoutSub}</p>
                <div className="flex flex-col gap-3 w-full">
                  <button type="button" onClick={retryPaymentCheck}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 px-6 rounded-2xl text-sm font-semibold uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />{copy.retryCheck}
                  </button>
                  <button type="button" onClick={() => setLocation('/paywall')}
                    className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copy.backToPay}
                  </button>
                </div>
              </>
            )}

            {/* GENERATION ERROR */}
            {isGenError && (
              <>
                <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-emerald-400 mb-3 font-medium">
                  {copy.paySuccess}
                </div>
                <h1 className="text-2xl font-serif mb-3">{copy.genError}</h1>
                {genError && <p className="text-xs text-muted-foreground/60 mb-5">{genError}</p>}
                <div className="flex flex-col gap-3 w-full">
                  <button type="button" onClick={retryGeneration}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3.5 px-6 rounded-2xl text-sm font-semibold uppercase tracking-widest hover:bg-primary/90 active:scale-95 transition-all shadow-[0_4px_30px_-8px_rgba(212,175,55,0.45)]"
                  >
                    <RefreshCw className="w-4 h-4" />{copy.genRetry}
                  </button>
                  <button type="button" onClick={() => {
                    refreshPremiumStatus().catch(() => {});
                    const params = lsRead<SavedTripParams>(STORAGE.tripParams);
                    if (params) restoreParamsIntoContext(ctx, params);
                    setLocation('/loading');
                  }}
                    className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plane className="w-4 h-4" />
                    {lang === 'ru' ? 'Открыть страницу загрузки' : 'Go to loading page'}
                  </button>
                </div>
              </>
            )}

          </motion.div>
        </AnimatePresence>

        <p className="mt-10 text-xs text-muted-foreground/30 max-w-xs leading-relaxed">
          {lang === 'ru'
            ? 'Если маршрут не открылся — войдите заново. Premium сохранён.'
            : "If the route didn't open — log out and back in. Premium is saved."}
        </p>
      </div>
    </div>
  );
}
