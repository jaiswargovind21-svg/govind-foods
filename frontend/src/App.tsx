import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { ReactNode } from 'react'
import { BrowserRouter, Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categories, formatPrice, restaurants } from './data'
import type { MenuItem } from './data'
import { api, clearToken, getToken } from './api'
import type { ApiMenuItem, ApiRestaurant } from './api'
import './App.css'

type CartLine = MenuItem & { restaurantId: string; quantity: number }

const currency = (amount: number) => formatPrice(amount)
const restaurantImage = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('saffron')) return 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=85'
  if (key.includes('green bowl')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=85'
  if (key.includes('pizza')) return 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1200&q=85'
  if (key.includes('wok')) return 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1200&q=85'
  if (key.includes('coffee')) return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85'
  if (key.includes('taco')) return 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=85'
  if (key.includes('spice route')) return 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=1200&q=85'
  return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85'
}
const foodImage = (name: string) => {
  const key = name.toLowerCase()
  if (key.includes('pizza')) return 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=85'
  if (key.includes('pasta')) return 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=500&q=85'
  if (key.includes('biryani')) return 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&w=500&q=85'
  if (key.includes('chicken')) return 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=85'
  if (key.includes('paneer') || key.includes('tikka')) return 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=500&q=85'
  if (key.includes('naan')) return 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=500&q=85'
  if (key.includes('salad') || key.includes('bowl') || key.includes('avocado')) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=85'
  if (key.includes('wrap') || key.includes('bao')) return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=85'
  if (key.includes('smoothie') || key.includes('drink')) return 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=500&q=85'
  if (key.includes('curry')) return 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=500&q=85'
  if (key.includes('dessert') || key.includes('tiramisu') || key.includes('mango')) return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=500&q=85'
  return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=500&q=85'
}

function App() {
  const [cart, setCart] = useState<CartLine[]>([])

  const addToCart = (item: MenuItem, restaurantId: string) => {
    setCart((current) => {
      const existing = current.find((line) => line.id === item.id)
      if (existing) {
        return current.map((line) => line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line)
      }
      return [...current, { ...item, restaurantId, quantity: 1 }]
    })
  }

  const updateQuantity = (id: string, change: number) => {
    setCart((current) => current.flatMap((line) => {
      if (line.id !== id) return [line]
      const quantity = line.quantity + change
      return quantity > 0 ? [{ ...line, quantity }] : []
    }))
  }

  return (
    <BrowserRouter>
      <AppShell cart={cart} addToCart={addToCart} updateQuantity={updateQuantity} setCart={setCart} />
    </BrowserRouter>
  )
}

function AppShell({ cart, addToCart, updateQuantity, setCart }: { cart: CartLine[]; addToCart: (item: MenuItem, restaurantId: string) => void; updateQuantity: (id: string, change: number) => void; setCart: (cart: CartLine[]) => void }) {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  return <div className="app">{!isAdminRoute && <Header cartCount={cart.reduce((total, item) => total + item.quantity, 0)} />}<Routes><Route path="/" element={<Home />} /><Route path="/restaurant/:restaurantId" element={<RestaurantPage addToCart={addToCart} />} /><Route path="/cart" element={<CartPage cart={cart} updateQuantity={updateQuantity} />} /><Route path="/checkout" element={<ProtectedRoute><CheckoutPage cart={cart} setCart={setCart} /></ProtectedRoute>} /><Route path="/order/:orderId" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} /><Route path="/login" element={<AuthPage mode="login" />} /><Route path="/signup" element={<AuthPage mode="signup" />} /><Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin" element={<AdminLayout><AdminOverview /></AdminLayout>} /><Route path="/admin/menu" element={<AdminLayout><AdminMenu /></AdminLayout>} /><Route path="/admin/orders" element={<AdminLayout><AdminOrders /></AdminLayout>} /><Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} /><Route path="*" element={<Home />} /></Routes>{!isAdminRoute && <Footer />}</div>
}

function Header({ cartCount }: { cartCount: number }) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const userQuery = useQuery({ queryKey: ['auth-user'], queryFn: api.me, enabled: Boolean(getToken()), retry: false })
  const user = userQuery.data
  const logout = () => {
    clearToken()
    queryClient.removeQueries({ queryKey: ['auth-user'] })
    queryClient.removeQueries({ queryKey: ['my-restaurant'] })
    queryClient.removeQueries({ queryKey: ['admin-users'] })
    navigate('/login', { replace: true })
  }
  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="brand-mark" aria-label="Govind Foods logo">GF</span>
        <span>Govind Foods</span>
      </Link>
      <div className="delivery-location"><span className="pin">⌖</span><span><small>Delivering to</small><strong> Indiranagar, Bengaluru</strong></span><span className="chevron">⌄</span></div>
      <nav className="main-nav">
        <NavLink to="/" end>Discover</NavLink>
        <a href="#how-it-works">How it works</a>
      </nav>
      <div className="header-actions">
        <Link className="icon-button" to="/cart" aria-label="View cart">🛒{cartCount > 0 && <b>{cartCount}</b>}</Link>
        {user ? <span className="header-user">Hi, <strong>{user.name}</strong></span> : <Link className="login-link" to="/login">Log in</Link>}
        {user ? <button type="button" className="header-logout" onClick={logout}>Log out</button> : <Link className="button button-dark button-small" to="/signup">Sign up</Link>}
      </div>
    </header>
  )
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  if (!getToken()) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

