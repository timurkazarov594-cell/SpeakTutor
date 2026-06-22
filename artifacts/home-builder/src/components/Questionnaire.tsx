import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { HouseAnswers } from "@/types";

type Option = { value: string; label: string; icon?: string; sub?: string; swatch?: string };

const STEPS = [
  {
    key: "style", multi: false,
    question: "Какой стиль дома?",
    hint: "Выберите один вариант",
    emoji: "🎨",
    options: [
      { value:"minimal",       label:"Минимализм",        icon:"⬜" },
      { value:"modern",        label:"Современный",       icon:"🏙️" },
      { value:"hitech",        label:"Хай-тек",           icon:"🔷" },
      { value:"scandinavian",  label:"Скандинавский",     icon:"🌲" },
      { value:"classic",       label:"Классический",      icon:"🏛️" },
      { value:"chalet",        label:"Шале",              icon:"🏔️" },
      { value:"japanese",      label:"Японский",          icon:"⛩️" },
      { value:"mediterranean", label:"Средиземноморский", icon:"🌊" },
      { value:"loft",          label:"Лофт",              icon:"🏭" },
      { value:"eco",           label:"Эко-стиль",         icon:"🌿" },
    ] as Option[],
  },
  {
    key: "size", multi: false,
    question: "Размер дома?",
    hint: "Выберите один вариант",
    emoji: "📐",
    options: [
      { value:"tiny",    label:"Маленький",    sub:"до 80 м²",    icon:"🏠" },
      { value:"compact", label:"Компактный",   sub:"80–120 м²",   icon:"🏡" },
      { value:"medium",  label:"Средний",      sub:"120–180 м²",  icon:"🏘️" },
      { value:"large",   label:"Большой",      sub:"180–250 м²",  icon:"🏰" },
      { value:"villa",   label:"Вилла",        sub:"250+ м²",     icon:"🏯" },
    ] as Option[],
  },
  {
    key: "color", multi: false,
    question: "Цвет фасада?",
    hint: "Выберите один вариант",
    emoji: "🎭",
    options: [
      { value:"white",      label:"Белый",          swatch:"#f0ede8" },
      { value:"gray",       label:"Серый",           swatch:"#9098a0" },
      { value:"black",      label:"Чёрный",          swatch:"#2a2e35" },
      { value:"beige",      label:"Бежевый",         swatch:"#c9aa80" },
      { value:"sand",       label:"Песочный",        swatch:"#d4b87a" },
      { value:"graphite",   label:"Графитовый",      swatch:"#4a5060" },
      { value:"wood_white", label:"Дерево + белый",  swatch:"linear-gradient(135deg,#c8a070 50%,#f0ede8 50%)" },
      { value:"stone_gray", label:"Камень + серый",  swatch:"linear-gradient(135deg,#9a9090 50%,#6a7080 50%)" },
    ] as Option[],
  },
  {
    key: "floors", multi: false,
    question: "Сколько этажей?",
    hint: "Выберите один вариант",
    emoji: "🏢",
    options: [
      { value:"1", label:"1 этаж",  icon:"1️⃣" },
      { value:"2", label:"2 этажа", icon:"2️⃣" },
      { value:"3", label:"3 этажа", icon:"3️⃣" },
    ] as Option[],
  },
  {
    key: "roof", multi: false,
    question: "Тип крыши?",
    hint: "Выберите один вариант",
    emoji: "🏠",
    options: [
      { value:"flat",          label:"Плоская",           icon:"⬛" },
      { value:"gabled",        label:"Двускатная",        icon:"🔺" },
      { value:"hipped",        label:"Вальмовая",         icon:"⬦" },
      { value:"slanted",       label:"Односкатная",       icon:"📐" },
      { value:"green",         label:"Зелёная крыша",     icon:"🌱" },
      { value:"terrace_roof",  label:"Терраса на крыше",  icon:"🌅" },
    ] as Option[],
  },
  {
    key: "extras", multi: true,
    question: "Дополнительные элементы",
    hint: "Мультивыбор — отметьте всё нужное",
    emoji: "✨",
    options: [
      { value:"balcony",       label:"Балкон",            icon:"🪟" },
      { value:"terrace_front", label:"Терраса спереди",   icon:"🌿" },
      { value:"terrace_back",  label:"Терраса сзади",     icon:"🌳" },
      { value:"lawn_front",    label:"Газон спереди",     icon:"🟩" },
      { value:"lawn_back",     label:"Газон сзади",       icon:"🟢" },
      { value:"pool",          label:"Бассейн",           icon:"🏊" },
      { value:"garage1",       label:"Гараж",             icon:"🚗" },
      { value:"carport",       label:"Навес для авто",    icon:"⛺" },
      { value:"panoramic",     label:"Панорамные окна",   icon:"🖼️" },
      { value:"garden",        label:"Сад",               icon:"🌸" },
      { value:"path",          label:"Дорожка к дому",    icon:"🛤️" },
      { value:"fence",         label:"Забор",             icon:"🚧" },
      { value:"bbq",           label:"Зона барбекю",      icon:"🔥" },
      { value:"solar",         label:"Солнечные панели",  icon:"☀️" },
      { value:"lights",        label:"Уличное освещение", icon:"💡" },
    ] as Option[],
  },
  {
    key: "rooms", multi: true,
    question: "Комнаты в доме",
    hint: "Мультивыбор — выберите все нужные комнаты",
    emoji: "🛋️",
    options: [
      { value:"living",   label:"Гостиная",         icon:"🛋️" },
      { value:"kitchen",  label:"Кухня",            icon:"🍳" },
      { value:"dining",   label:"Столовая",         icon:"🍽️" },
      { value:"master",   label:"Мастер-спальня",   icon:"👑" },
      { value:"bedroom",  label:"Спальня",          icon:"🛏️" },
      { value:"bathroom", label:"Ванная",           icon:"🛁" },
      { value:"kids",     label:"Детская",          icon:"🧸" },
      { value:"office",   label:"Кабинет",          icon:"💼" },
      { value:"wardrobe", label:"Гардеробная",      icon:"👗" },
      { value:"guest",    label:"Гостевая",         icon:"🛌" },
      { value:"laundry",  label:"Прачечная",        icon:"🧺" },
      { value:"gym",      label:"Спортзал",         icon:"💪" },
      { value:"playroom", label:"Игровая",          icon:"🎮" },
      { value:"cinema",   label:"Домашний кинозал", icon:"🎬" },
    ] as Option[],
  },
  {
    key: "layout", multi: false,
    question: "Тип планировки?",
    hint: "Выберите один вариант",
    emoji: "📋",
    options: [
      { value:"open",            label:"Open space",       icon:"🔓" },
      { value:"family",          label:"Семейная",         icon:"👨‍👩‍👧" },
      { value:"minimal_walls",   label:"Минималистичная",  icon:"◻️" },
      { value:"many_rooms",      label:"Много комнат",     icon:"🏠" },
      { value:"big_living",      label:"Большая гостиная", icon:"🛋️" },
      { value:"separate_kitchen",label:"Отдельная кухня",  icon:"🚪" },
    ] as Option[],
  },
];

