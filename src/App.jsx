import { useState, useRef, useEffect } from 'react'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion"
import OrientationCheck from './OrientationCheck.jsx'
import SwipeDemo from './SwipeDemo.jsx'
import SCENES, { SCENE_MAP } from './scenes.js'

// ─────────────────────────────────────────────────────────────────────────────
// Tiny shared components
// ─────────────────────────────────────────────────────────────────────────────

function GlowLine({ className = '' }) {
  return (
    <div className={`h-px w-24 bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-60 ${className}`} />
  );
}

// Fades + slides up when element enters the viewport
function RevealSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 56 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Fades each letter in one by one
function AnimatedTitle({ text, className = '' }) {
  return (
    <motion.h1 className={className}>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 + i * 0.035, ease: [0.22, 1, 0.36, 1] }}
          style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : undefined }}
        >
          {char}
        </motion.span>
      ))}
    </motion.h1>
  );
}

// Drifting particle dots in the background
function ParticleField() {
  // generate once so particles don't re-randomize on re-render
  const particles = useRef(
    Array.from({ length: 38 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      duration: Math.random() * 18 + 10,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.45 + 0.1,
      driftX: Math.random() * 30 - 15,
    }))
  ).current;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-indigo-300"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -60, 0], x: [0, p.driftX, 0], opacity: [p.opacity, p.opacity * 1.8, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// Homepage feature card