function Home() {
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [category, setCategory] = useState('All')
  const [heroSlide, setHeroSlide] = useState(0)
  const heroSlides = [
    { name: 'Saffron Stories', subtitle: 'North Indian · Biryani', image: restaurantImage('Saffron Stories'), accent: '#f7d5bd' },
    { name: 'The Green Bowl', subtitle: 'Healthy · Salads · Smoothies', image: restaurantImage('The Green Bowl'), accent: '#d8ead4' },
    { name: 'Pizza Lab', subtitle: 'Italian · Pizza · Pasta', image: restaurantImage('Pizza Lab'), accent: '#f3d2c1' },
    { name: 'Wok This Way', subtitle: 'Asian · Chinese · Thai', image: restaurantImage('Wok This Way'), accent: '#f7e2a8' },
    { name: 'The Coffee Room', subtitle: 'Cafe · Breakfast · Desserts', image: restaurantImage('The Coffee Room'), accent: '#e8d1bd' },
    { name: 'Taco Town', subtitle: 'Mexican · Tacos · Burritos', image: restaurantImage('Taco Town'), accent: '#f5d88d' },
    { name: 'Spice Route', subtitle: 'Indian · Curry · Kebabs', image: restaurantImage('Spice Route'), accent: '#f1c98e' },
  ]
  useEffect(() => {
    const timer = window.setInterval(() => setHeroSlide((current) => (current + 1) % heroSlides.length), 4500)
    return () => window.clearInterval(timer)
  }, [heroSlides.length])
  const restaurantsQuery = useQuery({ queryKey: ['restaurants', search], queryFn: () => api.restaurants(search) })
  const filteredRestaurants = useMemo(() => (restaurantsQuery.data ?? []).filter((restaurant) => {
    const matchesSearch = `${restaurant.name} ${restaurant.cuisine}`.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = category === 'All' || restaurant.cuisine.toLowerCase().includes(category.toLowerCase()) || restaurant.menuItems.some((item) => item.category.toLowerCase().includes(category.toLowerCase()))
    return matchesSearch && matchesCategory
  }), [category, search, restaurantsQuery.data])
  const searchRestaurants = search.trim() ? (restaurantsQuery.data ?? []).filter((restaurant) => `${restaurant.name} ${restaurant.cuisine}`.toLowerCase().includes(search.toLowerCase())) : []
  const searchFoods = search.trim() ? (restaurantsQuery.data ?? []).flatMap((restaurant) => restaurant.menuItems.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase())).map((item) => ({ item, restaurant }))).slice(0, 6) : []

  return (
    <main>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">GOOD FOOD, GOOD MOOD</span>
          <h1>Make your day<br /><em>delicious.</em></h1>
          <p>Discover the best local restaurants, delivered to your door with a little more care.</p>
          <div className="search-box search-box-wrap" onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}>
            <span>⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search for restaurants or dishes" aria-label="Search restaurants" />
            <button type="button" className="search-button">Search</button>
            {searchFocused && search.trim() && <div className="search-results"><div><small>RESTAURANTS</small>{searchRestaurants.length ? searchRestaurants.map((restaurant) => <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}><span>🍽️</span><span><strong>{restaurant.name}</strong><small>{restaurant.cuisine}</small></span></Link>) : <p>No restaurants found</p>}</div><div><small>FOOD</small>{searchFoods.length ? searchFoods.map(({ item, restaurant }) => <Link key={`${restaurant.id}-${item.id}`} to={`/restaurant/${restaurant.id}`}><span>🍴</span><span><strong>{item.name}</strong><small>{restaurant.name} · {item.category}</small></span></Link>) : <p>No matching dishes found</p>}</div></div>}
          </div>
          <div className="hero-note"><span>✦</span> Curated for your cravings <span className="dot">·</span> No hidden fees</div>
        </div>
        <div className="hero-art">
          <div className="hero-blob" style={{ background: heroSlides[heroSlide].accent }}></div>
          <div className="floating-card card-top"><span>⭐</span><strong>4.9</strong><small>top rated</small></div>
          <div className="food-bowl" style={{ backgroundImage: `url(${heroSlides[heroSlide].image})` }} role="img" aria-label={heroSlides[heroSlide].name}></div>
          <div className="floating-card card-bottom"><span>♨</span><strong>{heroSlides[heroSlide].name}</strong><small>{heroSlides[heroSlide].subtitle}</small></div>
          <div className="hero-carousel-controls"><button type="button" onClick={() => setHeroSlide((heroSlide - 1 + heroSlides.length) % heroSlides.length)} aria-label="Previous food">‹</button><div>{heroSlides.map((slide, index) => <button type="button" className={index === heroSlide ? 'active' : ''} key={slide.name} onClick={() => setHeroSlide(index)} aria-label={`Show ${slide.name}`} />)}</div><button type="button" onClick={() => setHeroSlide((heroSlide + 1) % heroSlides.length)} aria-label="Next food">›</button></div>
        </div>
      </section>
      <section className="content-section restaurant-section">
        <div className="section-heading"><div><span className="eyebrow">EXPLORE NEARBY</span><h2>What are you craving?</h2></div>{filteredRestaurants[0] && <Link to={`/restaurant/${filteredRestaurants[0].id}`} className="text-link">View all <span>→</span></Link>}</div>
        <div className="category-row">{categories.map((item) => <button key={item.name} type="button" className={`category-pill ${category === item.name ? 'active' : ''}`} onClick={() => setCategory(item.name)}><span>{item.emoji}</span>{item.name}</button>)}</div>
        {restaurantsQuery.isLoading && <div className="empty-state"><span>⌛</span><h3>Finding good food nearby...</h3></div>}
        {restaurantsQuery.isError && <div className="empty-state"><span>⚠</span><h3>We couldn't load restaurants</h3><p>{(restaurantsQuery.error as Error).message}</p></div>}
        <div className="restaurant-grid">{filteredRestaurants.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}</div>
        {filteredRestaurants.length === 0 && <div className="empty-state"><span>🍽️</span><h3>No restaurants found</h3><p>Try a different search or explore all categories.</p></div>}
      </section>
      <section className="feature-strip" id="how-it-works">
        <div><span className="feature-icon">✦</span><div><strong>Thoughtfully curated</strong><p>The good stuff, handpicked for you.</p></div></div>
        <div><span className="feature-icon">♨</span><div><strong>Always fresh</strong><p>Made to order, never sitting around.</p></div></div>
        <div><span className="feature-icon">♡</span><div><strong>Delivered with care</strong><p>We make every order count.</p></div></div>
      </section>
    </main>
  )
}

