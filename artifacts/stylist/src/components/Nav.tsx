import { NavLink, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home", exact: true },
  { to: "/history", label: "History", exact: false },
  { to: "/premium", label: "Premium", exact: false },
];

export default function Nav() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10, 11, 14, 0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212, 175, 55, 0.1)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" data-testid="nav-logo">
          <motion.div
            className="flex items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)",
              }}
            >
              <Sparkles size={14} className="text-black" />
            </div>
            <span
              className="text-lg font-semibold tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span className="gold-gradient">Atelier</span>
              <span className="text-foreground/80"> AI</span>
            </span>
          </motion.div>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              data-testid={`nav-link-${link.label.toLowerCase()}`}
            >
              {({ isActive }) => (
                <motion.span
                  className={`text-sm font-medium tracking-wider uppercase cursor-pointer transition-colors duration-200 ${
                    isActive
                      ? "text-yellow-400"
                      : "text-foreground/60 hover:text-foreground/90"
                  }`}
                  whileHover={{ y: -1 }}
                >
                  {link.label}
                </motion.span>
              )}
            </NavLink>
          ))}
          <motion.button
            onClick={() => navigate("/quiz")}
            className="px-5 py-2 text-sm font-semibold tracking-wider uppercase rounded-full text-black cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)",
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            data-testid="nav-cta"
          >
            Get Styled
          </motion.button>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground/60 hover:text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
          data-testid="nav-mobile-menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border/50 px-6 py-4 flex flex-col gap-4"
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.exact}
              onClick={() => setMenuOpen(false)}
              data-testid={`nav-mobile-link-${link.label.toLowerCase()}`}
            >
              {({ isActive }) => (
                <span
                  className={`text-sm font-medium tracking-wider uppercase cursor-pointer ${
                    isActive ? "text-yellow-400" : "text-foreground/60"
                  }`}
                >
                  {link.label}
                </span>
              )}
            </NavLink>
          ))}
          <button
            onClick={() => { navigate("/quiz"); setMenuOpen(false); }}
            className="w-full py-2 text-sm font-semibold tracking-wider uppercase rounded-full text-black gold-gradient-bg"
          >
            Get Styled
          </button>
        </motion.div>
      )}
    </motion.nav>
  );
}
