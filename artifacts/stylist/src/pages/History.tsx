import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useListOutfits } from "@workspace/api-client-react";
import { Clock, Eye, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function History() {
  const navigate = useNavigate();
  const { data: outfits, isLoading, error } = useListOutfits();

  type SavedOutfitItem = NonNullable<typeof outfits>[number];

  const handleView = (outfit: SavedOutfitItem) => {
    sessionStorage.setItem("atelier_result", JSON.stringify(outfit.outfitResult));
    sessionStorage.setItem("atelier_quiz", JSON.stringify(outfit.quizAnswers));
    navigate("/results");
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" data-testid="history-page">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            Your <span className="gold-gradient">Outfit Archive</span>
          </h1>
          <p className="text-muted-foreground">All your saved AI-curated looks in one place.</p>
        </motion.div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "rgba(255,255,255,0.03)" }} />
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Failed to load your outfits.</p>
          </div>
        )}

        {!isLoading && outfits && outfits.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.15)" }}
            >
              <Sparkles size={24} style={{ color: "#d4af37" }} />
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              No saved looks yet
            </h3>
            <p className="text-muted-foreground text-sm mb-8 max-w-xs mx-auto">
              Create your first AI outfit and save it here for future reference.
            </p>
            <motion.button
              onClick={() => navigate("/quiz")}
              className="px-8 py-3 rounded-full text-sm font-semibold text-black"
              style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)" }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              data-testid="history-start-quiz"
            >
              Create Your First Look
            </motion.button>
          </motion.div>
        )}

        {!isLoading && outfits && outfits.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {outfits.map((outfit, i) => {
              const result = outfit.outfitResult as {
                overallAesthetic?: string;
                styleNarrative?: string;
                items?: { category: string; name: string; brand: string }[];
              };
              const items = result.items || [];
              const topItems = items.slice(0, 3);

              return (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-card rounded-2xl p-6 group cursor-pointer hover:border-yellow-500/20 transition-all duration-500"
                  onClick={() => handleView(outfit)}
                  data-testid={`history-card-${outfit.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        className="text-base font-semibold text-foreground leading-tight mb-1"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {result.overallAesthetic || outfit.label || "Outfit Look"}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock size={11} />
                        {format(new Date(outfit.createdAt), "MMM d, yyyy")}
                      </div>
                    </div>
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); handleView(outfit); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all opacity-0 group-hover:opacity-100"
                      style={{
                        background: "rgba(212,175,55,0.1)",
                        border: "1px solid rgba(212,175,55,0.2)",
                        color: "#d4af37",
                      }}
                      data-testid={`history-view-${outfit.id}`}
                    >
                      <Eye size={11} />
                      View
                    </motion.button>
                  </div>

                  {result.styleNarrative && (
                    <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {result.styleNarrative}
                    </p>
                  )}

                  <div className="space-y-1">
                    {topItems.map((item, j) => (
                      <div key={j} className="flex items-center gap-2 text-xs text-foreground/70">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "rgba(212,175,55,0.6)" }} />
                        <span className="capitalize text-muted-foreground">{item.category}:</span>
                        <span>{item.name}</span>
                        <span className="text-muted-foreground">— {item.brand}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <p className="text-xs text-muted-foreground pl-3.5">+{items.length - 3} more pieces</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