function RestaurantCard({ restaurant }: { restaurant: ApiRestaurant }) {
  return <Link className="restaurant-card" to={`/restaurant/${restaurant.id}`}>
    <div className="restaurant-image" style={{ backgroundImage: `url(${restaurantImage(restaurant.name)})` }}><span className="delivery-badge">● {restaurant.deliveryTime}</span><button type="button" className="heart" onClick={(event) => event.preventDefault()}>♡</button></div>
    <div className="restaurant-card-copy"><div><h3>{restaurant.name}</h3><p>{restaurant.cuisine}</p></div><span className="rating">★ {restaurant.rating}</span></div>
    <div className="restaurant-meta"><span>{restaurant.deliveryTime}</span><span>·</span><span>{restaurant.deliveryFee === 0 ? 'Free delivery' : `${currency(restaurant.deliveryFee)} delivery`}</span></div>
  </Link>
}

function RestaurantPage({ addToCart }: { addToCart: (item: MenuItem, restaurantId: string) => void }) {
  const { restaurantId } = useParams()
  const restaurantQuery = useQuery({ queryKey: ['restaurant', restaurantId], queryFn: () => api.restaurant(restaurantId!), enabled: Boolean(restaurantId) })
  const [selectedCategory, setSelectedCategory] = useState('All')
  const restaurant = restaurantQuery.data
  if (restaurantQuery.isLoading) return <main className="page-content"><div className="empty-state"><span>⌛</span><h3>Loading menu...</h3></div></main>
  if (!restaurant) return <main className="page-content"><div className="empty-state"><span>⚠</span><h3>Restaurant unavailable</h3><p>{(restaurantQuery.error as Error)?.message ?? 'Please try another restaurant.'}</p></div></main>
  const menuCategories = ['All', ...Array.from(new Set(restaurant.menuItems.map((item) => item.category)))]
  const menu = selectedCategory === 'All' ? restaurant.menuItems : restaurant.menuItems.filter((item) => item.category === selectedCategory)
  return <main className="restaurant-detail">
    <div className="detail-hero" style={{ backgroundImage: `url(${restaurantImage(restaurant.name)})` }}><div className="detail-overlay"></div><Link className="back-link" to="/">← Back to restaurants</Link><button type="button" className="detail-heart">♡</button></div>
    <section className="detail-content">
      <div className="detail-intro"><div><span className="eyebrow">LOCAL FAVOURITE</span><h1>{restaurant.name}</h1><p>{restaurant.description}</p><div className="detail-facts"><span>★ <b>{restaurant.rating}</b> rating</span><span>◷ {restaurant.deliveryTime}</span><span>⌖ {currency(restaurant.deliveryFee)} delivery</span></div></div><div className="detail-tags"><span>{restaurant.isOpen ? 'Accepting orders' : 'Currently closed'}</span><span>Freshly prepared</span></div></div>
      <div className="menu-tabs">{menuCategories.map((item) => <button type="button" className={selectedCategory === item ? 'active' : ''} key={item} onClick={() => setSelectedCategory(item)}>{item}</button>)}</div>
      <div className="menu-list">{menu.map((item) => <MenuCard key={item.id} item={{ ...item, emoji: restaurants[0].menu.find((mock) => mock.id === item.id)?.emoji ?? '🍽️' }} restaurantId={restaurant.id} addToCart={addToCart} />)}</div>
    </section>
  </main>
}

function MenuCard({ item, restaurantId, addToCart }: { item: MenuItem; restaurantId: string; addToCart: (item: MenuItem, restaurantId: string) => void }) {
  return <article className="menu-card"><div className="menu-card-copy">{item.popular && <span className="popular-label">POPULAR</span>}<h3>{item.name}</h3><p>{item.description}</p><strong>{currency(item.price)}</strong></div><div className="menu-item-art" style={{ backgroundImage: `url(${foodImage(item.name)})` }}><button type="button" onClick={() => addToCart(item, restaurantId)} aria-label={`Add ${item.name} to cart`}>+</button></div></article>
}

