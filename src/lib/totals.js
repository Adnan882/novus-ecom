// Shared price-breakdown used by Cart, Checkout and Order summaries.
export function calcTotals(rows, promoApplied = null) {
  const subtotal = rows.reduce((s, r) => s + r.product.price * r.qty, 0)
  const mrp = rows.reduce((s, r) => s + r.product.mrp * r.qty, 0)
  const discount = promoApplied ? Math.round((subtotal * promoApplied.percent) / 100) : 0
  const gst = Math.round((subtotal - discount) * 0.18)
  const grand = subtotal - discount + gst
  return { subtotal, mrp, discount, gst, grand, savings: mrp - subtotal }
}