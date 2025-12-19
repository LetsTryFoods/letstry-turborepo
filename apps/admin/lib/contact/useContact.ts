import { useState, useCallback } from "react"

// Types
export type ContactStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
export type ContactPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type ContactType = "GENERAL" | "ORDER_ISSUE" | "PRODUCT_INQUIRY" | "COMPLAINT" | "FEEDBACK" | "RETURN_REQUEST"

export interface ContactQuery {
  _id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  type: ContactType
  status: ContactStatus
  priority: ContactPriority
  orderId?: string
  replies: ContactReply[]
  assignedTo?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface ContactReply {
  _id: string
  message: string
  isAdminReply: boolean
  createdAt: string
  createdBy: string
}

export interface ContactInput {
  name: string
  email: string
  phone: string
  subject: string
  message: string
  type: ContactType
}

export interface ReplyInput {
  message: string
}

// Labels
export const statusLabels: Record<ContactStatus, string> = {
  NEW: "New",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed"
}

export const priorityLabels: Record<ContactPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent"
}

export const typeLabels: Record<ContactType, string> = {
  GENERAL: "General Inquiry",
  ORDER_ISSUE: "Order Issue",
  PRODUCT_INQUIRY: "Product Inquiry",
  COMPLAINT: "Complaint",
  FEEDBACK: "Feedback",
  RETURN_REQUEST: "Return Request"
}

