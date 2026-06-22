import { useState } from "react";
import {
  X, Zap, Lock, CheckCircle2, MessageSquare, ShieldCheck,
  BookOpen, Star, ScrollText, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  variant?: "purchase" | "scenario_done";
  onClose: () => void;
  onActivated?: () => void;
};

const AGREEMENT_TEXT = `Пользователь понимает, что сервис не гарантирует 100% результат обучения, конкретный уровень владения языком, сдачу экзамена, трудоустройство или иной персональный результат.

Пользователь самостоятельно принимает решение об оплате и использовании сервиса, самостоятельно оценивает пригодность сервиса для своих целей и несёт ответственность за своё решение потратить деньги.

Данные пользователя, выбранный уровень, прогресс, лимиты сообщений и статус доступа хранятся локально в браузере (localStorage). При очистке данных браузера, смене устройства или переустановке браузера доступ может быть потерян.

Возврат денежных средств осуществляется только в случаях, предусмотренных применимым законодательством.`;

export function PaywallModal({ open, variant = "purchase", onClose, onActivated: _onActivated }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [agreementExpanded, setAgreementExpanded] = useState(false);

  if (!open) return null;

  const handlePurchase = async () => {
    setLoading(true);
    setError("");
    try {
      const base = import.meta.env.BASE_URL.replace(/\/$/, "");
      const returnUrl = `${window.location.origin}${base}/payment/return`;
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnUrl }),
      });
      const data = await res.json() as { confirmationUrl?: string; yookassaPaymentId?: string; error?: string };
      if (!res.ok || data.error) {
        setError("Не удалось создать платёж. Попробуйте позже.");
        return;
      }
      if (data.yookassaPaymentId) {
        try { localStorage.setItem("st_pending_yk_id", data.yookassaPaymentId); } catch {}
      }
      if (data.confirmationUrl) {
        window.location.href = data.confirmationUrl;
      } else {
        setError("Платёжный сервис временно недоступен. Попробуйте позже.");
      }
    } catch {
      setError("Ошибка соединения. Проверьте интернет и повторите.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full shadow-[0_0_80px_-20px_rgba(0,229,255,0.25)] relative max-h-[90vh] overflow-y-auto">
        <button
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {variant === "scenario_done" ? "Сценарий завершён!" : "Пробный доступ закончился"}
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {variant === "scenario_done"
              ? "Все 6 сообщений в этом сценарии использованы. Выберите другой или оплатите полный доступ."
              : "Вы использовали 3 бесплатных сообщения. Оплатите полный доступ за 1500 ₽."}
          </p>
        </div>

        {/* Plan card */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-5 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-primary">Полный доступ</span>
            <span className="text-2xl font-bold text-primary">1500 ₽</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Что включено:</p>
          <div className="space-y-2">
            {[
              [MessageSquare, "10 сценариев разблокированы"],
              [MessageSquare, "6 AI-сообщений в каждом сценарии"],
              [CheckCircle2,  "Итого 60 сообщений"],
              [CheckCircle2,  "Разбор грамматики и словарного запаса"],
              [BookOpen,      "Три уровня сложности"],
              [Star,          "Немедленный доступ после оплаты"],
            ].map(([Icon, text], i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Icon className="w-3.5 h-3.5 text-primary/70 mt-0.5 shrink-0" />
                {text as string}
              </div>
            ))}
          </div>
        </div>

        {/* localStorage warning */}
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 mb-4 flex gap-2">
          <ScrollText className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-400 leading-snug">
            Доступ хранится в браузере. При очистке данных или смене устройства он может быть потерян.
          </p>
        </div>

        {/* Secure payment badge */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 px-1">
          <ShieldCheck className="w-3.5 h-3.5 text-primary/60 shrink-0" />
          Безопасная оплата через ЮKassa
        </div>

        {/* Пользовательское соглашение — inline accordion */}
        <div className="mb-4 rounded-xl border border-border overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            onClick={() => setAgreementExpanded((v) => !v)}
          >
            <span className="flex items-center gap-2">
              <ScrollText className="w-3.5 h-3.5 text-primary/60" />
              Пользовательское соглашение
            </span>
            {agreementExpanded
              ? <ChevronUp className="w-4 h-4 shrink-0" />
              : <ChevronDown className="w-4 h-4 shrink-0" />
            }
          </button>

          {agreementExpanded && (
            <div className="bg-[#0d1117] px-4 pb-4 pt-2 border-t border-border/40 animate-in slide-in-from-top-2 duration-200">
              {AGREEMENT_TEXT.split("\n\n").map((para, i) => (
                <p key={i} className="text-xs text-muted-foreground leading-relaxed mt-2 first:mt-0">
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Terms checkbox */}
        <label className="flex items-start gap-3 cursor-pointer group mb-4">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              className="sr-only"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              termsAccepted
                ? "bg-primary border-primary"
                : "bg-background/50 border-border group-hover:border-primary/50"
            }`}>
              {termsAccepted && (
                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-muted-foreground leading-snug">
            Я принимаю пользовательское соглашение и понимаю, что прогресс и доступ
            могут храниться локально в браузере.
          </span>
        </label>

        {error && (
          <p className="text-sm text-destructive text-center mb-3">{error}</p>
        )}

        <div className="space-y-2">
          <Button
            className="w-full gap-2 shadow-[0_0_20px_-5px_rgba(0,229,255,0.4)]"
            size="lg"
            disabled={loading || !termsAccepted}
            onClick={handlePurchase}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Перенаправление…
              </span>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Оплатить 1500 ₽
              </>
            )}
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
            Позже
          </Button>
        </div>

        <div className="text-[11px] text-muted-foreground/70 leading-relaxed border-t border-border/50 pt-3 mt-2">
          Пользователь понимает, что результаты обучения зависят от его личной вовлечённости.
          SpeakTutor не гарантирует достижение конкретного уровня знаний.
        </div>
      </div>
    </div>
  );
}
