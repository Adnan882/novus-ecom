import React, { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, List, ChevronDown } from 'lucide-react'
import ProductCard from './ProductCard'
import { PRODUCTS, CATEGORIES } from '../data/products'
import { STAGGER_CONTAINER, SECTION_ENTER, SPRING_SNAPPY } from '../lib/motion'

const PAGE = 8

export default function ProductCatalog({ onQuickView, searchResults }) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('featured')
  const [visible, setVisible] = useState(PAGE)
  const [view, setView] = useState('grid')

  useEffect(() => {
    const handler = (e) => {
      setFilter(e.detail)
      setVisible(PAGE)
    }
    window.addEventListener('tv-filter', handler)
    return () => window.removeEventListener('tv-filter', handler)
  }, [])

  const list = useMemo(() => {
    let base = searchResults || PRODUCTS
    if (filter !== 'all') base = base.filter((p) => p.category === filter)
    base = [...base]
    if (sort === 'price-asc') base.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') base.sort((a, b) => b.price - a.price)
    else if (sort === 'rating') base.sort((a, b) => b.rating - a.rating)
    else if (sort === 'discount') base.sort((a, b) => (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp)
    return base
  }, [filter, sort, searchResults])

  const shown = list.slice(0, visible)
  const active = CATEGORIES.find((c) => c.id === filter)

  return (
    <section id="products" className="relative py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={STAGGER_CONTAINER} className="text-center mb-12">
          <motion.h2 variants={SECTION_ENTER} className="text-3xl sm:text-4xl font-black tracking-tight">
            {active ? active.label : <span className="gradient-text">The Collection</span>}
          </motion.h2>
          <motion.p variants={SECTION_ENTER} className="text-mist mt-3 text-sm sm:text-base">Every product inspected, tested and shipped with a GST invoice.</motion.p>
        </motion.div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setFilter('all'); setVisible(PAGE) }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${filter === 'all' ? 'bg-glow text-glow-ink border-glow shadow-lg shadow-glow/30' : 'bg-glass text-mist border-line hover:text-ink-2'}`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => { setFilter(c.id); setVisible(PAGE) }}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${filter === c.id ? 'bg-glow text-glow-ink border-glow shadow-lg shadow-glow/30' : 'bg-glass text-mist border-line hover:text-ink-2'}`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 rounded-full bg-glass border border-line text-sm text-mist focus:text-ink-2 focus:border-glow outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Biggest Savings</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-mist pointer-events-none" />
            </div>
            {/* View toggle */}
            <div className="hidden sm:flex rounded-full border border-line overflow-hidden">
              <button onClick={() => setView('grid')} className={`p-3 min-h-[44px] ${view === 'grid' ? 'bg-glow/20 text-glow' : 'text-mist'}`}><LayoutGrid className="w-4 h-4" /></button>
              <button onClick={() => setView('list')} className={`p-3 min-h-[44px] ${view === 'list' ? 'bg-glow/20 text-glow' : 'text-mist'}`}><List className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5' : 'grid grid-cols-1 gap-5 max-w-3xl'}>
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} onQuickView={(prod) => onQuickView(prod)} />
            ))}
          </AnimatePresence>
        </div>

        {/* Load more */}
        {visible < list.length && (
          <div className="mt-10 text-center">
            <button onClick={() => setVisible((v) => v + PAGE)} className="btn-ghost px-8 py-3 text-sm">
              Load more products
            </button>
          </div>
        )}
        {list.length === 0 && (
          <p className="text-center text-mist py-16">No products found for this filter.</p>
        )}
      </div>
    </section>
  )
}