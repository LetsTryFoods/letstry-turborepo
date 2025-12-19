// Reviews Hook with Dummy Data
// TODO: Replace with actual GraphQL queries when backend is ready

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Review {
  _id: string
  productId: string
  productName: string
  productImage: string
  customerId: string
  customerName: string
  customerEmail: string
  rating: number
  title: string
  comment: string
  images?: string[]
  status: ReviewStatus
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: string
  updatedAt: string
}

// Dummy data for reviews based on LetsTry Foods products
export const dummyReviews: Review[] = [
  {
    _id: 'rev1',
    productId: 'prod1',
    productName: 'Mango Pickle (Aam ka Achar)',
    productImage: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/mango-pickle.jpg',
    customerId: 'cust1',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@gmail.com',
    rating: 5,
    title: 'Best mango pickle ever!',
    comment: 'This is the most authentic mango pickle I have ever tasted. Reminds me of my grandmother\'s homemade pickle. The spices are perfectly balanced and the mangoes are fresh. Will definitely order again!',
    images: ['https://res.cloudinary.com/demo/image/upload/v1/reviews/rev1-1.jpg'],
    status: 'APPROVED',
    isVerifiedPurchase: true,
    helpfulCount: 24,
    createdAt: '2024-12-10T10:30:00Z',
    updatedAt: '2024-12-10T12:00:00Z'
  },
  {
    _id: 'rev2',
    productId: 'prod2',
    productName: 'Mixed Vegetable Pickle',
    productImage: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/mixed-pickle.jpg',
    customerId: 'cust2',
    customerName: 'Priya Patel',
    customerEmail: 'priya.patel@outlook.com',
    rating: 4,
    title: 'Good quality, slightly spicy',
    comment: 'The pickle is really tasty and has a good mix of vegetables. However, it\'s a bit too spicy for my taste. Would appreciate a milder version. Overall great product!',
    status: 'APPROVED',
    isVerifiedPurchase: true,
    helpfulCount: 12,
    createdAt: '2024-12-09T15:45:00Z',
    updatedAt: '2024-12-09T16:00:00Z'
  },
  {
    _id: 'rev3',
    productId: 'prod3',
    productName: 'Lemon Pickle (Nimbu ka Achar)',
    productImage: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/lemon-pickle.jpg',
    customerId: 'cust3',
    customerName: 'Amit Kumar',
    customerEmail: 'amit.kumar@yahoo.com',
    rating: 5,
    title: 'Tangy and delicious!',
    comment: 'Perfect tangy taste! The lemon pickle goes well with everything - dal rice, paratha, you name it. The packaging was also very good and the product arrived fresh.',
    status: 'PENDING',
    isVerifiedPurchase: true,
    helpfulCount: 0,
    createdAt: '2024-12-12T08:20:00Z',
    updatedAt: '2024-12-12T08:20:00Z'
  },
  {
    _id: 'rev4',
    productId: 'prod4',
    productName: 'Green Chilli Pickle',
    productImage: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/chilli-pickle.jpg',
    customerId: 'cust4',
    customerName: 'Sneha Reddy',
    customerEmail: 'sneha.reddy@gmail.com',
    rating: 3,
    title: 'Average product',
    comment: 'The pickle is okay but nothing special. Expected more heat from green chilli pickle. The oil quantity was also less compared to what I usually prefer.',
    status: 'APPROVED',
    isVerifiedPurchase: true,
    helpfulCount: 5,
    createdAt: '2024-12-08T11:30:00Z',
    updatedAt: '2024-12-08T14:00:00Z'
  },
  {
    _id: 'rev5',
    productId: 'prod1',
    productName: 'Mango Pickle (Aam ka Achar)',
    productImage: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/mango-pickle.jpg',
    customerId: 'cust5',
    customerName: 'Vikram Singh',
    customerEmail: 'vikram.singh@gmail.com',
    rating: 1,
    title: 'Very disappointed',
    comment: 'The pickle arrived with the jar broken. Customer service was slow to respond. When I finally got a replacement, it tasted stale. Very bad experience.',
    status: 'REJECTED',
    isVerifiedPurchase: false,
    helpfulCount: 2,
    createdAt: '2024-12-05T14:00:00Z',
    updatedAt: '2024-12-06T10:00:00Z'
  },
  {
    _id: 'rev6',
    productId: 'prod5',
    productName: 'Garlic Pickle (Lahsun ka Achar)',
    productImage: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/garlic-pickle.jpg',
    customerId: 'cust6',
    customerName: 'Meera Nair',
    customerEmail: 'meera.nair@gmail.com',
    rating: 5,
    title: 'Absolutely love it!',
    comment: 'Being from Kerala, I was skeptical about North Indian pickles, but this garlic pickle won me over. The garlic cloves are perfectly pickled and the taste is amazing!',
    images: ['https://res.cloudinary.com/demo/image/upload/v1/reviews/rev6-1.jpg', 'https://res.cloudinary.com/demo/image/upload/v1/reviews/rev6-2.jpg'],
    status: 'PENDING',
    isVerifiedPurchase: true,
    helpfulCount: 0,
    createdAt: '2024-12-11T16:30:00Z',
    updatedAt: '2024-12-11T16:30:00Z'
  },
  {
    _id: 'rev7',
    productId: 'prod2',
    productName: 'Mixed Vegetable Pickle',
    productImage: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/mixed-pickle.jpg',
    customerId: 'cust7',
    customerName: 'Rajesh Gupta',
    customerEmail: 'rajesh.gupta@gmail.com',
    rating: 4,
    title: 'Good value for money',
    comment: 'The quantity is generous and the taste is authentic. Good variety of vegetables. Packaging could be better but overall satisfied with the purchase.',
    status: 'APPROVED',
    isVerifiedPurchase: true,
    helpfulCount: 8,
    createdAt: '2024-12-07T09:15:00Z',
    updatedAt: '2024-12-07T11:00:00Z'
  },
  {
    _id: 'rev8',
    productId: 'prod6',
    productName: 'Stuffed Red Chilli Pickle',
    productImage: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/stuffed-chilli.jpg',
    customerId: 'cust8',
    customerName: 'Ananya Banerjee',
    customerEmail: 'ananya.b@gmail.com',
    rating: 5,
    title: 'Restaurant quality at home!',
    comment: 'These stuffed chillis are exactly like what you get in authentic Rajasthani restaurants. The filling is flavorful and the chillis have the perfect crunch. Highly recommend!',
    status: 'APPROVED',
    isVerifiedPurchase: true,
    helpfulCount: 18,
    createdAt: '2024-12-06T12:45:00Z',
    updatedAt: '2024-12-06T14:30:00Z'
  },
  {
    _id: 'rev9',
    productId: 'prod3',
    productName: 'Lemon Pickle (Nimbu ka Achar)',
    productImage: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/lemon-pickle.jpg',
    customerId: 'cust9',
    customerName: 'Karthik Iyer',
    customerEmail: 'karthik.iyer@gmail.com',
    rating: 4,
    title: 'Fresh and tasty',
    comment: 'Good lemon pickle with nice tangy flavor. The lemons are soft and well-marinated. Only giving 4 stars because delivery took longer than expected.',
    status: 'PENDING',
    isVerifiedPurchase: true,
    helpfulCount: 0,
    createdAt: '2024-12-12T09:30:00Z',
    updatedAt: '2024-12-12T09:30:00Z'
  },
  {
    _id: 'rev10',
    productId: 'prod7',
    productName: 'Amla Pickle (Gooseberry)',
    productImage: 'https://res.cloudinary.com/demo/image/upload/v1/pickles/amla-pickle.jpg',
    customerId: 'cust10',
    customerName: 'Pooja Deshmukh',
    customerEmail: 'pooja.d@gmail.com',
    rating: 5,
    title: 'Healthy and delicious',
    comment: 'I love that this pickle is not just tasty but also healthy. Amla is great for immunity and this pickle makes it easy to include in daily diet. The taste is perfectly balanced - not too sour, not too spicy.',
    status: 'APPROVED',
    isVerifiedPurchase: true,
    helpfulCount: 15,
    createdAt: '2024-12-04T10:00:00Z',
    updatedAt: '2024-12-04T12:00:00Z'
  }
]

