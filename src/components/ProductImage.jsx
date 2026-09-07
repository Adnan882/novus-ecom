import React from 'react'

export default function ProductImage({ product, className = '', alt }) {
  if (!product?.image) return null
  return (
    <img
      src={product.image}
      alt={alt || product.name}
      loading="lazy"
      className={`object-contain ${className}`}
      draggable={false}
    />
  )
}

export function ProductImageBySrc({ src, alt = '', className = '' }) {
  return <img src={src} alt={alt} loading="lazy" className={`object-contain ${className}`} draggable={false} />
}