// Procedural 3D model "types" that map to component in <ProductModel3D />
// model: 'airpods' | 'airpodsmax' | 'watch' | 'smartwatch' | 'airtag' | 'powerbank' | 'speaker' | 'gaming'

const inr = (n) => `₹${n.toLocaleString('en-IN')}`

// Base-aware public asset prefix (works at '/images/...' in dev and
// '/novus-ecom/images/...' when deployed to a subpath like GitHub Pages).
const img = (p) => `${import.meta.env.BASE_URL}images/${p}`

export const PRODUCTS = [
  {
    id: 'demo-1',
    slug: 'demo-test-product',
    name: 'Demo Test Product',
    category: 'accessories',
    model: 'airtag',
    image: img('magsafe.jpg'),
    tagline: '₹1 demo product for testing payments',
    price: 1,
    mrp: 99,
    rating: 4.0,
    reviews: 1,
    badge: 'Test',
    hot: true,
    features: ['Test Product', '₹1 Payment', 'For Demo Only'],
    colors: [{ name: 'White', hex: '#f5f5f7' }],
    stock: 999,
  },
  {
    id: 'ap-pro-2',
    slug: 'clone-airpods-pro-2',
    name: 'AirPods Pro 2',
    category: 'airpods',
    model: 'airpods',
    image: img('airpods.jpg'),
    tagline: 'Wireless earbuds with active noise cancelling',
    price: 1749,
    mrp: 2799,
    rating: 4.8,
    reviews: 2143,
    badge: 'Bestseller',
    hot: true,
    features: ['Active Noise Cancelling', 'Spatial Audio', 'MagSafe Charging', 'IPX4 Sweat Resistant'],
    colors: [
      { name: 'Gloss White', hex: '#f5f5f7' },
      { name: 'Matte Black', hex: '#2c2c2e' },
    ],
    stock: 42,
  },
  {
    id: 'aw-s9',
    slug: 'clone-apple-watch-series-9',
    name: 'Apple Watch S9',
    category: 'watches',
    model: 'smartwatch',
    image: img('apple-watch.jpg'),
    tagline: 'Your health companion, every day',
    price: 2399,
    mrp: 2799,
    rating: 4.7,
    reviews: 1540,
    features: ['ECG & Blood Oxygen', 'Always-On Retina', 'Fast Charging', '45mm Aluminium'],
    colors: [
      { name: 'Midnight', hex: '#1f2437' },
      { name: 'Starlight', hex: '#e5ddd3' },
      { name: 'Silver', hex: '#d9d9db' },
      { name: 'Product Red', hex: '#d12a2a' },
    ],
    stock: 51,
  },
  {
    id: 'pb-magsafe',
    slug: 'clone-magsafe-charger',
    name: 'MagSafe Charger',
    category: 'accessories',
    model: 'powerbank',
    image: img('magsafe.jpg'),
    tagline: 'Snap-on wireless fast charging',
    price: 1699,
    mrp: 3599,
    rating: 4.5,
    reviews: 892,
    badge: 'Hot Deal',
    hot: true,
    features: ['MagSafe Snap', '15W Wireless', 'USB-C Power Delivery', 'Qi2 Compatible'],
    colors: [
      { name: 'White', hex: '#f5f5f7' },
      { name: 'Slate', hex: '#3a3a3c' },
    ],
    stock: 120,
  },
  {
    id: 'aw-u1',
    slug: 'clone-apple-watch-ultra',
    name: 'Apple Watch Ultra',
    category: 'watches',
    model: 'smartwatch',
    image: img('apple-watch-ultra.jpg'),
    tagline: 'Titanium rugged smartwatch',
    price: 1899,
    mrp: 5499,
    rating: 4.7,
    reviews: 936,
    badge: 'Trending',
    hot: true,
    features: ['49mm Titanium Case', 'Always-On Display', 'GPS + Cellular', '100m Water Resistant'],
    colors: [
      { name: 'Titanium', hex: '#c0b7a6' },
      { name: 'Dark Titanium', hex: '#3d3d3f' },
    ],
    stock: 28,
  },
  {
    id: 'ap-pro-max',
    slug: 'clone-airpods-max-v2',
    name: 'AirPods Max',
    category: 'airpods',
    model: 'airpodsmax',
    image: img('airpods-max.jpg'),
    tagline: 'Over-ear premium at a fraction of the price',
    price: 3199,
    mrp: 6499,
    rating: 4.9,
    reviews: 876,
    badge: 'Premium',
    hot: true,
    features: ['Spatial Audio', 'Aluminium Ear Cups', 'Transparency Mode', 'Mesh Headband'],
    colors: [
      { name: 'Space Grey', hex: '#4a5568' },
      { name: 'Silver', hex: '#cbd5e0' },
      { name: 'Midnight Blue', hex: '#2b4a7a' },
      { name: 'Pink', hex: '#f08aad' },
    ],
    stock: 21,
  },
]

export const CATEGORIES = [
  { id: 'airpods', label: 'AirPods & Earbuds', icon: 'Headphones', blurb: 'Wireless earbuds with pro features' },
  { id: 'watches', label: 'Watches & Smart', icon: 'Watch', blurb: 'Culture watches & smartwear' },
  { id: 'speakers', label: 'Speakers', icon: 'Volume2', blurb: '360° sound for every space' },
  { id: 'accessories', label: 'Accessories', icon: 'Zap', blurb: 'Power, tracking & docking' },
  { id: 'gaming', label: 'Gaming', icon: 'Gamepad2', blurb: 'Controllers & gaming audio' },
]

export const DEALS = PRODUCTS.filter((p) => p.hot).slice(0, 4)

export const PROMO_CODES = {
  NOVUS10: 10,
  WELCOME15: 15,
  BIGDEAL25: 25,
}

export const INDIAN_BANKS = [
  'State Bank of India',
  'HDFC Bank',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank',
  'Bank of Baroda',
  'Canara Bank',
  'IDBI Bank',
  'Yes Bank',
  'IndusInd Bank',
  'Union Bank of India',
  'Central Bank of India',
  'Indian Bank',
  'Federal Bank',
  'Bandhan Bank',
]

export const INDIAN_STATES = [
  'Andaman & Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Dadra & Nagar Haveli', 'Daman & Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

export { inr }