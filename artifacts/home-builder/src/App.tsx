import { useState } from "react";
import type { HouseAnswers, AppMode } from "@/types";
import Questionnaire from "@/components/Questionnaire";
import ResultScreen from "@/components/ResultScreen";
import HouseViewer from "@/components/HouseViewer";
import FloorPlanViewer from "@/components/FloorPlanViewer";
import InteriorViewer from "@/components/InteriorViewer";

function App() {
  const [mode, setMode] = useState<AppMode>("quiz");
  const [answers, setAnswers] = useState<HouseAnswers | null>(null);

  const handleComplete = (a: HouseAnswers) => {
    setAnswers(a);
    setMode("result");
  };
  const handleRestart = () => { setAnswers(null); setMode("quiz"); };
  const handleEdit = () => setMode("result");

  if (mode === "quiz") return <Questionnaire onComplete={handleComplete} initialAnswers={answers} />;
  if (mode === "result" && answers) return (
    <ResultScreen answers={answers}
      onView3D={() => setMode("3d")}
      onViewPlan={() => setMode("floorplan")}
      onInterior={() => setMode("interior")}
      onEdit={() => setMode("quiz")}
      onRestart={handleRestart}
    />
  );
  if (mode === "3d" && answers) return (
    <HouseViewer answers={answers} onEdit={handleEdit} onRestart={handleRestart}
      onFloorPlan={() => setMode("floorplan")} onInterior={() => setMode("interior")} />
  );
  if (mode === "floorplan" && answers) return (
    <FloorPlanViewer answers={answers} onEdit={handleEdit} onRestart={handleRestart}
      on3D={() => setMode("3d")} />
  );
  if (mode === "interior" && answers) return (
    <InteriorViewer answers={answers} onEdit={handleEdit} onRestart={handleRestart}
      on3D={() => setMode("3d")} />
  );
  return null;
}

export default App;
