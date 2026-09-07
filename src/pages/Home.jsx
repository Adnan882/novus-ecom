import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import BentoSection from '../components/BentoSection'
import { Categories, Deals, About, Newsletter, TrustStrip } from '../components/Sections'
import Story from '../components/story/Story'
import ProductCatalog from '../components/ProductCatalog'
import QuickViewModal from '../components/QuickViewModal'

export default function Home() {
  const navigate = useNavigate()
  const [quickView, setQuickView] = useState(null)
  const [searchResults, setSearchResults] = useState(null)

  const goProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
  }

  const selectCategory = (id) => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })
    if (id !== 'all') {
      window.dispatchEvent(new CustomEvent('tv-filter', { detail: id }))
    }
  }

  useEffect(() => {
    const onSearch = (e) => setSearchResults(e.detail || null)
    window.addEventListener('novus-search', onSearch)
    return () => window.removeEventListener('novus-search', onSearch)
  }, [])

  return (
    <main className="pt-16">
      <Hero onExplore={goProducts} />
      <Story onExplore={goProducts} />
      <TrustStrip />
      <BentoSection />
      <Categories onSelect={selectCategory} />
      <ProductCatalog onQuickView={setQuickView} searchResults={searchResults} />
      <Deals onQuickView={setQuickView} />
      <About onExplore={goProducts} />
      <Newsletter />
      <QuickViewModal
        product={quickView}
        onClose={() => setQuickView(null)}
        onBuyNow={() => navigate('/checkout')}
      />
    </main>
  )
}