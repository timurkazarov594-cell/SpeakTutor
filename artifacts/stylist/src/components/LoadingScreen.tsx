import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyzeStyle, type QuizAnswers } from "@workspace/api-client-react";

const MESSAGES = [
  "Reading your aesthetic...",
  "Analyzing style signals...",
  "Sourcing luxury pieces...",
  "Curating your color palette...",
  "Matching brands to your vision...",
  "Finalizing your signature look...",
];

function buildClientDemo(quiz: QuizAnswers) {
  const style = quiz.style || "minimalist";
  const budget = quiz.budget || "luxury";
  const brandMap: Record<string, string> = {
    budget: "COS", "mid-range": "Acne Studios", luxury: "Brunello Cucinelli", "ultra-luxury": "Loro Piana",
  };
  const priceMap: Record<string, string> = {
    budget: "$80-$200", "mid-range": "$300-$800", luxury: "$800-$2,500", "ultra-luxury": "$2,500-$8,000",
  };
  const brand = quiz.brands?.[0] || brandMap[budget] || "Brunello Cucinelli";
  const price = priceMap[budget] || "$800-$2,500";
  return {
    overallAesthetic: `${style.charAt(0).toUpperCase() + style.slice(1).replace("-", " ")} Refined`,
    styleNarrative: `A carefully considered ${style} ensemble built for ${quiz.purpose || "everyday"} wear. Each piece was selected to create a cohesive, intentional look that speaks quietly but powerfully — the hallmark of true personal style.`,
    chatResponse: quiz.chatMessage ? "I've curated an outfit tailored to your request. Here's a look that captures the essence of what you had in mind." : null,
    items: [
      { category: "tops", name: "Relaxed-fit lightweight cashmere crew", brand, estimatedPrice: price, aestheticTag: style, colorPalette: ["#2c2c2c", "#f5f0e8"], description: "A foundational piece in ultra-fine cashmere that anchors the entire look with understated luxury." },
      { category: "outerwear", name: "Unstructured single-breasted blazer", brand, estimatedPrice: price, aestheticTag: "refined", colorPalette: ["#4a4a4a", "#1a1a1a", "#f5f0e8"], description: "A deconstructed blazer in superfine wool that drapes effortlessly — the cornerstone of a considered wardrobe." },
      { category: "pants", name: "Tailored straight-leg trousers", brand, estimatedPrice: price, aestheticTag: "structured", colorPalette: ["#1a1a1a", "#3d3d3d"], description: "Precision-cut trousers with a clean silhouette that works from morning meetings to evening events." },
      { category: "shoes", name: "Polished leather Chelsea boots", brand: quiz.brands?.[1] || "Common Projects", estimatedPrice: priceMap["mid-range"], aestheticTag: "elevated", colorPalette: ["#2c1810", "#1a1a1a"], description: "Hand-stitched Chelsea boots in full-grain leather — the perfect finishing touch." },
      { category: "accessories", name: "Slim hand-finished leather belt", brand: quiz.brands?.[2] || "Anderson's", estimatedPrice: "$150-$350", aestheticTag: "classic", colorPalette: ["#2c1810"], description: "A minimalist belt in vegetable-tanned leather that ties the silhouette together with quiet precision." },
      { category: "watches", name: "Slim dress watch with leather strap", brand: budget === "ultra-luxury" ? "A. Lange & Söhne" : budget === "luxury" ? "IWC Schaffhausen" : "Tissot", estimatedPrice: budget === "ultra-luxury" ? "$15,000-$30,000" : budget === "luxury" ? "$3,000-$6,000" : "$400-$800", aestheticTag: "horological", colorPalette: ["#c8b88a", "#1a1a1a", "#f5f0e8"], description: "A timepiece that communicates taste without a word." },
      { category: "bags", name: "Structured tote in full-grain leather", brand: quiz.brands?.[0] || (budget === "ultra-luxury" ? "Hermès" : "Métier"), estimatedPrice: budget === "ultra-luxury" ? "$4,000-$12,000" : "$600-$1,800", aestheticTag: "investment piece", colorPalette: ["#2c1810", "#4a3728"], description: "A considered carry that functions as much as it elevates — the quiet centerpiece of the look." },
    ],
  };
}

export default function LoadingScreen() {
  const navigate = useNavigate();
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const analyzeMutation = useAnalyzeStyle();

  useEffect(() => {
    const quizRaw = sessionStorage.getItem("atelier_quiz");
    const photoRaw = sessionStorage.getItem("atelier_photo");

    if (!quizRaw) {
      navigate("/quiz");
      return;
    }

    let quizAnswers: QuizAnswers;
    try {
      quizAnswers = JSON.parse(quizRaw) as QuizAnswers;
    } catch {
      navigate("/quiz");
      return;
    }

    analyzeMutation.mutate(
      { data: { photo: photoRaw || null, quizAnswers } },
      {
        onSuccess: (result) => {
          sessionStorage.setItem("atelier_result", JSON.stringify(result));
          navigate("/results");
        },
        onError: (err) => {
          console.error("[LoadingScreen] AI request failed, using demo fallback:", err);
          const demo = buildClientDemo(quizAnswers);
          sessionStorage.setItem("atelier_result", JSON.stringify(demo));
          navigate("/results");
        },
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 4, 92));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      data-testid="loading-page"
    >
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${120 + i * 40}px`,
              height: `${120 + i * 40}px`,
              left: `${20 + i * 10}%`,
              top: `${15 + i * 12}%`,
              background: `radial-gradient(circle, rgba(212,175,55,${0.04 - i * 0.005}) 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md w-full">
        <div className="flex items-center justify-center mb-10">
          <div className="relative">
            <motion.div
              className="w-28 h-28 rounded-full"
              style={{
                background: "linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)",
                border: "1px solid rgba(212,175,55,0.3)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-3 rounded-full"
              style={{
                background: "linear-gradient(225deg, rgba(212,175,55,0.3) 0%, transparent 100%)",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center" style={{ fontSize: "32px" }}>
              ✦
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Crafting your look
        </h2>

        <div className="h-8 flex items-center justify-center mb-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={msgIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-muted-foreground text-sm"
            >
              {MESSAGES[msgIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="relative">
          <div className="h-px w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #d4af37, #f5e07a, #d4af37)",
                backgroundSize: "200% 100%",
              }}
              animate={{
                width: `${progress}%`,
                backgroundPosition: ["0% 0%", "100% 0%", "0% 0%"],
              }}
              transition={{
                width: { duration: 0.8, ease: "easeOut" },
                backgroundPosition: { duration: 2, repeat: Infinity, ease: "linear" },
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-3 opacity-50">{Math.round(progress)}% complete</p>
        </div>
      </div>
    </div>
  );
}
