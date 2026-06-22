import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, MeshReflectorMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import type { HouseAnswers } from "@/types";
import HouseModel from "@/components/house/HouseModel";

export default function HouseViewer({
  answers, onEdit, onRestart, onFloorPlan, onInterior,
}: {
  answers: HouseAnswers;
  onEdit: () => void;
  onRestart: () => void;
  onFloorPlan: () => void;
  onInterior: () => void;
}) {
  const handleScreenshot = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = "house-3d.png"; a.click();
  };
  const styleLabel: Record<string,string> = {
    minimal:"Минимализм", modern:"Современный", hitech:"Хай-тек",
    scandinavian:"Скандинавский", classic:"Классический", chalet:"Шале",
    japanese:"Японский", mediterranean:"Средиземноморский", loft:"Лофт", eco:"Эко-стиль",
  };
  return (
    <div className="w-full h-screen flex flex-col" style={{ background:"#060a12" }}>
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background:"rgba(6,10,18,0.97)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-white">🏠 3D Вид</span>
          <span className="hidden sm:block text-xs px-2.5 py-1 rounded-full"
            style={{ background:"rgba(99,102,241,0.14)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.22)" }}>
            {styleLabel[answers.style] ?? answers.style} · {answers.floors} эт.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onInterior}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(14,165,233,0.14)", color:"#7dd3fc", border:"1px solid rgba(14,165,233,0.22)" }}>
            🚪 Войти
          </button>
          <button onClick={onFloorPlan}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(139,92,246,0.14)", color:"#c4b5fd", border:"1px solid rgba(139,92,246,0.22)" }}>
            📐 План
          </button>
          <button onClick={handleScreenshot}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(255,255,255,0.05)", color:"#9ca3af", border:"1px solid rgba(255,255,255,0.07)" }}>
            📸
          </button>
          <button onClick={onEdit} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(255,255,255,0.05)", color:"#9ca3af", border:"1px solid rgba(255,255,255,0.07)" }}>
            ✏️ Изменить
          </button>
          <button onClick={onRestart} className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(255,255,255,0.05)", color:"#9ca3af", border:"1px solid rgba(255,255,255,0.07)" }}>
            ↺ Заново
          </button>
        </div>
      </div>

      <div className="text-center py-1 text-xs flex-shrink-0" style={{ color:"rgba(255,255,255,0.1)" }}>
        Drag to rotate · Scroll to zoom · Right-click to pan
      </div>

      <div className="flex-1 relative">
        <Canvas
          shadows
          gl={{
            antialias: true,
            preserveDrawingBuffer: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 0.92,
          }}
          camera={{ position:[18, 5, 26], fov:34, near:0.2, far:500 }}
          style={{ width:"100%", height:"100%" }}
        >
          <Suspense fallback={null}>
            {/* ── Evening atmosphere ─────────────────── */}
            <color attach="background" args={["#070a14"]} />
            <fog attach="fog" args={["#0a0e1c", 90, 300]} />
            <Environment preset="city" />

            {/* ── Moonlight (cool directional) ──────── */}
            <ambientLight intensity={0.1} color="#2038a0" />
            <directionalLight
              position={[-18, 30, -12]}
              intensity={0.52}
              color="#7888c8"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-camera-far={100}
              shadow-camera-left={-35}
              shadow-camera-right={35}
              shadow-camera-top={35}
              shadow-camera-bottom={-35}
              shadow-bias={-0.001}
            />
            {/* Rim / sky fill from right */}
            <directionalLight position={[14, 16, 12]} intensity={0.11} color="#9aaccf" />

            {/* ── Ground ────────────────────────────── */}
            {/* Outer dark grass */}
            <mesh rotation={[-Math.PI/2,0,0]} position={[0,-0.01,0]} receiveShadow>
              <planeGeometry args={[400,400]} />
              <meshStandardMaterial color="#0c1410" roughness={.98} />
            </mesh>
            {/* Inner plot — wet evening pavement (reflective) */}
            <mesh rotation={[-Math.PI/2,0,0]} position={[0,0.005,0]} receiveShadow>
              <planeGeometry args={[80,80]} />
              <MeshReflectorMaterial
                blur={[256,64]} resolution={256} mixBlur={1} mixStrength={24}
                roughness={.86} depthScale={1} minDepthThreshold={.4}
                maxDepthThreshold={1.4} color="#0e1412" metalness={.48}
              />
            </mesh>

            <HouseModel answers={answers} />

            {/* ── Post-processing ─────────────────── */}
            <EffectComposer multisampling={0}>
              <Bloom luminanceThreshold={0.28} intensity={0.7} levels={5} mipmapBlur />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
              <Vignette eskil={false} offset={0.28} darkness={0.68} />
            </EffectComposer>

            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.055}
              minDistance={6}
              maxDistance={75}
              maxPolarAngle={Math.PI/2 - 0.02}
              target={[0, 3.5, 0]}
              rotateSpeed={0.6}
            />
          </Suspense>
        </Canvas>

        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 sm:hidden px-4">
          <button onClick={onInterior} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background:"rgba(14,165,233,0.88)" }}>🚪 Войти</button>
          <button onClick={onFloorPlan} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white"
            style={{ background:"rgba(139,92,246,0.88)" }}>📐 План</button>
        </div>
      </div>
    </div>
  );
}
