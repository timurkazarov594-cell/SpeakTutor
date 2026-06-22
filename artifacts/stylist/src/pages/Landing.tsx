import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Star, Zap } from "lucide-react";
import { useRef } from "react";

const features = [
  { icon: Sparkles, label: "AI-Powered Analysis", desc: "GPT-4o Vision reads your photo and style DNA" },
  { icon: Star, label: "Luxury Curation", desc: "Investment pieces from world-class brands" },
  { icon: Zap, label: "Instant Results", desc: "Your complete look in under 60 seconds" },
];

const aesthetics = ["Old Money", "Quiet Luxury", "Streetwear Elite", "Dark Academia", "Coastal Granddad", "Power Minimal"];

export default function Landing() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, -80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <div className="min-h-screen" data-testid="landing-page">
      {/* Hero */}
      <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 80% 100%, rgba(100,80,200,0.05) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <motion.div
          style={{ y, opacity }}
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-widest uppercase mb-8"
            style={{
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "#d4af37",
            }}
          >
            <Sparkles size={12} />
            Powered by GPT-4o Vision
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-none"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span className="text-foreground">Your Personal</span>
            <br />
            <span className="gold-gradient">AI Stylist</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Upload your photo, answer a few questions about your style, and receive a
            complete luxury outfit curated by AI — down to the last accessory.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => navigate("/quiz")}
              data-testid="landing-cta"
              className="group flex items-center gap-3 px-8 py-4 text-base font-semibold tracking-wide rounded-full text-black"
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 50%, #c9a227 100%)",
                boxShadow: "0 8px 32px rgba(212,175,55,0.3)",
              }}
              whileHover={{ scale: 1.04, boxShadow: "0 12px 40px rgba(212,175,55,0.5)" }}
              whileTap={{ scale: 0.97 }}
            >
              Create Your AI Outfit
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              onClick={() => navigate("/history")}
              data-testid="landing-history"
              className="flex items-center gap-2 px-8 py-4 text-base font-medium rounded-full text-foreground/70 hover:text-foreground transition-colors"
              style={{
                border: "1px solid rgba(212,175,55,0.2)",
                background: "rgba(212,175,55,0.04)",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              View Saved Looks
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mt-16 flex flex-wrap justify-center gap-2"
          >
            {aesthetics.map((a, i) => (
              <motion.span
                key={a}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.08 }}
                className="px-3 py-1 rounded-full text-xs font-medium text-foreground/50"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {a}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ opacity: 0.4 }}
        >
          <div className="w-px h-12 mx-auto" style={{ background: "linear-gradient(to bottom, rgba(212,175,55,0.8), transparent)" }} />
        </motion.div>
      </div>

      {/* Features section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Why <span className="gold-gradient">Atelier AI</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Fashion intelligence that understands luxury, not just clothes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl p-8 group hover:border-yellow-500/20 transition-all duration-500"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}
                >
                  <feature.icon size={20} style={{ color: "#d4af37" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.label}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="glass-card-strong rounded-3xl p-12"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Dress like you mean it.
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
              Your next signature look is 60 seconds away.
            </p>
            <motion.button
              onClick={() => navigate("/quiz")}
              data-testid="landing-cta-bottom"
              className="px-10 py-4 text-base font-semibold tracking-wide rounded-full text-black"
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 50%, #c9a227 100%)",
                boxShadow: "0 8px 32px rgba(212,175,55,0.3)",
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Start Your Style Journey
            </motion.button>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8 px-6 text-center">
        <p className="text-muted-foreground text-sm">Atelier AI — Premium Fashion Intelligence</p>
      </footer>
    </div>
  );
}
