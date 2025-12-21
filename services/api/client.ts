import { getIdentity } from "@/utils/identity";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

class ApiClient {
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const identity = await getIdentity();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          "x-identity-type": identity.type,
          "x-identity-id": identity.id,
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 402) {
          return {
            success: false,
            message: "You've reached your daily limit. Please upgrade to continue.",
          };
        }
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Request failed",
      };
    }
  }

  async post<T>(url: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  async get<T>(url: string): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      method: "GET",
    });
  }
}

export const apiClient = new ApiClient();
