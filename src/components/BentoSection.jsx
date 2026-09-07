import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Headset, ShieldCheck, Star, Truck, Undo2 } from 'lucide-react'
import ProductImage from './ProductImage'
import { PRODUCTS } from '../data/products'
import { STAGGER_CONTAINER, STAGGER_CHILD_UP, TEXT_REVEAL_LINE, SPRING_SNAPPY } from '../lib/motion'

function useCountUp(target, start) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf
    const t0 = performance.now()
    const dur = 1400
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / dur)
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    if (start) raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target])
  return v
}

function Tile({ children, className = '' }) {
  return (
    <motion.div
      variants={STAGGER_CHILD_UP}
      whileHover={{ y: -4 }}
      className={`group relative rounded-[28px] border border-line bg-panel/60 ${className}`}
    >
      {children}
    </motion.div>
  )
}

function SectionHeading() {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      variants={STAGGER_CONTAINER}
      className="text-center max-w-2xl mx-auto mb-12"
    >
      <motion.span variants={STAGGER_CHILD_UP} className="inline-flex items-center gap-2 rounded-full border border-line bg-panel px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-mist">
        The Novus Standard
      </motion.span>
      <motion.h2 variants={TEXT_REVEAL_LINE} className="text-3xl sm:text-5xl font-black tracking-tight mt-4 leading-[1.08]">
        Why <span className="gradient-text">Novus</span>
      </motion.h2>
      <motion.p variants={STAGGER_CHILD_UP} className="text-mist mt-4 text-sm sm:text-base leading-relaxed">
        Engineered details, live stats and deals worth pausing for.
      </motion.p>
    </motion.div>
  )
}

export default function BentoSection() {
  const apPro = PRODUCTS.find((p) => p.id === 'ap-pro-2')
  const [scrolling, setScrolling] = useState(false)
  const customers = useCountUp(52000, scrolling)
  const rating = useCountUp(48, scrolling)
  const cities = useCountUp(38, scrolling)

  useEffect(() => {
    const on = () => setScrolling(true)
    window.addEventListener('mousemove', on)
    window.addEventListener('keydown', on)
    window.addEventListener('touchstart', on, { passive: true })
    window.addEventListener('wheel', on)
    return () => {
      window.removeEventListener('mousemove', on)
      window.removeEventListener('keydown', on)
      window.removeEventListener('touchstart', on)
      window.removeEventListener('wheel', on)
    }
  }, [])

  return (
    <section id="standard" className="relative py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={STAGGER_CONTAINER}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5"
        >
          {/* BIG — flagship product */}
          <Tile className="md:col-span-2 lg:row-span-2 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/15 text-mint text-[11px] font-bold px-3 py-1">
                <BadgeCheck className="w-3.5 h-3.5" /> Flagship · Bestseller
              </span>
              <span className="text-[11px] text-mist">{apPro?.rating} ★ · {apPro?.reviews?.toLocaleString('en-IN')} reviews</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight">{apPro?.name}</h3>
            <p className="text-mist text-sm mt-1">Space-grade ANC. 30-hour battery. 1:1 clone precision.</p>

            <div className="relative my-4 h-52 sm:h-64 flex items-center justify-center">
              <ProductImage product={apPro} className="w-full h-full object-contain" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-mist text-[11px]">Today only</p>
                <p className="text-2xl font-extrabold flex items-baseline gap-2">
                  ₹{apPro?.price?.toLocaleString('en-IN')}
                  <span className="text-sm text-mist line-through">₹{apPro?.mrp?.toLocaleString('en-IN')}</span>
                </p>
              </div>
              <a href="#products" className="btn-glow px-5 py-2.5 text-sm">
                Shop now <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </Tile>

          {/* STAT — customers */}
          <Tile className="p-6 flex flex-col justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-mist">Happy customers</p>
            <p className="text-4xl font-black gradient-text mt-2">{customers.toLocaleString('en-IN')}+</p>
            <p className="text-mist text-xs mt-1">across {cities} Indian cities</p>
          </Tile>

          {/* STAT — rating */}
          <Tile className="p-6 flex flex-col justify-between">
            <p className="text-[11px] uppercase tracking-[0.2em] text-mist">Average rating</p>
            <p className="text-4xl font-black mt-2 flex items-baseline gap-1.5">
              {rating ? (rating / 10).toFixed(1) : '4.8'} <Star className="w-5 h-5 text-gold fill-gold" />
            </p>
            <p className="text-mist text-xs mt-1">11,200+ verified reviews</p>
          </Tile>

          {/* OFFER */}
          <Tile className="md:col-span-2 p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="rounded-full bg-ember text-white text-[11px] font-bold px-3 py-1">LIMITED TIME</span>
                <h4 className="text-xl sm:text-2xl font-black tracking-tight mt-2">Flat 40% off sitewide</h4>
                <p className="text-mist text-xs mt-1">+ free express shipping this weekend</p>
              </div>
              <div className="flex gap-2">
                {[{ l: '07', u: 'Days' }, { l: '12', u: 'Hrs' }, { l: '44', u: 'Min' }].map((t) => (
                  <div key={t.u} className="rounded-2xl border border-line bg-deep px-3 py-2 text-center min-w-[56px]">
                    <p className="text-xl font-black">{t.l}</p>
                    <p className="text-[9px] uppercase tracking-widest text-mist">{t.u}</p>
                  </div>
                ))}
              </div>
            </div>
          </Tile>

          {/* FEATURE — warranty */}
          <Tile className="p-6 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-panel border border-line flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-mint" />
            </div>
            <div className="mt-auto">
              <h4 className="font-bold">Quality guaranteed</h4>
              <p className="text-mist text-xs mt-1">200-point QA check before every dispatch</p>
            </div>
          </Tile>

          {/* FEATURE — support */}
          <Tile className="p-6 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-panel border border-line flex items-center justify-center">
              <Headset className="w-5 h-5 text-glow" />
            </div>
            <div className="mt-auto">
              <h4 className="font-bold">24/7 human support</h4>
              <p className="text-mist text-xs mt-1">Real humans in under 60 seconds</p>
            </div>
          </Tile>
        </motion.div>

        {/* mini trust row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Truck, label: 'Free shipping over ₹999' },
            { icon: Undo2, label: '7-day returns' },
            { icon: ShieldCheck, label: '1-year warranty' },
          ].map((f) => (
            <span key={f.label} className="inline-flex items-center gap-2 text-xs text-mist chip">
              <f.icon className="w-3.5 h-3.5 text-glow" /> {f.label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}