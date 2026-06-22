import { X, ScrollText, ShieldCheck, AlertTriangle, Scale, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onClose: () => void;
};

const SECTIONS = [
  {
    icon: Scale,
    title: "Об ограничениях ответственности",
    text: `Пользователь понимает, что сервис не гарантирует 100% результат обучения, конкретный уровень владения языком, сдачу экзамена, трудоустройство или иной персональный результат.

Пользователь самостоятельно принимает решение об оплате и использовании сервиса, самостоятельно оценивает пригодность сервиса для своих целей и несёт ответственность за своё решение потратить деньги.

Сервис предоставляет инструмент для самостоятельной языковой практики. Результат зависит от регулярности занятий, уровня пользователя, самостоятельной практики и других факторов.`,
  },
  {
    icon: AlertTriangle,
    title: "О хранении данных в браузере",
    text: `Данные пользователя, выбранный уровень, прогресс, лимиты сообщений и статус доступа хранятся локально в браузере пользователя (localStorage).

Если пользователь очистит данные браузера, кэш, удалит localStorage, сменит устройство, переустановит браузер или будет использовать приватный/инкогнито режим — данные могут быть потеряны.

Администрация не несёт ответственности за потерю локальных данных вследствие действий пользователя, очистки браузера, настроек устройства или технических ограничений браузера.

Пользователь осознаёт этот риск и принимает его, используя сервис.`,
  },
  {
    icon: ShieldCheck,
    title: "Об использовании сервиса",
    text: `Сервис предназначен исключительно для практики английского языка. Пользователь обязуется использовать сервис добросовестно и не предпринимать действий, направленных на обход ограничений использования.

Администрация вправе без предварительного уведомления изменять функциональность сервиса, цены и условия использования. Продолжение использования сервиса после изменений означает согласие с новыми условиями.

Сервис использует технологии искусственного интеллекта. Качество и содержание ответов AI может варьироваться. Администрация не несёт ответственности за содержание диалогов, генерируемых AI.`,
  },
  {
    icon: RotateCcw,
    title: "О возврате денежных средств",
    text: `Возврат денежных средств осуществляется только в случаях, предусмотренных применимым законодательством Российской Федерации.

Поскольку доступ предоставляется мгновенно после оплаты в цифровой форме, возврат средств по причине "передумал" или "не использовал" не производится.

По всем вопросам возврата обращайтесь по email: facemax1@mail.ru`,
  },
];

export function UserAgreementModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[#0d1117] border border-border/60 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-[0_0_80px_-20px_rgba(0,229,255,0.15)] animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <ScrollText className="w-4.5 h-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Пользовательское соглашение</h2>
              <p className="text-xs text-muted-foreground">SpeakTutor AI</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-7 py-6 space-y-6 flex-1">
          <p className="text-sm text-muted-foreground leading-relaxed bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            Используя сервис SpeakTutor AI, вы соглашаетесь с условиями, изложенными ниже.
            Пожалуйста, прочитайте их перед оплатой.
          </p>

          {SECTIONS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-primary/70 shrink-0" />
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              </div>
              <div className="pl-6 space-y-2">
                {text.split("\n\n").map((para, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-border/40 pt-4">
            <p className="text-xs text-muted-foreground/60 leading-relaxed text-center">
              Актуальная редакция соглашения всегда доступна в приложении.
              По вопросам: <a href="mailto:facemax1@mail.ru" className="text-primary/70 hover:text-primary transition-colors">facemax1@mail.ru</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-border/40 shrink-0">
          <Button className="w-full" onClick={onClose}>
            Понятно, закрыть
          </Button>
        </div>
      </div>
    </div>
  );
}
