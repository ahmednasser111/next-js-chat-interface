export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  text: string
  roomId: string
  userId: string
  user: User
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  memberCount?: number
}

export interface AuthResponse {
  token: string
  user: User
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ChatClientConfig {
  authServiceUrl?: string
  chatServiceUrl?: string
  gatewayUrl?: string
}
