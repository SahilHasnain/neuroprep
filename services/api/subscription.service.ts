import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";

export const subscriptionService = {
  async getPlanStatus() {
    return apiClient.get(API_ENDPOINTS.GET_PLAN_STATUS);
  },

  async createSubscription(userData: any) {
    return apiClient.post(API_ENDPOINTS.CREATE_SUBSCRIPTION, userData);
  },

  async verifyPayment(paymentData: any) {
    return apiClient.post(API_ENDPOINTS.VERIFY_PAYMENT, paymentData);
  },

  async cancelSubscription(reason?: string) {
    return apiClient.post(API_ENDPOINTS.CANCEL_SUBSCRIPTION, { reason });
  },
};
