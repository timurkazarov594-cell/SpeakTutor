import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

interface QuizAnswers {
  gender: string;
  style: string;
  styleCustom: string;
  colors: string[];
  season: string;
  purpose: string;
  budget: string;
  brands: string[];
}

const GENDERS = [
  { id: "male", label: "Man", emoji: "👔" },
  { id: "female", label: "Woman", emoji: "👗" },
  { id: "nonbinary", label: "Non-binary", emoji: "✦" },
];

const STYLES = [
  { id: "minimalist", label: "Minimalist", desc: "Clean lines, neutral tones" },
  { id: "streetwear", label: "Streetwear", desc: "Bold, urban, expressive" },
  { id: "old-money", label: "Old Money", desc: "Quiet luxury, understated" },
  { id: "dark-academia", label: "Dark Academia", desc: "Literary, intellectual" },
  { id: "techwear", label: "Techwear", desc: "Functional, futuristic" },
  { id: "bohemian", label: "Bohemian", desc: "Free-spirited, earthy" },
  { id: "power-suit", label: "Power Dressing", desc: "Sharp, commanding" },
  { id: "avant-garde", label: "Avant-Garde", desc: "Experimental, artistic" },
];

const COLORS = [
  { id: "black", label: "Black", hex: "#1a1a1a" },
  { id: "white", label: "White", hex: "#f5f5f0" },
  { id: "navy", label: "Navy", hex: "#1b2a4a" },
  { id: "camel", label: "Camel", hex: "#c19a6b" },
  { id: "burgundy", label: "Burgundy", hex: "#800020" },
  { id: "forest", label: "Forest", hex: "#2d5a3d" },
  { id: "grey", label: "Grey", hex: "#6b7280" },
  { id: "cream", label: "Cream", hex: "#f5f0e8" },
  { id: "brown", label: "Brown", hex: "#7c5c3e" },
  { id: "cobalt", label: "Cobalt", hex: "#0047ab" },
  { id: "gold", label: "Gold", hex: "#d4af37" },
  { id: "rust", label: "Rust", hex: "#b7410e" },
];

const SEASONS = [
  { id: "spring", label: "Spring", desc: "Florals, pastels, light layers" },
  { id: "summer", label: "Summer", desc: "Breathable, light, coastal" },
  { id: "fall", label: "Fall", desc: "Earthy tones, rich textures" },
  { id: "winter", label: "Winter", desc: "Cozy, dark, layered" },
];

const PURPOSES = [
  { id: "casual", label: "Casual Everyday", desc: "Effortless daily wear" },
  { id: "work", label: "Business / Work", desc: "Professional and polished" },
  { id: "formal", label: "Black Tie / Formal", desc: "Gala, ceremony, event" },
  { id: "date", label: "Date Night", desc: "Romantic and refined" },
  { id: "party", label: "Party / Club", desc: "Bold and memorable" },
  { id: "travel", label: "Travel", desc: "Versatile and comfortable" },
];

const BUDGETS = [
  { id: "budget", label: "Smart Shopper", desc: "Under $500 total", range: "$" },
  { id: "mid-range", label: "Mid-Range", desc: "$500 - $2,000", range: "$$" },
  { id: "luxury", label: "Luxury", desc: "$2,000 - $10,000", range: "$$$" },
  { id: "ultra-luxury", label: "Ultra Luxury", desc: "$10,000+", range: "$$$$" },
];

const BRANDS = [
  "Acne Studios", "Bottega Veneta", "Brunello Cucinelli", "Celine",
  "Givenchy", "Gucci", "Hermès", "Jacquemus", "Jil Sander",
  "Loro Piana", "Louis Vuitton", "Maison Margiela", "Off-White",
  "Prada", "Rick Owens", "Saint Laurent", "Stone Island", "Tom Ford",
  "Valentino", "Versace", "Zegna", "The Row",
];

