// FAQ Hook with Dummy Data
// TODO: Replace with actual GraphQL queries when backend is ready

import { useMemo, useCallback, useRef } from 'react'

export type FAQStatus = 'ACTIVE' | 'INACTIVE'
export type FAQCategory = 'GENERAL' | 'ORDERS' | 'SHIPPING' | 'PAYMENT' | 'RETURNS' | 'PRODUCTS'

export interface FAQ {
  _id: string
  question: string
  answer: string
  category: FAQCategory
  status: FAQStatus
  order: number
  createdAt: string
  updatedAt: string
}

// Dummy FAQ data for LetsTry Foods
export const dummyFAQs: FAQ[] = [
  {
    _id: 'faq1',
    question: 'What is the shelf life of your pickles?',
    answer: 'Our pickles have a shelf life of 12 months from the date of manufacture when stored properly in a cool, dry place. Once opened, please refrigerate and consume within 3 months for best taste.',
    category: 'PRODUCTS',
    status: 'ACTIVE',
    order: 1,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: 'faq2',
    question: 'Do you use any preservatives in your pickles?',
    answer: 'No, we do not use any artificial preservatives in our pickles. Our pickles are made using traditional methods with natural preservatives like oil, salt, and spices that have been used for generations.',
    category: 'PRODUCTS',
    status: 'ACTIVE',
    order: 2,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: 'faq3',
    question: 'How long does delivery take?',
    answer: 'We typically deliver within 3-5 business days for metro cities and 5-7 business days for other locations. You will receive a tracking link once your order is shipped.',
    category: 'SHIPPING',
    status: 'ACTIVE',
    order: 3,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  },
  {
    _id: 'faq4',
    question: 'Do you offer free shipping?',
    answer: 'Yes! We offer free shipping on all orders above ₹499. For orders below ₹499, a flat shipping fee of ₹49 is applicable.',
    category: 'SHIPPING',
    status: 'ACTIVE',
    order: 4,
    createdAt: '2024-02-01T10:00:00Z',
    updatedAt: '2024-02-01T10:00:00Z'
  },
  {
    _id: 'faq5',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major payment methods including Credit/Debit Cards (Visa, Mastercard, Rupay), UPI (Google Pay, PhonePe, Paytm), Net Banking, and Wallets. All transactions are secured with SSL encryption.',
    category: 'PAYMENT',
    status: 'ACTIVE',
    order: 5,
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z'
  },
  {
    _id: 'faq6',
    question: 'Is Cash on Delivery (COD) available?',
    answer: 'Currently, we only accept online payments to ensure faster processing and delivery. COD is not available at the moment.',
    category: 'PAYMENT',
    status: 'ACTIVE',
    order: 6,
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z'
  },
  {
    _id: 'faq7',
    question: 'Can I cancel my order?',
    answer: 'You can cancel your order within 2 hours of placing it, provided it has not been shipped yet. Once the order is shipped, cancellation is not possible. Please contact our support team for assistance.',
    category: 'ORDERS',
    status: 'ACTIVE',
    order: 7,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  },
  {
    _id: 'faq8',
    question: 'How can I track my order?',
    answer: 'Once your order is shipped, you will receive an email and SMS with the tracking link. You can also track your order by logging into your account and visiting the "My Orders" section.',
    category: 'ORDERS',
    status: 'ACTIVE',
    order: 8,
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z'
  },
  {
    _id: 'faq9',
    question: 'What is your return policy?',
    answer: 'We accept returns only for damaged or defective products. If you receive a damaged product, please contact us within 48 hours of delivery with photos of the damaged item. We will arrange for a replacement or refund.',
    category: 'RETURNS',
    status: 'ACTIVE',
    order: 9,
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z'
  },
  {
    _id: 'faq10',
    question: 'How do I get a refund?',
    answer: 'Refunds are processed within 5-7 business days after we receive and verify the returned product. The amount will be credited to your original payment method.',
    category: 'RETURNS',
    status: 'ACTIVE',
    order: 10,
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z'
  },
  {
    _id: 'faq11',
    question: 'Are your pickles vegetarian?',
    answer: 'Yes, all our pickles are 100% vegetarian. We use only plant-based ingredients and traditional spices in our recipes.',
    category: 'PRODUCTS',
    status: 'ACTIVE',
    order: 11,
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2024-04-01T10:00:00Z'
  },
  {
    _id: 'faq12',
    question: 'Do you ship internationally?',
    answer: 'Currently, we only ship within India. We are working on expanding our delivery to international locations. Please follow us on social media for updates.',
    category: 'SHIPPING',
    status: 'INACTIVE',
    order: 12,
    createdAt: '2024-04-01T10:00:00Z',
    updatedAt: '2024-04-01T10:00:00Z'
  },
  {
    _id: 'faq13',
    question: 'How can I contact customer support?',
    answer: 'You can reach us via email at support@letstryfoods.com or call us at +91-XXXXXXXXXX (Mon-Sat, 10 AM - 6 PM). You can also use the contact form on our website.',
    category: 'GENERAL',
    status: 'ACTIVE',
    order: 13,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    _id: 'faq14',
    question: 'Do you offer bulk orders for events or businesses?',
    answer: 'Yes, we do offer bulk orders and corporate gifting options. Please contact us at bulk@letstryfoods.com with your requirements and we will provide a customized quote.',
    category: 'GENERAL',
    status: 'ACTIVE',
    order: 14,
    createdAt: '2024-05-01T10:00:00Z',
    updatedAt: '2024-05-01T10:00:00Z'
  }
]

