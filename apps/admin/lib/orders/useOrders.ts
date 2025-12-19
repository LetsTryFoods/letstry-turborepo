// Orders Hook with Dummy Data
// TODO: Replace with actual GraphQL queries when backend is ready

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET'

export interface Customer {
  _id: string
  name: string
  email: string
  phone: string
}

export interface OrderItem {
  product: {
    _id: string
    name: string
    image: string
  }
  variant: string
  quantity: number
  price: number
}

export interface ShippingAddress {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  landmark?: string
}

export interface Payment {
  _id: string
  method: PaymentMethod
  status: PaymentStatus
  transactionId: string
  amount: number
  paidAt: string
}

export interface Order {
  _id: string
  orderNumber: string
  customer: Customer
  items: OrderItem[]
  shippingAddress: ShippingAddress
  payment: Payment
  subtotal: number
  deliveryCharge: number
  discount: number
  total: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

// Dummy data based on LetsTry Foods products
export const dummyOrders: Order[] = [
  {
    _id: '1',
    orderNumber: 'LTF-2024-001',
    customer: {
      _id: 'c1',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@gmail.com',
      phone: '+91 9876543210'
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
    shippingAddress: {
      fullName: 'Rahul Sharma',
      phone: '+91 9876543210',
      addressLine1: '42, MG Road, Sector 14',
      addressLine2: 'Near City Mall',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
      landmark: 'Opposite Metro Station'
    },
    payment: {
      _id: 'pay1',
      method: 'UPI',
      status: 'PAID',
      transactionId: 'TXN123456789',
      amount: 777,
      paidAt: '2024-12-10T10:30:00Z'
    },
    subtotal: 777,
    deliveryCharge: 0,
    discount: 0,
    total: 777,
    status: 'DELIVERED',
    createdAt: '2024-12-10T10:25:00Z',
    updatedAt: '2024-12-12T14:00:00Z'
  },
  {
    _id: '2',
    orderNumber: 'LTF-2024-002',
    customer: {
      _id: 'c2',
      name: 'Priya Patel',
      email: 'priya.patel@outlook.com',
      phone: '+91 8765432109'
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
      },
      {
        product: {
          _id: 'p4',
          name: 'Green Chilli Pickle (Hari Mirch)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '250g',
        quantity: 2,
        price: 149
      },
      {
        product: {
          _id: 'p5',
          name: 'Garlic Pickle (Lahsun ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 1,
        price: 279
      }
    ],
    shippingAddress: {
      fullName: 'Priya Patel',
      phone: '+91 8765432109',
      addressLine1: '15, Vastrapur Society',
      city: 'Ahmedabad',
      state: 'Gujarat',
      pincode: '380015'
    },
    payment: {
      _id: 'pay2',
      method: 'CARD',
      status: 'PAID',
      transactionId: 'TXN987654321',
      amount: 826,
      paidAt: '2024-12-11T15:45:00Z'
    },
    subtotal: 826,
    deliveryCharge: 50,
    discount: 50,
    total: 826,
    status: 'SHIPPED',
    createdAt: '2024-12-11T15:40:00Z',
    updatedAt: '2024-12-12T09:00:00Z'
  },
  {
    _id: '3',
    orderNumber: 'LTF-2024-003',
    customer: {
      _id: 'c3',
      name: 'Amit Kumar',
      email: 'amit.kumar@yahoo.com',
      phone: '+91 7654321098'
    },
    items: [
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
    shippingAddress: {
      fullName: 'Amit Kumar',
      phone: '+91 7654321098',
      addressLine1: '78, Laxmi Nagar',
      addressLine2: 'Block C',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110092',
      landmark: 'Near Laxmi Nagar Metro'
    },
    payment: {
      _id: 'pay3',
      method: 'NETBANKING',
      status: 'PAID',
      transactionId: 'TXN456789123',
      amount: 549,
      paidAt: '2024-12-12T08:20:00Z'
    },
    subtotal: 549,
    deliveryCharge: 0,
    discount: 0,
    total: 549,
    status: 'PROCESSING',
    createdAt: '2024-12-12T08:15:00Z',
    updatedAt: '2024-12-12T10:00:00Z'
  },
  {
    _id: '4',
    orderNumber: 'LTF-2024-004',
    customer: {
      _id: 'c4',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@gmail.com',
      phone: '+91 6543210987'
    },
    items: [
      {
        product: {
          _id: 'p6',
          name: 'Stuffed Red Chilli Pickle',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 3,
        price: 329
      },
      {
        product: {
          _id: 'p2',
          name: 'Mango Pickle (Aam ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '1kg',
        quantity: 1,
        price: 329
      }
    ],
    shippingAddress: {
      fullName: 'Sneha Reddy',
      phone: '+91 6543210987',
      addressLine1: '23, Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033'
    },
    payment: {
      _id: 'pay4',
      method: 'UPI',
      status: 'PAID',
      transactionId: 'TXN789123456',
      amount: 1316,
      paidAt: '2024-12-12T11:30:00Z'
    },
    subtotal: 1316,
    deliveryCharge: 0,
    discount: 100,
    total: 1216,
    status: 'CONFIRMED',
    createdAt: '2024-12-12T11:25:00Z',
    updatedAt: '2024-12-12T11:35:00Z'
  },
  {
    _id: '5',
    orderNumber: 'LTF-2024-005',
    customer: {
      _id: 'c5',
      name: 'Vikram Singh',
      email: 'vikram.singh@gmail.com',
      phone: '+91 5432109876'
    },
    items: [
      {
        product: {
          _id: 'p7',
          name: 'Amla Pickle (Gooseberry)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 2,
        price: 269
      }
    ],
    shippingAddress: {
      fullName: 'Vikram Singh',
      phone: '+91 5432109876',
      addressLine1: '56, Civil Lines',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302006',
      landmark: 'Near Raj Mandir Cinema'
    },
    payment: {
      _id: 'pay5',
      method: 'WALLET',
      status: 'PENDING',
      transactionId: '',
      amount: 538,
      paidAt: ''
    },
    subtotal: 538,
    deliveryCharge: 50,
    discount: 0,
    total: 588,
    status: 'PENDING',
    createdAt: '2024-12-12T14:00:00Z',
    updatedAt: '2024-12-12T14:00:00Z'
  },
  {
    _id: '6',
    orderNumber: 'LTF-2024-006',
    customer: {
      _id: 'c6',
      name: 'Meera Nair',
      email: 'meera.nair@gmail.com',
      phone: '+91 4321098765'
    },
    items: [
      {
        product: {
          _id: 'p8',
          name: 'Ginger Pickle (Adrak ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '250g',
        quantity: 1,
        price: 159
      },
      {
        product: {
          _id: 'p1',
          name: 'Mixed Pickle (Swaadisht Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 1,
        price: 299
      }
    ],
    shippingAddress: {
      fullName: 'Meera Nair',
      phone: '+91 4321098765',
      addressLine1: '12, MG Road',
      addressLine2: 'Ernakulam',
      city: 'Kochi',
      state: 'Kerala',
      pincode: '682011'
    },
    payment: {
      _id: 'pay6',
      method: 'UPI',
      status: 'FAILED',
      transactionId: 'TXN111222333',
      amount: 458,
      paidAt: ''
    },
    subtotal: 458,
    deliveryCharge: 50,
    discount: 0,
    total: 508,
    status: 'CANCELLED',
    createdAt: '2024-12-09T16:30:00Z',
    updatedAt: '2024-12-09T17:00:00Z'
  },
  {
    _id: '7',
    orderNumber: 'LTF-2024-007',
    customer: {
      _id: 'c7',
      name: 'Rajesh Gupta',
      email: 'rajesh.gupta@gmail.com',
      phone: '+91 3210987654'
    },
    items: [
      {
        product: {
          _id: 'p9',
          name: 'Carrot Pickle (Gajar ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '500g',
        quantity: 2,
        price: 229
      },
      {
        product: {
          _id: 'p3',
          name: 'Lemon Pickle (Nimbu ka Achar)',
          image: 'https://www.letstryfoods.com/_next/image?url=https%3A%2F%2Fres.cloudinary.com%2Fdxhwn7p8r%2Fimage%2Fupload%2Fv1731390694%2Fqkwvvb5ldznpyknlhhvt.png&w=640&q=75'
        },
        variant: '250g',
        quantity: 1,
        price: 139
      }
    ],
    shippingAddress: {
      fullName: 'Rajesh Gupta',
      phone: '+91 3210987654',
      addressLine1: '89, Hazratganj',
      city: 'Lucknow',
      state: 'Uttar Pradesh',
      pincode: '226001',
      landmark: 'Near Sahara Ganj Mall'
    },
    payment: {
      _id: 'pay7',
      method: 'CARD',
      status: 'REFUNDED',
      transactionId: 'TXN444555666',
      amount: 597,
      paidAt: '2024-12-08T09:15:00Z'
    },
    subtotal: 597,
    deliveryCharge: 0,
    discount: 0,
    total: 597,
    status: 'REFUNDED',
    createdAt: '2024-12-08T09:10:00Z',
    updatedAt: '2024-12-10T12:00:00Z'
  },
  {
    _id: '8',
    orderNumber: 'LTF-2024-008',
    customer: {
      _id: 'c8',
      name: 'Ananya Banerjee',
      email: 'ananya.b@gmail.com',
      phone: '+91 2109876543'
    },
    items: [
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
    shippingAddress: {
      fullName: 'Ananya Banerjee',
      phone: '+91 2109876543',
      addressLine1: '45, Salt Lake Sector V',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700091'
    },
    payment: {
      _id: 'pay8',
      method: 'UPI',
      status: 'PAID',
      transactionId: 'TXN777888999',
      amount: 699,
      paidAt: '2024-12-12T16:00:00Z'
    },
    subtotal: 699,
    deliveryCharge: 0,
    discount: 0,
    total: 699,
    status: 'CONFIRMED',
    createdAt: '2024-12-12T15:55:00Z',
    updatedAt: '2024-12-12T16:05:00Z'
  }
]

// Hook to get orders (using dummy data for now)
export const useOrders = (status?: OrderStatus) => {
  // TODO: Replace with actual GraphQL query
  // const { data, loading, error, refetch } = useQuery(GET_ORDERS, {
  //   variables: { status },
  //   fetchPolicy: 'cache-and-network',
  // })

  const filteredOrders = status 
    ? dummyOrders.filter(order => order.status === status)
    : dummyOrders

  return {
    data: { orders: filteredOrders },
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  }
}

// Hook to get single order
export const useOrder = (id: string) => {
  // TODO: Replace with actual GraphQL query
  const order = dummyOrders.find(o => o._id === id)
  
  return {
    data: { order },
    loading: false,
    error: null
  }
}

// Hook to update order status
export const useUpdateOrderStatus = () => {
  // TODO: Replace with actual GraphQL mutation
  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    console.log(`Updating order ${id} to status: ${status}`)
    // Simulate API call
    return Promise.resolve({ data: { updateOrderStatus: { _id: id, status } } })
  }

  return {
    updateOrderStatus,
    loading: false,
    error: null
  }
}

// Helper function to get order stats
export const getOrderStats = (orders: Order[]) => {
  return {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    confirmed: orders.filter(o => o.status === 'CONFIRMED').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length,
    refunded: orders.filter(o => o.status === 'REFUNDED').length,
    totalRevenue: orders
      .filter(o => o.payment.status === 'PAID' && o.status !== 'REFUNDED')
      .reduce((sum, o) => sum + o.total, 0),
    paidOrders: orders.filter(o => o.payment.status === 'PAID').length,
    pendingPayments: orders.filter(o => o.payment.status === 'PENDING').length,
    failedPayments: orders.filter(o => o.payment.status === 'FAILED').length
  }
}
