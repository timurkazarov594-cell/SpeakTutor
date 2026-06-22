import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Share2, MessageCircle, ExternalLink,
  Sparkles, Check, ChevronLeft, ShoppingCart,
} from "lucide-react";
import {
  useSaveOutfit, getListOutfitsQueryKey,
  type QuizAnswers, type OutfitResult, type OutfitItem,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import StyleChat from "@/components/StyleChat";

const QUICK_ACTIONS = [
  { id: "billionaire", label: "Dress me like a billionaire" },
  { id: "luxury", label: "Generate luxury fit" },
  { id: "celebrity", label: "Celebrity inspired" },
];

const CATEGORY_ORDER = [
  "tops", "shirts", "jackets", "outerwear", "pants", "bottoms",
  "shoes", "accessories", "watches", "bags", "jewelry", "glasses",
];

// ── Curated product image pools ──────────────────────────────────────────────
// Each pool uses real Unsplash photo IDs confirmed to show clean product shots.

const IMG = {
  // TOPS / SHIRTS
  tops: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=480&h=560&fit=crop&q=90",
  ],
  shirts: [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1604926810499-fb5a0d4df889?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=480&h=560&fit=crop&q=90",
  ],
  // JACKETS / OUTERWEAR
  jackets: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=480&h=560&fit=crop&q=90",
  ],
  outerwear: [
    "https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1548126032-079a0fb0099d?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=480&h=560&fit=crop&q=90",
  ],
  // PANTS / BOTTOMS
  pants: [
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1604176354204-926e837b4f23?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1519748771451-a94c596fad67?w=480&h=560&fit=crop&q=90",
  ],
  bottoms: [
    "https://images.unsplash.com/photo-1542272604-787c3835535d?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=480&h=560&fit=crop&q=90",
    "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=480&h=560&fit=crop&q=90",
  ],
  // SHOES
  shoes: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1552346154-21d32810ade3?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1614252235316-8bef52bc3748?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1600185365483-26d0a93cf74?w=480&h=480&fit=crop&q=90",
  ],
  // WATCHES — always clean product shots
  watches: [
    "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1587836374828-4f1d56b3d4b4?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=480&h=480&fit=crop&q=90",
  ],
  // GLASSES / SUNGLASSES
  glasses: [
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1577744486770-020ab432da65?w=480&h=480&fit=crop&q=90",
  ],
  // MALE BAGS — backpacks, messenger bags, crossbody (masculine)
  bags_male: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1473188588951-666fce8e7c68?w=480&h=480&fit=crop&q=90",
  ],
  // FEMALE BAGS — handbags, clutches, shoulder bags
  bags_female: [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1594938298603-c8148c4b4a34?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1575032617751-6ddec2089882?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=480&h=480&fit=crop&q=90",
  ],
  // MALE ACCESSORIES — caps, chains, rings, belts
  accessories_male: [
    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1624913503273-5f9c4e980dba?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1575844264771-892081089af5?w=480&h=480&fit=crop&q=90",
  ],
  // FEMALE ACCESSORIES / JEWELRY — rings, necklaces, earrings
  accessories_female: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1573408301185-9519f94cf1be?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1601121141461-9d6647bef0a1?w=480&h=480&fit=crop&q=90",
  ],
  jewelry: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1573408301185-9519f94cf1be?w=480&h=480&fit=crop&q=90",
    "https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=480&h=480&fit=crop&q=90",
  ],
};

const FALLBACK_IMGS = [
  "https://images.unsplash.com/photo-1445205170230-053b83016050?w=480&h=560&fit=crop&q=90",
  "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=480&h=560&fit=crop&q=90",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=480&h=560&fit=crop&q=90",
];

