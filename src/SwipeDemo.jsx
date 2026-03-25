import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// ─── Utilities ────────────────────────────────────────────────────────────────

function colorDerive(color) {
  return { glow: color + "99", border: color + "aa" };
}

function useIsShortViewport() {
  const [isShort, setIsShort] = useState(() => window.innerHeight < 600);
  useEffect(() => {
    const handler = () => setIsShort(window.innerHeight < 600);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isShort;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function GlowLine() {
  return (
    <div className="h-px w-24 bg-linear-to-r from-transparent via-indigo-400 to-transparent opacity-60" />
  );
}

// Card background: shows an image, or falls back to the CSS bus scene
function CardBackground({ image, tint }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {typeof image === "string"
        ? <img src={image} alt="" className="w-full h-full object-cover" />
        : image
      }

      {/* color tint overlay (changes on swipe direction) */}
      <motion.div
        className="absolute inset-0"
        animate={{ background: tint || "rgba(0,0,0,0)" }}
        transition={{ duration: 0.3 }}
      />

      {/* top + bottom gradient vignettes */}
      <div className="absolute inset-x-0 top-0 h-[30%] pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(4,6,20,0.72), transparent)" }} />
      <div className="absolute inset-x-0 bottom-0 h-[40%] pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(4,6,20,0.9), transparent)" }} />
    </div>
  );
}

