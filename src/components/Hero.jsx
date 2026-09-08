import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Flame } from 'lucide-react'
import { PRODUCTS } from '../data/products'
import { SPRING_SNAPPY, SPRING_SOFT, SPRING_GENTLE, STAGGER_CONTAINER, TEXT_REVEAL_LINE } from '../lib/motion'

const HERO_ITEMS = ['ap-pro-2', 'aw-s9', 'pb-magsafe', 'aw-u1', 'ap-pro-max']
  .map((id) => PRODUCTS.find((p) => p.id === id))
  .filter(Boolean)

function useCountUp(target, duration = 2000) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let raf
    const start = performance.now()
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      setVal(Math.floor(target * (1 - Math.pow(1 - t, 3))))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val
}

function Stat({ value, suffix = '', label, duration }) {
  const v = useCountUp(value, duration)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING_SOFT, delay: 0.8 }}
    >
      <p className="text-2xl sm:text-3xl font-extrabold">
        <span className="gradient-text">{v.toLocaleString('en-IN')}{suffix}</span>
      </p>
      <p className="text-xs text-mist mt-1">{label}</p>
    </motion.div>
  )
}

export default function Hero({ onExplore }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const active = HERO_ITEMS[activeIdx]
  const color = active.colors[0]?.name || ''

  const switchTo = (i) => {
    setActiveIdx(i)
  }

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-center relative z-10">
        {/* Copy — staggered word reveal */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={STAGGER_CONTAINER}
        >
          {/* Badge */}
          <motion.div
            variants={TEXT_REVEAL_LINE}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-1.5 text-xs font-medium text-mist mb-6"
          >
            New Collection 2026 · Clone Tech
          </motion.div>

          {/* Title */}
          <motion.h1 variants={TEXT_REVEAL_LINE} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight" style={{ perspective: 800 }}>
            <span className="block">Experience premium tech</span>
            <motion.span
              className="block gradient-text mt-1"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_GENTLE, delay: 0.4 }}
            >
              without the flagship price.
            </motion.span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={TEXT_REVEAL_LINE}
            className="mt-6 text-mist text-base sm:text-lg leading-relaxed max-w-lg"
          >
            Five flagship clones — AirPods Pro, Apple Watch, MagSafe, Ultra & Max — precision-built from the DNA of the originals. Premium quality at a fraction of the price.
          </motion.p>

          {/* Spec chips */}
          <motion.div variants={TEXT_REVEAL_LINE} className="mt-6 flex flex-wrap gap-2">
            {[
              ['ANC', 'Active noise cancelling'],
              ['30h', 'Battery life'],
              ['IPX4', 'Splash proof'],
              ['1:1', 'Clone precision'],
            ].map(([k, v]) => (
              <motion.span
                key={k}
                whileHover={{ y: -2 }}
                transition={SPRING_SNAPPY}
                className="chip flex items-center gap-1.5 cursor-default"
                title={v}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-glow" />
                <span className="font-bold text-ink">{k}</span>
                <span className="text-mist hidden sm:inline">{v}</span>
              </motion.span>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div variants={TEXT_REVEAL_LINE} className="mt-8 flex flex-wrap gap-3">
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_SNAPPY}
              onClick={onExplore}
              className="btn-glow px-7 py-3.5 text-sm"
            >
              Explore Products <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING_SNAPPY}
              onClick={() => document.getElementById('deals')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-ghost px-7 py-3.5 text-sm"
            >
              <Flame className="w-4 h-4 text-ember" /> Hot Deals
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div variants={TEXT_REVEAL_LINE} className="mt-10 flex flex-wrap gap-6 sm:gap-10">
            <Stat value={5} suffix="" label="Flagship clones" duration={1000} />
            <Stat value={52000} suffix="+" label="Happy customers" duration={2200} />
            <Stat value={99} suffix="%" label="Satisfaction" duration={1200} />
          </motion.div>
        </motion.div>

        {/* Product stage — clean, static */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...SPRING_GENTLE, delay: 0.3 }}
          className="relative"
        >
          <div className="lens rounded-[28px] overflow-hidden">
            <div className="px-5 pt-4 flex items-center justify-between">
              {/* Product switcher */}
              <div className="flex gap-2 flex-wrap">
                {HERO_ITEMS.map((p, i) => (
                  <motion.button
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING_SNAPPY, delay: 0.4 + i * 0.04 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => switchTo(i)}
                    className={`px-3.5 py-2.5 min-h-[44px] rounded-full text-xs font-semibold transition-colors ${i === activeIdx ? 'bg-glow text-glow-ink' : 'bg-panel text-mist hover:text-ink-2 border border-line'}`}
                  >
                    {p.name.replace('Clone ', '')}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="h-[clamp(240px,44vw,500px)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${active.id}-${color}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <img
                    src={active.image}
                    alt={active.name}
                    className="max-w-[85%] max-h-full object-contain"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Price chip */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="absolute -top-3 right-0 sm:right-6 rounded-2xl border border-line bg-deep px-4 py-2.5 max-w-[calc(100%-1.5rem)]"
            >
              <p className="text-[11px] text-mist uppercase tracking-wider">{active.name.replace('Clone ', '')}</p>
              <p className="text-lg font-extrabold flex items-baseline gap-2">
                <span>₹{active.price.toLocaleString('en-IN')}</span>
                <span className="text-xs text-mist line-through font-medium">₹{active.mrp.toLocaleString('en-IN')}</span>
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}