function imagesForCategory(category: string, gender?: string): string[] {
  const key = category.toLowerCase().replace(/[^a-z]/g, "");
  const isMale = !gender || gender === "male" || gender === "nonbinary";

  // Exact gender-specific pools first
  if (key.includes("bag") || key.includes("tote") || key.includes("clutch") || key.includes("purse")) {
    return isMale ? IMG.bags_male : IMG.bags_female;
  }
  if (key.includes("accessor") || key.includes("chain") || key.includes("belt") || key.includes("cap") || key.includes("hat") || key.includes("ring") || key.includes("scarf")) {
    return isMale ? IMG.accessories_male : IMG.accessories_female;
  }
  if (key.includes("jewel") || key.includes("necklace") || key.includes("earring") || key.includes("bracelet")) {
    return IMG.jewelry;
  }
  if (key.includes("watch")) return IMG.watches;
  if (key.includes("glass") || key.includes("sunglass") || key.includes("eyewear") || key.includes("spectacle")) return IMG.glasses;
  if (key.includes("shoe") || key.includes("boot") || key.includes("sneaker") || key.includes("loafer") || key.includes("mule") || key.includes("heel") || key.includes("sandal")) return IMG.shoes;
  if (key.includes("jacket") || key.includes("blazer") || key.includes("coat")) return IMG.jackets;
  if (key.includes("outerwear") || key.includes("windbreaker") || key.includes("parka")) return IMG.outerwear;
  if (key.includes("pant") || key.includes("trouser") || key.includes("jean") || key.includes("cargo") || key.includes("chino") || key.includes("short")) return IMG.pants;
  if (key.includes("bottom") || key.includes("skirt")) return IMG.bottoms;
  if (key.includes("shirt") || key.includes("oxford") || key.includes("linen") || key.includes("polo")) return IMG.shirts;
  if (key.includes("top") || key.includes("tee") || key.includes("hoodie") || key.includes("sweater") || key.includes("knitwear") || key.includes("cashmere") || key.includes("turtleneck") || key.includes("blouse")) return IMG.tops;

  return FALLBACK_IMGS;
}

function getImageForItem(item: OutfitItem, seed: number, gender?: string): string {
  const pool = imagesForCategory(item.category, gender);
  return pool[seed % pool.length] ?? FALLBACK_IMGS[0];
}

// ── Color theming ─────────────────────────────────────────────────────────────
const DARK_STYLES = new Set(["techwear", "dark-academia", "streetwear", "avant-garde"]);

const COLOR_BG: Record<string, { bg: string; isDark: boolean }> = {
  black:    { bg: "#0a0a10", isDark: true },
  charcoal: { bg: "#0d0d14", isDark: true },
  navy:     { bg: "#06101e", isDark: true },
  dark:     { bg: "#0a0a10", isDark: true },
  white:    { bg: "#fafafa", isDark: false },
  cream:    { bg: "#faf6ee", isDark: false },
  beige:    { bg: "#f5ece0", isDark: false },
  camel:    { bg: "#f5ece0", isDark: false },
  tan:      { bg: "#f0e4d0", isDark: false },
  brown:    { bg: "#f5ece0", isDark: false },
  grey:     { bg: "#f4f4f4", isDark: false },
  gray:     { bg: "#f4f4f4", isDark: false },
  blue:     { bg: "#edf3fa", isDark: false },
  forest:   { bg: "#eef5ee", isDark: false },
  green:    { bg: "#edf5ed", isDark: false },
  burgundy: { bg: "#1a0a0a", isDark: true },
  rust:     { bg: "#f5ece0", isDark: false },
  cobalt:   { bg: "#edf3fa", isDark: false },
  gold:     { bg: "#f5f0e0", isDark: false },
};

function getCollagePalette(colors: string[], style: string) {
  if (DARK_STYLES.has(style)) return { bg: "#0a0a10", isDark: true };
  for (const c of colors) {
    const key = c.toLowerCase().replace(/[^a-z]/g, "");
    const match = COLOR_BG[key];
    if (match) return match;
  }
  return { bg: "#f5f3f0", isDark: false };
}

const COLOR_SWATCH: Record<string, string> = {
  black: "#1a1a1a", white: "#f8f8f8", navy: "#162040", beige: "#e8d9c0",
  cream: "#f5ecd8", grey: "#888", gray: "#888", brown: "#6b4226",
  tan: "#c8a876", camel: "#c4924e", blue: "#3a6ea8", forest: "#2d5a3d",
  green: "#3a7a4a", red: "#b83232", burgundy: "#800020", rust: "#b7410e",
  cobalt: "#0047ab", gold: "#d4af37", purple: "#8b5cf6",
};

// ── FallbackImage ─────────────────────────────────────────────────────────────
function FallbackImage({
  src, fallbacks, alt, className, style,
}: {
  src: string; fallbacks: string[]; alt: string;
  className?: string; style?: React.CSSProperties;
}) {
  const all = [src, ...fallbacks];
  const [idx, setIdx] = useState(0);
  return (
    <img
      key={all[idx]}
      src={all[idx] ?? all[0]}
      alt={alt}
      onError={() => setIdx((i) => Math.min(i + 1, all.length - 1))}
      className={className}
      style={style}
      loading="lazy"
    />
  );
}

