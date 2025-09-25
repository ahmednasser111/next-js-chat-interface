"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
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
	const [currentRoom, setCurrentRoom] = useState<string>("");
	const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
	const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const socketRef = useRef<Socket | null>(null);
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

	// Connect socket when user is authenticated
	useEffect(() => {
		if (token && user && !socketRef.current) {
			connectSocket(token);
		}

		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		};
	}, [token, user]);

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
					const errorText = await response.text();
					throw new Error(`API call failed: ${response.status} ${errorText}`);
				}

				return await response.json();
			} catch (err) {
				console.error("API call error:", err);
				throw err;
			}
		},
		[gatewayUrl, token]
	);

	// Socket connection with proper event handlers
	const connectSocket = useCallback(
		(authToken: string) => {
			if (socketRef.current?.connected) return;

			try {
				socketRef.current = io(`${gatewayUrl}/chat`, {
					auth: { token: authToken },
					transports: ["websocket", "polling"],
					autoConnect: true,
				});

				const socket = socketRef.current;

				socket.on("connect", () => {
					console.log("Socket connected:", socket.id);
					setIsConnected(true);
					setError(null);
				});

				socket.on("disconnect", (reason) => {
					console.log("Socket disconnected:", reason);
					setIsConnected(false);
					if (reason === "io server disconnect") {
						// Server forcibly disconnected, try to reconnect
						socket.connect();
					}
				});

				socket.on("connect_error", (error) => {
					console.error("Socket connection error:", error);
					setIsConnected(false);
					setError("Connection failed. Please try again.");
				});

				// Real-time message events
				socket.on("message:new", (message: Message) => {
					console.log("New message received:", message);
					setMessages((prev) => {
						// Avoid duplicates
						const exists = prev.some((m) => m.id === message.id);
						if (exists) return prev;
						return [...prev, message];
					});
				});

				socket.on("message:updated", (message: Message) => {
					console.log("Message updated:", message);
					setMessages((prev) =>
						prev.map((msg) => (msg.id === message.id ? message : msg))
					);
				});

				socket.on("message:deleted", (data: { messageId: string }) => {
					console.log("Message deleted:", data);
					setMessages((prev) =>
						prev.filter((msg) => msg.id !== data.messageId)
					);
				});

				// User presence events
				socket.on("user:joined", (data: { userId: string; roomId: string }) => {
					console.log("User joined:", data);
					if (data.roomId === currentRoom) {
						setOnlineUsers((prev) => new Set([...prev, data.userId]));
					}
				});

				socket.on("user:left", (data: { userId: string; roomId: string }) => {
					console.log("User left:", data);
					if (data.roomId === currentRoom) {
						setOnlineUsers((prev) => {
							const newSet = new Set(prev);
							newSet.delete(data.userId);
							return newSet;
						});
					}
				});

				socket.on("users:online", (data: { users: string[] }) => {
					console.log("Online users updated:", data);
					setOnlineUsers(new Set(data.users));
				});

				// Typing events
				socket.on(
					"typing:start",
					(data: { userId: string; roomId: string }) => {
						if (data.roomId === currentRoom && data.userId !== user?.id) {
							setTypingUsers((prev) => new Set([...prev, data.userId]));
						}
					}
				);

				socket.on("typing:stop", (data: { userId: string; roomId: string }) => {
					if (data.roomId === currentRoom) {
						setTypingUsers((prev) => {
							const newSet = new Set(prev);
							newSet.delete(data.userId);
							return newSet;
						});
					}
				});

				// Room events
				socket.on("room:created", (room: Room) => {
					console.log("Room created:", room);
					setRooms((prev) => [...prev, room]);
				});

				socket.on("room:updated", (room: Room) => {
					console.log("Room updated:", room);
					setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)));
				});

				socket.on("room:deleted", (data: { roomId: string }) => {
					console.log("Room deleted:", data);
					setRooms((prev) => prev.filter((r) => r.id !== data.roomId));
					if (currentRoom === data.roomId) {
						setCurrentRoom("");
						setMessages([]);
					}
				});

				// Error handling
				socket.on("error", (error) => {
					console.error("Socket error:", error);
					setError(error.message || "Socket error occurred");
				});
			} catch (error) {
				console.error("Failed to connect socket:", error);
				setError("Failed to establish real-time connection");
			}
		},
		[gatewayUrl, currentRoom, user?.id]
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

				// Get user info
				const userData = await getCurrentUser(newToken);
				if (userData) {
					// Socket will connect via useEffect
					return { token: newToken, user: userData };
				}

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
			// Clean up state
			setToken(null);
			setUser(null);
			setIsConnected(false);
			setCurrentRoom("");
			setMessages([]);
			setRooms([]);
			setOnlineUsers(new Set());
			setTypingUsers(new Set());

			// Clear localStorage
			localStorage.removeItem("chat_token");
			localStorage.removeItem("chat_user");
			localStorage.removeItem("currentRoom");

			// Disconnect socket
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		}
	}, [apiCall, token]);

	const getCurrentUser = useCallback(
		async (authToken?: string) => {
			const currentToken = authToken || token;
			if (!currentToken) return null;

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
			return null;
		},
		[gatewayUrl, token]
	);

	// Message functions
	const sendMessage = useCallback(
		async (text: string, roomId?: string) => {
			const targetRoom = roomId || currentRoom;

			// Ensure user is in a room before sending
			if (!targetRoom) {
				throw new Error("You must join a room before sending messages");
			}

			if (!token) throw new Error("Not authenticated");

			try {
				// Send via socket for real-time if connected, fallback to API
				if (socketRef.current?.connected) {
					socketRef.current.emit("message:send", { text, roomId: targetRoom });
					return; // Message will be received via socket event
				} else {
					// Fallback to REST API
					const response = await apiCall("/chat/api/messages", {
						method: "POST",
						body: JSON.stringify({ text, roomId: targetRoom }),
					});

					const { message } = response;
					setMessages((prev) => [...prev, message]);
					return message;
				}
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

				// Filter out any "global" rooms that might exist
				const filteredRooms = roomList.filter(
					(room: Room) =>
						room.id !== "global" && room.name.toLowerCase() !== "global"
				);

				setRooms(filteredRooms);
				return filteredRooms;
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
				const response = await apiCall("/chat/api/rooms", {
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
			// Leave current room if connected via socket
			if (currentRoom && socketRef.current?.connected) {
				socketRef.current.emit("room:leave", currentRoom);
			}

			// Update current room
			setCurrentRoom(roomId);
			setMessages([]); // Clear messages when switching rooms

			// Join new room if connected via socket
			if (socketRef.current?.connected) {
				socketRef.current.emit("room:join", roomId);
			}

			// Load room messages
			await getMessages(roomId);

			// Save to localStorage
			localStorage.setItem("currentRoom", roomId);
		},
		[currentRoom, getMessages]
	);

	// Typing functions
	const startTyping = useCallback(() => {
		if (currentRoom && socketRef.current?.connected) {
			socketRef.current.emit("typing:start", { roomId: currentRoom });
		}
	}, [currentRoom]);

	const stopTyping = useCallback(() => {
		if (currentRoom && socketRef.current?.connected) {
			socketRef.current.emit("typing:stop", { roomId: currentRoom });
		}
	}, [currentRoom]);

	// Connection check function
	const checkConnection = useCallback(() => {
		if (!socketRef.current) {
			setIsConnected(false);
			return false;
		}

		const connected = socketRef.current.connected;
		setIsConnected(connected);

		// If not connected, try to reconnect
		if (!connected && token) {
			console.log("Attempting to reconnect...");
			socketRef.current.connect();
		}

		return connected;
	}, [token]);

	// Utility functions
	const isAuthenticated = useCallback(() => {
		return !!(token && user);
	}, [token, user]);

	const canSendMessage = useCallback(() => {
		return !!(token && user && currentRoom);
	}, [token, user, currentRoom]);

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

		// Typing functions
		startTyping,
		stopTyping,

		// Utility functions
		isAuthenticated,
		canSendMessage,
		checkConnection,
	};
}
