import { useQuery, useMutation } from "@apollo/client/react"
import { GET_CONTACT_MESSAGES, UPDATE_CONTACT_STATUS, DELETE_CONTACT_MESSAGE } from "../graphql/contact"

// Types
export type ContactStatus = "PENDING" | "REVIEWED" | "RESOLVED"
export type ContactType = "GENERAL" | "ORDER_ISSUE" | "PRODUCT_INQUIRY" | "COMPLAINT" | "FEEDBACK" | "RETURN_REQUEST"
export type ContactPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export interface ContactQuery {
  _id: string
  name: string
  phone: string
  message: string
  status: ContactStatus
  createdAt: string
  updatedAt: string

  // Optional fields just for type safety from the UI
  email?: string
  subject?: string
  type?: ContactType
  priority?: ContactPriority
  orderId?: string
  replies?: any[]
  assignedTo?: string
  resolvedAt?: string
}

interface GetContactMessagesResponse {
  getContactMessages: {
    data: ContactQuery[];
    total: number;
  };
}

// Labels
export const statusLabels: Record<ContactStatus | string, string> = {
  PENDING: "Pending",
  REVIEWED: "Reviewed",
  RESOLVED: "Resolved",
}

export const priorityLabels: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent"
}

export const typeLabels: Record<string, string> = {
  GENERAL: "General Inquiry",
  ORDER_ISSUE: "Order Issue",
  PRODUCT_INQUIRY: "Product Inquiry",
  COMPLAINT: "Complaint",
  FEEDBACK: "Feedback",
  RETURN_REQUEST: "Return Request"
}

// Stats helper
export function getContactStats(queries: ContactQuery[]) {
  const stats = {
    total: queries.length,
    new: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    byType: {} as Record<string, number>,
    byPriority: {} as Record<string, number>,
    avgResponseTime: "N/A"
  }

  queries.forEach(query => {
    // Status counts
    if (query.status === "PENDING") stats.new++
    else if (query.status === "REVIEWED") stats.inProgress++
    else if (query.status === "RESOLVED") stats.resolved++
  })

  return stats
}

// Hooks
export function useContactQueries() {
  const { data, loading, error, refetch } = useQuery<GetContactMessagesResponse>(
    GET_CONTACT_MESSAGES,
    { variables: { skip: 0, limit: 100 }, fetchPolicy: 'network-only' }
  );

  return { queries: data?.getContactMessages?.data || [], loading, refetch }
}

export function useUpdateContactStatus() {
  const [updateContactStatusMutation, { loading }] = useMutation(UPDATE_CONTACT_STATUS)

  const updateStatus = async (id: string, status: ContactStatus | string) => {
    try {
      await updateContactStatusMutation({ variables: { id, status } })
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
  return { updateStatus, loading }
}

export function useUpdateContactPriority() {
  const updatePriority = async (id: string, priority: ContactPriority) => {
    return true
  }
  return { updatePriority, loading: false }
}

export function useReplyToContact() {
  const reply = async (id: string, data: any) => {
    return true
  }
  return { reply, loading: false }
}

export function useAssignContact() {
  const assign = async (id: string, assignedTo: string) => {
    return true
  }
  return { assign, loading: false }
}

export function useDeleteContact() {
  const [deleteContactMutation, { loading }] = useMutation(DELETE_CONTACT_MESSAGE)

  const deleteContact = async (id: string) => {
    try {
      await deleteContactMutation({ variables: { id } })
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
  return { deleteContact, loading }
}
