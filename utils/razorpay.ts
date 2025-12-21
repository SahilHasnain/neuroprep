import RazorpayCheckout from "react-native-razorpay";
import { RAZORPAY_KEY_ID } from "@/constants";

export interface RazorpayOptions {
  subscriptionId: string;
  amount?: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    email?: string;
    contact?: string;
    name?: string;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export const openRazorpayCheckout = (
  options: RazorpayOptions
): Promise<RazorpayResponse> => {
  return new Promise((resolve, reject) => {
    const checkoutOptions = {
      key: RAZORPAY_KEY_ID,
      subscription_id: options.subscriptionId,
      amount: options.amount || 19900, // ₹199 in paise
      currency: options.currency || "INR",
      name: options.name || "NeuroPrep Pro",
      description: options.description || "Pro Subscription - ₹199/month",
      prefill: options.prefill || {},
      theme: {
        color: "#f59e0b", // Amber color
      },
    };

    RazorpayCheckout.open(checkoutOptions)
      .then((data: RazorpayResponse) => {
        resolve(data);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};
