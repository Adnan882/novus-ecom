import React, { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import { ArrowRight, FlaskConical, Gem, PackageCheck, Ruler, ShieldCheck, Cpu } from 'lucide-react'
import ProductImage from '../ProductImage'
import { PRODUCTS } from '../../data/products'

const CH = [
  {
    no: '01',
    kicker: 'The Blueprint',
    title: 'A 1:1 map of the original',
    body: 'Every pair starts as a precision 3D scan of the original. The geometry is digitised to 0.05 mm tolerances, so the clone is measured — not just copied — to the exact proportions of the real thing.',
    icon: Ruler,
    product: 'ap-pro-2',
    align: 'left',
    accent: 'bg-glow/10 border-glow/30 text-glow',
    hex: 'rgb(var(--tv-glow))',
  },
  {
    no: '02',
    kicker: 'Premium Materials',
    title: 'OEM-grade build, true to spec',
    body: 'Aerospace aluminium, gloss PC+ABS shell, medical-grade silicone tips and nitro-coated mesh — pulled from the same OEM supply chains the originals are built from.',
    icon: Gem,
    product: 'aw-s9',
    align: 'right',
    accent: 'bg-aqua/10 border-aqua/30 text-aqua',
    hex: '#97b4de',
  },
  {
    no: '03',
    kicker: 'Clean Cloning',
    title: 'Zero-damage fabrication',
    body: 'Injection moulds stamped at 1,400 tonnes hold ±0.01 mm. Parts break out on air curtains instead of ejector pins — so every surface stays scratch-free, mirror-clean and stress-mark free. Ever.',
    icon: ShieldCheck,
    product: 'ap-pro-max',
    align: 'left',
    accent: 'bg-mint/10 border-mint/30 text-mint',
    hex: '#1fa968',
  },
  {
    no: '04',
    kicker: 'The Brain Inside',
    title: 'Internals you can’t see, but feel',
    body: 'The H1-class chip, tuned 13 mm drivers and a fast-charge cell are placed on precision SMT lines in a Class-100 dust-free zone, then sealed with calibrated press-fit and ultrasonic welding. No gaps. No creaks.',
    icon: Cpu,
    product: 'aw-u1',
    align: 'right',
    accent: 'bg-ember/10 border-ember/30 text-ember',
    hex: '#e15151',
  },
  {
    no: '05',
    kicker: 'Testing & Tuning',
    title: 'Tested like the original',
    body: 'Every single unit runs ANC calibration, 30+ audio checks, an IPX4 splash test and a 200-point QA stamp. If it doesn’t pass, it doesn’t ship.',
    icon: FlaskConical,
    product: 'pb-magsafe',
    align: 'left',
    accent: 'bg-gold/10 border-gold/30 text-gold',
    hex: '#d99a1a',
  },
  {
    no: '06',
    kicker: 'Sealed & Shipped',
    title: 'Delivered like a flagship',
    body: 'Anti-static blister, tamper-proof seal and a GST billing slip from ₹1,299 — with free, fast India-wide delivery.',
    icon: PackageCheck,
    product: 'ap-pro-2',
    align: 'right',
    accent: 'bg-glow/10 border-glow/30 text-glow',
    hex: 'rgb(var(--tv-glow))',
  },
]

const N = CH.length

function Chapter({ c, i, onExplore, setRef }) {
  const ref = useRef()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const opacity = useTransform(scrollYProgress, [0, 0.18, 0.8, 1], [0, 1, 1, 0])
  const y = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [60, 0, 0, -60])
  const Icon = c.icon
  const right = c.align === 'right'
  const product = PRODUCTS.find((p) => p.id === c.product)
  const sideX = right ? -1 : 1
  const imgOpacity = useTransform(scrollYProgress, [0, 0.12, 0.85, 1], [0, 1, 1, 0])
  const imgX = useTransform(scrollYProgress, [0, 0.28, 0.72, 1], [sideX * 70, 0, 0, sideX * 70])
  const imgRotate = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [right ? 6 : -6, 0, 0, right ? -6 : 6])

  return (
    <div
      ref={(el) => {
        ref.current = el
        setRef?.(el)
      }}
      className="relative h-screen w-full pointer-events-none"
    >
      {/* Image on the opposite side of the text box */}
      {product && (
        <motion.div
          style={{ opacity: imgOpacity, x: imgX, rotate: imgRotate }}
          className={`absolute top-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center ${right ? 'lg:left-[6%]' : 'lg:right-[6%]'}`}
        >
          <div className="w-72 h-72 sm:w-80 sm:h-80 lg:w-[24rem] lg:h-[24rem] xl:w-[28rem] xl:h-[28rem] rounded-3xl bg-card border border-line p-6 flex items-center justify-center transition-colors duration-300">
            <ProductImage product={product} className="w-full h-full object-contain" />
          </div>
        </motion.div>
      )}

      <motion.div
        style={{ opacity, y }}
        className={`absolute top-1/2 -translate-y-1/2 w-full max-w-md px-6 sm:px-8 ${right ? 'lg:left-auto lg:right-0' : ''} ${right ? 'lg:ml-auto' : ''}`}
      >
        <div className={`relative ${right ? 'lg:mr-[12%]' : 'lg:ml-[8%]'}`}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${c.accent}`}>
              <Icon className="w-5 h-5" />
            </span>
            <span className="font-mono text-xs tracking-[0.3em] text-mist uppercase">
              {c.kicker}
            </span>
          </div>

          <div className="pointer-events-auto rounded-3xl bg-panel border border-line p-6 sm:p-8 transition-colors duration-300">
            <span className="block font-mono text-sm font-bold text-mist pb-2 mb-3 border-b border-line">{c.no}</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight mb-3">
              {c.title}
            </h3>
            <p className="text-sm sm:text-base text-mist leading-relaxed mb-5">{c.body}</p>
            {i === N - 1 && (
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2 rounded-xl bg-glow text-glow-ink text-sm font-bold px-5 py-2.5 hover:opacity-90 transition-opacity"
              >
                Explore the range <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function Story({ onExplore }) {
  const wrapRef = useRef(null)
  const chapterRefs = useRef([])
  const [active, setActive] = useState(0)

  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(Math.min(N - 1, Math.max(0, Math.floor(v * N))))
  })

  const jump = (i) => {
    chapterRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="story" ref={wrapRef} className="relative bg-midnight overflow-x-clip transition-colors duration-300">
      {/* progress hairline */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-40">
        <motion.div style={{ scaleX: scrollYProgress }} className="h-full origin-left bg-glow" />
      </div>

      {/* Pinned stage */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        {/* Chapter number + label — anchored bottom-left so it never overlaps the scrolling text boxes or images */}
        <div className="absolute left-6 sm:left-12 bottom-10 z-20">
          <motion.div key={active} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative">
            <span className="font-mono text-xs tracking-[0.3em] uppercase" style={{ color: CH[active]?.hex }}>
              {CH[active]?.kicker}
            </span>
            <span className="block font-mono font-black leading-none mt-4 text-6xl sm:text-8xl md:text-[104px] text-ink">
              {CH[active]?.no}
            </span>
            <span className="hidden sm:block text-sm text-mist mt-1 max-w-xs">
              {CH[active]?.title}
            </span>
          </motion.div>
        </div>
      </div>

        {/* fades for navbar readability */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-midnight/90 to-transparent pointer-events-none transition-colors duration-300" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-midnight to-transparent pointer-events-none transition-colors duration-300" />

        {/* Chapter rail */}
        <div className="hidden lg:flex absolute right-5 top-1/2 -translate-y-1/2 z-40 flex-col items-end gap-1">
          {CH.map((c, i) => (
            <button
              key={c.no}
              onClick={() => jump(i)}
              className={`group flex items-center gap-3 py-1.5 transition-opacity ${active === i ? 'opacity-100' : 'opacity-40 hover:opacity-90'}`}
            >
              <span className={`text-[10px] font-mono uppercase tracking-widest transition-all ${active === i ? 'text-ink' : 'text-mist'} group-hover:text-ink`}>
                {c.kicker}
              </span>
              <span className={`w-2.5 h-2.5 rounded-full border transition-all ${active === i ? 'bg-glow border-glow' : 'bg-transparent border-mist/40 group-hover:border-glow'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Chapters overlay */}
      <div className="relative">
        {CH.map((c, i) => (
          <Chapter
            key={c.no}
            c={c}
            i={i}
            onExplore={onExplore}
            setRef={(el) => (chapterRefs.current[i] = el)}
          />
        ))}
      </div>
    </section>
  )
}