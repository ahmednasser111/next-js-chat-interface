"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface MessageListProps {
	messages: Message[];
	currentUserId?: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	if (messages.length === 0) {
		return (
			<div className="flex-1 flex items-center justify-center">
				<div className="text-center space-y-2">
					<p className="text-muted-foreground">No messages yet</p>
					<p className="text-sm text-muted-foreground">
						Start the conversation!
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-4">
			{messages.map((message) => {
				const isOwnMessage = message.userId === currentUserId;
				const initials = message.user.email?.[0]?.toUpperCase() || "?";

				return (
					<div
						key={message.id}
						className={`flex gap-3 ${
							isOwnMessage ? "flex-row-reverse" : "flex-row"
						}`}>
						<Avatar className="h-8 w-8 flex-shrink-0">
							<AvatarFallback className="bg-primary/10 text-primary text-xs">
								{initials}
							</AvatarFallback>
						</Avatar>

						<div
							className={`flex flex-col max-w-[70%] ${
								isOwnMessage ? "items-end" : "items-start"
							}`}>
							<div className="flex items-center gap-2 mb-1">
								<span className="text-sm font-medium text-foreground">
									{isOwnMessage ? "You" : message.user.email?.split("@")[0]}
								</span>
								<span className="text-xs text-muted-foreground">
									{formatDistanceToNow(new Date(message.createdAt), {
										addSuffix: true,
									})}
								</span>
							</div>

							<div
								className={`rounded-lg px-3 py-2 text-sm ${
									isOwnMessage
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
								}`}>
								{message.text}
							</div>
						</div>
					</div>
				);
			})}
			<div ref={messagesEndRef} />
		</div>
	);
}