function DefaultBusScene() {
  return (
    <div className="absolute inset-0">
      {/* sky gradient */}
      <div className="absolute inset-0" style={{ background: "linear-gradient(175deg, #06091f 0%, #0e1245 35%, #080c30 70%, #050818 100%)" }} />

      {/* windows */}
      {[15, 42, 69].map((left, i) => (
        <div key={i} className="absolute" style={{
          top: "8%", left: `${left}%`, width: "22%", height: "28%", borderRadius: 4,
          background: "linear-gradient(180deg, rgba(180,200,255,0.07), rgba(100,130,255,0.03))",
          border: "1px solid rgba(150,170,255,0.1)",
        }} />
      ))}

      {/* seats — first seat highlighted */}
      {[0, 1].map(row =>
        [18, 52, 75].map((left, col) => {
          const highlighted = row === 0 && col === 0;
          return (
            <div key={`${row}-${col}`} className="absolute" style={{
              top: `${48 + row * 22}%`, left: `${left}%`, width: "18%", height: "14%",
              borderRadius: "5px 5px 3px 3px",
              background: highlighted ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${highlighted ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`,
            }} />
          );
        })
      )}

      {/* elderly woman silhouette */}
      <svg viewBox="0 0 60 120" className="absolute" style={{ bottom: "10%", left: "50%", transform: "translateX(-50%)", width: "18%", opacity: 0.85 }}>
        <ellipse cx="30" cy="75" rx="14" ry="28" fill="rgba(200,180,160,0.55)" />
        <circle  cx="30" cy="22" r="13"            fill="rgba(210,190,170,0.6)" />
        <line x1="42" y1="70"  x2="52" y2="112" stroke="rgba(255,255,255,0.3)"   strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="58"  x2="8"  y2="42"  stroke="rgba(200,180,160,0.45)" strokeWidth="5"   strokeLinecap="round" />
        <line x1="2"  y1="40"  x2="28" y2="40"  stroke="rgba(150,160,200,0.35)" strokeWidth="3"   strokeLinecap="round" />
      </svg>

      {/* handrail */}
      <div className="absolute" style={{ top: "18%", left: "5%", right: "5%", height: 2, background: "linear-gradient(90deg, transparent, rgba(150,160,200,0.25), transparent)" }} />
      {[25, 50, 75].map(l => (
        <div key={l} className="absolute" style={{ top: "18%", left: `${l}%`, width: 1.5, height: "10%", background: "rgba(150,160,200,0.2)" }} />
      ))}
    </div>
  );
}

// Shows after confirming a choice on the homepage demo
function ResultScreen({ choiceData, onReset }) {
  const { color, glow, label, result, detail, resultIcon } = choiceData;

  return (
    <motion.div
      className="flex flex-col items-center gap-4 text-center"
      style={{ maxWidth: "clamp(240px, 36vw, 360px)" }}
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {resultIcon && (
        <motion.div
          animate={{ scale: [0.6, 1.2, 1] }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: 52, filter: `drop-shadow(0 0 20px ${glow})` }}
        >
          {resultIcon}
        </motion.div>
      )}

      <div>
        <span style={{ fontSize: 9, fontFamily: "Verdana", letterSpacing: "0.12em", color, textTransform: "uppercase" }}>
          You chose
        </span>
        <h3 style={{ fontFamily: "Patrick Hand", fontSize: "clamp(20px, 2.8vw, 28px)", color, margin: "4px 0 0", textShadow: `0 0 20px ${glow}` }}>
          {label}
        </h3>
      </div>

      {result && (
        <p style={{ fontFamily: "Kalam", color: "rgba(255,255,255,0.72)", fontSize: "clamp(12px, 1.5vw, 15px)", lineHeight: 1.65, margin: 0 }}>
          {result}
        </p>
      )}

      {detail && (
        <div style={{ padding: "12px 16px", borderRadius: 14, fontFamily: "Kalam", lineHeight: 1.6, fontSize: "clamp(10px, 1.2vw, 13px)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.4)" }}>
          {detail}
        </div>
      )}

      <motion.button
        onClick={onReset}
        style={{ padding: "9px 24px", borderRadius: 999, cursor: "pointer", fontFamily: "Kalam", fontSize: "clamp(12px, 1.3vw, 14px)", color, background: `${color}1a`, border: `1px solid ${color}55` }}
        whileHover={{ scale: 1.06, background: `${color}2e` }}
        whileTap={{ scale: 0.95 }}
      >
        ↩ Try again
      </motion.button>
    </motion.div>
  );
}

// ─── SwipeCard ────────────────────────────────────────────────────────────────

export function SwipeCard({ scenarioLabel, image = null, left, right }) {
  const x      = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-8, 8]);
  const [pending, setPending] = useState(null); // "left" | "right" | null

  const leftDerived  = colorDerive(left.color);
  const rightDerived = colorDerive(right.color);

  // the currently selected choice (if any)
  const choice = pending === "left"  ? { ...left,  ...leftDerived  }
               : pending === "right" ? { ...right, ...rightDerived }
               : null;

  // badge opacity tied to drag distance
  const leftOpacity  = useTransform(x, [0, -80], [0, 1]);
  const rightOpacity = useTransform(x, [0,  80], [0, 1]);

  const imageNode = image === null   ? <DefaultBusScene />
                  : typeof image === "string" ? <img src={image} alt="" className="w-full h-full object-cover" />
                  : image;

  function handleDragEnd(_, info) {
    const dx = info.offset.x;
    const snap = (stiffness = 300) => animate(x, 0, { type: "spring", stiffness, damping: 26 });
    if      (dx < -70) { setPending("left");  snap(); }
    else if (dx >  70) { setPending("right"); snap(); }
    else               {                      snap(320); }
  }

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.33}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, cursor: "grab", touchAction: "none", overflow: "visible", flexShrink: 0 }}
      whileTap={{ cursor: "grabbing" }}
      className="select-none relative"
    >
      <div style={{
        width: "clamp(220px, 30vw, 360px)",
        aspectRatio: "3/4",
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        boxShadow: choice
          ? `0 0 0 2px ${choice.border}, 0 24px 60px rgba(0,0,0,0.7)`
          : "0 24px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.07)",
        transition: "box-shadow 0.3s ease",
      }}>
        <CardBackground image={imageNode} tint={choice?.tint ?? null} />

        {/* scenario label — top center badge */}
        {scenarioLabel && (
          <div className="absolute top-0 inset-x-0 flex justify-center pt-3.5 z-20 pointer-events-none">
            <span style={{ fontSize: 9, fontFamily: "Verdana", letterSpacing: "0.14em", textTransform: "uppercase", color: "#818cf8", background: "rgba(2,7,24,0.55)", backdropFilter: "blur(6px)", padding: "3px 10px", borderRadius: 999, border: "1px solid rgba(99,102,241,0.3)" }}>
              {scenarioLabel}
            </span>
          </div>
        )}

        {/* left / right drag indicator badges */}
        {[
          { side: "left",  data: left,  derived: leftDerived,  opacity: leftOpacity,  style: { left: 14  } },
          { side: "right", data: right, derived: rightDerived, opacity: rightOpacity, style: { right: 14 } },
        ].map(({ side, data, derived, opacity, style }) => (
          <motion.div key={side} className="absolute top-4 z-20 pointer-events-none flex flex-col items-center gap-1" style={{ opacity, ...style }}>
            <span style={{ fontSize: 26, fontWeight: 900, fontFamily: "Patrick Hand", color: data.color, textShadow: `0 0 14px ${derived.glow}` }}>
              {data.symbol}
            </span>
            <span style={{ fontSize: 9, fontFamily: "Verdana", color: data.color, background: `${data.color}22`, border: `1px solid ${data.color}`, borderRadius: 999, padding: "2px 7px", whiteSpace: "nowrap" }}>
              {data.label}
            </span>
          </motion.div>
        ))}

        {/* bottom section: pending choice UI or idle swipe hint */}
        <div className="absolute bottom-0 inset-x-0 z-15 flex flex-col items-center gap-2.5 px-4 pb-4.5">
          {pending ? (
            <PendingChoiceUI choice={choice} />
          ) : (
            <IdleHint left={left} right={right} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

function PendingChoiceUI({ choice }) {
  return (
    <motion.div
      key={choice.label}
      className="w-full flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* selected choice label */}
      <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl" style={{ backdropFilter: "blur(10px)", background: `${choice.color}22`, border: `1px solid ${choice.border}` }}>
        <span style={{ fontSize: 18, fontFamily: "Patrick Hand", color: choice.color }}>{choice.symbol}</span>
        <span style={{ fontFamily: "Patrick Hand", fontSize: "clamp(13px, 1.5vw, 16px)", color: choice.color }}>{choice.label}</span>
      </div>

      {/* confirm button */}
      <motion.button
        className="w-full py-2.5 rounded-xl text-white"
        style={{ fontFamily: "Patrick Hand", fontSize: "clamp(13px, 1.5vw, 15px)", cursor: "pointer", letterSpacing: "0.05em", border: "none", background: "#6366f1", boxShadow: "0 4px 20px #6366f1" }}
        onClick={() => choice.onConfirm?.()}
        whileHover={{ scale: 1.03, boxShadow: "0 6px 28px #6366f1" }}
        whileTap={{ scale: 0.97 }}
      >
        Confirm Choice
      </motion.button>

      <span style={{ fontFamily: "Kalam", color: "rgba(255,255,255,0.3)", fontSize: "clamp(9px, 1vw, 11px)" }}>
        swipe the other way to change
      </span>
    </motion.div>
  );
}

function IdleHint({ left, right }) {
  return (
    <motion.div key="idle" className="flex items-center gap-2.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <span style={{ color: left.color,  fontSize: 10, fontFamily: "Verdana" }}>← {left.label}</span>
      <motion.span
        animate={{ x: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
        style={{ color: "rgba(255,255,255,0.25)", fontSize: 15 }}
      >↔</motion.span>
      <span style={{ color: right.color, fontSize: 10, fontFamily: "Verdana" }}>{right.label} →</span>
    </motion.div>
  );
}

// ─── Default scenario (used by homepage demo) ─────────────────────────────────

const DEMO_SCENARIO = {
  scenarioLabel: "Scenario 1",
  narrative: "An elderly woman stands gripping the handrail. The bus is packed. Nobody moves.",
  image: null,
  left: {
    label: "Ignore her", symbol: "✗", color: "#ef4444", tint: "rgba(120,20,20,0.42)",
    resultIcon: "😶",
    result: "You look away. The moment passes — but something small and uncomfortable stays with you.",
    detail: "In the full game, regret has its own path. Sometimes the harder story teaches the most.",
  },
  right: {
    label: "Offer your seat", symbol: "✓", color: "#6366f1", tint: "rgba(20,20,100,0.42)",
    resultIcon: "🤝",
    result: "You stand up and smile. Her face softens. A stranger nearby quietly nods at you.",
    detail: "In the full game, this act of kindness ripples outward and unlocks three hidden storylines.",
  },
};

// ─── SwipeDemo ────────────────────────────────────────────────────────────────
//
// Props (all optional, falls back to DEMO_SCENARIO):
//   heading       string     section heading text
//   tryit         bool       show "Try it now" eyebrow label
//   scenarioLabel string     label shown inside the narrative box
//   narrative     string     narrative body text
//   image         string     card image URL
//   left / right  object     choice data (see DEMO_SCENARIO shape above)
//   onTryAgain    fn         called when result screen "Try again" is clicked

export default function SwipeDemo(props) {
  const [confirmed, setConfirmed] = useState(null);
  const isShort = useIsShortViewport();

  // merge props over defaults
  const s = {
    ...DEMO_SCENARIO,
    ...props,
    left:  { ...DEMO_SCENARIO.left,  ...props.left  },
    right: { ...DEMO_SCENARIO.right, ...props.right },
  };

  const heading = props.heading || "Feel the Mechanic";
  const tryit   = props.tryit || false;

  // wrap each onConfirm: if an external handler exists, defer to it (game scenes);
  // otherwise show the result screen (homepage demo)
  function withConfirm(option, side) {
    return {
      ...option,
      onConfirm: () => {
        option.onConfirm?.();
        if (!option.onConfirm) setConfirmed(side);
      },
    };
  }

  const confirmedData = confirmed
    ? { ...(confirmed === "left" ? s.left : s.right), ...colorDerive(confirmed === "left" ? s.left.color : s.right.color) }
    : null;

  // layout flips to row when screen is too short to stack vertically
  const layout = {
    flexDirection: isShort ? "row" : "column",
    gap: isShort ? 48 : 32,
  };

  const textColumn = {
    flex: isShort ? "1 1 220px" : "0 0 auto",
    maxWidth: isShort ? 400 : 520,
    textAlign: isShort ? "left" : "center",
    alignItems: isShort ? "flex-start" : "center",
  };

  return (
    <section className="relative w-full flex items-start justify-center" style={{ padding: "80px 24px"}}>

      {/* ambient glow blob */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-130 h-130 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)" }}
      />

      <div className="flex items-center justify-center w-full max-w-300 mx-auto px-10" style={layout}>

        {/* ── Text column: heading + narrative ── */}
        <motion.div
          className="flex flex-col w-full"
          style={textColumn}
          initial={{ opacity: 0, x: isShort ? -20 : 0, y: isShort ? 0 : -20 }}
          whileInView={{ opacity: 1, x: 0, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {tryit && (
            <span className="mb-2" style={{ fontSize: 10, fontFamily: "Verdana", letterSpacing: "0.15em", textTransform: "uppercase", color: "#818cf8" }}>
              Try it now
            </span>
          )}

          <h2 style={{ fontFamily: "Patrick Hand", fontSize: "clamp(24px, 3.5vw, 52px)", color: "#fff", margin: "0 0 16px", lineHeight: 1.15 }}>
            {heading}
          </h2>

          <div style={{ display: "flex", justifyContent: isShort ? "flex-start" : "center", marginBottom: 16 }}>
            <GlowLine />
          </div>

          {/* narrative box */}
          <motion.div
            style={{ padding: "14px 18px", borderRadius: 14, backdropFilter: "blur(8px)", maxWidth: "clamp(220px, 40vw, 420px)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {s.scenarioLabel && (
              <span style={{ fontSize: 9, fontFamily: "Verdana", letterSpacing: "0.14em", textTransform: "uppercase", color: "#818cf8", display: "block", marginBottom: 8 }}>
                {s.scenarioLabel}
              </span>
            )}
            <p style={{ fontFamily: "Kalam", color: "rgba(255,255,255,0.75)", fontSize: "clamp(12px, 1.3vw, 14px)", lineHeight: 1.6, margin: 0 }}>
              {s.narrative}
            </p>
          </motion.div>
        </motion.div>

        {/* ── Card column ── */}
        <motion.div
          className="flex items-center justify-center flex-none"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {confirmed ? (
            <ResultScreen
              choiceData={confirmedData}
              onReset={() => { s.onTryAgain?.(); setConfirmed(null); }}
            />
          ) : (
            <SwipeCard
              image={s.image}
              left={withConfirm(s.left,  "left")}
              right={withConfirm(s.right, "right")}
            />
          )}
        </motion.div>

      </div>
    </section>
  );
}