// ── Collage slot ──────────────────────────────────────────────────────────────
function CollageSlot({
  item, label, isDark, seed, gender, style: gridStyle,
}: {
  item: OutfitItem | null; label: string; isDark: boolean; seed: number;
  gender?: string; style?: React.CSSProperties;
}) {
  const cardBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.85)";
  const labelColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";

  if (!item) {
    return (
      <div
        className="rounded-xl flex flex-col items-center justify-center"
        style={{
          background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)",
          border: isDark ? "1px dashed rgba(255,255,255,0.07)" : "1px dashed rgba(0,0,0,0.08)",
          ...gridStyle,
        }}
      />
    );
  }

  const primarySrc = getImageForItem(item, seed, gender);
  const fallbacks = [...imagesForCategory(item.category, gender).slice(1), ...FALLBACK_IMGS];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: seed * 0.07 }}
      className="rounded-xl overflow-hidden flex flex-col group"
      style={{
        background: cardBg,
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.07)",
        boxShadow: isDark ? "none" : "0 2px 10px rgba(0,0,0,0.06)",
        ...gridStyle,
      }}
    >
      <div className="relative flex-1 flex items-center justify-center overflow-hidden" style={{ minHeight: 0 }}>
        <FallbackImage
          src={primarySrc}
          fallbacks={fallbacks}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div
          className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
          style={{ background: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.88)", backdropFilter: "blur(4px)" }}
        >
          <p
            className="font-semibold truncate leading-tight"
            style={{ fontSize: "9px", color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)", textTransform: "uppercase", letterSpacing: "0.06em" }}
          >
            {item.brand}
          </p>
          <p style={{ fontSize: "8px", color: labelColor, textTransform: "capitalize" }}>{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ── OutfitCollage ─────────────────────────────────────────────────────────────
function OutfitCollage({
  items, aesthetic, quizAnswers,
}: {
  items: OutfitItem[]; aesthetic: string; quizAnswers: QuizAnswers;
}) {
  const { bg, isDark } = getCollagePalette(quizAnswers.colors, quizAnswers.style);
  const gender = (quizAnswers as unknown as { gender?: string }).gender;
  const isMale = !gender || gender === "male" || gender === "nonbinary";

  function find(...cats: string[]): OutfitItem | null {
    return items.find((it) => cats.some((c) => it.category.toLowerCase().includes(c.toLowerCase()))) ?? null;
  }

  const jacket = find("jacket", "outerwear", "coat", "blazer", "windbreaker");
  const top = find("top", "shirt", "knitwear", "sweater", "hoodie", "tee", "cashmere", "turtleneck", "blouse");
  const pants = find("pant", "trouser", "jean", "bottom", "chino", "short", "skirt", "cargo");
  const shoes = find("shoe", "boot", "sneaker", "loafer", "mule", "heel", "sandal");
  const watch = find("watch");
  const glasses = find("glass", "sunglass", "spectacle", "eyewear", "visor");
  const bag = find("bag", "tote", "clutch", "purse", "backpack", "messenger", "satchel", "briefcase");
  const accessory = find("accessor", "belt", "scarf", "chain", "ring", "cap", "hat", "wallet");
  const jewelry = find("jewel", "necklace", "earring", "bracelet");

  const mainTop = jacket ?? top;
  const subTop = jacket && top ? top : null;
  const extraAccessory = accessory ?? jewelry;

  // Fill any null slot with another available item so no slot is empty
  const usedIds = new Set(
    [mainTop, subTop, pants, shoes, watch, glasses, bag, extraAccessory]
      .filter(Boolean)
      .map((i) => i!.name),
  );
  const spare = items.find((it) => !usedIds.has(it.name)) ?? items[0] ?? null;

  function fillSlot(preferred: OutfitItem | null, fallback: OutfitItem | null = spare): OutfitItem | null {
    return preferred ?? fallback;
  }

  const accentColor = isDark ? "#d4af37" : "#b8922a";
  const textColor = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";
  const mutedColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.38)";

  const bagLabel = isMale ? "Bag / Pack" : "Bag";
  const accessoryLabel = isMale ? "Accessory" : (jewelry ? "Jewelry" : "Accessory");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl overflow-hidden mb-6"
      style={{ background: bg, border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)" }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.05)" }}
      >
        <div>
          <p className="text-sm font-bold tracking-wide" style={{ color: accentColor }}>{aesthetic}</p>
          <p className="text-[10px]" style={{ color: mutedColor }}>Complete Outfit Preview</p>
        </div>
        <div className="flex items-center gap-1.5">
          {quizAnswers.colors.slice(0, 5).map((c, i) => {
            const hex = COLOR_SWATCH[c.toLowerCase()] ?? "#888";
            return (
              <div
                key={i}
                className="w-3.5 h-3.5 rounded-full"
                style={{
                  backgroundColor: hex,
                  boxShadow: isDark ? "0 0 0 1px rgba(255,255,255,0.12)" : "0 0 0 1px rgba(0,0,0,0.1)",
                }}
                title={c}
              />
            );
          })}
          <span className="text-[10px] ml-1" style={{ color: mutedColor }}>
            {quizAnswers.colors.slice(0, 3).join(" · ")}
          </span>
        </div>
      </div>

      {/* 3-col Pinterest grid */}
      <div
        className="p-3"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.8fr 1fr",
          gridTemplateRows: "190px 155px 135px",
          gap: "6px",
        }}
      >
        {/* Row 1 */}
        <CollageSlot item={fillSlot(watch)} label="Watch" isDark={isDark} seed={0} gender={gender ?? undefined}
          style={{ gridColumn: "1", gridRow: "1" }} />
        <CollageSlot item={fillSlot(mainTop)} label={jacket ? "Jacket" : "Top"} isDark={isDark} seed={1} gender={gender ?? undefined}
          style={{ gridColumn: "2", gridRow: "1 / 3" }} />
        <CollageSlot item={fillSlot(bag)} label={bagLabel} isDark={isDark} seed={2} gender={gender ?? undefined}
          style={{ gridColumn: "3", gridRow: "1" }} />

        {/* Row 2 */}
        <CollageSlot item={fillSlot(subTop ?? extraAccessory)} label={subTop ? "Top" : accessoryLabel} isDark={isDark} seed={3} gender={gender ?? undefined}
          style={{ gridColumn: "1", gridRow: "2" }} />
        <CollageSlot item={fillSlot(glasses)} label="Eyewear" isDark={isDark} seed={5} gender={gender ?? undefined}
          style={{ gridColumn: "3", gridRow: "2" }} />

        {/* Row 3 — full width */}
        <CollageSlot item={fillSlot(extraAccessory ?? watch)} label={accessoryLabel} isDark={isDark} seed={6} gender={gender ?? undefined}
          style={{ gridColumn: "1", gridRow: "3" }} />
        <CollageSlot item={fillSlot(pants)} label="Bottoms" isDark={isDark} seed={4} gender={gender ?? undefined}
          style={{ gridColumn: "2", gridRow: "3" }} />
        <CollageSlot item={fillSlot(shoes)} label="Shoes" isDark={isDark} seed={7} gender={gender ?? undefined}
          style={{ gridColumn: "3", gridRow: "3" }} />
      </div>

      {/* Watermark */}
      <div
        className="absolute top-14 right-4 rotate-12 opacity-[0.06] select-none pointer-events-none"
        style={{ color: accentColor, fontSize: "10px", fontWeight: 800, letterSpacing: "0.35em", textTransform: "uppercase" }}
      >
        {quizAnswers.style}
      </div>

      {/* Style narrative */}
      {items.length > 0 && (
        <div
          className="px-5 pb-4 pt-2"
          style={{ borderTop: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.04)" }}
        >
          <p className="text-xs italic leading-relaxed" style={{ color: mutedColor }}>
            {items[0]?.description?.slice(0, 120)}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ item, index, gender }: { item: OutfitItem; index: number; gender?: string }) {
  const primarySrc = getImageForItem(item, index, gender);
  const fallbacks = [...imagesForCategory(item.category, gender).slice(1), ...FALLBACK_IMGS];
  const searchUrl = `https://www.farfetch.com/shopping/search/?q=${encodeURIComponent(item.brand + " " + item.name)}`;
  const brandUrl = `https://www.ssense.com/en-us/search?q=${encodeURIComponent(item.brand)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="group rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
      whileHover={{ boxShadow: "0 6px 32px rgba(212,175,55,0.1)", y: -2 }}
      data-testid={`outfit-card-${index}`}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden flex items-center justify-center"
        style={{ height: "220px", background: "#f0ede8" }}
      >
        <FallbackImage
          src={primarySrc}
          fallbacks={fallbacks}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          style={{ background: "#f0ede8" }}
        />
        {/* Category badge */}
        <span
          className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase"
          style={{ background: "rgba(0,0,0,0.7)", color: "#d4af37", backdropFilter: "blur(4px)" }}
        >
          {item.category}
        </span>
        {/* Color swatches */}
        <div className="absolute bottom-3 left-3 flex gap-1">
          {item.colorPalette.slice(0, 3).map((hex, i) => (
            <div
              key={i}
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: hex, boxShadow: "0 0 0 1.5px rgba(0,0,0,0.2)" }}
            />
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div>
          <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "#d4af37" }}>
            {item.brand}
          </p>
          <h3 className="text-sm font-semibold text-foreground/90 leading-snug mt-0.5 line-clamp-2">
            {item.name}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-base font-bold text-foreground/90">{item.estimatedPrice}</span>
          <span
            className="text-[10px] px-2 py-0.5 rounded-full italic"
            style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}
          >
            {item.aestheticTag}
          </span>
        </div>

        <p className="text-xs text-muted-foreground/60 line-clamp-2 leading-relaxed flex-1">
          {item.description}
        </p>

        <div className="flex gap-2 mt-1">
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-opacity hover:opacity-80"
            style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)", color: "#000" }}
            data-testid={`card-buy-${index}`}
          >
            <ShoppingCart size={12} />
            Buy Similar
          </a>
          <a
            href={brandUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors hover:text-foreground/70"
            style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
            data-testid={`card-brand-${index}`}
          >
            <ExternalLink size={11} />
            Brand
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// ── Results page ──────────────────────────────────────────────────────────────
export default function Results() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<OutfitResult | null>(null);
  const [outfitResult, setOutfitResult] = useState<OutfitResult | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    try {
      const resultRaw = sessionStorage.getItem("atelier_result");
      const quizRaw = sessionStorage.getItem("atelier_quiz");
      const photoRaw = sessionStorage.getItem("atelier_photo");
      if (resultRaw) setOutfitResult(JSON.parse(resultRaw) as OutfitResult);
      if (quizRaw) setQuizAnswers(JSON.parse(quizRaw) as QuizAnswers);
      if (photoRaw) setPhotoPreview(`data:image/jpeg;base64,${photoRaw}`);
    } catch {
      navigate("/quiz");
    }
  }, [navigate]);

  const saveOutfitMutation = useSaveOutfit();
  const displayResult = currentResult || outfitResult;

  if (!displayResult || !quizAnswers) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="results-empty">
        <div className="text-center">
          <p className="text-muted-foreground mb-6">No outfit to display.</p>
          <Link to="/quiz">
            <button
              className="px-6 py-3 rounded-full text-sm font-semibold text-black"
              style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)" }}
            >
              Start the Quiz
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const gender = (quizAnswers as unknown as { gender?: string }).gender;

  const sortedItems = [...displayResult.items].sort((a, b) => {
    const ai = CATEGORY_ORDER.indexOf(a.category.toLowerCase());
    const bi = CATEGORY_ORDER.indexOf(b.category.toLowerCase());
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  const categories = Array.from(new Set(sortedItems.map((i) => i.category)));
  const filteredItems = activeCategory
    ? sortedItems.filter((i) => i.category === activeCategory)
    : sortedItems;

  const handleSave = () => {
    if (saved || saveOutfitMutation.isPending) return;
    saveOutfitMutation.mutate(
      { data: { quizAnswers, outfitResult: displayResult, label: displayResult.overallAesthetic } },
      { onSuccess: () => { setSaved(true); queryClient.invalidateQueries({ queryKey: getListOutfitsQueryKey() }); } },
    );
  };

  const handleQuickAction = (actionId: string) => {
    sessionStorage.setItem("atelier_quiz", JSON.stringify({ ...quizAnswers, quickAction: actionId }));
    navigate("/loading");
  };

  const handleShare = (platform: "instagram" | "tiktok") => {
    window.open(
      platform === "instagram" ? "https://www.instagram.com/create/story" : "https://www.tiktok.com/upload",
      "_blank",
    );
  };

  return (
    <div className="min-h-screen pt-16" data-testid="results-page">
      {/* Sticky top bar */}
      <div
        className="sticky top-16 z-30 px-4 py-3"
        style={{
          background: "rgba(10,11,14,0.93)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(212,175,55,0.08)",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/quiz">
              <button
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                data-testid="back-to-quiz"
              >
                <ChevronLeft size={14} />
                New Outfit
              </button>
            </Link>
            <div className="w-px h-4 bg-white/10" />
            <p className="text-xs font-semibold text-yellow-400/80 truncate max-w-[200px]">
              {displayResult.overallAesthetic}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick actions */}
            <div className="hidden sm:flex gap-1.5">
              {QUICK_ACTIONS.map((a) => (
                <motion.button
                  key={a.id}
                  onClick={() => handleQuickAction(a.id)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium transition-all"
                  style={{
                    background: "rgba(212,175,55,0.08)",
                    border: "1px solid rgba(212,175,55,0.2)",
                    color: "rgba(212,175,55,0.8)",
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  data-testid={`quick-action-${a.id}`}
                >
                  <Sparkles size={10} />
                  {a.label}
                </motion.button>
              ))}
            </div>

            <motion.button
              onClick={() => setChatOpen((o) => !o)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium"
              style={{
                background: "rgba(212,175,55,0.1)",
                border: "1px solid rgba(212,175,55,0.25)",
                color: "#d4af37",
              }}
              whileHover={{ scale: 1.03 }}
              data-testid="chat-toggle"
            >
              <MessageCircle size={13} />
              Style Chat
            </motion.button>

            <motion.button
              onClick={handleSave}
              disabled={saved || saveOutfitMutation.isPending}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-black transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)" }}
              whileHover={{ scale: 1.03 }}
              data-testid="save-outfit"
            >
              {saved ? <Check size={13} /> : <Save size={13} />}
              {saved ? "Saved" : "Save"}
            </motion.button>

            <motion.button
              onClick={() => handleShare("instagram")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium"
              style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
              whileHover={{ scale: 1.03 }}
              data-testid="share-button"
            >
              <Share2 size={13} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Style chat */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <StyleChat
                currentOutfit={displayResult}
                quizAnswers={quizAnswers}
                onOutfitUpdate={(newResult) => {
                  setCurrentResult(newResult);
                  sessionStorage.setItem("atelier_result", JSON.stringify(newResult));
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo preview */}
        {photoPreview && (
          <div className="flex justify-center mb-6">
            <img
              src={photoPreview}
              alt="Your photo"
              className="w-20 h-20 rounded-full object-cover"
              style={{ border: "2px solid rgba(212,175,55,0.4)" }}
            />
          </div>
        )}

        {/* Collage */}
        <OutfitCollage
          items={sortedItems}
          aesthetic={displayResult.overallAesthetic}
          quizAnswers={quizAnswers}
        />

        {/* Narrative */}
        <div
          className="rounded-xl px-5 py-4 mb-8"
          style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.12)" }}
        >
          <p className="text-sm leading-relaxed text-foreground/75 italic">{displayResult.styleNarrative}</p>
        </div>

        {/* Category filter tabs */}
        {categories.length > 1 && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory(null)}
              className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: !activeCategory ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)",
                border: !activeCategory ? "1px solid rgba(212,175,55,0.35)" : "1px solid rgba(255,255,255,0.08)",
                color: !activeCategory ? "#f5e07a" : "rgba(255,255,255,0.5)",
              }}
              data-testid="filter-all"
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
                className="flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all capitalize"
                style={{
                  background: activeCategory === cat ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.04)",
                  border: activeCategory === cat ? "1px solid rgba(212,175,55,0.35)" : "1px solid rgba(255,255,255,0.08)",
                  color: activeCategory === cat ? "#f5e07a" : "rgba(255,255,255,0.5)",
                }}
                data-testid={`filter-${cat}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Product cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredItems.map((item, i) => (
            <ProductCard key={`${item.name}-${i}`} item={item} index={i} gender={gender ?? undefined} />
          ))}
        </div>
      </div>
    </div>
  );
}