export default function Questionnaire({
  onComplete, initialAnswers,
}: {
  onComplete: (a: HouseAnswers) => void;
  initialAnswers: HouseAnswers | null;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(
    initialAnswers ? { ...initialAnswers } : {}
  );

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  const isSelected = (val: string) => {
    const v = answers[current.key];
    return Array.isArray(v) ? v.includes(val) : v === val;
  };

  const handleSelect = (val: string) => {
    if (!current.multi) {
      const newAnswers = { ...answers, [current.key]: val };
      setAnswers(newAnswers);
      setTimeout(() => {
        if (step < STEPS.length - 1) setStep(step + 1);
        else submitAnswers(newAnswers);
      }, 160);
    } else {
      const prev = (answers[current.key] as string[]) ?? [];
      setAnswers({ ...answers, [current.key]: prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val] });
    }
  };

  const submitAnswers = (ans: Record<string, string | string[]>) => {
    onComplete({
      style:   (ans.style as string)   ?? "modern",
      size:    (ans.size as string)    ?? "medium",
      color:   (ans.color as string)   ?? "white",
      floors:  (ans.floors as string)  ?? "2",
      roof:    (ans.roof as string)    ?? "gabled",
      extras:  (ans.extras as string[]) ?? [],
      rooms:   (ans.rooms as string[])  ?? ["living","kitchen","bedroom","bathroom"],
      layout:  (ans.layout as string)  ?? "open",
    });
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else submitAnswers(answers);
  };

  const multiCount = current.multi ? ((answers[current.key] as string[]) ?? []).length : 0;
  const canNext = current.multi ? multiCount > 0 : !!answers[current.key];

  const cols = current.options.length <= 3 ? "grid-cols-1 sm:grid-cols-3" :
    current.options.length <= 6 ? "grid-cols-2 sm:grid-cols-3" :
    "grid-cols-2 sm:grid-cols-4 lg:grid-cols-5";

  return (
    <div className="hb-bg min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div className="hb-bg-blob1" />
      <div className="hb-bg-blob2" />
      <div className="hb-bg-blob3" />

      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity:0, y:-20 }}
          animate={{ opacity:1, y:0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-black mb-2 tracking-tight"
            style={{ background:"linear-gradient(135deg,#6366f1,#a855f7,#3b82f6)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            🏗️ Home Builder 3D
          </h1>
          <p className="text-sm sm:text-base" style={{ color:"#6b7280" }}>
            Спроектируйте дом вашей мечты
          </p>
        </motion.div>

        {/* Progress */}
        <div className="glass rounded-2xl px-5 py-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">{current.emoji}</span>
              <span className="text-sm font-semibold" style={{ color:"#374151" }}>
                Шаг {step + 1} из {STEPS.length}
              </span>
            </div>
            <span className="text-sm font-bold" style={{ color:"#6366f1" }}>
              {Math.round(progress)}%
            </span>
          </div>
          {/* Segmented dots */}
          <div className="flex gap-1.5 mb-3">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background:"rgba(0,0,0,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: i < step ? "#6366f1" : i === step ? "linear-gradient(90deg,#6366f1,#a855f7)" : "transparent" }}
                  animate={{ width: i <= step ? "100%" : "0%" }}
                  transition={{ duration:0.4, delay: i === step ? 0 : 0 }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity:0, x:40, scale:0.97 }}
            animate={{ opacity:1, x:0, scale:1 }}
            exit={{ opacity:0, x:-40, scale:0.97 }}
            transition={{ duration:0.25, ease:"easeOut" }}
          >
            <div className="glass rounded-2xl p-5 sm:p-7">
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-bold mb-1.5" style={{ color:"#1e1b4b" }}>
                  {current.question}
                </h2>
                {current.multi && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ background:"rgba(245,158,11,0.12)", color:"#d97706", border:"1px solid rgba(245,158,11,0.25)" }}>
                    ✦ Мультивыбор
                  </div>
                )}
              </div>

              <div className={`grid gap-2.5 ${cols}`}>
                {current.options.map((opt) => {
                  const sel = isSelected(opt.value);
                  return (
                    <motion.button
                      key={opt.value}
                      whileHover={{ scale:1.02, y:-2 }}
                      whileTap={{ scale:0.97 }}
                      onClick={() => handleSelect(opt.value)}
                      className={`card-option text-left p-3.5 outline-none ${sel ? "selected" : ""}`}
                    >
                      {opt.swatch && (
                        <div className="w-8 h-8 rounded-lg mb-2 border border-black/10"
                          style={{ background:opt.swatch, flexShrink:0 }} />
                      )}
                      {opt.icon && (
                        <div className="text-xl mb-1.5 leading-none">{opt.icon}</div>
                      )}
                      <div className="text-sm font-semibold leading-tight"
                        style={{ color: sel ? "#4338ca" : "#1f2937" }}>
                        {opt.label}
                      </div>
                      {opt.sub && (
                        <div className="text-xs mt-0.5" style={{ color:"#9ca3af" }}>{opt.sub}</div>
                      )}
                      {sel && (
                        <motion.div
                          initial={{ scale:0, rotate:-90 }}
                          animate={{ scale:1, rotate:0 }}
                          className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                        >
                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {current.multi && (
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color:"#9ca3af" }}>
                    {multiCount > 0 ? `Выбрано: ${multiCount}` : "Ничего не выбрано"}
                  </span>
                  <motion.button
                    whileHover={{ scale:1.03 }}
                    whileTap={{ scale:0.97 }}
                    onClick={handleNext}
                    disabled={!canNext}
                    className="btn-primary px-7 py-2.5 text-sm"
                    style={{ opacity: canNext ? 1 : 0.45, cursor: canNext ? "pointer" : "not-allowed" }}
                  >
                    {step === STEPS.length - 1 ? "Создать дом →" : "Далее →"}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {step > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setStep(step - 1)}
              className="btn-secondary px-4 py-2 text-sm"
            >
              ← Назад
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
