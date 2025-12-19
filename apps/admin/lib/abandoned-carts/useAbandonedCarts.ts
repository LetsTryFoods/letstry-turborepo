// Abandoned Carts Hook with Dummy Data
// TODO: Replace with actual GraphQL queries when backend is ready

export interface CartItem {
  product: {
    _id: string
    name: string
    image: string
  }
  variant: string
  quantity: number
  price: number
}

export interface Customer {
  _id: string
  name: string
  email: string
  phone: string
}

export interface AbandonedCart {
  _id: string
  customer: Customer
  items: CartItem[]
  subtotal: number
  createdAt: string
  updatedAt: string
  lastActivity: string
}

// Dummy data for abandoned carts based on LetsTry Foods products
export const dummyAbandonedCarts: AbandonedCart[] = [
  {
    _id: 'cart1',
    customer: {
      _id: 'c1',
      name: 'Arjun Mehta',
      email: 'arjun.mehta@gmail.com',
      phone: '+919876543210'
    },
    items: [
      {
        product: {
          _id: 'p1',
          name: 'Mixed Pickle (Swaadisht Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 2,
        price: 299
      },
      {
        product: {
          _id: 'p2',
          name: 'Mango Pickle (Aam ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '250g',
        quantity: 1,
        price: 179
      }
    ],
    subtotal: 777,
    createdAt: '2024-12-10T10:30:00Z',
    updatedAt: '2024-12-12T15:45:00Z',
    lastActivity: '2024-12-12T15:45:00Z'
  },
  {
    _id: 'cart2',
    customer: {
      _id: 'c2',
      name: 'Kavita Sharma',
      email: 'kavita.sharma@yahoo.com',
      phone: '+918765432109'
    },
    items: [
      {
        product: {
          _id: 'p3',
          name: 'Lemon Pickle (Nimbu ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 1,
        price: 249
      }
    ],
    subtotal: 249,
    createdAt: '2024-12-11T08:20:00Z',
    updatedAt: '2024-12-12T10:30:00Z',
    lastActivity: '2024-12-12T10:30:00Z'
  },
  {
    _id: 'cart3',
    customer: {
      _id: 'c3',
      name: 'Rohit Verma',
      email: 'rohit.verma@outlook.com',
      phone: '+917654321098'
    },
    items: [
      {
        product: {
          _id: 'p4',
          name: 'Green Chilli Pickle (Hari Mirch)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '250g',
        quantity: 3,
        price: 149
      },
      {
        product: {
          _id: 'p5',
          name: 'Garlic Pickle (Lahsun ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 2,
        price: 279
      }
    ],
    subtotal: 1005,
    createdAt: '2024-12-09T14:15:00Z',
    updatedAt: '2024-12-11T09:00:00Z',
    lastActivity: '2024-12-11T09:00:00Z'
  },
  {
    _id: 'cart4',
    customer: {
      _id: 'c4',
      name: 'Deepa Nair',
      email: 'deepa.nair@gmail.com',
      phone: '+916543210987'
    },
    items: [
      {
        product: {
          _id: 'p6',
          name: 'Stuffed Red Chilli Pickle',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 1,
        price: 329
      },
      {
        product: {
          _id: 'p7',
          name: 'Amla Pickle (Gooseberry)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '250g',
        quantity: 2,
        price: 149
      },
      {
        product: {
          _id: 'p1',
          name: 'Mixed Pickle (Swaadisht Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '1kg',
        quantity: 1,
        price: 549
      }
    ],
    subtotal: 1176,
    createdAt: '2024-12-08T16:45:00Z',
    updatedAt: '2024-12-10T11:20:00Z',
    lastActivity: '2024-12-10T11:20:00Z'
  },
  {
    _id: 'cart5',
    customer: {
      _id: 'c5',
      name: 'Suresh Patel',
      email: 'suresh.patel@gmail.com',
      phone: '+915432109876'
    },
    items: [
      {
        product: {
          _id: 'p8',
          name: 'Ginger Pickle (Adrak ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 2,
        price: 289
      }
    ],
    subtotal: 578,
    createdAt: '2024-12-12T09:00:00Z',
    updatedAt: '2024-12-12T18:30:00Z',
    lastActivity: '2024-12-12T18:30:00Z'
  },
  {
    _id: 'cart6',
    customer: {
      _id: 'c6',
      name: 'Anjali Reddy',
      email: 'anjali.reddy@hotmail.com',
      phone: '+914321098765'
    },
    items: [
      {
        product: {
          _id: 'p9',
          name: 'Carrot Pickle (Gajar ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 1,
        price: 229
      },
      {
        product: {
          _id: 'p10',
          name: 'Pickle Combo Pack',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '4 x 250g',
        quantity: 1,
        price: 699
      }
    ],
    subtotal: 928,
    createdAt: '2024-12-07T12:30:00Z',
    updatedAt: '2024-12-09T14:15:00Z',
    lastActivity: '2024-12-09T14:15:00Z'
  },
  {
    _id: 'cart7',
    customer: {
      _id: 'c7',
      name: 'Manish Kumar',
      email: 'manish.kumar@gmail.com',
      phone: '+913210987654'
    },
    items: [
      {
        product: {
          _id: 'p2',
          name: 'Mango Pickle (Aam ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '1kg',
        quantity: 2,
        price: 329
      }
    ],
    subtotal: 658,
    createdAt: '2024-12-11T17:00:00Z',
    updatedAt: '2024-12-12T08:45:00Z',
    lastActivity: '2024-12-12T08:45:00Z'
  },
  {
    _id: 'cart8',
    customer: {
      _id: 'c8',
      name: 'Priyanka Singh',
      email: 'priyanka.singh@gmail.com',
      phone: '+912109876543'
    },
    items: [
      {
        product: {
          _id: 'p3',
          name: 'Lemon Pickle (Nimbu ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '250g',
        quantity: 4,
        price: 139
      },
      {
        product: {
          _id: 'p5',
          name: 'Garlic Pickle (Lahsun ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '250g',
        quantity: 2,
        price: 159
      }
    ],
    subtotal: 874,
    createdAt: '2024-12-10T20:15:00Z',
    updatedAt: '2024-12-12T12:00:00Z',
    lastActivity: '2024-12-12T12:00:00Z'
  }
]

// Hook to get abandoned carts (using dummy data for now)
export const useAbandonedCarts = () => {
  // TODO: Replace with actual GraphQL query
  return {
    data: { abandonedCarts: dummyAbandonedCarts },
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  }
}

// Hook to get single abandoned cart
export const useAbandonedCart = (id: string) => {
  // TODO: Replace with actual GraphQL query
  const cart = dummyAbandonedCarts.find(c => c._id === id)
  
  return {
    data: { abandonedCart: cart },
    loading: false,
    error: null
  }
}

// Hook to send WhatsApp notification
export const useSendWhatsAppNotification = () => {
  // TODO: Replace with actual API call
  const sendNotification = async (phone: string, customerName: string, cartValue: number) => {
    console.log(`Sending WhatsApp notification to ${phone}`)
    console.log(`Customer: ${customerName}, Cart Value: ₹${cartValue}`)
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Notification sent successfully' })
      }, 1000)
    })
  }

  return {
    sendNotification,
    loading: false,
    error: null
  }
}

// Hook to send SMS notification
export const useSendSMSNotification = () => {
  // TODO: Replace with actual API call to SMS gateway
  const sendSMS = async (phone: string, customerName: string, cartValue: number, message: string) => {
    console.log(`Sending SMS notification to ${phone}`)
    console.log(`Customer: ${customerName}, Cart Value: ₹${cartValue}`)
    console.log(`Message: ${message}`)
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'SMS sent successfully' })
      }, 1000)
    })
  }

  return {
    sendSMS,
    loading: false,
    error: null
  }
}

// Helper function to get cart stats
export const getAbandonedCartStats = (carts: AbandonedCart[]) => {
  const now = new Date()
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  return {
    total: carts.length,
    totalValue: carts.reduce((sum, cart) => sum + cart.subtotal, 0),
    last24Hours: carts.filter(c => new Date(c.lastActivity) > oneDayAgo).length,
    last3Days: carts.filter(c => new Date(c.lastActivity) > threeDaysAgo).length,
    last7Days: carts.filter(c => new Date(c.lastActivity) > sevenDaysAgo).length,
    averageCartValue: Math.round(carts.reduce((sum, cart) => sum + cart.subtotal, 0) / carts.length),
    totalItems: carts.reduce((sum, cart) => sum + cart.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0)
  }
}

// WhatsApp template messages
export const whatsAppTemplates = [
  {
    id: 'reminder',
    name: 'Cart Reminder',
    message: 'Hi {{name}}, you left some delicious pickles in your cart worth ₹{{value}}! Complete your order now and enjoy authentic homemade taste. Shop now: https://www.letstryfoods.com/cart'
  },
  {
    id: 'discount',
    name: 'Special Discount',
    message: 'Hi {{name}}, we noticed items worth ₹{{value}} in your cart! Use code COMEBACK10 for 10% off. Limited time offer! Shop: https://www.letstryfoods.com/cart'
  },
  {
    id: 'urgency',
    name: 'Limited Stock',
    message: 'Hi {{name}}, hurry! Items in your cart (₹{{value}}) are selling fast. Complete your order before they\'re gone! Shop: https://www.letstryfoods.com/cart'
  },
  {
    id: 'free_delivery',
    name: 'Free Delivery',
    message: 'Hi {{name}}, good news! Get FREE delivery on your cart worth ₹{{value}}. Complete your order today! Shop: https://www.letstryfoods.com/cart'
  }
]

// SMS template messages
export const smsTemplates = [
  {
    id: 'reminder',
    name: 'Cart Reminder',
    message: 'Hi {{name}}, your cart (₹{{value}}) is waiting! Complete your order at LetsTry Foods. Shop: letstryfoods.com/cart'
  },
  {
    id: 'discount',
    name: 'Special Discount',
    message: 'Hi {{name}}, get 10% off on your cart (₹{{value}})! Use code COMEBACK10. Shop: letstryfoods.com/cart'
  },
  {
    id: 'urgency',
    name: 'Limited Stock',
    message: 'Hi {{name}}, items in your cart (₹{{value}}) are selling fast! Order now: letstryfoods.com/cart'
  },
  {
    id: 'free_delivery',
    name: 'Free Delivery',
    message: 'Hi {{name}}, FREE delivery on your cart (₹{{value}})! Complete order: letstryfoods.com/cart'
  }
]
