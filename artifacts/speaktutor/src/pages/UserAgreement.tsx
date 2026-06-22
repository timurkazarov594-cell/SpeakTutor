import { Link } from "wouter";
import { Mic, ArrowLeft, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function UserAgreement() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary cursor-pointer">
              <Mic className="w-5 h-5" />
              SpeakTutor AI
            </div>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Пользовательское соглашение</h1>
            <p className="text-sm text-muted-foreground">SpeakTutor AI</p>
          </div>
        </div>

        {/* Critical warning */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-5 mb-8 flex gap-4">
          <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-2">⚠️ Важное предупреждение о локальном аккаунте</p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              На сайте используется локальный аккаунт без серверной базы данных. Данные аккаунта,
              прогресс, настройки и история использования хранятся <strong className="text-foreground">только в браузере</strong> пользователя
              на конкретном устройстве.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              Если пользователь <strong className="text-foreground">очистит данные браузера, кэш, localStorage</strong>, сменит устройство,
              переустановит браузер или использует режим приватного просмотра — аккаунт, прогресс
              и связанные данные могут быть <strong className="text-foreground">безвозвратно утеряны</strong>.
            </p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">1. Общие положения</h2>
            <p>
              Настоящее Пользовательское соглашение (далее — «Соглашение») регулирует отношения между
              SpeakTutor AI (далее — «Сервис», «Исполнитель») и любым лицом, использующим сайт и
              связанные сервисы (далее — «Пользователь»).
            </p>
            <p className="mt-2">
              Использование Сервиса означает полное и безоговорочное принятие настоящего Соглашения.
              Если Пользователь не согласен с условиями — использование Сервиса недопустимо.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">2. Локальное хранение данных</h2>
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p>
                <strong className="text-foreground">Сервис не использует серверную базу данных для хранения пользовательских аккаунтов.</strong>{" "}
                Все данные — уровень, прогресс, статус оплаты, история сессий — хранятся
                исключительно в localStorage браузера пользователя.
              </p>
              <p>Администрация сайта <strong className="text-foreground">не несёт ответственности</strong> за потерю локальных данных вследствие:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>очистки кэша, cookies или данных сайта в браузере;</li>
                <li>удаления браузера или переустановки операционной системы;</li>
                <li>смены устройства или использования другого браузера;</li>
                <li>использования режима «Инкогнито» / «Приватного просмотра»;</li>
                <li>технических ограничений браузера или устройства;</li>
                <li>действий самого Пользователя, приведших к потере данных.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">3. Оплата и статус «Оплачено»</h2>
            <p>
              После оплаты статус оплаты сохраняется <strong className="text-foreground">только в localStorage</strong> устройства,
              с которого произведена оплата. Сервис не хранит информацию об оплатах в привязке к
              конкретному пользователю.
            </p>
            <p className="mt-2">
              Пользователь понимает и принимает, что в случае потери localStorage-данных
              (очистка браузера, смена устройства и т.д.) <strong className="text-foreground">доступ к оплаченным функциям может быть утерян</strong>.
              В таком случае Пользователю необходимо обратиться в поддержку по адресу{" "}
              <a href="mailto:facemax1@mail.ru" className="text-primary hover:underline">facemax1@mail.ru</a>{" "}
              с подтверждением оплаты.
            </p>
            <p className="mt-2">
              Возврат средств осуществляется в течение 14 дней с момента оплаты, если Пользователь
              не воспользовался оплаченными сообщениями. При частичном использовании возврат производится
              за неиспользованную часть в соответствии с применимым законодательством.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">4. Ограничение гарантий и ответственности</h2>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <p>
                Пользователь понимает и принимает, что <strong className="text-foreground">Сервис не гарантирует</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>100% результата обучения или конкретного уровня владения языком;</li>
                <li>поступление, трудоустройство, сдачу экзамена или иной персональный результат;</li>
                <li>достижение любого языкового сертификата (IELTS, TOEFL и т.д.);</li>
                <li>непрерывную доступность Сервиса 24/7.</li>
              </ul>
              <p>
                Результат зависит от регулярности занятий, начального уровня, усилий и индивидуальных
                особенностей Пользователя. SpeakTutor AI является <strong className="text-foreground">вспомогательным инструментом</strong>,
                а не заменой системного языкового образования.
              </p>
            </div>
            <p className="mt-3">
              Пользователь самостоятельно несёт ответственность за решение о покупке, использование
              Сервиса и оценку его пригодности для своих целей. Совокупная ответственность Исполнителя
              ограничена суммой фактически уплаченных Пользователем средств за последние 30 дней.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">5. Персональные данные</h2>
            <p>
              Сервис не требует регистрации и не собирает персональные данные пользователей (имя, email,
              телефон) без их явного согласия. При оплате через ЮKassa данные обрабатываются
              платёжным сервисом в соответствии с их политикой конфиденциальности.
            </p>
            <p className="mt-2">
              Аудиозаписи речи Пользователя передаются в OpenAI Whisper для распознавания и не
              сохраняются на серверах SpeakTutor AI. Текстовые диалоги обрабатываются OpenAI GPT для
              генерации ответов и не сохраняются долгосрочно.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">6. Обязанности Пользователя</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Использовать Сервис исключительно в законных и личных целях.</li>
              <li>Не передавать доступ третьим лицам.</li>
              <li>Не предпринимать действий, нарушающих работу Сервиса или инфраструктуры.</li>
              <li>Принимать, что сохранение данных — ответственность Пользователя.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">7. Изменение условий</h2>
            <p>
              Исполнитель вправе в одностороннем порядке изменять настоящее Соглашение.
              Новая редакция вступает в силу с момента публикации на сайте.
              Продолжение использования Сервиса означает согласие с изменёнными условиями.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-3">8. Контактная информация</h2>
            <p>
              По всем вопросам, связанным с настоящим Соглашением:{" "}
              <a href="mailto:facemax1@mail.ru" className="text-primary hover:underline font-medium">
                facemax1@mail.ru
              </a>
            </p>
          </section>

        </div>

        <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground text-center">
          © 2026 SpeakTutor AI · Все права защищены ·{" "}
          <a href="mailto:facemax1@mail.ru" className="text-primary hover:underline">facemax1@mail.ru</a>
        </div>
      </main>
    </div>
  );
}
