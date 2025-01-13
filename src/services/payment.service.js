import cashfree from '../config/cashfree.js';
import Payment from '../models/payment.model.js';

export const createPaymentOrder = async (userId, eventId, amount, customerDetails) => {
  try {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const orderData = {
      orderId: orderId,
      orderAmount: amount,
      orderCurrency: 'INR',
      customerDetails: {
        customerId: userId,
        customerEmail: customerDetails.email,
        customerPhone: customerDetails.phone,
        customerName: customerDetails.name
      },
      orderMeta: {
        returnUrl: `${process.env.FRONTEND_URL}/payment/status/{order_id}`,
        notifyUrl: `${process.env.BACKEND_URL}/api/payments/webhook`
      }
    };

    const order = await cashfree.orders.createOrder(orderData);

    // Create payment record in database
    await Payment.create({
      user: userId,
      event: eventId,
      orderId: orderId,
      amount: amount,
      status: 'PENDING'
    });

    return order;
  } catch (error) {
    console.error('Payment order creation failed:', error);
    throw error;
  }
};

export const verifyPaymentWebhook = async (webhookData) => {
  try {
    const { orderId, orderStatus, paymentId, paymentMethod } = webhookData;
    
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      throw new Error('Payment not found');
    }

    payment.status = orderStatus === 'PAID' ? 'SUCCESS' : 'FAILED';
    payment.paymentId = paymentId;
    payment.paymentMethod = paymentMethod;
    payment.transactionTime = new Date();
    
    await payment.save();
    
    return payment;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw error;
  }
};