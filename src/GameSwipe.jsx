import { useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// ─────────────────────────────────────────────────────────────────────────────
// SwipeCard — fully customisable
//
// Props:
//   scenarioLabel  string          e.g. "Scenario 1"
//   narrative      string          text shown above the card
//   image          string | node   URL string → renders as <img>
//                                  React node → rendered directly (for CSS scenes)
//   left  / right  {
//     label    string     button label & badge text
//     symbol   string     e.g. "✗" / "✓"
//     color    string     hex or rgba
//     tint     string     rgba overlay on image while pending
//     result   string     text shown in ResultScreen after confirm
//     detail   string     smaller flavour text in ResultScreen
//     onConfirm fn()      called when user confirms this choice
//   }
// ─────────────────────────────────────────────────────────────────────────────

// derive glow / border from color automatically
function derive(color) {
  return {
    glow:   color + "99",
    border: color + "aa",
  };
}

// ─── Card image area ──────────────────────────────────────────────────────────
function CardImage({ image, tint }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {typeof image === "string" ? (
        <img
          src={image}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        // custom React node (e.g. a CSS scene component)
        image
      )}

      {/* choice tint overlay */}
      <motion.div
        animate={{ background: tint || "rgba(0,0,0,0)" }}
        transition={{ duration: 0.3 }}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* top vignette */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: "30%",
        background: "linear-gradient(to bottom, rgba(4,6,20,0.72), transparent)",
        pointerEvents: "none",
      }} />
      {/* bottom vignette */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
        background: "linear-gradient(to top, rgba(4,6,20,0.9), transparent)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ─── Default CSS bus scene (used when no image prop is given) ─────────────────
function DefaultBusScene() {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(175deg, #06091f 0%, #0e1245 35%, #080c30 70%, #050818 100%)",
      }} />
      {[15, 42, 69].map((left, i) => (
        <div key={i} style={{
          position: "absolute", top: "8%", left: `${left}%`,
          width: "22%", height: "28%",
          background: "linear-gradient(180deg, rgba(180,200,255,0.07) 0%, rgba(100,130,255,0.03) 100%)",
          border: "1px solid rgba(150,170,255,0.1)", borderRadius: 4,
        }} />
      ))}
      {[0, 1].map(row =>
        [18, 52, 75].map((left, i) => (
          <div key={`${row}-${i}`} style={{
            position: "absolute", top: `${48 + row * 22}%`, left: `${left}%`,
            width: "18%", height: "14%",
            background: row === 0 && i === 0 ? "rgba(99,102,241,0.18)" : "rgba(255,255,255,0.04)",
            border: row === 0 && i === 0 ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.06)",
            borderRadius: "5px 5px 3px 3px",
          }} />
        ))
      )}
      <svg viewBox="0 0 60 120" style={{
        position: "absolute", bottom: "10%", left: "50%", transform: "translateX(-50%)",
        width: "18%", opacity: 0.85,
      }}>
        <ellipse cx="30" cy="75" rx="14" ry="28" fill="rgba(200,180,160,0.55)" />
        <circle cx="30" cy="22" r="13" fill="rgba(210,190,170,0.6)" />
        <line x1="42" y1="70" x2="52" y2="112" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" y1="58" x2="8" y2="42" stroke="rgba(200,180,160,0.45)" strokeWidth="5" strokeLinecap="round" />
        <line x1="2" y1="40" x2="28" y2="40" stroke="rgba(150,160,200,0.35)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", top: "18%", left: "5%", right: "5%", height: 2,
        background: "linear-gradient(90deg, transparent, rgba(150,160,200,0.25), transparent)",
      }} />
      {[25, 50, 75].map(l => (
        <div key={l} style={{
          position: "absolute", top: "18%", left: `${l}%`,
          width: 1.5, height: "10%", background: "rgba(150,160,200,0.2)",
        }} />
      ))}
    </div>
  );
}