// Hook to get reviews (using dummy data for now)
export const useReviews = (status?: ReviewStatus) => {
  // TODO: Replace with actual GraphQL query
  const filteredReviews = status 
    ? dummyReviews.filter(review => review.status === status)
    : dummyReviews

  return {
    data: { reviews: filteredReviews },
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  }
}

// Hook to get single review
export const useReview = (id: string) => {
  // TODO: Replace with actual GraphQL query
  const review = dummyReviews.find(r => r._id === id)
  
  return {
    data: { review },
    loading: false,
    error: null
  }
}

// Hook to update review status
export const useUpdateReviewStatus = () => {
  // TODO: Replace with actual GraphQL mutation
  const updateStatus = async (id: string, status: ReviewStatus) => {
    console.log(`Updating review ${id} to status: ${status}`)
    return Promise.resolve({ success: true })
  }

  return {
    updateStatus,
    loading: false,
    error: null
  }
}

// Hook to delete review
export const useDeleteReview = () => {
  // TODO: Replace with actual GraphQL mutation
  const deleteReview = async (id: string) => {
    console.log(`Deleting review ${id}`)
    return Promise.resolve({ success: true })
  }

  return {
    deleteReview,
    loading: false,
    error: null
  }
}

// Helper function to get review stats
export const getReviewStats = (reviews: Review[]) => {
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0'
  
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  }

  return {
    total: totalReviews,
    avgRating: parseFloat(avgRating),
    pending: reviews.filter(r => r.status === 'PENDING').length,
    approved: reviews.filter(r => r.status === 'APPROVED').length,
    rejected: reviews.filter(r => r.status === 'REJECTED').length,
    verifiedPurchases: reviews.filter(r => r.isVerifiedPurchase).length,
    ratingDistribution,
    totalHelpful: reviews.reduce((sum, r) => sum + r.helpfulCount, 0)
  }
}
