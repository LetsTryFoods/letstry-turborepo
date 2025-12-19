// Notifications Hook with Dummy Data
// TODO: Replace with actual GraphQL queries when backend is ready

export type NotificationType = 'PUSH' | 'EMAIL' | 'SMS'
export type NotificationStatus = 'DRAFT' | 'SCHEDULED' | 'SENT' | 'FAILED'
export type NotificationAudience = 'ALL' | 'ACTIVE_CUSTOMERS' | 'INACTIVE_CUSTOMERS' | 'NEW_CUSTOMERS' | 'CUSTOM'

export interface Notification {
  _id: string
  title: string
  message: string
  type: NotificationType
  status: NotificationStatus
  audience: NotificationAudience
  targetCount: number
  sentCount: number
  openRate?: number
  clickRate?: number
  scheduledAt?: string
  sentAt?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface NotificationTemplate {
  _id: string
  name: string
  title: string
  message: string
  type: NotificationType
}

// Dummy notification templates
export const notificationTemplates: NotificationTemplate[] = [
  {
    _id: 'temp1',
    name: 'Welcome New Customer',
    title: 'Welcome to LetsTry Foods! 🎉',
    message: 'Thank you for joining us! Enjoy authentic homemade pickles delivered to your doorstep. Use code WELCOME10 for 10% off your first order!',
    type: 'PUSH'
  },
  {
    _id: 'temp2',
    name: 'Abandoned Cart Reminder',
    title: 'You left something behind! 🛒',
    message: 'Your delicious pickles are waiting! Complete your order now and enjoy free delivery on orders above ₹499.',
    type: 'PUSH'
  },
  {
    _id: 'temp3',
    name: 'Order Delivered',
    title: 'Your order has been delivered! 📦',
    message: 'We hope you enjoy your authentic pickles! Don\'t forget to leave a review and share your experience with us.',
    type: 'PUSH'
  },
  {
    _id: 'temp4',
    name: 'New Product Launch',
    title: 'New Arrival: Try our latest pickle! 🌶️',
    message: 'Introducing our new [Product Name]! Made with traditional recipes and fresh ingredients. Order now!',
    type: 'PUSH'
  },
  {
    _id: 'temp5',
    name: 'Festival Offer',
    title: 'Festival Special Offer! 🎊',
    message: 'Celebrate with LetsTry Foods! Get up to 30% off on all pickles. Limited time offer. Shop now!',
    type: 'EMAIL'
  },
  {
    _id: 'temp6',
    name: 'Reorder Reminder',
    title: 'Time to restock your pickles! 🥒',
    message: 'It\'s been a while since your last order. We miss you! Here\'s 15% off on your next purchase.',
    type: 'SMS'
  }
]

// Dummy data for sent notifications
export const dummyNotifications: Notification[] = [
  {
    _id: 'notif1',
    title: 'Diwali Special Sale! 🪔',
    message: 'Celebrate Diwali with our special pickle hampers! Get 25% off on combo packs. Use code DIWALI25. Valid till Nov 15th.',
    type: 'PUSH',
    status: 'SENT',
    audience: 'ALL',
    targetCount: 1250,
    sentCount: 1248,
    openRate: 68.5,
    clickRate: 24.2,
    sentAt: '2024-11-01T10:00:00Z',
    createdAt: '2024-10-30T15:30:00Z',
    updatedAt: '2024-11-01T10:05:00Z',
    createdBy: 'Admin'
  },
  {
    _id: 'notif2',
    title: 'New Mango Pickle Variant! 🥭',
    message: 'Introducing our Premium Rajasthani Aam ka Achar! Made with raw mangoes and traditional spices. Try now!',
    type: 'EMAIL',
    status: 'SENT',
    audience: 'ACTIVE_CUSTOMERS',
    targetCount: 856,
    sentCount: 854,
    openRate: 42.3,
    clickRate: 15.8,
    sentAt: '2024-12-05T14:00:00Z',
    createdAt: '2024-12-04T11:20:00Z',
    updatedAt: '2024-12-05T14:10:00Z',
    createdBy: 'Admin'
  },
  {
    _id: 'notif3',
    title: 'Weekend Flash Sale! ⚡',
    message: 'Flash Sale Alert! Get 20% off on all pickles this weekend. No code needed. Auto-applied at checkout!',
    type: 'PUSH',
    status: 'SCHEDULED',
    audience: 'ALL',
    targetCount: 1320,
    sentCount: 0,
    scheduledAt: '2024-12-14T09:00:00Z',
    createdAt: '2024-12-12T16:45:00Z',
    updatedAt: '2024-12-12T16:45:00Z',
    createdBy: 'Admin'
  },
  {
    _id: 'notif4',
    title: 'Complete Your Order! 🛒',
    message: 'Your cart is waiting! You have items worth ₹599 in your cart. Complete your order now and get free delivery!',
    type: 'SMS',
    status: 'SENT',
    audience: 'CUSTOM',
    targetCount: 45,
    sentCount: 43,
    sentAt: '2024-12-10T11:30:00Z',
    createdAt: '2024-12-10T11:25:00Z',
    updatedAt: '2024-12-10T11:35:00Z',
    createdBy: 'Admin'
  },
  {
    _id: 'notif5',
    title: 'We Miss You! 💚',
    message: 'It\'s been 30 days since your last order. Come back and enjoy 15% off with code MISSYOU15!',
    type: 'EMAIL',
    status: 'SENT',
    audience: 'INACTIVE_CUSTOMERS',
    targetCount: 234,
    sentCount: 230,
    openRate: 28.6,
    clickRate: 8.4,
    sentAt: '2024-12-08T10:00:00Z',
    createdAt: '2024-12-07T14:00:00Z',
    updatedAt: '2024-12-08T10:15:00Z',
    createdBy: 'Admin'
  },
  {
    _id: 'notif6',
    title: 'Order Confirmation',
    message: 'Thank you for your order #LTF-2024-XXX! Your delicious pickles are being prepared and will be shipped soon.',
    type: 'EMAIL',
    status: 'DRAFT',
    audience: 'CUSTOM',
    targetCount: 0,
    sentCount: 0,
    createdAt: '2024-12-11T09:00:00Z',
    updatedAt: '2024-12-11T09:00:00Z',
    createdBy: 'Admin'
  },
  {
    _id: 'notif7',
    title: 'Christmas Special! 🎄',
    message: 'Merry Christmas from LetsTry Foods! Gift your loved ones the taste of tradition. Special hampers available now!',
    type: 'PUSH',
    status: 'SCHEDULED',
    audience: 'ALL',
    targetCount: 1320,
    sentCount: 0,
    scheduledAt: '2024-12-25T08:00:00Z',
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-10T10:00:00Z',
    createdBy: 'Admin'
  },
  {
    _id: 'notif8',
    title: 'Welcome Aboard! 🎉',
    message: 'Welcome to the LetsTry Foods family! Enjoy 10% off on your first order with code WELCOME10.',
    type: 'EMAIL',
    status: 'FAILED',
    audience: 'NEW_CUSTOMERS',
    targetCount: 28,
    sentCount: 12,
    sentAt: '2024-12-06T16:00:00Z',
    createdAt: '2024-12-06T15:55:00Z',
    updatedAt: '2024-12-06T16:05:00Z',
    createdBy: 'Admin'
  }
]

// Hook to get notifications
export const useNotifications = (status?: NotificationStatus) => {
  const filteredNotifications = status 
    ? dummyNotifications.filter(n => n.status === status)
    : dummyNotifications

  return {
    data: { notifications: filteredNotifications },
    loading: false,
    error: null,
    refetch: () => Promise.resolve()
  }
}

// Hook to get notification templates
export const useNotificationTemplates = () => {
  return {
    data: { templates: notificationTemplates },
    loading: false,
    error: null
  }
}

// Hook to send notification
export const useSendNotification = () => {
  const sendNotification = async (data: {
    title: string
    message: string
    type: NotificationType
    audience: NotificationAudience
    scheduledAt?: string
  }) => {
    console.log('Sending notification:', data)
    return Promise.resolve({ success: true, id: 'new-notif-id' })
  }

  return {
    sendNotification,
    loading: false,
    error: null
  }
}

// Hook to delete notification
export const useDeleteNotification = () => {
  const deleteNotification = async (id: string) => {
    console.log(`Deleting notification ${id}`)
    return Promise.resolve({ success: true })
  }

  return {
    deleteNotification,
    loading: false,
    error: null
  }
}

// Helper function to get notification stats
export const getNotificationStats = (notifications: Notification[]) => {
  const sentNotifications = notifications.filter(n => n.status === 'SENT')
  const avgOpenRate = sentNotifications.length > 0
    ? sentNotifications.reduce((sum, n) => sum + (n.openRate || 0), 0) / sentNotifications.filter(n => n.openRate).length
    : 0
  const avgClickRate = sentNotifications.length > 0
    ? sentNotifications.reduce((sum, n) => sum + (n.clickRate || 0), 0) / sentNotifications.filter(n => n.clickRate).length
    : 0

  return {
    total: notifications.length,
    draft: notifications.filter(n => n.status === 'DRAFT').length,
    scheduled: notifications.filter(n => n.status === 'SCHEDULED').length,
    sent: sentNotifications.length,
    failed: notifications.filter(n => n.status === 'FAILED').length,
    totalSent: sentNotifications.reduce((sum, n) => sum + n.sentCount, 0),
    avgOpenRate: avgOpenRate.toFixed(1),
    avgClickRate: avgClickRate.toFixed(1),
    pushCount: notifications.filter(n => n.type === 'PUSH').length,
    emailCount: notifications.filter(n => n.type === 'EMAIL').length,
    smsCount: notifications.filter(n => n.type === 'SMS').length
  }
}