// ─── SwipeCard ────────────────────────────────────────────────────────────────
export function SwipeCard({
  scenarioLabel = "Scenario 1",
  narrative     = "",
  image         = null,   // string URL or React node; null → DefaultBusScene
  left,
  right,
}) {
  const x      = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-8, 8]);
  const [pending, setPending] = useState(null);

  const leftDerived  = derive(left.color);
  const rightDerived = derive(right.color);
  const choice = pending === "left"
    ? { ...left,  ...leftDerived  }
    : pending === "right"
    ? { ...right, ...rightDerived }
    : null;

  const handleDragEnd = (_, info) => {
    const dx = info.offset.x;
    if      (dx < -70) { setPending("left");  animate(x, 0, { type: "spring", stiffness: 300, damping: 26 }); }
    else if (dx >  70) { setPending("right"); animate(x, 0, { type: "spring", stiffness: 300, damping: 26 }); }
    else               {                      animate(x, 0, { type: "spring", stiffness: 320, damping: 28 }); }
  };

  const leftOpacity  = useTransform(x, [0, -80], [0, 1]);
  const rightOpacity = useTransform(x, [0,  80], [0, 1]);

  const imageNode = image == null
    ? <DefaultBusScene />
    : typeof image === "string"
    ? <img src={image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    : image;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>

      {/* narrative label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: "center", maxWidth: "clamp(280px, 44vw, 520px)",
          padding: "10px 18px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 14, backdropFilter: "blur(8px)",
        }}
      >
        <span style={{
          fontSize: 9, fontFamily: "Verdana", letterSpacing: "0.14em",
          textTransform: "uppercase", color: "#818cf8", display: "block", marginBottom: 5,
        }}>{scenarioLabel}</span>
        <p style={{
          fontFamily: "Kalam", color: "rgba(255,255,255,0.78)",
          fontSize: "clamp(12px, 1.4vw, 14px)", lineHeight: 1.55, margin: 0,
        }}>{narrative}</p>
      </motion.div>

      {/* draggable card */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x, rotate, cursor: "grab", touchAction: "none", position: "relative", flexShrink: 0, overflow: "visible" }}
        whileTap={{ cursor: "grabbing" }}
        className="select-none"
      >
        <div style={{
          width: "clamp(280px, 44vw, 520px)",
          aspectRatio: "4/3",
          borderRadius: 20,
          overflow: "hidden",
          position: "relative",
          boxShadow: choice
            ? `0 0 0 2px ${choice.border}, 0 24px 60px rgba(0,0,0,0.7)`
            : "0 24px 60px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.07)",
          transition: "box-shadow 0.3s ease",
        }}>

          {/* image / scene */}
          <CardImage image={imageNode} tint={choice?.tint || null} />

          {/* live drag badges */}
          {[
            { side: "left",  data: left,  derived: leftDerived,  opacity: leftOpacity,  pos: { left: 14 } },
            { side: "right", data: right, derived: rightDerived, opacity: rightOpacity, pos: { right: 14 } },
          ].map(({ side, data, derived, opacity, pos }) => (
            <motion.div key={side} style={{
              opacity, position: "absolute", top: 16, zIndex: 20, pointerEvents: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              ...pos,
            }}>
              <span style={{
                fontSize: 26, fontWeight: 900, fontFamily: "Patrick Hand",
                color: data.color, textShadow: `0 0 14px ${derived.glow}`,
              }}>{data.symbol}</span>
              <span style={{
                fontSize: 9, fontFamily: "Verdana", color: data.color,
                border: `1px solid ${data.color}`, background: `${data.color}22`,
                borderRadius: 999, padding: "2px 7px", whiteSpace: "nowrap",
              }}>{data.label}</span>
            </motion.div>
          ))}

          {/* bottom: pending choice OR idle hint */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            padding: "0 16px 18px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            zIndex: 15,
          }}>
            {pending ? (
              <motion.div
                key={pending}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}
              >
                {/* choice banner */}
                <div style={{
                  width: "100%", padding: "8px 12px", borderRadius: 12,
                  background: `${choice.color}22`, border: `1px solid ${choice.border}`,
                  backdropFilter: "blur(10px)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 18, fontFamily: "Patrick Hand", color: choice.color }}>{choice.symbol}</span>
                  <span style={{ fontFamily: "Patrick Hand", fontSize: "clamp(13px, 1.5vw, 16px)", color: choice.color }}>
                    {choice.label}
                  </span>
                </div>

                {/* confirm */}
                <motion.button
                  onClick={() => choice.onConfirm && choice.onConfirm()}
                  style={{
                    width: "100%", padding: "10px 0", borderRadius: 12,
                    background: choice.color, border: "none",
                    color: "#fff", fontFamily: "Patrick Hand",
                    fontSize: "clamp(13px, 1.5vw, 15px)",
                    cursor: "pointer", letterSpacing: "0.05em",
                    boxShadow: `0 4px 20px ${choice.glow}`,
                  }}
                  whileHover={{ scale: 1.03, boxShadow: `0 6px 28px ${choice.glow}` }}
                  whileTap={{ scale: 0.97 }}
                >
                  Confirm Choice
                </motion.button>

                <span style={{ fontFamily: "Kalam", color: "rgba(255,255,255,0.3)", fontSize: "clamp(9px, 1vw, 11px)" }}>
                  swipe the other way to change
                </span>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span style={{ color: left.color,  fontSize: 10, fontFamily: "Verdana" }}>← {left.label}</span>
                <motion.span
                  animate={{ x: [-3, 3, -3] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                  style={{ color: "rgba(255,255,255,0.25)", fontSize: 15 }}
                >↔</motion.span>
                <span style={{ color: right.color, fontSize: 10, fontFamily: "Verdana" }}>{right.label} →</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Result screen ────────────────────────────────────────────────────────────
function ResultScreen({ choiceData, onReset }) {
  const { color, glow, label, result, detail, resultIcon } = choiceData;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: 16, textAlign: "center",
        maxWidth: "clamp(240px, 36vw, 360px)",
      }}
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
        <h3 style={{
          fontFamily: "Patrick Hand", fontSize: "clamp(20px, 2.8vw, 28px)",
          color, margin: "4px 0 0", textShadow: `0 0 20px ${glow}`,
        }}>{label}</h3>
      </div>

      {result && (
        <p style={{
          fontFamily: "Kalam", color: "rgba(255,255,255,0.72)",
          fontSize: "clamp(12px, 1.5vw, 15px)", lineHeight: 1.65, margin: 0,
        }}>{result}</p>
      )}

      {detail && (
        <div style={{
          padding: "12px 16px", borderRadius: 14,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
          fontFamily: "Kalam", color: "rgba(255,255,255,0.4)",
          fontSize: "clamp(10px, 1.2vw, 13px)", lineHeight: 1.6,
        }}>{detail}</div>
      )}

      <motion.button
        onClick={onReset}
        style={{
          padding: "9px 24px", borderRadius: 999, cursor: "pointer",
          background: `${color}1a`, border: `1px solid ${color}55`,
          color, fontFamily: "Kalam", fontSize: "clamp(12px, 1.3vw, 14px)",
        }}
        whileHover={{ scale: 1.06, background: `${color}2e` }}
        whileTap={{ scale: 0.95 }}
      >
        ↩ Try again
      </motion.button>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SwipeDemo — drop-in section component
//
// All scenario data lives here. Edit this one object to customise everything.
// ─────────────────────────────────────────────────────────────────────────────
const DEMO_SCENARIO = {
  scenarioLabel: "Scenario 1",
  narrative: "An elderly woman stands gripping the handrail. The bus is packed. Nobody moves.",

  // image: "/path/to/your/image.jpg"   ← swap in any URL or import
  // image: <YourCustomScene />          ← or pass a React node
  image: null,  // null → uses built-in CSS bus scene

  left: {
    label:      "Ignore her",
    symbol:     "✗",
    color:      "#ef4444",
    tint:       "rgba(120,20,20,0.42)",
    resultIcon: "😶",
    result:     "You look away. The moment passes — but something small and uncomfortable stays with you.",
    detail:     "In the full game, regret has its own path. Sometimes the harder story teaches the most.",
    // onConfirm: () => { /* navigate, set state, play sound, etc. */ },
  },

  right: {
    label:      "Offer your seat",
    symbol:     "✓",
    color:      "#6366f1",
    tint:       "rgba(20,20,100,0.42)",
    resultIcon: "🤝",
    result:     "You stand up and smile. Her face softens. A stranger nearby quietly nods at you.",
    detail:     "In the full game, this act of kindness ripples outward and unlocks three hidden storylines.",
    // onConfirm: () => { /* navigate, set state, play sound, etc. */ },
  },
};

export default function SwipeDemo(props) {
  const [confirmed, setConfirmed] = useState(null); // null | "left" | "right"

  // props override DEMO_SCENARIO — fall back to defaults for anything not passed
  const s = { ...DEMO_SCENARIO, ...props,
    left:  { ...DEMO_SCENARIO.left,  ...props.left  },
    right: { ...DEMO_SCENARIO.right, ...props.right },
  };

  // wrap onConfirm so we also record which side was chosen for ResultScreen
  const leftWithConfirm  = { ...s.left,  onConfirm: () => { s.left.onConfirm?.();  setConfirmed("left");  } };
  const rightWithConfirm = { ...s.right, onConfirm: () => { s.right.onConfirm?.(); setConfirmed("right"); } };

  const confirmedData = confirmed
    ? { ...(confirmed === "left" ? s.left : s.right), ...derive(confirmed === "left" ? s.left.color : s.right.color) }
    : null;

  return (
    <section style={{ padding: "68px 0", position: "relative" }}>
      {/* ambient glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 520, height: 520, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 36 }}>

        {/* section heading */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center" }}
        >
          <span style={{
            fontSize: 10, fontFamily: "Verdana", letterSpacing: "0.15em",
            textTransform: "uppercase", color: "#818cf8", display: "block", marginBottom: 8,
          }}>Try it now</span>
          <h2 style={{ fontFamily: "Patrick Hand", fontSize: "clamp(26px, 4vw, 44px)", color: "#fff", margin: 0 }}>
            Feel the Mechanic
          </h2>
        </motion.div>

        {/* landscape row */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
          style={{
            display: "flex", flexDirection: "row",
            alignItems: "center", justifyContent: "center",
            gap: 48, width: "100%",
          }}
        >
          {!confirmed && (
            <SwipeCard
              scenarioLabel={s.scenarioLabel}
              narrative={s.narrative}
              image={s.image}
              left={leftWithConfirm}
              right={rightWithConfirm}
            />
          )}

          {confirmed && (
            <ResultScreen
              choiceData={confirmedData}
              onReset={() => {
                s.onTryAgain?.();
                setConfirmed(null);
              }}
            />
          )}
        </motion.div>

      </div>
    </section>
  );
}