function CartPage({ cart, updateQuantity }: { cart: CartLine[]; updateQuantity: (id: string, change: number) => void }) {
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const delivery = cart.length ? 39 : 0
  return <main className="page-content"><div className="page-title"><span className="eyebrow">YOUR ORDER</span><h1>Your cart</h1><p>{cart.length ? 'Almost there. Your delicious choices are waiting.' : 'Your cart is waiting for something delicious.'}</p></div>{cart.length ? <div className="cart-layout"><div className="cart-items"><div className="order-restaurant"><span>🍽️</span><div><strong>{restaurants.find((item) => item.id === cart[0].restaurantId)?.name}</strong><small>Delivery in 25–35 min</small></div><span className="verified">✓</span></div>{cart.map((item) => <div className="cart-line" key={item.id}><span className="line-emoji">{item.emoji}</span><div className="line-info"><strong>{item.name}</strong><small>{currency(item.price)} each</small></div><div className="quantity-control"><button type="button" onClick={() => updateQuantity(item.id, -1)}>−</button><span>{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button></div><strong className="line-total">{currency(item.price * item.quantity)}</strong></div>)}<Link className="add-more" to={`/restaurant/${cart[0].restaurantId}`}>+ Add more items</Link></div><OrderSummary subtotal={subtotal} delivery={delivery} /></div> : <div className="empty-cart"><span>🛍️</span><h2>Nothing here yet</h2><p>Find a restaurant and add your first dish.</p><Link className="button button-dark" to="/">Explore restaurants</Link></div>}</main>
}

function OrderSummary({ subtotal, delivery, checkout = true }: { subtotal: number; delivery: number; checkout?: boolean }) {
  const total = subtotal + delivery
  return <aside className="order-summary"><h2>Order summary</h2><div className="summary-row"><span>Subtotal</span><strong>{currency(subtotal)}</strong></div><div className="summary-row"><span>Delivery fee</span><strong>{currency(delivery)}</strong></div><div className="summary-row savings"><span>✨ You’re saving ₹40 today</span><strong>−₹40</strong></div><div className="summary-total"><span>Total</span><strong>{currency(total)}</strong></div>{checkout && <Link className="button button-dark full-width" to="/checkout">Continue to checkout <span>→</span></Link>}<small className="secure-note">🔒 Secure checkout · No hidden fees</small></aside>
}

function CheckoutPage({ cart, setCart }: { cart: CartLine[]; setCart: (cart: CartLine[]) => void }) {
  const navigate = useNavigate()
  const [address, setAddress] = useState('home')
  const [payment, setPayment] = useState('upi')
  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const createOrder = useMutation({ mutationFn: () => api.createOrder({ restaurantId: cart[0].restaurantId, items: cart.map((item) => ({ menuItemId: item.id, quantity: item.quantity })), deliveryAddress: address === 'home' ? '42, 5th Main, Indiranagar, Bengaluru, 560038' : '12, 100 Feet Road, Bengaluru, 560008' }), onSuccess: (order) => { setCart([]); navigate(`/order/${order.id}`) } })
  const placeOrder = (event: FormEvent) => { event.preventDefault(); createOrder.mutate() }
  if (!cart.length) return <main className="page-content"><div className="empty-cart"><span>🛒</span><h2>Your cart is empty</h2><p>Add some food before checking out.</p><Link className="button button-dark" to="/">Browse restaurants</Link></div></main>
  return <main className="page-content checkout-page"><div className="page-title"><span className="eyebrow">ALMOST THERE</span><h1>Checkout</h1><p>Just a few details and your order is on its way.</p></div><form className="checkout-layout" onSubmit={placeOrder}><div className="checkout-fields"><section className="checkout-section"><div className="checkout-heading"><span>01</span><div><h2>Delivery address</h2><p>Where should we bring your food?</p></div></div><div className="choice-grid"><label className={`choice-card ${address === 'home' ? 'selected' : ''}`}><input type="radio" checked={address === 'home'} onChange={() => setAddress('home')} /><span className="choice-icon">⌂</span><span><strong>Home</strong><small>42, 5th Main, Indiranagar<br />Bengaluru, 560038</small></span><b>✓</b></label><label className={`choice-card ${address === 'office' ? 'selected' : ''}`}><input type="radio" checked={address === 'office'} onChange={() => setAddress('office')} /><span className="choice-icon">▣</span><span><strong>Office</strong><small>12, 100 Feet Road<br />Bengaluru, 560008</small></span><b>✓</b></label></div><button type="button" className="outline-button">+ Add a new address</button></section><section className="checkout-section"><div className="checkout-heading"><span>02</span><div><h2>Payment method</h2><p>All payments are secure and encrypted.</p></div></div><div className="payment-list"><label className={`payment-option ${payment === 'upi' ? 'selected' : ''}`}><input type="radio" checked={payment === 'upi'} onChange={() => setPayment('upi')} /><span className="payment-icon">↗</span><span><strong>UPI</strong><small>Pay with Google Pay, PhonePe or any UPI app</small></span><b>✓</b></label><label className={`payment-option ${payment === 'card' ? 'selected' : ''}`}><input type="radio" checked={payment === 'card'} onChange={() => setPayment('card')} /><span className="payment-icon">▭</span><span><strong>Card</strong><small>Credit or debit card</small></span><b>✓</b></label><label className={`payment-option ${payment === 'cash' ? 'selected' : ''}`}><input type="radio" checked={payment === 'cash'} onChange={() => setPayment('cash')} /><span className="payment-icon">₹</span><span><strong>Cash on delivery</strong><small>Pay when your order arrives</small></span><b>✓</b></label></div></section><label className="note-field"><span>Delivery instructions <small>(optional)</small></span><textarea placeholder="Anything we should know?"></textarea></label></div><div><OrderSummary subtotal={subtotal} delivery={39} checkout={false} /><button className="button button-dark full-width place-order" type="submit" disabled={createOrder.isPending}>{createOrder.isPending ? 'Placing order...' : 'Place order'} <span>→</span></button>{createOrder.error && <p className="form-error">{(createOrder.error as Error).message}</p>}<p className="terms-copy">By placing your order, you agree to our terms and conditions.</p></div></form></main>
}

function OrderPage() {
  const { orderId } = useParams()
  const orderQuery = useQuery({ queryKey: ['order', orderId], queryFn: () => api.order(orderId!), enabled: Boolean(orderId) })
  const [statusIndex, setStatusIndex] = useState(2)
  const liveStatus = orderQuery.data?.status
  const statuses = [{ icon: '✓', title: 'Order placed', detail: 'We’ve received your order' }, { icon: '♨', title: 'Being prepared', detail: 'The kitchen is working its magic' }, { icon: '♧', title: 'Out for delivery', detail: 'Your rider is on the way' }, { icon: '⌂', title: 'Delivered', detail: 'Enjoy your meal!' }]
  return <main className="page-content order-page"><div className="order-success"><span className="success-mark">✓</span><span className="eyebrow">ORDER CONFIRMED</span><h1>It’s on its way!</h1><p>Order <strong>#{orderId}</strong> · {liveStatus ? liveStatus.replaceAll('_', ' ') : 'Loading status...'}</p></div><div className="tracking-card"><div className="tracking-header"><div><span className="eyebrow">LIVE ORDER STATUS</span><h2>From Saffron Stories</h2></div><span className="order-number">#{orderId}</span></div><div className="progress-track"><span style={{ width: `${(statusIndex / (statuses.length - 1)) * 100}%` }}></span></div><div className="status-list">{statuses.map((status, index) => <div className={`status-step ${index <= statusIndex ? 'complete' : ''} ${index === statusIndex ? 'current' : ''}`} key={status.title}><span className="status-icon">{status.icon}</span><div><strong>{status.title}</strong><small>{status.detail}</small></div></div>)}</div><button type="button" className="simulate-button" onClick={() => setStatusIndex((current) => Math.min(current + 1, statuses.length - 1))}>{statusIndex < statuses.length - 1 ? 'Simulate next update' : 'Your order is delivered!'} <span>→</span></button></div><div className="order-help"><span>Need help with your order?</span><a href="mailto:support@govindfoods.test">Contact support →</a></div></main>
}

function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavigate()
  const isSignup = mode === 'signup'
  const [error, setError] = useState('')
  const login = useMutation({ mutationFn: (values: { name?: string; email: string; password: string }) => isSignup ? api.signup(values.name ?? '', values.email, values.password) : api.login(values.email, values.password), onSuccess: ({ token }) => { localStorage.setItem('morsel_token', token); navigate('/') }, onError: (requestError: Error) => setError(requestError.message) })
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); login.mutate({ name: String(form.get('name') ?? ''), email: String(form.get('email')), password: String(form.get('password')) }) }
  return <main className="auth-page"><div className="auth-art"><Link className="brand brand-light" to="/"><span className="brand-mark" aria-label="Govind Foods logo">GF</span><span>Govind Foods</span></Link><div><span className="auth-quote">“Good food is<br /><em>good mood.</em>”</span><p>Find your next favourite meal,<br />just around the corner.</p></div><span className="auth-food">🍜</span></div><div className="auth-form-wrap"><div className="auth-form"><span className="eyebrow">{isSignup ? 'WELCOME TO GOVIND FOODS' : 'WELCOME BACK'}</span><h1>{isSignup ? 'Let’s get you fed.' : 'Good to see you again.'}</h1><p className="form-intro">{isSignup ? 'Create an account and discover something delicious.' : 'Log in to see your favourite spots and recent orders.'}</p><form onSubmit={submit}>{isSignup && <label>Full name<input name="name" required placeholder="Your name" /></label>}<label>Email address<input name="email" required type="email" placeholder="you@example.com" /></label><label>Password<input name="password" required type="password" placeholder="••••••••" /></label>{!isSignup && <div className="form-options"><label className="checkbox-label"><input type="checkbox" /> Remember me</label><a href="#forgot">Forgot password?</a></div>}<button className="button button-dark full-width" type="submit" disabled={login.isPending}>{login.isPending ? 'Signing in...' : isSignup ? 'Create account' : 'Log in'} <span>→</span></button>{error && <p className="form-error">{error}</p>}</form><div className="auth-divider"><span>or continue with</span></div><button type="button" className="social-button">G <span>Continue with Google</span></button><p className="switch-auth">{isSignup ? 'Already have an account?' : 'New to Govind Foods?'} <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create an account'}</Link></p></div></div></main>
}

