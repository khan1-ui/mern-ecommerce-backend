export const generateInvoiceNumber = (orderId) => {
  const shortId = orderId.toString().slice(-6).toUpperCase();
  const year = new Date().getFullYear();
  return `INV-${year}-${shortId}`;
};
