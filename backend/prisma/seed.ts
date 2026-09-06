import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const passwordHash = await bcrypt.hash('ChangeMe123!', 12)

const admin = await prisma.user.upsert({
  where: { email: 'admin@morsel.test' },
  update: {},
  create: { email: 'admin@morsel.test', name: 'Morsel Admin', passwordHash, role: Role.ADMIN },
})
const owner = await prisma.user.upsert({
  where: { email: 'owner@saffron.test' },
  update: {},
  create: { email: 'owner@saffron.test', name: 'Saffron Stories', passwordHash, role: Role.RESTAURANT_ADMIN },
})
await prisma.restaurant.upsert({
  where: { ownerId: owner.id },
  update: {},
  create: {
    ownerId: owner.id, name: 'Saffron Stories', cuisine: 'North Indian · Biryani',
    description: 'Hearty Indian favourites, slow-cooked with fragrant spices.',
    deliveryTime: '25–35 min', deliveryFee: 39, rating: 4.8,
    menuItems: { create: [
      { name: 'Butter Chicken', description: 'Tandoori chicken in a silky tomato and cashew gravy.', category: 'Main course', price: 349 },
      { name: 'Paneer Tikka', description: 'Charred cottage cheese, peppers and onions with mint chutney.', category: 'Starters', price: 289 },
      { name: 'Royal Veg Biryani', description: 'Basmati rice, seasonal vegetables and saffron.', category: 'Main course', price: 269 },
      { name: 'Garlic Naan', description: 'Tandoor-baked naan finished with garlic butter.', category: 'Breads', price: 79 },
    ] },
  },
})

const additionalRestaurants = [
  { email: 'owner@greenbowl.test', ownerName: 'Green Bowl Partner', name: 'The Green Bowl', cuisine: 'Healthy · Salads · Smoothies', description: 'Fresh, colourful bowls made for good days and busy schedules.', deliveryTime: '20–30 min', deliveryFee: 29, rating: 4.7, menu: [{ name: 'Rainbow Protein Bowl', description: 'Quinoa, avocado, roasted vegetables and lemon tahini.', category: 'Bowls', price: 329 }, { name: 'Green Falafel Wrap', description: 'Crispy falafel, hummus, greens and pickled onions.', category: 'Wraps', price: 249 }, { name: 'Berry Blast Smoothie', description: 'Strawberry, blueberry, banana and oat milk.', category: 'Drinks', price: 199 }] },
  { email: 'owner@pizzalab.test', ownerName: 'Pizza Lab Partner', name: 'Pizza Lab', cuisine: 'Italian · Pizza · Pasta', description: 'Hand-stretched pizzas with a little bit of Naples in every bite.', deliveryTime: '30–40 min', deliveryFee: 49, rating: 4.6, menu: [{ name: 'Classic Margherita', description: 'San Marzano tomato, fresh mozzarella and basil.', category: 'Pizzas', price: 349 }, { name: 'Truffle Cream Pasta', description: 'Tagliatelle, parmesan, mushroom and truffle oil.', category: 'Pasta', price: 399 }, { name: 'Tiramisu Cup', description: 'Espresso-soaked sponge layered with mascarpone cream.', category: 'Desserts', price: 189 }] },
  { email: 'owner@wokway.test', ownerName: 'Wok This Way Partner', name: 'Wok This Way', cuisine: 'Asian · Chinese · Thai', description: 'Big wok flavours, fresh ingredients, and just the right amount of heat.', deliveryTime: '25–35 min', deliveryFee: 39, rating: 4.5, menu: [{ name: 'Classic Pad Thai', description: 'Rice noodles, vegetables, egg and roasted peanuts.', category: 'Noodles', price: 299 }, { name: 'Crispy Bao Buns', description: 'Steamed buns with crispy tofu, slaw and hoisin.', category: 'Small plates', price: 249 }, { name: 'Thai Green Curry', description: 'Coconut curry with vegetables and jasmine rice.', category: 'Main course', price: 329 }] },
  { email: 'owner@coffeeroom.test', ownerName: 'The Coffee Room Partner', name: 'The Coffee Room', cuisine: 'Cafe · Breakfast · Desserts', description: 'Slow mornings, excellent coffee, and comforting all-day breakfast.', deliveryTime: '15–25 min', deliveryFee: 19, rating: 4.4, menu: [{ name: 'Classic Cappuccino', description: 'Rich espresso with silky steamed milk foam.', category: 'Drinks', price: 149 }, { name: 'Avocado Toast', description: 'Sourdough toast with smashed avocado and chilli flakes.', category: 'Breakfast', price: 229 }, { name: 'Chocolate Brownie', description: 'Warm, fudgy brownie with dark chocolate.', category: 'Desserts', price: 179 }] },
  { email: 'owner@tacotown.test', ownerName: 'Taco Town Partner', name: 'Taco Town', cuisine: 'Mexican · Tacos · Burritos', description: 'Bright, punchy Mexican street food made fresh to order.', deliveryTime: '25–35 min', deliveryFee: 35, rating: 4.3, menu: [{ name: 'Loaded Chicken Tacos', description: 'Soft tortillas, grilled chicken, salsa and crema.', category: 'Tacos', price: 279 }, { name: 'Bean Burrito', description: 'Spiced beans, rice, cheese and pico de gallo.', category: 'Burritos', price: 249 }, { name: 'Churros', description: 'Cinnamon sugar churros with chocolate dip.', category: 'Desserts', price: 159 }] },
]
for (const restaurant of additionalRestaurants) {
  const restaurantOwner = await prisma.user.upsert({ where: { email: restaurant.email }, update: {}, create: { email: restaurant.email, name: restaurant.ownerName, passwordHash, role: Role.RESTAURANT_ADMIN } })
  await prisma.restaurant.upsert({ where: { ownerId: restaurantOwner.id }, update: {}, create: { ownerId: restaurantOwner.id, name: restaurant.name, cuisine: restaurant.cuisine, description: restaurant.description, deliveryTime: restaurant.deliveryTime, deliveryFee: restaurant.deliveryFee, rating: restaurant.rating, menuItems: { create: restaurant.menu } } })
}
console.log(`Seeded admin ${admin.email} and restaurant owner ${owner.email}`)
await prisma.$disconnect()