type AdminOrder = {
  id: string
  customer: string
  items: string
  total: number
  time: string
  status: 'New' | 'Preparing' | 'Ready for pickup' | 'Out for delivery'
}

type AdminMenuItem = ApiMenuItem

const adminOrders: AdminOrder[] = [
  { id: '#MOR-2841', customer: 'Aarav Mehta', items: 'Butter Chicken × 1, Garlic Naan × 2', total: 507, time: '2 min ago', status: 'New' },
  { id: '#MOR-2840', customer: 'Nisha Kapoor', items: 'Paneer Tikka × 1, Royal Veg Biryani × 1', total: 597, time: '8 min ago', status: 'Preparing' },
  { id: '#MOR-2839', customer: 'Rohan Shah', items: 'Butter Chicken × 2', total: 737, time: '19 min ago', status: 'Ready for pickup' },
  { id: '#MOR-2838', customer: 'Meera Iyer', items: 'Garlic Naan × 2, Royal Veg Biryani × 1', total: 427, time: '31 min ago', status: 'Out for delivery' },
]

function AdminLogin() {
  const navigate = useNavigate()
  const login = useMutation({ mutationFn: (values: { email: string; password: string }) => api.login(values.email, values.password), onSuccess: ({ token }) => { localStorage.setItem('morsel_token', token); navigate('/admin') } })
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); login.mutate({ email: String(form.get('email')), password: String(form.get('password')) }) }
  return <main className="admin-login"><div className="admin-login-card"><Link className="brand" to="/"><span className="brand-mark" aria-label="Govind Foods logo">GF</span><span>Govind Foods</span></Link><span className="eyebrow">RESTAURANT PARTNER PORTAL</span><h1>Welcome back.</h1><p>Manage your menu and keep your hungry customers happy.</p><form onSubmit={submit}><label>Email address<input name="email" required type="email" placeholder="owner@saffron.test" /></label><label>Password<input name="password" required type="password" placeholder="••••••••" /></label><button className="button button-dark full-width" type="submit" disabled={login.isPending}>{login.isPending ? 'Signing in...' : 'Sign in to dashboard'} <span>→</span></button>{login.error && <p className="form-error">{(login.error as Error).message}</p>}</form><small>Use owner@saffron.test / ChangeMe123!</small></div></main>
}

function AdminLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const restaurantQuery = useQuery({ queryKey: ['my-restaurant'], queryFn: api.myRestaurant, enabled: Boolean(getToken()) })
  if (!getToken()) { navigate('/admin/login'); return null }
  if (restaurantQuery.isLoading) return <main className="admin-login"><h2>Loading restaurant...</h2></main>
  if (restaurantQuery.isError || !restaurantQuery.data) return <main className="admin-login"><div className="empty-state"><h2>Unable to load restaurant</h2><p>{(restaurantQuery.error as Error)?.message}</p><Link className="button button-dark" to="/admin/login" onClick={clearToken}>Sign in again</Link></div></main>
  const restaurant = restaurantQuery.data
  const logout = () => {
    clearToken()
    queryClient.clear()
    navigate('/admin/login', { replace: true })
  }
  return <div className="admin-shell"><aside className="admin-sidebar"><Link className="brand" to="/"><span className="brand-mark" aria-label="Govind Foods logo">GF</span><span>Govind Foods</span></Link><div className="admin-restaurant"><span className="admin-avatar">SS</span><span><strong>{restaurant.name}</strong><small>Restaurant partner</small></span><span className="status-dot"></span></div><nav className="admin-nav"><span className="admin-nav-label">WORKSPACE</span><NavLink to="/admin" end><span>⌂</span> Overview</NavLink><NavLink to="/admin/orders"><span>♧</span> Incoming orders</NavLink><NavLink to="/admin/menu"><span>▦</span> Menu management</NavLink><NavLink to="/admin/users"><span>♙</span> Customers</NavLink><span className="admin-nav-label">ACCOUNT</span><a href="#settings"><span>⚙</span> Settings</a></nav><button className="admin-signout" type="button" onClick={logout}>↪ Sign out</button></aside><div className="admin-main"><header className="admin-topbar"><div><span className="eyebrow">RESTAURANT PARTNER PORTAL</span><h2>Good afternoon, {restaurant.name} <span>✦</span></h2></div><div className="admin-top-actions"><span className="admin-user">AS</span></div></header>{children}</div></div>
}

