import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { EffectComposer, Bloom, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import type { HouseAnswers } from "@/types";
import FloorPlanModel from "@/components/floorplan/FloorPlanModel";

export default function FloorPlanViewer({
  answers, onEdit, onRestart, on3D,
}: {
  answers: HouseAnswers;
  onEdit: () => void;
  onRestart: () => void;
  on3D: () => void;
}) {
  const handleScreenshot = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a"); a.href = url; a.download = "floor-plan.png"; a.click();
  };

  return (
    <div className="w-full h-screen flex flex-col" style={{ background:"#0d1117" }}>
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ background:"#111827", borderBottom:"1px solid #1f2937" }}>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold" style={{ color:"#f9fafb" }}>📐 План дома</h1>
          <span className="hidden sm:block text-xs px-2.5 py-1 rounded-full"
            style={{ background:"rgba(59,130,246,0.1)", color:"#60a5fa", border:"1px solid rgba(59,130,246,0.2)" }}>
            {answers.rooms.length} комнат · {answers.floors} эт.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={on3D}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(99,102,241,0.15)", color:"#a5b4fc", border:"1px solid rgba(99,102,241,0.25)" }}>
            🏠 3D вид
          </button>
          <button onClick={handleScreenshot}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(255,255,255,0.05)", color:"#9ca3af", border:"1px solid rgba(255,255,255,0.08)" }}>
            📸 Скачать
          </button>
          <button onClick={onEdit}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(255,255,255,0.05)", color:"#9ca3af", border:"1px solid rgba(255,255,255,0.08)" }}>
            ✏️ Изменить
          </button>
          <button onClick={onRestart}
            className="px-3 py-1.5 rounded-lg text-xs font-medium"
            style={{ background:"rgba(255,255,255,0.05)", color:"#9ca3af", border:"1px solid rgba(255,255,255,0.08)" }}>
            ↺ Заново
          </button>
        </div>
      </div>

      <div className="text-center py-1 text-xs flex-shrink-0" style={{ color:"rgba(255,255,255,0.15)" }}>
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
            toneMappingExposure: 1.15,
          }}
          camera={{ position:[0, 30, 12], fov:44, near:0.1, far:300 }}
          style={{ width:"100%", height:"100%" }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={1.4} color="#ffffff" />
            <directionalLight position={[12, 22, 10]} intensity={1.6} castShadow
              shadow-mapSize-width={1024} shadow-mapSize-height={1024}
              shadow-camera-far={80} shadow-camera-left={-30}
              shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} />
            <directionalLight position={[-10, 18, -8]} intensity={0.6} color="#d0e8ff" />
            <pointLight position={[0, 12, 0]} intensity={1.8} color="#fff8e8" distance={60} />

            <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.12,0]} receiveShadow>
              <planeGeometry args={[200,200]} />
              <meshStandardMaterial color="#12161e" roughness={1} />
            </mesh>

            <FloorPlanModel answers={answers} />

            <EffectComposer multisampling={0}>
              <Bloom luminanceThreshold={0.7} intensity={0.3} levels={4} mipmapBlur />
              <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            </EffectComposer>

            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.07}
              minDistance={8}
              maxDistance={65}
              target={[0, 0, 0]}
              maxPolarAngle={Math.PI * 0.85}
            />
          </Suspense>
        </Canvas>

        <div className="absolute bottom-4 right-4 sm:hidden">
          <button onClick={on3D} className="px-4 py-2 rounded-xl text-xs font-medium text-white"
            style={{ background:"rgba(99,102,241,0.85)" }}>🏠 3D</button>
        </div>
      </div>
    </div>
  );
}
