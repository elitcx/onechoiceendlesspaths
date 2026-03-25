import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function OrientationCheck({ children }) {
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!isLandscape && (
          <motion.div
            key="orientation-block"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 28,
              background: "linear-gradient(135deg, #020718 0%, #020718 60%, #0B2587 100%)",
              textAlign: "center",
              padding: "32px",
            }}
          >
            {/* ambient glow */}
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: 300, height: 300,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)",
              filter: "blur(30px)",
              pointerEvents: "none",
            }} />

            {/* rotating phone icon */}
            <motion.div
              animate={{ rotate: [0, 90, 90, 0, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", times: [0, 0.35, 0.65, 0.9, 1] }}
              style={{ fontSize: 64, filter: "drop-shadow(0 0 18px rgba(99,102,241,0.7))" }}
            >
              📱
            </motion.div>

            {/* arrow hinting rotation */}
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], x: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ fontSize: 22, color: "rgba(99,102,241,0.8)" }}
            >
              ↻
            </motion.div>

            {/* text */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 1 }}
            >
              <h1 style={{
                fontFamily: "Patrick Hand",
                fontSize: "clamp(22px, 5vw, 30px)",
                color: "#fff",
                margin: 0,
                letterSpacing: "0.02em",
              }}>
                Rotate Your Device
              </h1>
              <p style={{
                fontFamily: "Kalam",
                fontSize: "clamp(13px, 3vw, 16px)",
                color: "rgba(255,255,255,0.45)",
                margin: 0,
                lineHeight: 1.6,
              }}>
                This page is best experienced<br />in landscape mode.
              </p>
            </motion.div>

            {/* pulsing border pill */}
            <motion.div
              animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                padding: "8px 22px",
                borderRadius: 999,
                border: "1px solid rgba(99,102,241,0.45)",
                background: "rgba(99,102,241,0.1)",
                color: "#818cf8",
                fontFamily: "Verdana",
                fontSize: 10,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              Landscape mode required
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* always render children so they're ready when rotated */}
      <div style={{ visibility: isLandscape ? "visible" : "hidden" }}>
        {children}
      </div>
    </>
  );
}