function AdminOverview() {
  return <main className="admin-content"><div className="admin-page-heading"><div><span className="eyebrow">YOUR RESTAURANT AT A GLANCE</span><h1>Overview</h1></div><button type="button" className="button button-dark" onClick={() => window.location.assign('/admin/orders')}>View incoming orders <span>→</span></button></div><div className="admin-stats"><div><span className="stat-icon orange">₹</span><small>Today's revenue</small><strong>₹12,480</strong><em>↑ 18.4% vs yesterday</em></div><div><span className="stat-icon green">♧</span><small>Orders today</small><strong>38</strong><em>↑ 6 orders vs yesterday</em></div><div><span className="stat-icon purple">★</span><small>Average rating</small><strong>4.8</strong><em>From 124 reviews</em></div><div><span className="stat-icon blue">◷</span><small>Avg. prep time</small><strong>24 min</strong><em>↓ 3 min this week</em></div></div><div className="admin-columns"><section className="admin-panel"><div className="panel-heading"><div><span className="eyebrow">LIVE QUEUE</span><h2>Incoming orders</h2></div><Link to="/admin/orders" className="text-link">View all →</Link></div>{adminOrders.slice(0, 3).map((order) => <AdminOrderRow key={order.id} order={order} />)}</section><section className="admin-panel menu-shortcut"><div className="panel-heading"><div><span className="eyebrow">YOUR MENU</span><h2>Menu at a glance</h2></div><Link to="/admin/menu" className="text-link">Manage →</Link></div><div className="menu-summary"><span className="menu-summary-icon">🍛</span><div><strong>12 active items</strong><small>Across 3 categories</small></div><span className="menu-summary-arrow">→</span></div><div className="menu-summary"><span className="menu-summary-icon">♨</span><div><strong>2 items paused</strong><small>Check availability</small></div><span className="menu-summary-arrow">→</span></div><div className="availability-row"><span className="status-dot"></span><span>Restaurant is accepting orders</span><button type="button">Open</button></div></section></div></main>
}

