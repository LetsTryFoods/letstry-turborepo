// Reports Hook with Dummy Data
// TODO: Replace with actual GraphQL queries when backend is ready

export interface DailySales {
  date: string
  orders: number
  revenue: number
}

export interface TopProduct {
  _id: string
  name: string
  image: string
  soldQuantity: number
  revenue: number
}

export interface TopCustomer {
  _id: string
  name: string
  email: string
  totalOrders: number
  totalSpent: number
}

export interface CategorySales {
  category: string
  revenue: number
  percentage: number
}

export interface ReportSummary {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  avgOrderValue: number
  revenueGrowth: number
  ordersGrowth: number
  customersGrowth: number
}

export interface ReportsData {
  summary: ReportSummary
  dailySales: DailySales[]
  topProducts: TopProduct[]
  topCustomers: TopCustomer[]
  categorySales: CategorySales[]
}

// Generate dummy daily sales data ONCE at module load
const staticDailySales: DailySales[] = (() => {
  const sales: DailySales[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Fixed seed-like values based on day index for consistency
    const orders = 5 + (i % 20) + Math.floor(i / 3)
    const avgValue = 400 + (i * 13) % 400
    
    sales.push({
      date: date.toISOString().split('T')[0],
      orders,
      revenue: orders * avgValue
    })
  }
  
  return sales
})()

// Dummy top products data
const dummyTopProducts: TopProduct[] = [
  {
    _id: 'prod1',
    name: 'Mango Pickle (Aam ka Achar)',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/mango-pickle.jpg',
    soldQuantity: 245,
    revenue: 73255
  },
  {
    _id: 'prod2',
    name: 'Mixed Vegetable Pickle',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/mixed-pickle.jpg',
    soldQuantity: 198,
    revenue: 59202
  },
  {
    _id: 'prod3',
    name: 'Lemon Pickle (Nimbu ka Achar)',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/lemon-pickle.jpg',
    soldQuantity: 176,
    revenue: 44176
  },
  {
    _id: 'prod4',
    name: 'Stuffed Red Chilli Pickle',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/stuffed-chilli.jpg',
    soldQuantity: 142,
    revenue: 49558
  },
  {
    _id: 'prod5',
    name: 'Garlic Pickle (Lahsun ka Achar)',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/garlic-pickle.jpg',
    soldQuantity: 128,
    revenue: 38272
  },
  {
    _id: 'prod6',
    name: 'Amla Pickle (Gooseberry)',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/amla-pickle.jpg',
    soldQuantity: 115,
    revenue: 31625
  },
  {
    _id: 'prod7',
    name: 'Green Chilli Pickle',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/chilli-pickle.jpg',
    soldQuantity: 98,
    revenue: 24402
  },
  {
    _id: 'prod8',
    name: 'Ginger Pickle (Adrak ka Achar)',
    image: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/ginger-pickle.jpg',
    soldQuantity: 87,
    revenue: 26013
  }
]

// Dummy top customers data
const dummyTopCustomers: TopCustomer[] = [
  {
    _id: 'cust9',
    name: 'Karthik Iyer',
    email: 'karthik.iyer@gmail.com',
    totalOrders: 15,
    totalSpent: 12450
  },
  {
    _id: 'cust3',
    name: 'Amit Kumar',
    email: 'amit.kumar@yahoo.com',
    totalOrders: 12,
    totalSpent: 8750
  },
  {
    _id: 'cust1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    totalOrders: 8,
    totalSpent: 4599
  },
  {
    _id: 'cust10',
    name: 'Pooja Deshmukh',
    email: 'pooja.d@gmail.com',
    totalOrders: 7,
    totalSpent: 4890
  },
  {
    _id: 'cust7',
    name: 'Rajesh Gupta',
    email: 'rajesh.gupta@gmail.com',
    totalOrders: 6,
    totalSpent: 3245
  }
]

// Dummy category sales data
const dummyCategorySales: CategorySales[] = [
  { category: 'Mango Pickles', revenue: 85000, percentage: 32 },
  { category: 'Mixed Pickles', revenue: 62000, percentage: 23 },
  { category: 'Chilli Pickles', revenue: 48000, percentage: 18 },
  { category: 'Lemon Pickles', revenue: 38000, percentage: 14 },
  { category: 'Other Pickles', revenue: 35000, percentage: 13 }
]

// Pre-calculate summary from static daily sales
const staticSummary: ReportSummary = (() => {
  const totalRevenue = staticDailySales.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = staticDailySales.reduce((sum, d) => sum + d.orders, 0)
  
  return {
    totalRevenue,
    totalOrders,
    totalCustomers: 1250,
    avgOrderValue: Math.round(totalRevenue / totalOrders),
    revenueGrowth: 18.5,
    ordersGrowth: 12.3,
    customersGrowth: 8.7
  }
})()

// Pre-built static reports data
const staticReportsData: ReportsData = {
  summary: staticSummary,
  dailySales: staticDailySales,
  topProducts: dummyTopProducts,
  topCustomers: dummyTopCustomers,
  categorySales: dummyCategorySales
}

// Static result object - never changes
const staticResult = {
  data: staticReportsData,
  loading: false,
  error: null,
  refetch: () => Promise.resolve()
}

// Hook to get reports data
export const useReports = (period: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  // Return the same static reference every time
  return staticResult
}

// Helper to format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount)
}

// Helper to format compact numbers
export const formatCompactNumber = (num: number) => {
  if (num >= 100000) {
    return `${(num / 100000).toFixed(1)}L`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}