// Dummy data
const dummyContactQueries: ContactQuery[] = [
  {
    _id: "contact_1",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 98765 43210",
    subject: "Inquiry about Mango Pickle availability",
    message: "Hi, I wanted to know if the Mango Pickle (1kg) is available for delivery to Mumbai? Also, do you have any bulk order discounts for corporate gifting?",
    type: "PRODUCT_INQUIRY",
    status: "NEW",
    priority: "MEDIUM",
    replies: [],
    createdAt: "2024-01-20T10:30:00Z",
    updatedAt: "2024-01-20T10:30:00Z"
  },
  {
    _id: "contact_2",
    name: "Rajesh Kumar",
    email: "rajesh.k@yahoo.com",
    phone: "+91 87654 32109",
    subject: "Order not received - #ORD-2024-1234",
    message: "I placed an order on 15th January (Order ID: ORD-2024-1234) but haven't received it yet. The tracking shows it was delivered but I haven't received anything. Please help resolve this issue urgently.",
    type: "ORDER_ISSUE",
    status: "IN_PROGRESS",
    priority: "URGENT",
    orderId: "ORD-2024-1234",
    replies: [
      {
        _id: "reply_1",
        message: "Dear Rajesh, we apologize for the inconvenience. We have escalated this to our delivery partner and will update you within 24 hours.",
        isAdminReply: true,
        createdAt: "2024-01-21T09:00:00Z",
        createdBy: "Admin"
      }
    ],
    assignedTo: "Support Team",
    createdAt: "2024-01-20T14:00:00Z",
    updatedAt: "2024-01-21T09:00:00Z"
  },
  {
    _id: "contact_3",
    name: "Anita Patel",
    email: "anita.patel@outlook.com",
    phone: "+91 76543 21098",
    subject: "Request for return - Damaged product",
    message: "I received my order today but the Mixed Pickle jar was broken and the contents were leaking. I would like to request a replacement or refund. Attaching photos in follow-up email.",
    type: "RETURN_REQUEST",
    status: "IN_PROGRESS",
    priority: "HIGH",
    orderId: "ORD-2024-1189",
    replies: [
      {
        _id: "reply_2",
        message: "Hi Anita, we're sorry to hear about the damaged product. Please share the photos at support@letstryfoods.com. We'll arrange a replacement immediately.",
        isAdminReply: true,
        createdAt: "2024-01-19T15:30:00Z",
        createdBy: "Admin"
      },
      {
        _id: "reply_3",
        message: "I have sent the photos. Please process the replacement at the earliest.",
        isAdminReply: false,
        createdAt: "2024-01-19T16:00:00Z",
        createdBy: "Anita Patel"
      }
    ],
    assignedTo: "Quality Team",
    createdAt: "2024-01-19T11:00:00Z",
    updatedAt: "2024-01-19T16:00:00Z"
  },
  {
    _id: "contact_4",
    name: "Suresh Menon",
    email: "suresh.menon@gmail.com",
    phone: "+91 65432 10987",
    subject: "Great products - Feedback",
    message: "Just wanted to say that your Lemon Pickle is absolutely amazing! It reminds me of my grandmother's recipe. Will definitely order more. Keep up the great work!",
    type: "FEEDBACK",
    status: "RESOLVED",
    priority: "LOW",
    replies: [
      {
        _id: "reply_4",
        message: "Thank you so much Suresh for your kind words! We're thrilled that our pickle brought back such wonderful memories. We'd love to offer you a 10% discount on your next order. Use code THANKYOU10.",
        isAdminReply: true,
        createdAt: "2024-01-18T10:00:00Z",
        createdBy: "Admin"
      }
    ],
    createdAt: "2024-01-18T08:30:00Z",
    updatedAt: "2024-01-18T10:00:00Z",
    resolvedAt: "2024-01-18T10:00:00Z"
  },
  {
    _id: "contact_5",
    name: "Deepa Reddy",
    email: "deepa.reddy@hotmail.com",
    phone: "+91 54321 09876",
    subject: "Complaint about taste - Garlic Pickle",
    message: "The Garlic Pickle I ordered tastes different from what I ordered before. It's too sour and doesn't have the same flavor. Is there a change in recipe or is this a bad batch?",
    type: "COMPLAINT",
    status: "NEW",
    priority: "HIGH",
    orderId: "ORD-2024-1156",
    replies: [],
    createdAt: "2024-01-21T08:00:00Z",
    updatedAt: "2024-01-21T08:00:00Z"
  },
  {
    _id: "contact_6",
    name: "Vikram Singh",
    email: "vikram.singh@gmail.com",
    phone: "+91 43210 98765",
    subject: "Wholesale inquiry",
    message: "I run a grocery store in Jaipur and would like to stock your pickles. Can you please share details about wholesale pricing, minimum order quantities, and delivery options?",
    type: "GENERAL",
    status: "NEW",
    priority: "MEDIUM",
    replies: [],
    createdAt: "2024-01-21T07:00:00Z",
    updatedAt: "2024-01-21T07:00:00Z"
  },
  {
    _id: "contact_7",
    name: "Meera Iyer",
    email: "meera.iyer@yahoo.com",
    phone: "+91 32109 87654",
    subject: "Order modification request",
    message: "I just placed order #ORD-2024-1245 but I want to change the delivery address. The order hasn't shipped yet. Can you please update the address to: 45, MG Road, Bangalore - 560001?",
    type: "ORDER_ISSUE",
    status: "RESOLVED",
    priority: "MEDIUM",
    orderId: "ORD-2024-1245",
    replies: [
      {
        _id: "reply_5",
        message: "Hi Meera, we have updated the delivery address as requested. Your order will be delivered to 45, MG Road, Bangalore - 560001.",
        isAdminReply: true,
        createdAt: "2024-01-17T14:00:00Z",
        createdBy: "Admin"
      }
    ],
    createdAt: "2024-01-17T12:00:00Z",
    updatedAt: "2024-01-17T14:00:00Z",
    resolvedAt: "2024-01-17T14:00:00Z"
  },
  {
    _id: "contact_8",
    name: "Amit Deshmukh",
    email: "amit.d@gmail.com",
    phone: "+91 21098 76543",
    subject: "Product suggestion",
    message: "I've been a regular customer and I love your pickles. I was wondering if you could introduce a Sugar-Free variant for diabetic customers like myself? I'm sure many would appreciate it.",
    type: "FEEDBACK",
    status: "NEW",
    priority: "LOW",
    replies: [],
    createdAt: "2024-01-20T16:00:00Z",
    updatedAt: "2024-01-20T16:00:00Z"
  },
  {
    _id: "contact_9",
    name: "Kavitha Nair",
    email: "kavitha.nair@outlook.com",
    phone: "+91 10987 65432",
    subject: "Wrong product delivered",
    message: "I ordered Lime Pickle but received Mango Pickle instead. Order ID: ORD-2024-1201. Please arrange for exchange or send the correct product.",
    type: "ORDER_ISSUE",
    status: "IN_PROGRESS",
    priority: "HIGH",
    orderId: "ORD-2024-1201",
    replies: [
      {
        _id: "reply_6",
        message: "Dear Kavitha, we apologize for the mix-up. We are shipping the correct Lime Pickle immediately. You can keep the Mango Pickle as a token of apology from our side.",
        isAdminReply: true,
        createdAt: "2024-01-20T11:00:00Z",
        createdBy: "Admin"
      }
    ],
    assignedTo: "Support Team",
    createdAt: "2024-01-20T09:00:00Z",
    updatedAt: "2024-01-20T11:00:00Z"
  },
  {
    _id: "contact_10",
    name: "Ravi Shankar",
    email: "ravi.shankar@gmail.com",
    phone: "+91 09876 54321",
    subject: "Payment issue - Double charged",
    message: "I was charged twice for my order #ORD-2024-1198. Total amount ₹1,198 was deducted twice. Please refund the extra amount immediately.",
    type: "ORDER_ISSUE",
    status: "CLOSED",
    priority: "URGENT",
    orderId: "ORD-2024-1198",
    replies: [
      {
        _id: "reply_7",
        message: "Dear Ravi, we have verified the transaction and initiated a refund of ₹1,198. It will be credited to your account within 5-7 business days.",
        isAdminReply: true,
        createdAt: "2024-01-16T10:00:00Z",
        createdBy: "Admin"
      },
      {
        _id: "reply_8",
        message: "Thank you, I received the refund today.",
        isAdminReply: false,
        createdAt: "2024-01-19T09:00:00Z",
        createdBy: "Ravi Shankar"
      }
    ],
    assignedTo: "Finance Team",
    createdAt: "2024-01-16T08:00:00Z",
    updatedAt: "2024-01-19T09:00:00Z",
    resolvedAt: "2024-01-19T09:00:00Z"
  },
  {
    _id: "contact_11",
    name: "Lakshmi Venkatesh",
    email: "lakshmi.v@yahoo.com",
    phone: "+91 98765 12340",
    subject: "Shelf life inquiry",
    message: "What is the shelf life of your pickles after opening? Do they need to be refrigerated? I want to order for my parents who live alone.",
    type: "PRODUCT_INQUIRY",
    status: "RESOLVED",
    priority: "LOW",
    replies: [
      {
        _id: "reply_9",
        message: "Hi Lakshmi, our pickles have a shelf life of 12 months unopened. Once opened, they can last 3-4 months if stored in a cool, dry place. Refrigeration is recommended for longer freshness but not mandatory. Use a dry spoon each time to prevent moisture.",
        isAdminReply: true,
        createdAt: "2024-01-15T11:00:00Z",
        createdBy: "Admin"
      }
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
    resolvedAt: "2024-01-15T11:00:00Z"
  },
  {
    _id: "contact_12",
    name: "Arjun Kapoor",
    email: "arjun.kapoor@gmail.com",
    phone: "+91 87654 09871",
    subject: "COD not available",
    message: "Why is Cash on Delivery not available for my pincode 400001? I prefer COD as I'm not comfortable with online payments.",
    type: "GENERAL",
    status: "RESOLVED",
    priority: "MEDIUM",
    replies: [
      {
        _id: "reply_10",
        message: "Hi Arjun, COD availability depends on our delivery partner's serviceable areas. We have now enabled COD for your pincode 400001. Please try placing your order again.",
        isAdminReply: true,
        createdAt: "2024-01-14T15:00:00Z",
        createdBy: "Admin"
      }
    ],
    createdAt: "2024-01-14T12:00:00Z",
    updatedAt: "2024-01-14T15:00:00Z",
    resolvedAt: "2024-01-14T15:00:00Z"
  }
]

// Stats helper
export function getContactStats(queries: ContactQuery[]) {
  const stats = {
    total: queries.length,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    byType: {} as Record<ContactType, number>,
    byPriority: {} as Record<ContactPriority, number>,
    avgResponseTime: "2.5 hours"
  }

  queries.forEach(query => {
    // Status counts
    if (query.status === "NEW") stats.new++
    else if (query.status === "IN_PROGRESS") stats.inProgress++
    else if (query.status === "RESOLVED") stats.resolved++
    else if (query.status === "CLOSED") stats.closed++

    // Type counts
    stats.byType[query.type] = (stats.byType[query.type] || 0) + 1

    // Priority counts
    stats.byPriority[query.priority] = (stats.byPriority[query.priority] || 0) + 1
  })

  return stats
}

// Hooks
export function useContactQueries() {
  const [loading, setLoading] = useState(false)
  const [queries, setQueries] = useState<ContactQuery[]>(dummyContactQueries)

  const refetch = useCallback(() => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setQueries([...dummyContactQueries])
      setLoading(false)
    }, 500)
  }, [])

  return { queries, loading, refetch }
}