// Pre-sorted static data - never changes
const sortedFAQs = dummyFAQs.sort((a, b) => a.order - b.order)

// Hook to get FAQs
export const useFAQs = (category?: FAQCategory, status?: FAQStatus) => {
  
  const filteredFAQs = useMemo(() => {
    if (!category && !status) {
      return sortedFAQs
    }
    
    let faqs = sortedFAQs
    
    if (category) {
      faqs = faqs.filter(faq => faq.category === category)
    }
    
    if (status) {
      faqs = faqs.filter(faq => faq.status === status)
    }
    
    return faqs
  }, [category, status])

  // Use ref to maintain stable reference
  const resultRef = useRef({
    data: { faqs: sortedFAQs },
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  })

  // Only update if filtered data actually changed
  resultRef.current.data = { faqs: filteredFAQs }

  return resultRef.current
}

// Hook to get single FAQ
export const useFAQ = (id: string) => {
  const faq = dummyFAQs.find(f => f._id === id)
  
  return {
    data: { faq },
    loading: false,
    error: null
  }
}

// Hook to create FAQ
export const useCreateFAQ = () => {
  const createFAQ = async (data: Omit<FAQ, '_id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Creating FAQ:', data)
    return Promise.resolve({ success: true, id: 'new-faq-id' })
  }

  return {
    createFAQ,
    loading: false,
    error: null
  }
}

// Hook to update FAQ
export const useUpdateFAQ = () => {
  const updateFAQ = async (id: string, data: Partial<FAQ>) => {
    console.log(`Updating FAQ ${id}:`, data)
    return Promise.resolve({ success: true })
  }

  return {
    updateFAQ,
    loading: false,
    error: null
  }
}

// Hook to delete FAQ
export const useDeleteFAQ = () => {
  const deleteFAQ = async (id: string) => {
    console.log(`Deleting FAQ ${id}`)
    return Promise.resolve({ success: true })
  }

  return {
    deleteFAQ,
    loading: false,
    error: null
  }
}

// Helper function to get FAQ stats
export const getFAQStats = (faqs: FAQ[]) => {
  const categoryCount: Record<FAQCategory, number> = {
    GENERAL: 0,
    ORDERS: 0,
    SHIPPING: 0,
    PAYMENT: 0,
    RETURNS: 0,
    PRODUCTS: 0
  }

  faqs.forEach(faq => {
    categoryCount[faq.category]++
  })

  return {
    total: faqs.length,
    active: faqs.filter(f => f.status === 'ACTIVE').length,
    inactive: faqs.filter(f => f.status === 'INACTIVE').length,
    categoryCount
  }
}

export const categoryLabels: Record<FAQCategory, string> = {
  GENERAL: 'General',
  ORDERS: 'Orders',
  SHIPPING: 'Shipping & Delivery',
  PAYMENT: 'Payment',
  RETURNS: 'Returns & Refunds',
  PRODUCTS: 'Products'
}
