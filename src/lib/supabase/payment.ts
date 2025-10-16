export const initializePayment = async (data: any) => {
  console.warn('Payment not configured.');
  return { paymentConfig: { publicKey: '', email: '', amount: 0, reference: '' } };
};