export function useUpdateContactStatus() {
  const [loading, setLoading] = useState(false)

  const updateStatus = useCallback(async (id: string, status: ContactStatus) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Updated contact ${id} status to ${status}`)
    setLoading(false)
    return true
  }, [])

  return { updateStatus, loading }
}

export function useUpdateContactPriority() {
  const [loading, setLoading] = useState(false)

  const updatePriority = useCallback(async (id: string, priority: ContactPriority) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Updated contact ${id} priority to ${priority}`)
    setLoading(false)
    return true
  }, [])

  return { updatePriority, loading }
}

export function useReplyToContact() {
  const [loading, setLoading] = useState(false)

  const reply = useCallback(async (id: string, data: ReplyInput) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Replied to contact ${id}:`, data)
    setLoading(false)
    return true
  }, [])

  return { reply, loading }
}

export function useAssignContact() {
  const [loading, setLoading] = useState(false)

  const assign = useCallback(async (id: string, assignedTo: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Assigned contact ${id} to ${assignedTo}`)
    setLoading(false)
    return true
  }, [])

  return { assign, loading }
}

export function useDeleteContact() {
  const [loading, setLoading] = useState(false)

  const deleteContact = useCallback(async (id: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Deleted contact ${id}`)
    setLoading(false)
    return true
  }, [])

  return { deleteContact, loading }
}
