import { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle2, XCircle, Loader2, Mic, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { activatePaid } from "@/lib/store";

type PaymentStatus = "loading" | "paid" | "failed" | "not_found";

function getYkPaymentId(): string | null {
  // Try URL param first (for direct links), then localStorage (stored before redirect)
  try {
    const urlParam = new URLSearchParams(window.location.search).get("yk_payment_id");
    if (urlParam) return urlParam;
    return localStorage.getItem("st_pending_yk_id");
  } catch {
    return null;
  }
}

export default function PaymentReturn() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<PaymentStatus>("loading");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ykPaymentId = getYkPaymentId();

    if (!ykPaymentId) {
      setStatus("not_found");
      return;
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/payments/${encodeURIComponent(ykPaymentId)}/status`);
        if (!res.ok) { setStatus("failed"); return; }
        const data = await res.json() as { status: string };
        if (data.status === "paid") {
          activatePaid();
          try { localStorage.removeItem("st_pending_yk_id"); } catch {}
          setStatus("paid");
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (data.status === "failed") {
          setStatus("failed");
          if (pollRef.current) clearInterval(pollRef.current);
        }
        // else "pending" → keep polling
      } catch {
        // keep polling
      }
    };

    poll();
    pollRef.current = setInterval(poll, 3000);

    const timeout = setTimeout(() => {
      if (pollRef.current) clearInterval(pollRef.current);
      setStatus((s) => (s === "loading" ? "not_found" : s));
    }, 120_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (status !== "paid") return;
    const t = setTimeout(() => setLocation("/scenarios"), 4000);
    return () => clearTimeout(t);
  }, [status, setLocation]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="flex items-center gap-2 text-primary mb-10">
        <Mic className="w-7 h-7" />
        <span className="text-2xl font-bold tracking-tight">SpeakTutor</span>
      </div>

      <div className="bg-card border border-border rounded-3xl p-10 max-w-md w-full text-center shadow-[0_0_60px_-15px_rgba(0,229,255,0.2)]">
        {status === "loading" ? (
          <>
            <Loader2 className="w-14 h-14 text-primary mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold mb-2">Проверяем оплату…</h2>
            <p className="text-muted-foreground text-sm">
              Это займёт несколько секунд. Не закрывайте страницу.
            </p>
          </>
        ) : status === "paid" ? (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-green-500">Оплата успешно получена!</h2>
            <p className="text-foreground font-medium mb-3">Полный доступ активирован.</p>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-6 flex gap-2 text-left">
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-xs text-orange-400 leading-snug">
                Доступ сохранён в этом браузере. При очистке данных браузера или смене устройства
                он может быть утерян. Сохраните подтверждение оплаты от ЮKassa.
              </p>
            </div>
            <p className="text-muted-foreground text-sm mb-6">Переходим к сценариям…</p>
            <Link href="/scenarios">
              <Button className="w-full gap-2 shadow-[0_0_20px_-5px_rgba(0,229,255,0.4)]">
                Начать практику
              </Button>
            </Link>
          </>
        ) : status === "failed" ? (
          <>
            <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2 text-destructive">Оплата не прошла</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Платёж был отклонён или отменён. Попробуйте снова.
            </p>
            <Link href="/scenarios">
              <Button className="w-full">Попробовать снова</Button>
            </Link>
          </>
        ) : (
          <>
            <XCircle className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Платёж не найден</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Если деньги были списаны — свяжитесь с поддержкой:{" "}
              <a href="mailto:facemax1@mail.ru" className="text-primary hover:underline">facemax1@mail.ru</a>
            </p>
            <Link href="/">
              <Button variant="outline" className="w-full">На главную</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
