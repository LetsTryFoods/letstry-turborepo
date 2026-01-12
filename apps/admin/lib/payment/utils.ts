export const getStatusBadgeColor = (status: string) => {
  const colors: Record<string, string> = {
    SUCCESS: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    EXECUTING: 'bg-blue-100 text-blue-800',
    NOT_STARTED: 'bg-gray-100 text-gray-800',
    REFUNDED: 'bg-purple-100 text-purple-800',
    PARTIALLY_REFUNDED: 'bg-orange-100 text-orange-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const formatCurrency = (amount: string, currency: string) => {
  const num = parseFloat(amount);
  if (currency === 'INR') {
    return `₹${num.toFixed(2)}`;
  }
  return `${currency} ${num.toFixed(2)}`;
};

export const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const maskCardNumber = (cardNumber: string) => {
  if (!cardNumber || cardNumber.length < 8) return cardNumber;
  const first4 = cardNumber.substring(0, 4);
  const last4 = cardNumber.substring(cardNumber.length - 4);
  return `${first4} XXXX XXXX ${last4}`;
};