function FeatureCard({ icon, title, desc, delay }) {
  return (
    <RevealSection delay={delay}>
      <motion.div
        className="relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden cursor-default"
        whileHover={{ borderColor: 'rgba(99,102,241,0.5)', backgroundColor: 'rgba(99,102,241,0.08)' }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
        <div className="text-3xl mb-3">{icon}</div>
        <h3 className="text-white font-semibold text-lg mb-2" style={{ fontFamily: 'Patrick Hand' }}>{title}</h3>
        <p className="text-white/60 text-sm leading-relaxed" style={{ fontFamily: 'Kalam' }}>{desc}</p>
      </motion.div>
    </RevealSection>
  );
}

// Wrapper that fades between screens
function FadeTransition({ children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Home',    page: 1, sectionId: 'home'    },
  { label: 'About',   page: 1, sectionId: 'about'   },
  { label: 'Contact', page: 1, sectionId: 'contact' },
  { label: 'Game',    page: 2, sectionId: null       },
];

function NavigationBar({ onNavigate, currentPage }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [underline, setUnderline]     = useState({ left: 0, width: 0 });
  const linkRefs = useRef([]);
  const isAutoScrolling = useRef(false);
  const manualIndex = useRef(null);
  
  function updateUnderline() {
    const idx = currentPage === 2
      ? NAV_LINKS.findIndex(l => l.page === 2)
      : (manualIndex.current ?? activeIndex);

    const el = linkRefs.current[idx];
    if (el) {
      setUnderline({
        left: el.offsetLeft,
        width: el.offsetWidth
      });
    }
  }

  // keep the underline in sync with the active link
  useEffect(() => {
    updateUnderline();
  }, [activeIndex, currentPage]);

  useEffect(() => {
    function handleResize() {
      updateUnderline();
    }

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex, currentPage]);

  // scroll-spy: highlight the section currently in view
  useEffect(() => {
    if (currentPage !== 1) return;
    const container = document.getElementById('app-root');
    if (!container) return;
    const sectionIds = ['home', 'about', 'contact'];

    function onScroll() {
      if (isAutoScrolling.current) return;

      const container = document.getElementById('app-root');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();

      let foundIdx = 0;

      sectionIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;

        const rect = el.getBoundingClientRect();

        // section is considered active when near top of viewport
        if (rect.top - containerRect.top <= 150) {
          foundIdx = i;
        }
  });

  const isAtBottom =
    container.scrollTop + container.clientHeight >= container.scrollHeight - 5;

  if (isAtBottom) {
    foundIdx = sectionIds.length - 1;
  }

  setActiveIndex(foundIdx);
}

    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set correct state on mount

    return () => container.removeEventListener('scroll', onScroll);
  }, [currentPage]);

  function handleClick(link, index) {
    manualIndex.current = index;
    setActiveIndex(index);

    if (link.page !== currentPage) {
      onNavigate(link.page, link.sectionId);
      return;
    }

    if (link.sectionId) {
      const container = document.getElementById('app-root');
      const target    = document.getElementById(link.sectionId);

      if (container && target) {
        isAutoScrolling.current = true;

        container.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });

        setTimeout(() => {
          isAutoScrolling.current = false;
          manualIndex.current = null; // release lock after scroll
        }, 900);
      }
    }
}

  return (
    <div className="mx-auto max-w-4xl px-5 py-3 sticky z-50 top-0 w-full">
      <div className="w-full rounded-full border border-white/20 shadow-[0_4px_40px_rgba(99,102,241,0.15)] backdrop-blur-md bg-white/5 flex items-center py-2 md:py-6">
        <div className="flex px-2 py-1 w-full relative">
          <nav className="flex text-[8px] md:text-[12px] lg:text-base justify-around items-center w-full text-white" style={{ fontFamily: 'Verdana' }}>
            {NAV_LINKS.map((link, idx) => (
              <motion.a
                key={link.label}
                ref={el => (linkRefs.current[idx] = el)}
                onClick={() => handleClick(link, idx)}
                style={{ cursor: 'pointer', paddingBottom: 2 }}
                whileHover={{ scale: 1.1, color: '#a5b4fc' }}
                transition={{ duration: 0.18 }}
              >
                {link.label}
              </motion.a>
            ))}
          </nav>
          <motion.div
            className="absolute bottom-0 h-0.5 bg-indigo-400"
            animate={{ left: underline.left, width: underline.width }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Game data
// ─────────────────────────────────────────────────────────────────────────────

const ENDINGS_META = [
  { id: 'ending_good',      label: 'Good',      color: '#6366f1', glow: 'rgba(99,102,241,0.6)',  icon: '🤝', desc: 'The path of empathy'     },
  { id: 'ending_neutral_1', label: 'Neutral 1',  color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', icon: '⚖️', desc: 'The path of hesitation'   },
  { id: 'ending_neutral_2', label: 'Neutral 2',  color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', icon: '⚖️', desc: 'The path of hesitation'   },
  { id: 'ending_bad',       label: 'Bad',        color: '#ef4444', glow: 'rgba(239,68,68,0.5)',   icon: '😶', desc: 'The path of indifference' },
];

const ENDING_THEMES = {
  good:    { color: '#6366f1', glow: 'rgba(99,102,241,0.5)',  label: 'Good Ending'    },
  bad:     { color: '#ef4444', glow: 'rgba(239,68,68,0.5)',   label: 'Bad Ending'     },
  neutral: { color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', label: 'Neutral Ending' },
};

const PROLOGUE_STEPS = [
  {
    image: '/assets/prologue1.webp',
    text: "You step onto a crowded bus after a long day. The air feels heavy, and every seat is taken."
  },
  {
    image: '/assets/prologue2.webp',
    text: "An elderly person boards slowly, scanning the bus for a place to sit."
  },
  {
    image: '/assets/prologue3.webp',
    text: "You hesitate. It's just one small decision… but it might matter more than you think."
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// Game screens
// ─────────────────────────────────────────────────────────────────────────────

// Shared structure used by both PrologueScreen and EndingScreen
function FullscreenImageSlideshow({ images, badge, badgeStyle = {}, bottomContent, onAdvance, canAdvance }) {
  const [index, setIndex] = useState(0);
  const hasMore = index < images.length - 1;

  function advance() {
    if (hasMore) setIndex(i => i + 1);
    else onAdvance?.();
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto cursor-pointer"
      style={{ background: '#020718' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 1.0, ease: 'easeInOut' }}
      onClick={canAdvance !== false ? advance : undefined}
    >
      {/* crossfading background image */}
      <AnimatePresence mode="wait">
        <motion.div key={index} className="fixed inset-0" style={{ backgroundColor: '#020718' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
        >
          {images[index] && (
            <img src={images[index]} alt="" className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* gradient overlay */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(2,7,24,0.98) 0%, rgba(2,7,24,0.6) 50%, rgba(2,7,24,0.2) 100%)' }}
      />

      {/* UI layer */}
      <div className="relative z-10 flex flex-col items-center justify-between px-6 py-8" style={{ minHeight: '100dvh' }}>

        {/* top badge */}
        <motion.div
          className="px-4 py-1.5 rounded-full border text-xs tracking-widest uppercase"
          style={{ fontFamily: 'Verdana', ...badgeStyle }}
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {badge}
        </motion.div>

        <div className="flex-1" />

        {/* bottom content */}
        <div className="w-full max-w-xl flex flex-col items-center text-center gap-4">
          {bottomContent({ hasMore, index, advance })}
        </div>
      </div>
    </motion.div>
  );
}

function PrologueScreen({ onDone }) {
  return (
    <FullscreenImageSlideshow
      images={PROLOGUE_STEPS.map(s => s.image)}
      badge="Prologue"
      badgeStyle={{
        color: '#818cf8',
        borderColor: 'rgba(99,102,241,0.4)',
        background: 'rgba(99,102,241,0.1)',
      }}
      onAdvance={onDone}
      bottomContent={({ hasMore, index }) => (
        <>
          {/* TEXT (this is what you wanted) */}
          <motion.p
            key={index}
            style={{
              fontFamily: 'Kalam',
              fontSize: 'clamp(12px, 2.5vw, 15px)',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.7,
              margin: 0,
              whiteSpace: 'pre-line'
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {PROLOGUE_STEPS[index].text}
          </motion.p>

          {/* divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              height: 1,
              width: 96,
              background: 'linear-gradient(90deg, transparent, #6366f1, transparent)'
            }}
          />

          {/* dots */}
          <div className="flex gap-1.5">
            {PROLOGUE_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === index ? 20 : 6,
                  height: 6,
                  borderRadius: 999,
                  background: i === index ? '#6366f1' : 'rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>

          {/* tap hint */}
          <motion.p
            className="text-sm"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              fontFamily: 'Verdana',
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              margin: 0
            }}
          >
            {hasMore ? 'Tap anywhere to continue' : 'Tap anywhere to begin'}
          </motion.p>
        </>
      )}
    />
  );
}

function EndingScreen({ scene, onPlayAgain }) {
  const theme = ENDING_THEMES[scene.endingType] || ENDING_THEMES.neutral;
  const images = Array.isArray(scene.image) ? scene.image : [scene.image].filter(Boolean);

  return (
    <FullscreenImageSlideshow
      images={images}
      badge={theme.label}
      badgeStyle={{ color: theme.color, borderColor: theme.color + '55', background: theme.color + '18', boxShadow: `0 0 20px ${theme.glow}`, whiteSpace: 'nowrap'}}
      bottomContent={({ hasMore }) => (
        <>
          <motion.h2
            className="font-bold text-white"
            style={{ fontFamily: 'Patrick Hand', fontSize: 'clamp(22px, 5vw, 36px)', textShadow: `0 0 30px ${theme.glow}`, margin: 0 }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
          >
            {scene.scenarioLabel}
          </motion.h2>

          <motion.div
            style={{ height: 1, width: 96, background: `linear-gradient(90deg, transparent, ${theme.color}, transparent)` }}
            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          />

          <AnimatePresence mode="wait">
            {!hasMore && (
              <motion.p
                key="endtext"
                style={{ fontFamily: 'Kalam', fontSize: 'clamp(12px, 2.5vw, 15px)', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, whiteSpace: 'pre-line', margin: 0 }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.7, delay: 0.9 }}
              >
                {scene.endingText}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.6 }} style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)', marginTop: 4 }}>
            {hasMore ? (
              <motion.p
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                style={{ fontFamily: 'Verdana', fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase', cursor: 'pointer', margin: 0 }}
              >
                Tap anywhere to continue
              </motion.p>
            ) : (
              <motion.button
                onClick={e => { e.stopPropagation(); onPlayAgain(); }}
                style={{ padding: '12px 36px', borderRadius: 999, border: 'none', background: theme.color, color: '#fff', fontFamily: 'Patrick Hand', fontSize: 'clamp(14px, 3vw, 17px)', cursor: 'pointer', letterSpacing: '0.06em', boxShadow: `0 0 24px ${theme.glow}` }}
                whileHover={{ scale: 1.06, boxShadow: `0 0 44px ${theme.glow}` }}
                whileTap={{ scale: 0.96 }}
              >
                ▶ Play Again
              </motion.button>
            )}
          </motion.div>
        </>
      )}
    />
  );
}

// Ending cards shown on the landing screen
function EndingCard({ label, unlocked, color, glow, icon, desc }) {
  return (
    <div style={{
      width: 120, height: 170, borderRadius: 16, padding: '18px 12px 14px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      position: 'relative', overflow: 'hidden',
      border: `1px solid ${unlocked ? color + '55' : 'rgba(255,255,255,0.07)'}`,
      background: unlocked ? `linear-gradient(160deg, ${color}22, ${color}08)` : 'rgba(255,255,255,0.02)',
      boxShadow: unlocked ? `0 0 32px ${glow}, inset 0 0 20px ${color}0a` : 'none',
    }}>
      {unlocked && (
        <div className="absolute top-0 inset-x-0 h-0.5" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      )}
      <div style={{ fontSize: 32, opacity: unlocked ? 1 : 0.15, filter: unlocked ? `drop-shadow(0 0 10px ${glow})` : 'none' }}>
        {unlocked ? icon : '?'}
      </div>
      <div className="text-center flex flex-col gap-1">
        <span style={{ fontFamily: 'Patrick Hand', fontSize: 18, fontWeight: 700, letterSpacing: '0.05em', color: unlocked ? color : 'rgba(255,255,255,0.15)', textShadow: unlocked ? `0 0 12px ${glow}` : 'none' }}>
          {label}
        </span>
        <span style={{ fontFamily: 'Kalam', fontSize: 10, lineHeight: 1.4, color: unlocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)' }}>
          {unlocked ? desc : '???'}
        </span>
      </div>
      <div style={{ fontSize: 11, opacity: unlocked ? 0.5 : 0.2, color: unlocked ? color : 'rgba(255,255,255,0.3)' }}>
        {unlocked ? '✦ Unlocked' : '🔒 Locked'}
      </div>
    </div>
  );
}

function LandingScreen({ onStart, endings }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 cursor-pointer"
      style={{ background: 'rgba(2, 7, 24, 0.93)', backdropFilter: 'blur(8px)' }}
      onClick={onStart}
    >
      <motion.div className="flex flex-col items-center gap-1" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="text-white/25 text-[10px] tracking-[0.2em] uppercase" style={{ fontFamily: 'Verdana' }}>
          Endings Discovered
        </span>
        <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </motion.div>

      <div className="grid grid-cols-2 md:flex gap-5 items-end md:flex-wrap justify-center">
        {endings.map((ending, i) => (
          <motion.div key={ending.label} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.1 }}>
            <EndingCard {...ending} />
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-white/50 text-sm tracking-[0.2em] uppercase"
        style={{ fontFamily: 'Verdana' }}
        animate={{ opacity: [0.35, 0.9, 0.35] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
      >
        Press any button to start
      </motion.p>
    </div>
  );
}

// The game loop — renders scenes, handles navigation + fade-to-ending
function Game({ onRestart, unlockEnding }) {
  const [currentId, setCurrentId] = useState('scene_1');
  const [fadingTo,  setFadingTo]  = useState(null);
  const [fading,    setFading]    = useState(false);

  const scene = SCENES.find(s => s.id === currentId);

  useEffect(() => {
    if (scene?.isEnding) unlockEnding(scene.id);
  }, [scene?.id, scene?.isEnding, unlockEnding]);

  function go(side) {
    const nextId    = SCENE_MAP[currentId]?.[side];
    if (!nextId) return;
    const nextScene = SCENES.find(s => s.id === nextId);
    if (nextScene?.isEnding) {
      setFading(true);
      setFadingTo(nextId);
    } else {
      setCurrentId(nextId);
    }
  }

  function onFadeComplete() {
    if (fadingTo) { setCurrentId(fadingTo); setFadingTo(null); setFading(false); }
  }

  if (scene.isEnding) {
    return (
      <OrientationCheck>
        <EndingScreen scene={scene} onPlayAgain={onRestart} />
      </OrientationCheck>
    );
  }

  return (
    <div className="relative">
      <SwipeDemo
        key={currentId}
        scenarioLabel={scene.scenarioLabel}
        heading={scene.heading}
        narrative={scene.narrative}
        image={scene.image}
        left={scene.left  ? { ...scene.left,  onConfirm: () => go('left')  } : undefined}
        right={scene.right ? { ...scene.right, onConfirm: () => go('right') } : undefined}
      />

      {/* black fade overlay before switching to an ending */}
      <AnimatePresence>
        {fading && (
          <motion.div
            className="fixed inset-0 z-50 bg-black pointer-events-none"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: 'easeInOut' }}
            onAnimationComplete={onFadeComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Template variables expected: {{from_name}}, {{from_email}}, {{message}}
// ─────────────────────────────────────────────────────────────────────────────

const EMAILJS_SERVICE_ID  = 'service_3h7h4p6';
const EMAILJS_TEMPLATE_ID = 'template_g5fykjq';
const EMAILJS_PUBLIC_KEY  = 'oUMAX2luFDlUku81u';

function ContactForm() {
  const [fields,  setFields]  = useState({ name: '', email: '', message: '' });
  const [status,  setStatus]  = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'

  // load EmailJS SDK on first render
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    script.onload = () => window.emailjs.init(EMAILJS_PUBLIC_KEY);
    document.head.appendChild(script);
  }, []);

  function handleChange(e) {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fields.name || !fields.email || !fields.message) return;
    setStatus('sending');
    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name:  fields.name,
        from_email: fields.email,
        message:    fields.message,
      });
      setStatus('sent');
      setFields({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)',
    color: '#fff',
    fontFamily: 'Kalam',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: 'Verdana',
    fontSize: 9,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: '#818cf8',
    marginBottom: 6,
  };

  if (status === 'sent') {
    return (
      <motion.div
        className="flex flex-col items-center justify-center gap-4 text-center py-12"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ fontSize: 48 }}>✦</div>
        <h3 style={{ fontFamily: 'Patrick Hand', fontSize: 24, color: '#6366f1', margin: 0 }}>Message Sent!</h3>
        <p style={{ fontFamily: 'Kalam', color: 'rgba(255,255,255,0.5)', margin: 0 }}>We'll get back to you soon.</p>
        <motion.button
          onClick={() => setStatus('idle')}
          style={{ marginTop: 8, padding: '8px 20px', borderRadius: 999, border: '1px solid rgba(99,102,241,0.4)', background: 'transparent', color: '#818cf8', fontFamily: 'Kalam', fontSize: 13, cursor: 'pointer' }}
          whileHover={{ background: 'rgba(99,102,241,0.1)' }}
        >
          Send another
        </motion.button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Name</label>
        <input
          name="name"
          value={fields.name}
          onChange={handleChange}
          placeholder="Your name"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.6)')}
          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>Email</label>
        <input
          name="email"
          type="email"
          value={fields.email}
          onChange={handleChange}
          placeholder="your@email.com"
          style={inputStyle}
          onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.6)')}
          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          required
        />
      </div>

      <div>
        <label style={labelStyle}>Message</label>
        <textarea
          name="message"
          value={fields.message}
          onChange={handleChange}
          placeholder="What's on your mind?"
          rows={5}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
          onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.6)')}
          onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          required
        />
      </div>

      {status === 'error' && (
        <p style={{ fontFamily: 'Kalam', color: '#ef4444', fontSize: 13, margin: 0 }}>
          Something went wrong. Please try again or reach us on Instagram.
        </p>
      )}

      <motion.button
        type="submit"
        disabled={status === 'sending'}
        style={{
          padding: '13px 0',
          borderRadius: 12,
          border: 'none',
          background: status === 'sending' ? 'rgba(99,102,241,0.4)' : '#6366f1',
          color: '#fff',
          fontFamily: 'Patrick Hand',
          fontSize: 16,
          cursor: status === 'sending' ? 'not-allowed' : 'pointer',
          letterSpacing: '0.06em',
          boxShadow: '0 0 20px rgba(99,102,241,0.35)',
        }}
        whileHover={status !== 'sending' ? { scale: 1.02, boxShadow: '0 0 32px rgba(99,102,241,0.6)' } : {}}
        whileTap={status !== 'sending' ? { scale: 0.98 } : {}}
      >
        {status === 'sending' ? 'Sending…' : 'Send Message ✦'}
      </motion.button>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Exit button shown during game session (replaces navbar)
// ─────────────────────────────────────────────────────────────────────────────
 
function ExitButton({ onExit }) {
  return (
    <motion.button
      onClick={onExit}
      className="fixed top-5 left-5 z-40 flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md text-white/50 text-xs"
      style={{ fontFamily: 'Verdana', letterSpacing: '0.1em', cursor: 'pointer' }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.4 }}
      whileHover={{ borderColor: 'rgba(99,102,241,0.5)', color: '#a5b4fc', background: 'rgba(99,102,241,0.08)' }}
      whileTap={{ scale: 0.95 }}
    >
      ← Exit Game
    </motion.button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Homepage
// ─────────────────────────────────────────────────────────────────────────────

function HomePage({ onPlayClick }) {
  const aboutRef = useRef(null);
  const heroRef  = useRef(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY       = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <div className="h-full relative">

      {/* ── Hero section ── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col justify-center items-center text-white px-6 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
        />

        <motion.div style={{ opacity: heroOpacity, y: heroY }} className="relative z-10 flex flex-col items-center text-center max-w-4xl">
          <motion.div
            id="home"
            className="mb-6 px-4 py-1.5 rounded-full border border-indigo-400/40 bg-indigo-500/10 text-indigo-300 text-xs tracking-widest uppercase"
            style={{ fontFamily: 'Verdana' }}
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Interactive Narrative Game
          </motion.div>

          <AnimatedTitle text="One Choice,"   className="text-5xl md:text-8xl font-bold leading-tight"                style={{ fontFamily: 'Patrick Hand' }} />
          <AnimatedTitle text="Endless Paths" className="text-5xl md:text-8xl font-bold leading-tight text-indigo-300" style={{ fontFamily: 'Patrick Hand' }} />

          <motion.div className="my-5 h-px w-48 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
            initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.6, delay: 1.0 }}
          />

          <motion.h3
            className="text-xl md:text-3xl mb-6 tracking-[0.25em] text-white/80 uppercase"
            style={{ fontFamily: 'Patrick Hand' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 1.2 }}
          >
            Do The Right Thing.
          </motion.h3>

          <motion.p
            className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed mb-10"
            style={{ fontFamily: 'Kalam' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 1.4 }}
          >
            Step into interactive scenarios where your empathy shapes the outcome.
            A single act of kindness can ripple further than you imagine.
          </motion.p>

          <motion.div
            className="flex gap-4 flex-wrap justify-center"
            style={{ fontFamily: 'Kalam' }}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.6 }}
          >
            <motion.button
              className="px-9 py-4 rounded-full bg-indigo-500 text-white text-lg font-medium"
              style={{ cursor: 'pointer', boxShadow: '0 0 20px rgba(99,102,241,0.5)' }}
              onClick={onPlayClick}
              whileHover={{ boxShadow: '0 0 40px rgba(99,102,241,0.9)', scale: 1.07 }}
              whileTap={{ scale: 0.95 }}
            >
              ▶ Play Now
            </motion.button>
            <motion.button
              className="px-9 py-4 rounded-full border border-white/25 text-white/80 text-lg"
              style={{ cursor: 'pointer' }}
              onClick={() => aboutRef.current?.scrollIntoView({ behavior: 'smooth' })}
              whileHover={{ borderColor: 'rgba(99,102,241,0.7)', color: '#fff', scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Learn More
            </motion.button>
          </motion.div>

          {/* scroll cue */}
          <motion.div
            className="absolute bottom-[-120px] flex flex-col items-center gap-2 text-white/30 text-xs"
            style={{ fontFamily: 'Verdana' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2, duration: 0.8 }}
          >
            <span>scroll</span>
            <motion.div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent"
              animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ── Feature cards ── */}
      <section className="pb-16 px-6"  id="about">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          <FeatureCard icon="🤝" title="Empathy Driven"   desc="Every branch explores how compassion changes the world around you in unexpected ways." delay={0}   />
          <FeatureCard icon="🌿" title="Ripple Effects"   desc="Your small act of kindness cascades into larger consequences you never saw coming."    delay={0.1} />
          <FeatureCard icon="🎭" title="Multiple Endings" desc="Each playthrough reveals new perspectives, hidden stories, and deeply human moments."   delay={0.2} />
        </div>
      </section>

      {/* ── Interactive swipe demo ── */}
      <SwipeDemo
        scenarioLabel="Tutorial Scene"
        image="/assets/scene11.webp"
        narrative="How do you like our carefully crafted website? Swipe the card left or right to choose an option."
        left={{ label: "Dislike", result: "I am sorry to hear that. Feel free to contact us and leave suggestions!" }}
        right={{ label: "Like",   result: "Thank you for liking our website! We made a great amount of effort working on it." }}
      />

      {/* ── About ── */}
      <section ref={aboutRef} className="py-24 px-6 text-white">
        <div className="max-w-4xl mx-auto">
          <RevealSection>
            <div className="flex items-center gap-4 mb-3">
              <GlowLine />
              <span className="text-indigo-400 text-xs uppercase tracking-widest" style={{ fontFamily: 'Verdana' }}>The Story</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-10" style={{ fontFamily: 'Patrick Hand' }}>About The Game</h2>
          </RevealSection>

          <div className="grid md:grid-cols-2 gap-10 items-start">
            <RevealSection delay={0.1}>
              <div className="space-y-5 text-white/70 text-base md:text-lg leading-relaxed text-justify" style={{ fontFamily: 'Kalam' }}>
                <p>"One Choice, Endless Path: DO THE RIGHT THING." is an interactive narrative that places you in the role of a young person faced with a seemingly simple act of kindness: helping an elderly person find a seat on a crowded bus.</p>
                <p>But in this world, every small decision carries meaning. Will you immediately offer your seat, wait until the next stop, or start a conversation first?</p>
              </div>
            </RevealSection>
            <RevealSection delay={0.2}>
              <div className="space-y-5 text-white/70 text-base md:text-lg leading-relaxed text-justify" style={{ fontFamily: 'Kalam' }}>
                <p>This game explores the ripple effects of empathy, showing how one simple action can change not only the course of your life, but also the lives of the people around you.</p>
                <p>Are you ready to see how far a single choice can take you?</p>
                <motion.button
                  className="px-8 py-3 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-base"
                  style={{ cursor: 'pointer' }}
                  onClick={() => document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' })}
                  whileHover={{ backgroundColor: 'rgba(99,102,241,0.3)', scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Start Your Journey →
                </motion.button>
              </div>
            </RevealSection>
          </div>

          <RevealSection delay={0.3}>
            <div className="mt-16 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <div className="w-2 h-2 rounded-full bg-indigo-400/60" />
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="py-24 px-6 text-white">
        <div className="max-w-4xl mx-auto">
          <RevealSection>
            <div className="flex items-center justify-end gap-4 mb-3">
              <span className="text-indigo-400 text-xs uppercase tracking-widest" style={{ fontFamily: 'Verdana' }}>Get In Touch</span>
              <GlowLine />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-12 text-right" style={{ fontFamily: 'Patrick Hand' }}>Contact Us</h2>
          </RevealSection>

          {/* two-column layout: form left, socials right */}
          <div className="grid md:grid-cols-2 gap-12 items-start">

            {/* contact form */}
            <RevealSection delay={0.1}>
              <ContactForm />
            </RevealSection>

            {/* instagram links */}
            <RevealSection delay={0.2}>
              <div className="flex flex-col gap-4">
                <p className="text-white/40 text-sm mb-2" style={{ fontFamily: 'Kalam' }}>Or reach us directly on Instagram:</p>
                {[
                  { handle: '@kenneth_kiel', href: 'https://instagram.com/kenneth_kiel' },
                  { handle: '@aimer_ashcxl', href: 'https://instagram.com/aimer_ashcxl' },
                  { handle: '@dreamly_key',  href: 'https://instagram.com/dreamly_key'  },
                ].map(({ handle, href }, i) => (
                  <motion.a
                    key={handle}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-white/70 text-base"
                    style={{ fontFamily: 'Kalam' }}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ borderColor: 'rgba(99,102,241,0.5)', color: '#a5b4fc', scale: 1.02 }}
                  >
                    <svg className="w-4 h-4 opacity-70 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    {handle}
                  </motion.a>
                ))}
              </div>
            </RevealSection>
          </div>

          <RevealSection delay={0.3}>
            <p className="text-center text-white/25 text-xs mt-16 tracking-widest uppercase" style={{ fontFamily: 'Verdana' }}>
              One Choice, Endless Paths © 2025
            </p>
          </RevealSection>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// App root  —  gameState flow: 'landing' → 'prologue' → 'playing'
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [page,      setPage]      = useState(1);
  const [gameState, setGameState] = useState('landing');
  const [scrollTarget, setScrollTarget] = useState(null);

  const [unlockedEndings, setUnlockedEndings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('unlockedEndings')) || {}; }
    catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('unlockedEndings', JSON.stringify(unlockedEndings));
  }, [unlockedEndings]);

  // prevent white flash during transitions
  useEffect(() => { document.body.style.background = '#020718'; }, []);

  function unlockEnding(id) {
    setUnlockedEndings(prev => prev[id] ? prev : { ...prev, [id]: true });
  }

  function goToPage(nextPage, sectionId = null) {
    setPage(nextPage);
    if (nextPage === 2) setGameState('landing');
    if (sectionId) setScrollTarget(sectionId);
  }

  useEffect(() => {
    if (page === 1 && scrollTarget) {
      const container = document.getElementById('app-root');

      function tryScroll() {
        const target = document.getElementById(scrollTarget);

        if (container && target) {
          container.scrollTo({
            top: target.offsetTop - 80,
            behavior: 'smooth'
          });
          setScrollTarget(null);
        } else {
          requestAnimationFrame(tryScroll); // keep trying until ready
        }
      }

      requestAnimationFrame(tryScroll);
    }
  }, [page, scrollTarget]);

  const endingsWithState = ENDINGS_META.map(e => ({ ...e, unlocked: Boolean(unlockedEndings[e.id]) }));

  // Landing + prologue render outside the main layout (no navbar)
  if (page === 2 && gameState === 'landing') {
    return (
      <OrientationCheck>
        <AnimatePresence mode="wait">
          <FadeTransition key="landing">
            <LandingScreen onStart={() => setGameState('prologue')} endings={endingsWithState} />
          </FadeTransition>
        </AnimatePresence>
      </OrientationCheck>
    );
  }

  if (page === 2 && gameState === 'prologue') {
    return (
      <OrientationCheck>
        <AnimatePresence mode="wait">
          <FadeTransition key="prologue">
            <PrologueScreen onDone={() => setGameState('playing')} />
          </FadeTransition>
        </AnimatePresence>
      </OrientationCheck>
    );
  }

  return (
    <div
      id="app-root"
      className="w-full h-screen flex flex-col overflow-y-auto"
      style={{ background: 'radial-gradient(circle at center, rgba(10,25,77,0.55), transparent 55%), linear-gradient(135deg, #020718, #020718, #0B2587)' }}
    >
      <ParticleField />
      {page === 2 && gameState === 'playing' ? (
        <ExitButton onExit={() => setPage(1)} />
      ) : (
        <NavigationBar onNavigate={goToPage} currentPage={page} />
      )}
      

      <AnimatePresence mode="wait">
        {page === 1 && (
          <FadeTransition key="home">
            <HomePage onPlayClick={() => goToPage(2)} />
          </FadeTransition>
        )}
        {page === 2 && gameState === 'playing' && (
          <FadeTransition key="game">
            <Game onRestart={() => setGameState('landing')} unlockEnding={unlockEnding} />
          </FadeTransition>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App