const STEPS = ["Gender", "Style", "Colors", "Season", "Purpose", "Budget", "Brands"];

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    gender: "",
    style: "",
    styleCustom: "",
    colors: [],
    season: "",
    purpose: "",
    budget: "",
    brands: [],
  });

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    } else {
      sessionStorage.setItem("atelier_quiz", JSON.stringify(answers));
      sessionStorage.removeItem("atelier_photo");
      navigate("/upload");
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!answers.gender;
    if (step === 1) return !!answers.style;
    if (step === 2) return answers.colors.length > 0;
    if (step === 3) return !!answers.season;
    if (step === 4) return !!answers.purpose;
    if (step === 5) return !!answers.budget;
    if (step === 6) return true;
    return false;
  };

  const toggleColor = (id: string) => {
    setAnswers((a) => ({
      ...a,
      colors: a.colors.includes(id)
        ? a.colors.filter((c) => c !== id)
        : [...a.colors, id],
    }));
  };

  const toggleBrand = (brand: string) => {
    setAnswers((a) => ({
      ...a,
      brands: a.brands.includes(brand)
        ? a.brands.filter((b) => b !== brand)
        : [...a.brands, brand],
    }));
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6 flex flex-col items-center" data-testid="quiz-page">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
              Step {step + 1} of {STEPS.length}
            </span>
            <span className="text-xs font-medium text-yellow-400/80">{STEPS[step]}</span>
          </div>
          <div className="h-px w-full rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
            <motion.div
              className="h-px rounded-full"
              style={{ background: "linear-gradient(90deg, #d4af37, #f5e07a)" }}
              initial={false}
              animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </motion.div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {step === 0 && <StepGender answers={answers} setAnswers={setAnswers} />}
              {step === 1 && <StepStyle answers={answers} setAnswers={setAnswers} />}
              {step === 2 && <StepColors answers={answers} toggleColor={toggleColor} />}
              {step === 3 && <StepSeason answers={answers} setAnswers={setAnswers} />}
              {step === 4 && <StepPurpose answers={answers} setAnswers={setAnswers} />}
              {step === 5 && <StepBudget answers={answers} setAnswers={setAnswers} />}
              {step === 6 && <StepBrands answers={answers} toggleBrand={toggleBrand} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between mt-10">
          <motion.button
            onClick={goPrev}
            disabled={step === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium text-foreground/60 hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
            whileHover={{ scale: step === 0 ? 1 : 1.02 }}
            whileTap={{ scale: step === 0 ? 1 : 0.97 }}
            data-testid="quiz-prev"
          >
            <ChevronLeft size={16} />
            Back
          </motion.button>

          <motion.button
            onClick={goNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-7 py-3 rounded-full text-sm font-semibold text-black disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            style={{
              background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)",
              boxShadow: canProceed() ? "0 4px 20px rgba(212,175,55,0.3)" : "none",
            }}
            whileHover={{ scale: canProceed() ? 1.04 : 1 }}
            whileTap={{ scale: canProceed() ? 0.97 : 1 }}
            data-testid="quiz-next"
          >
            {step === STEPS.length - 1 ? "Continue to Upload" : "Next"}
            <ChevronRight size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function StepGender({ answers, setAnswers }: { answers: QuizAnswers; setAnswers: React.Dispatch<React.SetStateAction<QuizAnswers>> }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        Who are we styling?
      </h2>
      <p className="text-muted-foreground text-sm mb-8">This helps us recommend the right clothing and accessories.</p>
      <div className="grid grid-cols-3 gap-4">
        {GENDERS.map((g) => (
          <motion.button
            key={g.id}
            onClick={() => setAnswers((a) => ({ ...a, gender: g.id }))}
            data-testid={`gender-option-${g.id}`}
            className="p-6 rounded-xl text-center flex flex-col items-center gap-3 transition-all duration-200"
            style={{
              background: answers.gender === g.id ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
              border: answers.gender === g.id
                ? "1px solid rgba(212,175,55,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="text-3xl">{g.emoji}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{g.label}</span>
              {answers.gender === g.id && (
                <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#d4af37" }}>
                  <Check size={10} className="text-black" />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepStyle({ answers, setAnswers }: { answers: QuizAnswers; setAnswers: React.Dispatch<React.SetStateAction<QuizAnswers>> }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        What's your aesthetic?
      </h2>
      <p className="text-muted-foreground text-sm mb-8">Select the style that resonates most with you.</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {STYLES.map((s) => (
          <motion.button
            key={s.id}
            onClick={() => setAnswers((a) => ({ ...a, style: s.id }))}
            data-testid={`style-option-${s.id}`}
            className="p-4 rounded-xl text-left transition-all duration-200"
            style={{
              background: answers.style === s.id ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
              border: answers.style === s.id
                ? "1px solid rgba(212,175,55,0.4)"
                : "1px solid rgba(255,255,255,0.08)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-semibold mb-1">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
              {answers.style === s.id && (
                <div className="w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0" style={{ background: "#d4af37" }}>
                  <Check size={11} className="text-black" />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
      <div>
        <label className="text-xs text-muted-foreground tracking-wide uppercase mb-2 block">Custom style (optional)</label>
        <input
          type="text"
          placeholder="e.g. 'Japanese workwear meets Italian tailoring'"
          value={answers.styleCustom}
          onChange={(e) => setAnswers((a) => ({ ...a, styleCustom: e.target.value }))}
          className="w-full px-4 py-3 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 bg-transparent outline-none"
          style={{ border: "1px solid rgba(255,255,255,0.12)" }}
          data-testid="style-custom-input"
        />
      </div>
    </div>
  );
}

function StepColors({ answers, toggleColor }: { answers: QuizAnswers; toggleColor: (id: string) => void }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        Your color palette
      </h2>
      <p className="text-muted-foreground text-sm mb-8">Choose the colors you want in your outfit. Select all that apply.</p>
      <div className="flex flex-wrap gap-3">
        {COLORS.map((c) => {
          const selected = answers.colors.includes(c.id);
          return (
            <motion.button
              key={c.id}
              onClick={() => toggleColor(c.id)}
              data-testid={`color-option-${c.id}`}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                background: selected ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)",
                border: selected ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.1)",
                color: selected ? "#f5e07a" : "rgba(255,255,255,0.65)",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: c.hex,
                  border: c.hex === "#f5f5f0" || c.hex === "#f5f0e8" ? "1px solid rgba(255,255,255,0.3)" : "none",
                }}
              />
              {c.label}
              {selected && <Check size={12} />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StepSeason({ answers, setAnswers }: { answers: QuizAnswers; setAnswers: React.Dispatch<React.SetStateAction<QuizAnswers>> }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        What season?
      </h2>
      <p className="text-muted-foreground text-sm mb-8">We'll tailor your outfit for the weather and mood.</p>
      <div className="grid grid-cols-2 gap-3">
        {SEASONS.map((s) => (
          <motion.button
            key={s.id}
            onClick={() => setAnswers((a) => ({ ...a, season: s.id }))}
            data-testid={`season-option-${s.id}`}
            className="p-5 rounded-xl text-left"
            style={{
              background: answers.season === s.id ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
              border: answers.season === s.id ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.08)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="font-semibold mb-1 text-sm">{s.label}</div>
            <div className="text-xs text-muted-foreground">{s.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepPurpose({ answers, setAnswers }: { answers: QuizAnswers; setAnswers: React.Dispatch<React.SetStateAction<QuizAnswers>> }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        Where are you headed?
      </h2>
      <p className="text-muted-foreground text-sm mb-8">The occasion shapes everything about your look.</p>
      <div className="grid grid-cols-2 gap-3">
        {PURPOSES.map((p) => (
          <motion.button
            key={p.id}
            onClick={() => setAnswers((a) => ({ ...a, purpose: p.id }))}
            data-testid={`purpose-option-${p.id}`}
            className="p-5 rounded-xl text-left"
            style={{
              background: answers.purpose === p.id ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
              border: answers.purpose === p.id ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.08)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="font-semibold mb-1 text-sm">{p.label}</div>
            <div className="text-xs text-muted-foreground">{p.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepBudget({ answers, setAnswers }: { answers: QuizAnswers; setAnswers: React.Dispatch<React.SetStateAction<QuizAnswers>> }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        Your investment level
      </h2>
      <p className="text-muted-foreground text-sm mb-8">We match brands and pieces to your budget range.</p>
      <div className="grid grid-cols-2 gap-3">
        {BUDGETS.map((b) => (
          <motion.button
            key={b.id}
            onClick={() => setAnswers((a) => ({ ...a, budget: b.id }))}
            data-testid={`budget-option-${b.id}`}
            className="p-5 rounded-xl text-left"
            style={{
              background: answers.budget === b.id ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.03)",
              border: answers.budget === b.id ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.08)",
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-yellow-400/80">{b.range}</span>
              <span className="font-semibold text-sm">{b.label}</span>
            </div>
            <div className="text-xs text-muted-foreground">{b.desc}</div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function StepBrands({ answers, toggleBrand }: { answers: QuizAnswers; toggleBrand: (brand: string) => void }) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
        Brand affinities
      </h2>
      <p className="text-muted-foreground text-sm mb-8">Select brands you love. Skip to let AI decide.</p>
      <div className="flex flex-wrap gap-2">
        {BRANDS.map((brand) => {
          const selected = answers.brands.includes(brand);
          return (
            <motion.button
              key={brand}
              onClick={() => toggleBrand(brand)}
              data-testid={`brand-option-${brand.replace(/\s+/g, "-").toLowerCase()}`}
              className="px-4 py-2 rounded-full text-xs font-medium transition-all"
              style={{
                background: selected ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.04)",
                border: selected ? "1px solid rgba(212,175,55,0.4)" : "1px solid rgba(255,255,255,0.1)",
                color: selected ? "#f5e07a" : "rgba(255,255,255,0.65)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
            >
              {brand}
              {selected && <span className="ml-1">✓</span>}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
