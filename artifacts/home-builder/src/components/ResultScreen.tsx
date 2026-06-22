import { motion } from "framer-motion";
import type { HouseAnswers } from "@/types";

const styleLabels: Record<string, string> = {
  minimal:"Минимализм", modern:"Современный", hitech:"Хай-тек",
  scandinavian:"Скандинавский", classic:"Классический", chalet:"Шале",
  japanese:"Японский", mediterranean:"Средиземноморский", loft:"Лофт", eco:"Эко-стиль",
};
const sizeLabels: Record<string, string> = {
  tiny:"до 80 м²", compact:"80–120 м²", medium:"120–180 м²", large:"180–250 м²", villa:"250+ м²",
};
const colorLabels: Record<string, string> = {
  white:"Белый", gray:"Серый", beige:"Бежевый", black:"Чёрный", brown:"Коричневый",
  sand:"Песочный", graphite:"Графитовый", combo:"Комбинированный", wood_white:"Дерево+белый", stone_gray:"Камень+серый",
};
const roofLabels: Record<string, string> = {
  flat:"Плоская", gabled:"Двускатная", hipped:"Вальмовая", slanted:"Односкатная",
  green:"Зелёная", terrace_roof:"Терраса",
};
const extraLabels: Record<string, string> = {
  balcony:"Балкон", terrace_front:"Терраса сп.", terrace_back:"Терраса сз.",
  lawn_front:"Газон сп.", lawn_back:"Газон сз.", pool:"Бассейн",
  garage1:"Гараж 1м", garage2:"Гараж 2м", carport:"Навес", panoramic:"Панорам. окна",
  garden:"Сад", path:"Дорожка", fence:"Забор", bbq:"Барбекю", solar:"Солн. панели",
};
const roomLabels: Record<string, string> = {
  living:"Гостиная", kitchen:"Кухня", dining:"Столовая", bedroom:"Спальня",
  kids:"Детская", office:"Кабинет", wardrobe:"Гардеробная", bathroom:"Ванная",
  guest:"Гостевая", storage:"Кладовая", laundry:"Прачечная", gym:"Спортзал",
  playroom:"Игровая", cinema:"Кинотеатр", master:"Мастер-спальня",
};

export default function ResultScreen({ answers, onView3D, onViewPlan, onInterior, onEdit, onRestart }: {
  answers: HouseAnswers;
  onView3D: () => void;
  onViewPlan: () => void;
  onInterior: () => void;
  onEdit: () => void;
  onRestart: () => void;
}) {
  return (
    <div className="hb-bg flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="hb-bg-blob1" />
      <div className="hb-bg-blob2" />
      <div className="hb-bg-blob3" />

      <div className="w-full max-w-2xl relative z-10">
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>

          <div className="text-center mb-8">
            <motion.div
              initial={{ scale:0 }} animate={{ scale:1 }}
              transition={{ type:"spring", stiffness:300, damping:20, delay:0.2 }}
              className="text-6xl mb-4">🏠</motion.div>
            <h1 className="text-4xl font-black mb-2" style={{ color:"#1e1b4b" }}>
              Ваш дом готов!
            </h1>
            <p className="text-base" style={{ color:"#6b7280" }}>Выберите режим просмотра</p>
          </div>

          {/* Summary */}
          <div className="glass rounded-2xl p-5 mb-6">
            <h3 className="text-xs font-bold mb-3 uppercase tracking-widest" style={{ color:"#9ca3af" }}>
              Ваш проект
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
              {[
                ["🎨", styleLabels[answers.style]],
                ["📐", sizeLabels[answers.size]],
                ["🏢", `${answers.floors} эт.`],
                ["🏠", roofLabels[answers.roof]],
                ["🎭", colorLabels[answers.color]],
              ].map(([icon, val]) => (
                <div key={icon} className="rounded-xl p-3" style={{ background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.1)" }}>
                  <span className="text-xs mr-1">{icon}</span>
                  <span className="text-sm font-semibold" style={{ color:"#374151" }}>{val}</span>
                </div>
              ))}
            </div>
            {answers.extras.length > 0 && (
              <div className="mb-3">
                <div className="text-xs mb-1.5 font-medium" style={{ color:"#9ca3af" }}>Доп. элементы</div>
                <div className="flex flex-wrap gap-1.5">
                  {answers.extras.map(e => (
                    <span key={e} className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background:"rgba(99,102,241,0.1)", color:"#6366f1" }}>
                      {extraLabels[e] ?? e}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {answers.rooms.length > 0 && (
              <div>
                <div className="text-xs mb-1.5 font-medium" style={{ color:"#9ca3af" }}>Комнаты ({answers.rooms.length})</div>
                <div className="flex flex-wrap gap-1.5">
                  {answers.rooms.map(r => (
                    <span key={r} className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background:"rgba(139,92,246,0.1)", color:"#7c3aed" }}>
                      {roomLabels[r] ?? r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Primary action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { icon:"🏠", title:"Вид снаружи", sub:"Интерактивная 3D-модель", onClick:onView3D, gradient:"linear-gradient(135deg,#4f46e5,#7c3aed)" },
              { icon:"📐", title:"План дома", sub:"Вид сверху с комнатами", onClick:onViewPlan, gradient:"linear-gradient(135deg,#7c3aed,#a855f7)" },
              { icon:"🚪", title:"Войти в дом", sub:"Интерьер и комнаты", onClick:onInterior, gradient:"linear-gradient(135deg,#0ea5e9,#6366f1)" },
            ].map(btn => (
              <motion.button key={btn.title}
                whileHover={{ scale:1.03 }}
                whileTap={{ scale:0.97 }}
                onClick={btn.onClick}
                className="flex flex-col items-center gap-2 p-5 rounded-2xl cursor-pointer text-white"
                style={{ background:btn.gradient, boxShadow:"0 8px 24px rgba(99,102,241,0.25)" }}>
                <span className="text-3xl">{btn.icon}</span>
                <span className="text-base font-bold">{btn.title}</span>
                <span className="text-xs opacity-80">{btn.sub}</span>
              </motion.button>
            ))}
          </div>

          {/* Secondary */}
          <div className="flex gap-3 justify-center">
            <button onClick={onEdit} className="btn-secondary px-5 py-2.5 text-sm">✏️ Изменить</button>
            <button onClick={onRestart} className="btn-secondary px-5 py-2.5 text-sm">↺ Заново</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
