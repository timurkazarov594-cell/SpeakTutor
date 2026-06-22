import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Mic, ArrowRight, Lock, CheckCircle2, Zap, FileText, ScrollText, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SCENARIOS,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  type Difficulty,
} from "@/lib/scenarios";
import {
  getLevel,
  isPaid,
  getFreeUsed,
  getScenarioMsgsUsed,
  FREE_MESSAGES_LIMIT,
  SCENARIO_MESSAGES_LIMIT,
  getPaidMsgsUsed,
  PAID_MESSAGES_TOTAL,
  type Level,
} from "@/lib/store";
import { PaywallModal } from "@/components/PaywallModal";

const PDF_URL = `${import.meta.env.BASE_URL}offer.pdf`;

const LEVEL_ORDER: Difficulty[] = ["beginner", "intermediate", "advanced"];

export default function Scenarios() {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<string>("all");
  const [paywallOpen, setPaywallOpen] = useState(false);

  const level = getLevel() as Level | null;
  const paid = isPaid();
  const freeUsed = getFreeUsed();
  const paidMsgsUsed = getPaidMsgsUsed();
  const freeRemaining = Math.max(0, FREE_MESSAGES_LIMIT - freeUsed);
  const totalPaidRemaining = Math.max(0, PAID_MESSAGES_TOTAL - paidMsgsUsed);

  const categories = ["all", ...Array.from(new Set(SCENARIOS.map((s) => s.category)))];

  const filtered = SCENARIOS.filter((s) =>
    filter === "all" || s.category === filter
  );

  const grouped = LEVEL_ORDER.map((lvl) => ({
    lvl,
    scenarios: filtered.filter((s) => s.difficulty === lvl),
  })).filter((g) => g.scenarios.length > 0);

  const handleScenarioClick = (scenarioId: string) => {
    if (!paid && freeUsed >= FREE_MESSAGES_LIMIT) {
      setPaywallOpen(true);
      return;
    }
    setLocation(`/session/${scenarioId}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PaywallModal
        open={paywallOpen}
        variant="purchase"
        onClose={() => setPaywallOpen(false)}
        onActivated={() => setPaywallOpen(false)}
      />

      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/50 bg-card/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 text-lg font-bold tracking-tight text-primary cursor-pointer">
              <Mic className="w-5 h-5" />
              SpeakTutor AI
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {/* Status badge */}
            {paid ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Доступно: {totalPaidRemaining} / {PAID_MESSAGES_TOTAL} сообщ.
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-card border border-border rounded-full px-3 py-1">
                Бесплатно: {freeRemaining} / {FREE_MESSAGES_LIMIT} сообщ.
              </div>
            )}
            <Link href="/level">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline capitalize">{DIFFICULTY_LABELS[level ?? "beginner"]}</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* Banner: free trial or paywall notice */}
        {!paid && freeRemaining === 0 ? (
          <div className="bg-primary/10 border border-primary/30 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-foreground">Пробные сообщения закончились</p>
              <p className="text-sm text-muted-foreground mt-0.5">Оплатите доступ, чтобы продолжить практику — 10 сценариев, 6 сообщений каждый</p>
            </div>
            <Button size="sm" className="shrink-0 gap-2" onClick={() => setPaywallOpen(true)}>
              <Zap className="w-4 h-4" />
              Открыть за 1500 ₽
            </Button>
          </div>
        ) : !paid ? (
          <div className="bg-card border border-border rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-foreground">🎁 Бесплатный пробный доступ активен</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Осталось <strong className="text-foreground">{freeRemaining}</strong> из {FREE_MESSAGES_LIMIT} бесплатных AI-сообщений
              </p>
            </div>
            <Button size="sm" variant="outline" className="shrink-0 gap-2" onClick={() => setPaywallOpen(true)}>
              Полный доступ — 1500 ₽
            </Button>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-8 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            <p className="text-sm text-foreground">
              Полный доступ активирован ·{" "}
              <span className="text-muted-foreground">осталось {totalPaidRemaining} из {PAID_MESSAGES_TOTAL} сообщений</span>
            </p>
          </div>
        )}

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Выберите сценарий</h1>
          <p className="text-muted-foreground text-sm">30 реальных ситуаций · Три уровня сложности</p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[cat] ?? cat}
            </button>
          ))}
        </div>

        {/* Scenarios grouped by difficulty */}
        {grouped.map(({ lvl, scenarios }) => (
          <div key={lvl} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-base font-semibold text-muted-foreground uppercase tracking-wider">
                {DIFFICULTY_LABELS[lvl]}
              </h2>
              <div className="flex-1 h-px bg-border" />
              <Badge variant="outline" className={DIFFICULTY_COLORS[lvl] + " text-xs"}>
                {scenarios.length} сценариев
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {scenarios.map((scenario) => {
                const msgsUsed = getScenarioMsgsUsed(scenario.id);
                const msgsLeft = Math.max(0, SCENARIO_MESSAGES_LIMIT - msgsUsed);
                const scenarioDone = paid && msgsUsed >= SCENARIO_MESSAGES_LIMIT;
                const globallyLocked = !paid && freeUsed >= FREE_MESSAGES_LIMIT;

                return (
                  <button
                    key={scenario.id}
                    onClick={() => handleScenarioClick(scenario.id)}
                    className={`group text-left rounded-2xl border-2 p-5 transition-all duration-200 ${
                      scenarioDone
                        ? "border-border bg-card/50 opacity-60 cursor-default"
                        : globallyLocked
                        ? "border-border bg-card/50 cursor-pointer hover:border-primary/30"
                        : "border-border bg-card hover:border-primary/50 hover:bg-card/80 hover:shadow-[0_0_20px_-8px_rgba(0,229,255,0.3)] cursor-pointer"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl leading-none">{scenario.emoji}</span>
                      <div className="flex items-center gap-1.5">
                        {scenarioDone ? (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            Готово
                          </span>
                        ) : globallyLocked ? (
                          <Lock className="w-4 h-4 text-muted-foreground/50" />
                        ) : paid && msgsUsed > 0 ? (
                          <span className="text-xs text-primary font-medium">
                            {msgsLeft} осталось
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 text-foreground leading-snug">{scenario.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{scenario.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        {scenario.durationMinutes} мин
                      </span>
                      {!scenarioDone && !globallyLocked && (
                        <ArrowRight className="w-3.5 h-3.5 text-primary/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Fixed legal buttons */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-1.5">
        <a href={PDF_URL} target="_blank" rel="noreferrer"
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors bg-card/90 backdrop-blur border border-border rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm"
        >
          <FileText className="w-3 h-3" />
          Оферта
        </a>
        <Link href="/user-agreement"
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors bg-card/90 backdrop-blur border border-border rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm"
        >
          <ScrollText className="w-3 h-3" />
          Соглашение
        </Link>
      </div>
    </div>
  );
}
