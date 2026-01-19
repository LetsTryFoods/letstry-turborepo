'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePaymentDetail, useInitiateRefund } from '@/lib/payment/usePayments';
import {
  getStatusBadgeColor,
  formatCurrency,
  formatDateTime,
  maskCardNumber,
} from '@/lib/payment/utils';
import { useOrderById } from '@/lib/orders/queries';
import { useCustomerDetails } from '@/lib/customers/useCustomers';

export default function PaymentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentOrderId = params.id as string;
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  const { data, loading, error, refetch } = usePaymentDetail(paymentOrderId);
  const payment = (data as any)?.getAdminPaymentDetail;

  const { order: orderData, loading: orderLoading } = useOrderById(
    showOrderDialog ? payment?.orderId : ''
  );

  const { customer: customerData, loading: customerLoading } = useCustomerDetails(
    showCustomerDialog ? payment?.identityId : ''
  );

  const refundMutation = useInitiateRefund();

  const handleRefundSubmit = async () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      alert('Invalid refund amount');
      return;
    }

    try {
      await refundMutation.mutate({
        variables: {
          input: {
            paymentOrderId,
            refundAmount,
            reason: refundReason || 'Admin refund',
          },
        },
      });
      setShowRefundModal(false);
      setRefundAmount('');
      setRefundReason('');
      refetch();
    } catch (err) {
      console.error('Refund failed:', err);
    }
  };

  if (loading) return <div className="p-6">Loading payment details...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading payment</div>;
  if (!payment) return <div className="p-6">Payment not found</div>;

  const totalRefunded = payment.refunds?.reduce(
    (sum: number, r: any) => sum + parseFloat(r.refundAmount),
    0
  ) || 0;
  const remainingAmount = parseFloat(payment.amount) - totalRefunded;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-2"
          >
            ← Back to Payments
          </button>
          <h1 className="text-3xl font-bold">Payment Details</h1>
          <p className="text-gray-600">{payment.paymentOrderId}</p>
        </div>
        {payment.paymentOrderStatus === 'SUCCESS' && remainingAmount > 0 && (
          <button
            onClick={() => setShowRefundModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Initiate Refund
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Payment Summary</h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusBadgeColor(payment.paymentOrderStatus)}`}>
                {payment.paymentOrderStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-semibold">{formatCurrency(payment.amount, payment.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span>{payment.paymentMethod || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created At:</span>
              <span>{formatDateTime(payment.createdAt)}</span>
            </div>
            {payment.completedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completed At:</span>
                <span>{formatDateTime(payment.completedAt)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Customer ID:</span>
              <button
                onClick={() => setShowCustomerDialog(true)}
                className="font-mono text-sm text-blue-600 hover:underline"
              >
                {payment.identityId}
              </button>
            </div>
            {payment.orderId && (
              <div className="flex justify-between">
                <span className="text-gray-600">Order ID:</span>
                <button
                  onClick={() => setShowOrderDialog(true)}
                  className="font-mono text-sm text-blue-600 hover:underline"
                >
                  {payment.orderId}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Gateway Details</h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">PSP Transaction ID:</span>
              <span className="font-mono text-sm">{payment.pspTxnId || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">PSP Order ID:</span>
              <span className="font-mono text-sm">{payment.pspOrderId || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Code:</span>
              <span>{payment.pspResponseCode || '-'}</span>
            </div>
            {payment.pspResponseMessage && (
              <div className="flex justify-between">
                <span className="text-gray-600">Response Message:</span>
                <span className="text-sm">{payment.pspResponseMessage}</span>
              </div>
            )}
            {payment.failureReason && (
              <div className="flex justify-between">
                <span className="text-gray-600 text-red-600">Failure Reason:</span>
                <span className="text-sm text-red-600">{payment.failureReason}</span>
              </div>
            )}
            {payment.retryCount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Retry Count:</span>
                <span>{payment.retryCount}</span>
              </div>
            )}
          </div>
        </div>

        {payment.cardToken && (
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold border-b pb-2">Payment Instrument</h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span>{payment.paymentMode || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Card Scheme:</span>
                <span>{payment.cardScheme || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Card Number:</span>
                <span className="font-mono">{maskCardNumber(payment.cardToken)}</span>
              </div>
              {payment.bankName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Bank:</span>
                  <span>{payment.bankName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Financial</h2>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Ledger Updated:</span>
              <span className={payment.ledgerUpdated ? 'text-green-600' : 'text-gray-400'}>
                {payment.ledgerUpdated ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Refunded:</span>
              <span className="font-semibold">{formatCurrency(totalRefunded.toString(), payment.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Remaining:</span>
              <span className="font-semibold">{formatCurrency(remainingAmount.toString(), payment.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {payment.cartSnapshot && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">Cart Details</h2>

          {payment.cartSnapshot.items && payment.cartSnapshot.items.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="space-y-3">
                {payment.cartSnapshot.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-4 border rounded p-3">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(item.totalPrice.toString(), payment.currency)}</p>
                      <p className="text-sm text-gray-600">₹{item.unitPrice} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {payment.cartSnapshot.totals && (
            <div>
              <h3 className="font-semibold mb-3">Totals</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(payment.cartSnapshot.totals.subtotal.toString(), payment.currency)}</span>
                </div>
                {payment.cartSnapshot.totals.discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Discount:</span>
                    <span className="text-green-600">-{formatCurrency(payment.cartSnapshot.totals.discountAmount.toString(), payment.currency)}</span>
                  </div>
                )}
                {payment.cartSnapshot.totals.shippingCost > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping:</span>
                    <span>{formatCurrency(payment.cartSnapshot.totals.shippingCost.toString(), payment.currency)}</span>
                  </div>
                )}
                {payment.cartSnapshot.totals.estimatedTax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span>{formatCurrency(payment.cartSnapshot.totals.estimatedTax.toString(), payment.currency)}</span>
                  </div>
                )}
                {payment.cartSnapshot.totals.handlingCharge > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Handling:</span>
                    <span>{formatCurrency(payment.cartSnapshot.totals.handlingCharge.toString(), payment.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(payment.cartSnapshot.totals.grandTotal.toString(), payment.currency)}</span>
                </div>
              </div>
            </div>
          )}

          {payment.cartSnapshot.shippingAddress && (
            <div>
              <h3 className="font-semibold mb-3">Shipping Address</h3>
              <div className="border rounded p-4 space-y-2">
                <p className="font-medium">{payment.cartSnapshot.shippingAddress.recipientName}</p>
                <p className="text-sm text-gray-600">{payment.cartSnapshot.shippingAddress.recipientPhone}</p>
                <p className="text-sm text-gray-700 mt-2">{payment.cartSnapshot.shippingAddress.formattedAddress}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {payment.refunds && payment.refunds.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold border-b pb-2 mb-4">Refunds</h2>
          <div className="space-y-3">
            {payment.refunds.map((refund: any) => (
              <div key={refund._id} className="border rounded p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">{refund.refundId}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadgeColor(refund.refundStatus)}`}>
                    {refund.refundStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{formatCurrency(refund.refundAmount, refund.currency)}</span>
                </div>
                {refund.reason && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Reason:</span>
                    <span>{refund.reason}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Created:</span>
                  <span>{formatDateTime(refund.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showRefundModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold">Initiate Refund</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Refund Amount</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={remainingAmount}
                step="0.01"
                className="w-full border rounded px-3 py-2"
                placeholder={`Max: ${remainingAmount}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Remaining refundable amount: {formatCurrency(remainingAmount.toString(), payment.currency)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Reason (optional)</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Enter refund reason..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
                disabled={refundMutation.loading}
              >
                Cancel
              </button>
              <button
                onClick={handleRefundSubmit}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                disabled={refundMutation.loading}
              >
                {refundMutation.loading ? 'Processing...' : 'Submit Refund'}
              </button>
            </div>

            {refundMutation.error && (
              <div className="text-red-600 text-sm">
                Error initiating refund. Please try again.
              </div>
            )}
          </div>
        </div>
      )}

      {showOrderDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <button
                onClick={() => setShowOrderDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {orderLoading ? (
              <div className="text-center py-8">Loading order details...</div>
            ) : orderData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Order ID:</span>
                    <p className="font-medium">{orderData.orderId}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Status:</span>
                    <p className="font-medium">{orderData.orderStatus}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Total Amount:</span>
                    <p className="font-medium">{formatCurrency(orderData.totalAmount, orderData.currency || 'INR')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Created:</span>
                    <p className="font-medium">{formatDateTime(orderData.createdAt)}</p>
                  </div>
                </div>
                {orderData.items && orderData.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Items:</h3>
                    <div className="space-y-2">
                      {orderData.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between border-b pb-2">
                          <span>{item.name || item.sku}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Order not found</div>
            )}
          </div>
        </div>
      )}

      {showCustomerDialog && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Customer Details</h2>
              <button
                onClick={() => setShowCustomerDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            {customerLoading ? (
              <div className="text-center py-8">Loading customer details...</div>
            ) : customerData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600 text-sm">Name:</span>
                    <p className="font-medium">{customerData.firstName} {customerData.lastName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Email:</span>
                    <p className="font-medium">{customerData.email || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Phone:</span>
                    <p className="font-medium">{customerData.phoneNumber || '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Status:</span>
                    <p className="font-medium">{customerData.status}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Total Orders:</span>
                    <p className="font-medium">{customerData.totalOrders || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Total Spent:</span>
                    <p className="font-medium">₹{customerData.totalSpent || 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Registered:</span>
                    <p className="font-medium">{customerData.registeredAt ? formatDateTime(customerData.registeredAt) : '-'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">Guest:</span>
                    <p className="font-medium">{customerData.isGuest ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Customer not found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
