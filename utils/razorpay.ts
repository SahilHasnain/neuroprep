import RazorpayCheckout from "react-native-razorpay";
import { RAZORPAY_KEY_ID } from "@/constants";
import { THEME } from "@/constants/theme";

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
  razorpay_subscription_id: string;
  razorpay_signature: string;
}

export const openRazorpayCheckout = (
  options: RazorpayOptions
): Promise<RazorpayResponse> => {
  return new Promise((resolve, reject) => {
    const checkoutOptions = {
      key: RAZORPAY_KEY_ID,
      subscription_id: options.subscriptionId,
      amount: String(options.amount || 19900),
      currency: options.currency || "INR",
      name: options.name || "NeuroPrep Pro",
      description: options.description || "Pro Subscription - ₹199/month",
      prefill: options.prefill || {},
      theme: {
        color: THEME.colors.accent.orange,
      },
    };

    RazorpayCheckout.open(checkoutOptions)
      .then((data) => {
        resolve(data);
      })
      .catch((error: any) => {
        reject(error);
      });
  });
};
