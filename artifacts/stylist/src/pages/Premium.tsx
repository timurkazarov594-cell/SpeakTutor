import { motion } from "framer-motion";
import { Check, Crown, Zap, Star, Sparkles, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FEATURES_FREE = [
  "3 AI outfit generations per month",
  "Standard style quiz",
  "Basic outfit cards",
  "Community aesthetics",
];

const FEATURES_PREMIUM = [
  "Unlimited AI outfit generations",
  "GPT-4o Vision photo analysis",
  "Full outfit card with color palettes",
  "AI Stylist chat for real-time refinement",
  "Outfit history & archive (unlimited)",
  "Quick-action celebrity style templates",
  "Priority AI processing",
  "Early access to new features",
  "Export looks to PDF / share kit",
];

const PLANS = [
  {
    id: "free",
    name: "Essential",
    price: "Free",
    period: "",
    description: "Get started with AI styling",
    features: FEATURES_FREE,
    cta: "Current Plan",
    highlighted: false,
  },
  {
    id: "premium",
    name: "Premium",
    price: "$9.99",
    period: "/month",
    description: "The full luxury experience",
    features: FEATURES_PREMIUM,
    cta: "Get Premium",
    highlighted: true,
  },
];

const TESTIMONIALS = [
  {
    name: "Alexandra K.",
    role: "Creative Director",
    quote: "I spent $200 at a real stylist and got less than what Atelier AI gave me in 30 seconds.",
  },
  {
    name: "Marcus T.",
    role: "Entrepreneur",
    quote: "The billionaire mode is insane. It assembled a look I would have never thought of myself.",
  },
  {
    name: "Sofia M.",
    role: "Fashion Editor",
    quote: "The color palette matching is genuinely impressive. It understands how pieces work together.",
  },
];

export default function Premium() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-16 px-6" data-testid="premium-page">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-widest uppercase mb-6"
            style={{
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.2)",
              color: "#d4af37",
            }}
          >
            <Crown size={12} />
            Atelier Premium
          </div>
          <h1
            className="text-4xl md:text-6xl font-bold mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Dress like the{" "}
            <span className="gold-gradient">top 1%</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Unlimited AI styling. Photo analysis. Celebrity templates. Everything you need
            to look exceptional every single day.
          </p>
        </motion.div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="relative rounded-2xl p-8"
              style={
                plan.highlighted
                  ? {
                      background: "rgba(212,175,55,0.05)",
                      border: "1px solid rgba(212,175,55,0.3)",
                      boxShadow: "0 0 60px rgba(212,175,55,0.1)",
                    }
                  : {
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }
              }
              data-testid={`plan-${plan.id}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <motion.span
                    className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full text-xs font-bold text-black"
                    style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)" }}
                    animate={{ scale: [1, 1.03, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    data-testid="popular-badge"
                  >
                    <Star size={10} />
                    Most Popular
                  </motion.span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span
                    className="text-4xl font-bold"
                    style={plan.highlighted ? { color: "#d4af37" } : {}}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm mb-1">{plan.period}</span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={
                        plan.highlighted
                          ? { background: "rgba(212,175,55,0.15)" }
                          : { background: "rgba(255,255,255,0.06)" }
                      }
                    >
                      <Check
                        size={11}
                        style={{ color: plan.highlighted ? "#d4af37" : "rgba(255,255,255,0.5)" }}
                      />
                    </div>
                    <span className={plan.highlighted ? "text-foreground/80" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={() => plan.id !== "premium" && navigate("/quiz")}
                className="w-full py-3 rounded-full text-sm font-semibold transition-all"
                style={
                  plan.highlighted
                    ? {
                        background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)",
                        color: "#000",
                        boxShadow: "0 6px 24px rgba(212,175,55,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.7)",
                      }
                }
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                data-testid={`plan-cta-${plan.id}`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: Zap, title: "Instant Generation", desc: "Full luxury outfits in under 60 seconds, powered by GPT-4o" },
            { icon: Sparkles, title: "Unlimited Looks", desc: "Never run out of styling ideas — generate as many as you need" },
            { icon: Shield, title: "Always Private", desc: "Your photos and style data are never sold or shared" },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center glass-card rounded-2xl p-6"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)" }}
              >
                <item.icon size={20} style={{ color: "#d4af37" }} />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
            What members say
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl p-5"
              >
                <p className="text-sm text-foreground/75 leading-relaxed mb-4 italic">"{t.quote}"</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center glass-card-strong rounded-3xl p-12"
        >
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            Ready to dress exceptionally?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Join thousands who let AI handle their style. Cancel anytime.
          </p>
          <motion.button
            className="px-10 py-4 rounded-full text-base font-semibold text-black"
            style={{
              background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 50%, #c9a227 100%)",
              boxShadow: "0 8px 32px rgba(212,175,55,0.3)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            data-testid="premium-final-cta"
          >
            Get Premium — $9.99/month
          </motion.button>
          <p className="text-xs text-muted-foreground mt-4">No commitment. Cancel anytime.</p>
        </motion.div>
      </div>
    </div>
  );
}
