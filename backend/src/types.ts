export type MenuItem = {
  id: string
  restaurantId: string
  name: string
  description: string
  category: string
  price: number
  available: boolean
}

export type Restaurant = {
  id: string
  name: string
  cuisine: string
  description: string
  rating: number
  deliveryTime: string
  deliveryFee: number
  isOpen: boolean
  menu: MenuItem[]
}

export type OrderStatus =
  | 'PLACED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

export type Order = {
  id: string
  customerId: string
  restaurantId: string
  status: OrderStatus
  items: Array<{
    menuItemId: string
    name: string
    price: number
    quantity: number
  }>
  deliveryAddress: string
  subtotal: number
  deliveryFee: number
  total: number
  createdAt: string
}
