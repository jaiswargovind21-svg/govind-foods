import type { Order, Restaurant } from './types.js'

export const restaurants: Restaurant[] = [
  {
    id: 'saffron-stories',
    name: 'Saffron Stories',
    cuisine: 'North Indian · Biryani',
    description: 'Hearty Indian favourites, slow-cooked with fragrant spices.',
    rating: 4.8,
    deliveryTime: '25–35 min',
    deliveryFee: 39,
    isOpen: true,
    menu: [
      { id: 'butter-chicken', restaurantId: 'saffron-stories', name: 'Butter Chicken', description: 'Tandoori chicken in a silky tomato and cashew gravy.', category: 'Main course', price: 349, available: true },
      { id: 'paneer-tikka', restaurantId: 'saffron-stories', name: 'Paneer Tikka', description: 'Charred cottage cheese, peppers and onions with mint chutney.', category: 'Starters', price: 289, available: true },
      { id: 'veg-biryani', restaurantId: 'saffron-stories', name: 'Royal Veg Biryani', description: 'Basmati rice, seasonal vegetables and saffron.', category: 'Main course', price: 269, available: true },
      { id: 'garlic-naan', restaurantId: 'saffron-stories', name: 'Garlic Naan', description: 'Tandoor-baked naan finished with garlic butter.', category: 'Breads', price: 79, available: true },
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
    isOpen: true,
    menu: [
      { id: 'rainbow-bowl', restaurantId: 'green-bowl', name: 'Rainbow Protein Bowl', description: 'Quinoa, avocado, roasted vegetables and lemon tahini.', category: 'Bowls', price: 329, available: true },
      { id: 'falafel-wrap', restaurantId: 'green-bowl', name: 'Green Falafel Wrap', description: 'Crispy falafel, hummus, greens and pickled onions.', category: 'Wraps', price: 249, available: true },
    ],
  },
]

export const orders: Order[] = []
