"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useChat } from "@/hooks/use-chat"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import { RoomSidebar } from "@/components/chat/room-sidebar"
import { ChatHeader } from "@/components/chat/chat-header"
import type { Room } from "@/lib/types"

export default function ChatPage() {
  const router = useRouter()
  const {
    user,
    isConnected,
    messages,
    rooms,
    currentRoom,
    onlineUsers,
    isLoading,
    error,
    sendMessage,
    getMessages,
    getRooms,
    createRoom,
    switchRoom,
    logout,
    isAuthenticated,
  } = useChat()

  const [currentRoomData, setCurrentRoomData] = useState<Room | undefined>()

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  // Load initial data
  useEffect(() => {
    if (isAuthenticated()) {
      getRooms()
      getMessages()
    }
  }, [isAuthenticated, getRooms, getMessages])

  // Update current room data
  useEffect(() => {
    const roomData = rooms.find((room) => room.id === currentRoom)
    setCurrentRoomData(roomData)
  }, [rooms, currentRoom])

  const handleSendMessage = async (text: string) => {
    try {
      await sendMessage(text)
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleRoomSelect = async (roomId: string) => {
    try {
      await switchRoom(roomId)
    } catch (error) {
      console.error("Failed to switch room:", error)
    }
  }

  const handleCreateRoom = async (name: string, description?: string) => {
    try {
      await createRoom(name, description)
    } catch (error) {
      console.error("Failed to create room:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/auth")
    } catch (error) {
      console.error("Failed to logout:", error)
    }
  }

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar */}
      <RoomSidebar
        rooms={rooms}
        currentRoom={currentRoom}
        onRoomSelect={handleRoomSelect}
        onCreateRoom={handleCreateRoom}
        onlineUsers={Array.from(onlineUsers)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <ChatHeader currentRoom={currentRoomData} user={user} isConnected={isConnected} onLogout={handleLogout} />

        {/* Messages */}
        <MessageList messages={messages} currentUserId={user?.id} />

        {/* Message Input */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder={`Message ${currentRoomData?.name || "global"}`}
        />
      </div>
    </div>
  )
}
