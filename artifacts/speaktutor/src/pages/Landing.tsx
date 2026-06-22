import { useLocation } from "wouter";
import { Mic, ArrowRight, Zap, Star, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLevel } from "@/lib/store";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleStart = () => {
    if (getLevel()) {
      setLocation("/scenarios");
    } else {
      setLocation("/level");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <nav className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
          <Mic className="w-6 h-6" />
          SpeakTutor AI
        </div>
        <Button onClick={handleStart}>Начать бесплатно</Button>
      </nav>

      <main>
        {/* Hero */}
        <section className="container mx-auto px-6 py-24 text-center relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background opacity-50 blur-3xl" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            <span>Новый уровень изучения языка</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Говорите по-английски <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              без страха и ошибок
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Персональный ИИ-репетитор для русскоязычных. Практикуйте устную речь в реальных сценариях,
            получайте мгновенные исправления грамматики и прокачивайте свой уровень как в игре.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button
              size="lg"
              onClick={handleStart}
              className="text-lg px-8 py-6 h-auto w-full sm:w-auto font-semibold gap-2 shadow-[0_0_40px_-10px_rgba(0,229,255,0.5)]"
            >
              Попробовать сейчас
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">3 сообщения бесплатно · Без регистрации · Без карты</p>
        </section>

        {/* Features */}
        <section className="border-t border-border/50 bg-card/30 py-24">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  Icon: Mic,
                  title: "Говорите — не читайте",
                  body: "Реальные голосовые диалоги с ИИ. Whisper распознаёт вашу речь, GPT-4o отвечает как живой собеседник.",
                },
                {
                  Icon: Star,
                  title: "Мгновенные исправления",
                  body: "Каждый ответ анализируется: грамматика, словарный запас, произношение. Ошибки исправляются на месте.",
                },
                {
                  Icon: Shield,
                  title: "30 реальных сценариев",
                  body: "От заказа кофе до переговоров о зарплате. Три уровня сложности — от новичка до продвинутого.",
                },
              ].map(({ Icon, title, body }) => (
                <div key={title} className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-extrabold mb-4">Простые цены</h2>
            <p className="text-muted-foreground mb-12 max-w-xl mx-auto">
              Начните бесплатно. Полный доступ — одним платежом навсегда.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="bg-card border border-border rounded-2xl p-8 text-left">
                <p className="text-sm font-medium text-muted-foreground mb-2">Бесплатно</p>
                <p className="text-4xl font-bold mb-4">0 ₽</p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>✓ 3 пробных AI-сообщения</li>
                  <li>✓ Выбор уровня</li>
                  <li>✓ Анализ грамматики</li>
                </ul>
                <Button variant="outline" className="w-full" onClick={handleStart}>
                  Начать бесплатно
                </Button>
              </div>

              <div className="bg-primary/5 border border-primary/30 rounded-2xl p-8 text-left relative overflow-hidden">
                <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                  Полный доступ
                </div>
                <p className="text-sm font-medium text-primary mb-2">Навсегда</p>
                <p className="text-4xl font-bold mb-4 text-primary">1500 ₽</p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li>✓ 10 сценариев</li>
                  <li>✓ 6 AI-сообщений в каждом</li>
                  <li>✓ Итого 60 сообщений</li>
                  <li>✓ Детальный анализ речи</li>
                  <li>✓ Оплата через ЮKassa</li>
                </ul>
                <Button
                  className="w-full shadow-[0_0_20px_-5px_rgba(0,229,255,0.4)]"
                  onClick={handleStart}
                >
                  Попробовать и купить
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Mic className="w-4 h-4" />
            SpeakTutor AI
          </div>
          <a href="mailto:facemax1@mail.ru" className="hover:text-foreground transition-colors">
            facemax1@mail.ru
          </a>
        </div>
      </footer>
    </div>
  );
}
