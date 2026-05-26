import { jsPDF } from "jspdf"
import { Order } from "../orders/queries"

/**
 * Draws order shipping details on a beautifully centered box within an A4 PDF,
 * then triggers an immediate direct download of the PDF file.
 */
export function printShippingLabel(order: Order): void {
  // Extract details
  const fullName = order.shippingAddress?.fullName || order.customer?.name || 'Valued Customer'
  const phone = order.shippingAddress?.phone || order.customer?.phone || 'N/A'

  // Format Address
  const addressLine1 = order.shippingAddress?.addressLine1 || ''
  const addressLine2 = order.shippingAddress?.addressLine2 || ''
  const landmark = order.shippingAddress?.landmark || ''
  const city = order.shippingAddress?.city || ''
  const state = order.shippingAddress?.state || ''
  const pincode = order.shippingAddress?.pincode || ''

  let addressLines: string[] = []
  if (addressLine1) addressLines.push(addressLine1)
  if (addressLine2) addressLines.push(addressLine2)
  if (landmark) addressLines.push(`Landmark: ${landmark}`)

  const cityStateZip = [city, state].filter(Boolean).join(', ') + (pincode ? ` - ${pincode}` : '')
  if (cityStateZip) addressLines.push(cityStateZip)

  const fullAddress = addressLines.join('\n') || 'No Address Provided'
  const orderId = order.orderId || order._id
  // 1. Initialize jsPDF targeting A4 paper (210mm x 297mm) in portrait mode
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Dimensions of centered label box
  const x = 30 // left margin
  const y = 35 // top margin
  const width = 150 // box width
  const height = 210 // box height

  // 2. Draw thick outer black border
  doc.setLineWidth(1.2)
  doc.setDrawColor(0, 0, 0)
  doc.rect(x, y, width, height)

  // 3. Draw black header banner
  doc.setFillColor(0, 0, 0)
  doc.rect(x, y, width, 18, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('DELIVERY LABEL', x + width / 2, y + 12, { align: 'center' })

  // Reset text color to black
  doc.setTextColor(0, 0, 0)

  // 4. Draw Recipient Name
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('NAME:', x + 15, y + 36)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(fullName.toUpperCase(), x + 15, y + 44)

  // 5. Draw Phone Number
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('PHONE NUMBER:', x + 15, y + 60)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(phone, x + 15, y + 68)

  // 6. Draw Complete Shipping Address
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('DELIVERY ADDRESS:', x + 15, y + 84)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)

  // Use splitTextToSize to wrap text safely within label bounds
  const wrappedAddress = doc.splitTextToSize(fullAddress, width - 30)
  doc.text(wrappedAddress, x + 15, y + 92)

  // 7. Draw clean dashed cut-line above footer section
  doc.setLineWidth(0.6)
  doc.setLineDashPattern([3, 2], 0)
  doc.line(x + 10, y + height - 30, x + width - 10, y + height - 30)
  doc.setLineDashPattern([], 0) // Reset line style

  // 8. Draw Footer Info - Order ID
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('ORDER ID', x + 15, y + height - 20)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`#${orderId}`, x + 15, y + height - 13)

  // 10. Direct download the PDF file
  doc.save(`label-${orderId}.pdf`)
}

export interface SampleInvoiceLabelData {
  invoiceNumber: string
  recipient?: {
    name?: string
    company?: string
    address?: string
    phone?: string
  }
}

/**
 * Draws sample invoice shipping details on a beautifully centered box within an A4 PDF,
 * then triggers an immediate direct download of the PDF file.
 */
export function printSampleInvoiceLabel(invoice: SampleInvoiceLabelData): void {
  // Extract details
  const fullName = invoice.recipient?.name || 'Valued Customer'
  const phone = invoice.recipient?.phone || 'N/A'
  const address = invoice.recipient?.address || 'No Address Provided'
  const invoiceNumber = invoice.invoiceNumber

  // 1. Initialize jsPDF targeting A4 paper (210mm x 297mm) in portrait mode
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Dimensions of centered label box
  const x = 30 // left margin
  const y = 35 // top margin
  const width = 150 // box width
  const height = 210 // box height

  // 2. Draw thick outer black border
  doc.setLineWidth(1.2)
  doc.setDrawColor(0, 0, 0)
  doc.rect(x, y, width, height)

  // 3. Draw black header banner
  doc.setFillColor(0, 0, 0)
  doc.rect(x, y, width, 18, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('DELIVERY LABEL', x + width / 2, y + 12, { align: 'center' })

  // Reset text color to black
  doc.setTextColor(0, 0, 0)

  // 4. Draw Recipient Name
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text('NAME:', x + 15, y + 36)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  
  // Format Name: include company name if present
  const nameToPrint = invoice.recipient?.company 
    ? `${fullName} (${invoice.recipient.company})`
    : fullName
  doc.text(nameToPrint.toUpperCase(), x + 15, y + 44)

  // 5. Draw Phone Number
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('PHONE NUMBER:', x + 15, y + 60)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text(phone, x + 15, y + 68)

  // 6. Draw Complete Shipping Address
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('DELIVERY ADDRESS:', x + 15, y + 84)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)

  // Use splitTextToSize to wrap text safely within label bounds
  const wrappedAddress = doc.splitTextToSize(address, width - 30)
  doc.text(wrappedAddress, x + 15, y + 92)

  // 7. Draw clean dashed cut-line above footer section
  doc.setLineWidth(0.6)
  doc.setLineDashPattern([3, 2], 0)
  doc.line(x + 10, y + height - 30, x + width - 10, y + height - 30)
  doc.setLineDashPattern([], 0) // Reset line style

  // 8. Draw Footer Info - Invoice Number
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('INVOICE NO.', x + 15, y + height - 20)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.text(`#${invoiceNumber}`, x + 15, y + height - 13)

  // 10. Direct download the PDF file
  doc.save(`label-${invoiceNumber}.pdf`)
}

