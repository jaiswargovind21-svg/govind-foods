export type MenuItem = {
  id: string
  name: string
  description: string
  price: number
  category: string
  emoji: string
  popular?: boolean
}

export type Restaurant = {
  id: string
  name: string
  cuisine: string
  description: string
  rating: number
  deliveryTime: string
  deliveryFee: number
  tags: string[]
  image: string
  accent: string
  menu: MenuItem[]
}

export const restaurants: Restaurant[] = [
  {
    id: 'saffron-stories',
    name: 'Saffron Stories',
    cuisine: 'North Indian · Biryani',
    description: 'Hearty Indian favourites, slow-cooked with fragrant spices.',
    rating: 4.8,
    deliveryTime: '25–35 min',
    deliveryFee: 39,
    tags: ['Bestseller', 'Pure veg options'],
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=85',
    accent: '#f9d9b4',
    menu: [
      { id: 'butter-chicken', name: 'Butter Chicken', description: 'Tandoori chicken in a silky tomato and cashew gravy.', price: 349, category: 'Main course', emoji: '🍛', popular: true },
      { id: 'paneer-tikka', name: 'Paneer Tikka', description: 'Charred cottage cheese, peppers and onions with mint chutney.', price: 289, category: 'Starters', emoji: '🧀', popular: true },
      { id: 'veg-biryani', name: 'Royal Veg Biryani', description: 'Basmati rice, seasonal vegetables and saffron.', price: 269, category: 'Main course', emoji: '🍚' },
      { id: 'garlic-naan', name: 'Garlic Naan', description: 'Tandoor-baked naan finished with garlic butter.', price: 79, category: 'Breads', emoji: '🫓' },
    ],
  },
  {
    id: 'green-bowl',
    name: 'The Green Bowl',
    cuisine: 'Healthy · Salads · Smoothies',
    description: 'Fresh, colourful bowls made for good days and busy schedules.',
    rating: 4.7,
    deliveryTime: '20–30 min',
    deliveryFee: 29,
    tags: ['Healthy choice', 'No added sugar'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=85',
    accent: '#d8ead4',
    menu: [
      { id: 'rainbow-bowl', name: 'Rainbow Protein Bowl', description: 'Quinoa, avocado, roasted vegetables and lemon tahini.', price: 329, category: 'Bowls', emoji: '🥗', popular: true },
      { id: 'falafel-wrap', name: 'Green Falafel Wrap', description: 'Crispy falafel, hummus, greens and pickled onions.', price: 249, category: 'Wraps', emoji: '🌯', popular: true },
      { id: 'berry-smoothie', name: 'Berry Blast Smoothie', description: 'Strawberry, blueberry, banana and oat milk.', price: 199, category: 'Drinks', emoji: '🫐' },
      { id: 'avocado-toast', name: 'Smashed Avocado Toast', description: 'Sourdough, avocado, seeds and chilli flakes.', price: 229, category: 'Breakfast', emoji: '🥑' },
    ],
  },
  {
    id: 'pizza-lab',
    name: 'Pizza Lab',
    cuisine: 'Italian · Pizza · Pasta',
    description: 'Hand-stretched pizzas with a little bit of Naples in every bite.',
    rating: 4.6,
    deliveryTime: '30–40 min',
    deliveryFee: 49,
    tags: ['Free delivery above ₹499', 'Family favourite'],
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=900&q=85',
    accent: '#f3d2c1',
    menu: [
      { id: 'margherita', name: 'Classic Margherita', description: 'San Marzano tomato, fresh mozzarella and basil.', price: 349, category: 'Pizzas', emoji: '🍕', popular: true },
      { id: 'truffle-pasta', name: 'Truffle Cream Pasta', description: 'Tagliatelle, parmesan, mushroom and truffle oil.', price: 399, category: 'Pasta', emoji: '🍝', popular: true },
      { id: 'pesto-pizza', name: 'Garden Pesto Pizza', description: 'Pesto base, peppers, olives, cherry tomatoes and feta.', price: 429, category: 'Pizzas', emoji: '🍕' },
      { id: 'tiramisu', name: 'Tiramisu Cup', description: 'Espresso-soaked sponge layered with mascarpone cream.', price: 189, category: 'Desserts', emoji: '🍰' },
    ],
  },
  {
    id: 'wok-this-way',
    name: 'Wok This Way',
    cuisine: 'Asian · Chinese · Thai',
    description: 'Big wok flavours, fresh ingredients, and just the right amount of heat.',
    rating: 4.5,
    deliveryTime: '25–35 min',
    deliveryFee: 39,
    tags: ['Spicy favourites', 'Great portions'],
    image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=85',
    accent: '#f7e2a8',
    menu: [
      { id: 'pad-thai', name: 'Classic Pad Thai', description: 'Rice noodles, vegetables, egg and roasted peanuts.', price: 299, category: 'Noodles', emoji: '🍜', popular: true },
      { id: 'bao-buns', name: 'Crispy Bao Buns', description: 'Steamed buns with crispy tofu, slaw and hoisin.', price: 249, category: 'Small plates', emoji: '🥟', popular: true },
      { id: 'thai-curry', name: 'Thai Green Curry', description: 'Coconut curry with vegetables and fragrant jasmine rice.', price: 329, category: 'Main course', emoji: '🍲' },
      { id: 'mango-sticky-rice', name: 'Mango Sticky Rice', description: 'Sweet coconut rice with fresh Alphonso mango.', price: 179, category: 'Desserts', emoji: '🥭' },
    ],
  },
]

export const categories = [
  { name: 'All', emoji: '✨' },
  { name: 'Biryani', emoji: '🍛' },
  { name: 'Pizza', emoji: '🍕' },
  { name: 'Healthy', emoji: '🥗' },
  { name: 'Asian', emoji: '🍜' },
  { name: 'Desserts', emoji: '🍰' },
]

export const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`
