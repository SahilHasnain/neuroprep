import { apiClient } from "./client";
import { API_ENDPOINTS } from "@/constants";
import type {
  CreateSubscriptionRequest,
  SubscriptionData,
  VerifyPaymentRequest,
  PlanStatusResponse,
  ApiResponse,
} from "@/lib/types";

export const subscriptionService = {
  async getPlanStatus(): Promise<ApiResponse<PlanStatusResponse>> {
    return apiClient.get(API_ENDPOINTS.GET_PLAN_STATUS);
  },

  async createSubscription(userData: CreateSubscriptionRequest): Promise<ApiResponse<SubscriptionData>> {
    return apiClient.post(API_ENDPOINTS.CREATE_SUBSCRIPTION, userData);
  },

  async verifyPayment(paymentData: VerifyPaymentRequest): Promise<ApiResponse<void>> {
    return apiClient.post(API_ENDPOINTS.VERIFY_PAYMENT, paymentData);
  },

  async cancelSubscription(reason?: string): Promise<ApiResponse<void>> {
    return apiClient.post(API_ENDPOINTS.CANCEL_SUBSCRIPTION, { reason });
  },
};