function AdminUsers() {
  const usersQuery = useQuery({ queryKey: ['admin-users'], queryFn: api.users })
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const selectedUser = usersQuery.data?.find((user) => user.id === selectedUserId)
  return <main className="admin-content"><div className="admin-page-heading"><div><span className="eyebrow">CUSTOMER DIRECTORY</span><h1>Users</h1><p>View accounts registered in the food delivery platform.</p></div></div>{usersQuery.isLoading && <div className="empty-state"><span>⌛</span><h3>Loading users...</h3></div>}{usersQuery.isError && <div className="empty-state"><span>⚠</span><h3>We couldn't load users</h3><p>{(usersQuery.error as Error).message}</p></div>}{selectedUser && <section className="admin-panel user-detail-panel"><div><span className="eyebrow">USER DETAILS</span><h2>{selectedUser.name}</h2><p>{selectedUser.email}</p></div><div className="user-detail-grid"><span><small>Role</small><strong>{selectedUser.role.replaceAll('_', ' ')}</strong></span><span><small>Joined</small><strong>{new Date(selectedUser.createdAt).toLocaleString()}</strong></span><span><small>User ID</small><strong>{selectedUser.id}</strong></span></div><button type="button" className="outline-button" onClick={() => setSelectedUserId(null)}>Close details</button></section>}{usersQuery.data && <section className="admin-panel menu-panel"><div className="menu-toolbar"><div className="admin-tabs"><button className="active" type="button">All users <b>{usersQuery.data.length}</b></button></div></div><div className="admin-menu-table"><div className="admin-table-head"><span>NAME</span><span>EMAIL</span><span>ROLE</span><span>JOINED</span><span></span></div>{usersQuery.data.map((user) => <button className="admin-menu-row user-row-button" type="button" key={user.id} onClick={() => setSelectedUserId(user.id)}><span className="admin-item-name"><span className="admin-item-emoji">👤</span><span><strong>{user.name}</strong><small>{user.id}</small></span></span><span className="table-muted">{user.email}</span><span className="table-muted">{user.role.replaceAll('_', ' ')}</span><span className="table-muted">{new Date(user.createdAt).toLocaleDateString()}</span><span className="table-muted">View →</span></button>)}</div></section>}</main>
}

function AdminMenu() {
  const queryClient = useQueryClient()
  const restaurantQuery = useQuery({ queryKey: ['my-restaurant'], queryFn: api.myRestaurant })
  const items = restaurantQuery.data?.menuItems ?? []
  const [editing, setEditing] = useState<AdminMenuItem | null>(null)
  const [showForm, setShowForm] = useState(false)
  const createItem = useMutation({ mutationFn: ({ restaurantId, item }: { restaurantId: string; item: Omit<ApiMenuItem, 'id' | 'restaurantId'> }) => api.createMenuItem(restaurantId, item), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-restaurant'] }) })
  const updateItem = useMutation({ mutationFn: ({ id, item }: { id: string; item: Partial<ApiMenuItem> }) => api.updateMenuItem(id, item), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-restaurant'] }) })
  const deleteItem = useMutation({ mutationFn: api.deleteMenuItem, onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-restaurant'] }) })
  const saveItem = (item: AdminMenuItem) => { if (editing) updateItem.mutate({ id: item.id, item }); else if (restaurantQuery.data) createItem.mutate({ restaurantId: restaurantQuery.data.id, item }) ; setEditing(null); setShowForm(false) }
  return <main className="admin-content"><div className="admin-page-heading"><div><span className="eyebrow">KEEP YOUR OFFERING FRESH</span><h1>Menu management</h1><p>Add, edit or pause items customers see on your menu.</p></div><button type="button" className="button button-dark" onClick={() => { setEditing(null); setShowForm(true) }}>+ Add new item</button></div>{showForm && <MenuForm item={editing} onSave={saveItem} onCancel={() => { setEditing(null); setShowForm(false) }} />}{!showForm && <section className="admin-panel menu-panel"><div className="menu-toolbar"><div className="admin-tabs"><button className="active" type="button">All items <b>{items.length}</b></button></div><span className="menu-search">⌕ <input placeholder="Search menu" /></span></div><div className="admin-menu-table"><div className="admin-table-head"><span>ITEM</span><span>CATEGORY</span><span>PRICE</span><span>STATUS</span><span></span></div>{items.map((item) => <div className="admin-menu-row" key={item.id}><span className="admin-item-name"><span className="admin-item-emoji">🍛</span><span><strong>{item.name}</strong><small>{item.description}</small></span></span><span className="table-muted">{item.category}</span><span className="table-price">{currency(item.price)}</span><span><button type="button" className={`availability ${item.available ? 'available' : 'paused'}`} onClick={() => updateItem.mutate({ id: item.id, item: { available: !item.available } })}><i></i>{item.available ? 'Available' : 'Paused'}</button></span><span className="row-actions"><button type="button" onClick={() => { setEditing(item); setShowForm(true) }}>Edit</button><button type="button" onClick={() => deleteItem.mutate(item.id)}>Delete</button></span></div>)}</div></section>}</main>
}

function MenuForm({ item, onSave, onCancel }: { item: AdminMenuItem | null; onSave: (item: AdminMenuItem) => void; onCancel: () => void }) {
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [category, setCategory] = useState(item?.category ?? 'Main course')
  const [price, setPrice] = useState(String(item?.price ?? ''))
  return <form className="admin-panel menu-form" onSubmit={(event) => { event.preventDefault(); onSave({ id: item?.id ?? `menu-${Date.now()}`, restaurantId: item?.restaurantId ?? '', name, description, category, price: Number(price), available: item?.available ?? true }) }}><div className="panel-heading"><div><span className="eyebrow">{item ? 'UPDATE YOUR MENU' : 'NEW MENU ITEM'}</span><h2>{item ? 'Edit item' : 'Add an item'}</h2></div><button type="button" className="close-button" onClick={onCancel}>×</button></div><div className="form-grid"><label>Item name<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Chicken Biryani" /></label><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option>Main course</option><option>Starters</option><option>Breads</option><option>Desserts</option></select></label><label className="wide-field">Description<textarea required value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the dish..." /></label><label>Price (₹)<input required min="1" type="number" value={price} onChange={(event) => setPrice(event.target.value)} /></label></div><div className="form-actions"><button type="button" className="outline-button" onClick={onCancel}>Cancel</button><button type="submit" className="button button-dark">{item ? 'Save changes' : 'Add item'} <span>→</span></button></div></form>
}

function AdminOrders() {
  const queryClient = useQueryClient()
  const ordersQuery = useQuery({ queryKey: ['admin-orders'], queryFn: api.orders })
  const updateStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: string }) => api.updateOrderStatus(id, status), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-orders'] }) })
  const orders = ordersQuery.data ?? []
  return <main className="admin-content"><div className="admin-page-heading"><div><span className="eyebrow">KEEP THE GOOD FOOD MOVING</span><h1>Incoming orders</h1><p>Review new orders and keep customers updated.</p></div><span className="orders-live"><i></i> Live updates on</span></div><div className="order-filter-row"><div className="admin-tabs"><button className="active" type="button">All orders <b>{orders.length}</b></button></div><select><option>All orders</option></select></div><section className="admin-panel orders-panel">{ordersQuery.isLoading && <div className="empty-state"><span>⌛</span><h3>Loading orders...</h3></div>}{ordersQuery.isError && <div className="empty-state"><h3>Unable to load orders</h3><p>{(ordersQuery.error as Error).message}</p></div>}{orders.map((order) => <AdminOrderRow key={order.id} order={{ id: `#${order.id.slice(0, 8).toUpperCase()}`, customer: order.deliveryAddress, items: order.items.map((item) => `${item.name} × ${item.quantity}`).join(', '), total: order.total, time: new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: order.status === 'PLACED' ? 'New' : order.status === 'PREPARING' ? 'Preparing' : order.status === 'READY_FOR_PICKUP' ? 'Ready for pickup' : 'Out for delivery' }} interactive onStatusChange={(status) => updateStatus.mutate({ id: order.id, status: status === 'New' ? 'ACCEPTED' : status === 'Preparing' ? 'PREPARING' : status === 'Ready for pickup' ? 'READY_FOR_PICKUP' : 'OUT_FOR_DELIVERY' })} />)}</section></main>
}

function AdminOrderRow({ order, interactive = false, onStatusChange }: { order: AdminOrder; interactive?: boolean; onStatusChange?: (status: AdminOrder['status']) => void }) {
  return <div className="admin-order-row"><div className="order-id"><span className="order-food-icon">🍽️</span><span><strong>{order.id}</strong><small>{order.time}</small></span></div><div className="order-customer"><strong>{order.customer}</strong><small>{order.items}</small></div><strong className="order-total">{currency(order.total)}</strong><span className={`order-status status-${order.status.replaceAll(' ', '-').toLowerCase()}`}>{order.status}</span>{interactive ? <select className="order-status-select" value={order.status} onChange={(event) => onStatusChange?.(event.target.value as AdminOrder['status'])}><option>New</option><option>Preparing</option><option>Ready for pickup</option><option>Out for delivery</option></select> : <span className="order-arrow">→</span>}</div>
}

function Footer() {
  return <footer className="site-footer"><Link className="brand" to="/"><span className="brand-mark" aria-label="Govind Foods logo">GF</span><span>Govind Foods</span></Link><span>Made for good food days.</span><span>© 2026 Govind Foods</span></footer>
}

export default App
