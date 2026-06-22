import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import type { HouseAnswers } from "@/types";
import InteriorModel from "@/components/house/InteriorModel";

const SIZE_D: Record<string,number> = { tiny:7, compact:8, medium:9.5, large:11, villa:14 };
const ROOM_LABELS: Record<string,string> = {
  living:"🛋️ Гостиная", kitchen:"🍳 Кухня", dining:"🍽️ Столовая",
  master:"👑 Мастер-сп.", bedroom:"🛏️ Спальня", bathroom:"🛁 Ванная",
  kids:"🧸 Детская", office:"💼 Кабинет", wardrobe:"👗 Гардероб",
  guest:"🛌 Гостевая", laundry:"🧺 Прачечная", gym:"💪 Спортзал",
  playroom:"🎮 Игровая", cinema:"🎬 Кинозал",
};

export default function InteriorViewer({
  answers, onEdit, onRestart, on3D,
}: {
  answers: HouseAnswers;
  onEdit: () => void;
  onRestart: () => void;
  on3D: () => void;
}) {
  const d = SIZE_D[answers.size] ?? 9.5;
  const initCamZ = d / 2 - 1.6;

  const handleScreenshot = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = "interior.png"; a.click();
  };

  return (
    <div className="w-full h-screen flex flex-col" style={{ background:"#0a0810" }}>
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background:"rgba(10,8,20,0.97)", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">🚪 Интерьер</span>
          <span className="hidden sm:block text-xs px-2.5 py-1 rounded-full"
            style={{ background:"rgba(14,165,233,0.12)", color:"#7dd3fc", border:"1px solid rgba(14,165,233,0.2)" }}>
            {answers.rooms.length>0?`${answers.rooms.length} комнат`:"Базовый"} · {answers.floors} эт.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={on3D} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(99,102,241,0.15)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.25)" }}>
            🏠 3D вид
          </button>
          <button onClick={handleScreenshot} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(255,255,255,0.06)", color:"#9ca3af", border:"1px solid rgba(255,255,255,0.1)" }}>
            📸 Скачать
          </button>
          <button onClick={onEdit} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(255,255,255,0.06)", color:"#9ca3af", border:"1px solid rgba(255,255,255,0.1)" }}>
            ✏️ Изменить
          </button>
          <button onClick={onRestart} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(255,255,255,0.06)", color:"#9ca3af", border:"1px solid rgba(255,255,255,0.1)" }}>
            ↺ Заново
          </button>
        </div>
      </div>

      <div className="text-center py-1 text-xs flex-shrink-0" style={{ color:"rgba(255,255,255,0.16)" }}>
        Drag to look around · Scroll to zoom · You are inside the house
      </div>

      <div className="flex-1 relative">
        <Canvas
          shadows
          gl={{
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          camera={{ position:[0, 1.65, initCamZ], fov:68, near:0.05, far:120 }}
          style={{ width:"100%", height:"100%" }}
        >
          <Suspense fallback={null}>
            <Environment preset="apartment" />
            <ambientLight intensity={0.65} color="#ffe8c8" />
            <pointLight position={[0, 3.6, 0]} intensity={3.8} color="#fff4d0" distance={18} castShadow
              shadow-mapSize-width={512} shadow-mapSize-height={512} />
            <pointLight position={[-4, 3.4, -3]} intensity={2.2} color="#ffe8b0" distance={12} />
            <pointLight position={[4, 3.4, 3]} intensity={2.2} color="#fff0c8" distance={12} />
            <directionalLight position={[8, 5, 8]} intensity={0.7} color="#d0e8ff" />

            <InteriorModel answers={answers} />

            <EffectComposer multisampling={0}>
              <Bloom luminanceThreshold={0.55} intensity={0.45} levels={4} mipmapBlur />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
              <Vignette eskil={false} offset={0.38} darkness={0.6} />
            </EffectComposer>

            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.07}
              minDistance={0.6}
              maxDistance={15}
              target={[0, 1.5, 0]}
              rotateSpeed={0.55}
              minPolarAngle={0.08}
              maxPolarAngle={Math.PI * 0.88}
            />
          </Suspense>
        </Canvas>

        {answers.rooms.length > 0 && (
          <div className="absolute bottom-4 left-4 rounded-xl p-3 max-w-[160px]"
            style={{ background:"rgba(10,8,20,0.88)", border:"1px solid rgba(255,255,255,0.08)", backdropFilter:"blur(12px)" }}>
            <div className="text-xs font-semibold mb-2" style={{ color:"rgba(255,255,255,0.3)" }}>Комнаты</div>
            <div className="flex flex-col gap-0.5 max-h-36 overflow-auto">
              {answers.rooms.slice(0,10).map(r=>(
                <div key={r} className="text-xs" style={{ color:"rgba(255,255,255,0.52)" }}>{ROOM_LABELS[r]??r}</div>
              ))}
            </div>
          </div>
        )}
        <div className="absolute bottom-4 right-4 sm:hidden">
          <button onClick={on3D} className="px-4 py-2 rounded-xl text-xs font-medium text-white"
            style={{ background:"rgba(99,102,241,0.85)" }}>🏠 3D</button>
        </div>
      </div>
    </div>
  );
}
