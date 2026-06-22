import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Mic, ChevronRight, Zap, BookOpen, Star, FileText, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLevel, type Level } from "@/lib/store";

const LEVELS: { id: Level; label: string; sub: string; icon: React.ReactNode; hint: string; color: string }[] = [
  {
    id: "beginner",
    label: "Новичок",
    sub: "Знаю пару слов",
    icon: <BookOpen className="w-8 h-8" />,
    hint: "Простые фразы, много подсказок, медленный темп",
    color: "border-green-500/30 hover:border-green-500 bg-green-500/5 hover:bg-green-500/10",
  },
  {
    id: "intermediate",
    label: "Средний",
    sub: "Могу объясниться",
    icon: <Zap className="w-8 h-8" />,
    hint: "Обычный разговор, исправление ошибок",
    color: "border-orange-500/30 hover:border-orange-500 bg-orange-500/5 hover:bg-orange-500/10",
  },
  {
    id: "advanced",
    label: "Продвинутый",
    sub: "Свободно говорю",
    icon: <Star className="w-8 h-8" />,
    hint: "Сложная лексика, меньше подсказок, натуральный диалог",
    color: "border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10",
  },
];

const PDF_URL = `${import.meta.env.BASE_URL}offer.pdf`;

export default function LevelSelect() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<Level | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    setLevel(selected);
    setLocation("/scenarios");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary cursor-pointer">
            <Mic className="w-6 h-6" />
            SpeakTutor AI
          </div>
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-5">
              <Zap className="w-4 h-4" />
              Шаг 1 из 1
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-3">
              Выберите ваш уровень
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              ИИ-репетитор адаптирует сложность и стиль общения под вас
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {LEVELS.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setSelected(lvl.id)}
                className={`w-full text-left rounded-2xl border-2 p-5 transition-all duration-200 ${lvl.color} ${selected === lvl.id ? "ring-2 ring-offset-2 ring-offset-background ring-primary/50 scale-[1.01]" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`${selected === lvl.id ? "text-primary" : "text-muted-foreground"} transition-colors`}>
                    {lvl.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-lg">{lvl.label}</span>
                      <span className="text-sm text-muted-foreground">— {lvl.sub}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{lvl.hint}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${selected === lvl.id ? "border-primary bg-primary" : "border-border"}`}>
                    {selected === lvl.id && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Free trial note */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 text-center">
            <p className="text-sm font-medium text-foreground mb-1">🎁 Бесплатный пробный доступ</p>
            <p className="text-xs text-muted-foreground">3 AI-сообщения бесплатно. Без регистрации. Без карты.</p>
          </div>

          <Button
            size="lg"
            className="w-full gap-2 shadow-[0_0_30px_-5px_rgba(0,229,255,0.4)] text-base"
            disabled={!selected}
            onClick={handleContinue}
          >
            Начать практику
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </main>

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
