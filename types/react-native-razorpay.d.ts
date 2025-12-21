declare module 'react-native-razorpay' {
  interface RazorpayOptions {
    description?: string;
    image?: string;
    currency?: string;
    key: string;
    amount: string;
    name?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
    subscription_id?: string;
  }

  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_subscription_id: string;
    razorpay_signature: string;
  }

  const RazorpayCheckout: {
    open: (options: RazorpayOptions) => Promise<RazorpayResponse>;
  };

  export default RazorpayCheckout;
}
