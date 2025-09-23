// API utility functions for Kong Gateway integration

export class KongChatAPI {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = "http://localhost:8000") {
    this.baseUrl = baseUrl
    this.token = typeof window !== "undefined" ? localStorage.getItem("chat_token") : null
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("chat_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("chat_token")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API Error ${response.status}: ${errorText}`)
      }

      const contentType = response.headers.get("content-type")
      if (contentType && contentType.includes("application/json")) {
        return await response.json()
      }

      return await response.text()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Authentication endpoints
  async register(userData: {
    firstName: string
    lastName: string
    email: string
    password: string
  }) {
    return this.request("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(email: string, password: string) {
    const response = await this.request("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })

    if (response.token) {
      this.setToken(response.token)
    }

    return response
  }

  async logout() {
    try {
      await this.request("/api/v1/auth/logout", {
        method: "POST",
      })
    } finally {
      this.clearToken()
    }
  }

  // User endpoints
  async getCurrentUser() {
    return this.request("/api/users/me")
  }

  async getUsers(limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return this.request(`/api/users?${params}`)
  }

  // Message endpoints
  async getMessages(roomId?: string, limit = 50, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })

    if (roomId) {
      params.append("roomId", roomId)
    }

    return this.request(`/api/messages?${params}`)
  }

  async sendMessage(text: string, roomId = "global") {
    return this.request("/api/messages", {
      method: "POST",
      body: JSON.stringify({ text, roomId }),
    })
  }

  async updateMessage(messageId: string, text: string) {
    return this.request(`/api/messages/${messageId}`, {
      method: "PUT",
      body: JSON.stringify({ text }),
    })
  }

  async deleteMessage(messageId: string) {
    return this.request(`/api/messages/${messageId}`, {
      method: "DELETE",
    })
  }

  // Room endpoints
  async getRooms(limit = 20, offset = 0) {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    })
    return this.request(`/api/rooms?${params}`)
  }

  async getRoom(roomId: string) {
    return this.request(`/api/rooms/${roomId}`)
  }

  async createRoom(name: string, description?: string) {
    return this.request("/api/rooms", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    })
  }

  async updateRoom(roomId: string, name: string, description?: string) {
    return this.request(`/api/rooms/${roomId}`, {
      method: "PUT",
      body: JSON.stringify({ name, description }),
    })
  }

  async deleteRoom(roomId: string) {
    return this.request(`/api/rooms/${roomId}`, {
      method: "DELETE",
    })
  }

  // Health check endpoints
  async checkAuthHealth() {
    return this.request("/auth/health")
  }

  async checkChatHealth() {
    return this.request("/chat/health")
  }

  async checkGatewayHealth() {
    return this.request("/gateway/health")
  }

  // Kong Admin API (for monitoring - requires admin access)
  async getKongStatus() {
    return this.request("/status")
  }

  async getKongServices() {
    return this.request("/services")
  }

  async getKongRoutes() {
    return this.request("/routes")
  }

  async getKongPlugins() {
    return this.request("/plugins")
  }
}

// Export singleton instance
export const kongAPI = new KongChatAPI()

// Export types for better TypeScript support
export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}
