"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { User, Message, Room } from "@/lib/types";

// Chat client hook for managing authentication and real-time messaging
export function useChat(gatewayUrl = "http://localhost:8000") {
	const [user, setUser] = useState<User | null>(
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("chat_user") || "null")
			: null
	);
	const [token, setToken] = useState<string | null>(
		typeof window !== "undefined" ? localStorage.getItem("chat_token") : null
	);
	const [isConnected, setIsConnected] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [currentRoom, setCurrentRoom] = useState<string>("global");
	const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
	const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const socketRef = useRef<any>(null);
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Initialize authentication from localStorage
	useEffect(() => {
		const savedToken = localStorage.getItem("chat_token");
		const savedUser = localStorage.getItem("chat_user");
		if (savedToken) {
			setToken(savedToken);
			if (savedUser) {
				try {
					setUser(JSON.parse(savedUser));
				} catch {
					localStorage.removeItem("chat_user");
				}
			}
			getCurrentUser(savedToken);
		}
	}, []);

	// API helper function
	const apiCall = useCallback(
		async (endpoint: string, options: RequestInit = {}) => {
			const url = `${gatewayUrl}${endpoint}`;
			const headers = {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
				...options.headers,
			};

			try {
				const response = await fetch(url, { ...options, headers });

				if (!response.ok) {
					throw new Error(
						`API call failed: ${response.status} ${response.statusText}`
					);
				}

				return await response.json();
			} catch (err) {
				console.error("API call error:", err);
				throw err;
			}
		},
		[gatewayUrl, token]
	);

	// Authentication functions
	const register = useCallback(
		async (userData: {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
		}) => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await apiCall("/auth/api/v1/auth/register", {
					method: "POST",
					body: JSON.stringify(userData),
				});

				return response;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Registration failed";
				setError(errorMessage);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[apiCall]
	);

	const login = useCallback(
		async (email: string, password: string) => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await apiCall("/auth/api/v1/auth/login", {
					method: "POST",
					body: JSON.stringify({ email, password }),
				});

				const { token: newToken } = response;
				setToken(newToken);
				localStorage.setItem("chat_token", newToken);

				// Get user info and connect socket
				await getCurrentUser(newToken);
				connectSocket(newToken);

				return response;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Login failed";
				setError(errorMessage);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[apiCall]
	);

	const logout = useCallback(async () => {
		try {
			if (token) {
				await apiCall("/auth/api/v1/auth/logout", { method: "POST" });
			}
		} catch (err) {
			console.error("Logout error:", err);
		} finally {
			setToken(null);
			setUser(null);
			setIsConnected(false);
			localStorage.removeItem("chat_token");

			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		}
	}, [apiCall, token]);

	const getCurrentUser = useCallback(
		async (authToken?: string) => {
			const currentToken = authToken || token;
			if (!currentToken) return;

			try {
				const response = await fetch(`${gatewayUrl}/chat/api/users/me`, {
					headers: { Authorization: `Bearer ${currentToken}` },
					cache: "no-store",
				});

				if (response.ok) {
					const { user: userData } = await response.json();
					setUser(userData);
					localStorage.setItem("chat_user", JSON.stringify(userData));
					return userData;
				}
			} catch (err) {
				console.error("Get user error:", err);
			}
		},
		[gatewayUrl, token]
	);

	// Socket connection (placeholder for Socket.IO integration)
	const connectSocket = useCallback((authToken: string) => {
		// This would integrate with Socket.IO in a real implementation
		console.log(
			"Socket connection would be established here with token:",
			authToken
		);
		setIsConnected(true);
	}, []);

	// Message functions
	const sendMessage = useCallback(
		async (text: string, roomId = currentRoom) => {
			if (!token) throw new Error("Not authenticated");

			try {
				const response = await apiCall("/chat/api/messages", {
					method: "POST",
					body: JSON.stringify({ text, roomId }),
				});

				const { message } = response;
				setMessages((prev) => [...prev, message]);
				return message;
			} catch (err) {
				console.error("Send message error:", err);
				throw err;
			}
		},
		[apiCall, token, currentRoom]
	);

	const getMessages = useCallback(
		async (roomId?: string, limit = 50, offset = 0) => {
			if (!token) return [];

			try {
				const params = new URLSearchParams({
					...(roomId && { roomId }),
					limit: limit.toString(),
					offset: offset.toString(),
				});

				const response = await apiCall(`/chat/api/messages?${params}`);
				const { messages: messageList } = response;

				if (roomId === currentRoom || !roomId) {
					setMessages(messageList);
				}

				return messageList;
			} catch (err) {
				console.error("Get messages error:", err);
				return [];
			}
		},
		[apiCall, token, currentRoom]
	);

	// Room functions
	const getRooms = useCallback(
		async (limit = 20, offset = 0) => {
			if (!token) return [];

			try {
				const params = new URLSearchParams({
					limit: limit.toString(),
					offset: offset.toString(),
				});

				const response = await apiCall(`/chat/api/rooms?${params}`);
				const { rooms: roomList } = response;
				setRooms(roomList);
				return roomList;
			} catch (err) {
				console.error("Get rooms error:", err);
				return [];
			}
		},
		[apiCall, token]
	);

	const createRoom = useCallback(
		async (name: string, description?: string) => {
			if (!token) throw new Error("Not authenticated");

			try {
				const response = await apiCall("chat//api/rooms", {
					method: "POST",
					body: JSON.stringify({ name, description }),
				});

				const { room } = response;
				setRooms((prev) => [...prev, room]);
				return room;
			} catch (err) {
				console.error("Create room error:", err);
				throw err;
			}
		},
		[apiCall, token]
	);

	const switchRoom = useCallback(
		async (roomId: string) => {
			setCurrentRoom(roomId);
			await getMessages(roomId);
			localStorage.setItem("currentRoom", roomId);
		},
		[getMessages]
	);

	// Utility functions
	const isAuthenticated = useCallback(() => {
		return !!(token && user);
	}, [token, user]);

	return {
		// State
		user,
		token,
		isConnected,
		messages,
		rooms,
		currentRoom,
		onlineUsers,
		typingUsers,
		isLoading,
		error,

		// Auth functions
		register,
		login,
		logout,
		getCurrentUser,

		// Message functions
		sendMessage,
		getMessages,

		// Room functions
		getRooms,
		createRoom,
		switchRoom,

		// Utility functions
		isAuthenticated,
	};
}
