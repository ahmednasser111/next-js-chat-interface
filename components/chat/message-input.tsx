"use client";

import type React from "react";

import { useState, useRef, type KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
	onSendMessage: (text: string) => Promise<void>;
	isLoading?: boolean;
	placeholder?: string;
	disabled?: boolean;
}

export function MessageInput({
	onSendMessage,
	isLoading,
	placeholder = "Type a message...",
	disabled = false,
}: MessageInputProps) {
	const [message, setMessage] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleSubmit = async () => {
		const trimmedMessage = message.trim();
		if (!trimmedMessage || isLoading || disabled) return;

		try {
			await onSendMessage(trimmedMessage);
			setMessage("");
			if (textareaRef.current) {
				textareaRef.current.style.height = "auto";
			}
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit();
		}
	};

	const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessage(e.target.value);

		// Auto-resize textarea
		const textarea = e.target;
		textarea.style.height = "auto";
		textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
	};

	return (
		<div className="border-t border-border bg-background p-4">
			<div className="flex gap-2 items-end">
				<div className="flex-1">
					<Textarea
						ref={textareaRef}
						value={message}
						onChange={handleTextareaChange}
						onKeyDown={handleKeyDown}
						placeholder={placeholder}
						className="min-h-[40px] max-h-[120px] resize-none bg-input border-border text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
						disabled={isLoading || disabled}
					/>
				</div>
				<Button
					onClick={handleSubmit}
					disabled={!message.trim() || isLoading || disabled}
					size="sm"
					className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50">
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Send className="h-4 w-4" />
					)}
				</Button>
			</div>
			<p className="text-xs text-muted-foreground mt-2">
				{disabled
					? "Select a room to send messages"
					: "Press Enter to send, Shift+Enter for new line"}
			</p>
		</div>
	);
}
