"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage as ChatMessageType, Recipe } from "@/lib/types";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { RecipeCard } from "@/components/RecipeCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { YobrBanner } from "@/components/YobrBanner";

const INITIAL_MESSAGE: ChatMessageType = {
  role: "assistant",
  content:
    "Hei! Jeg er din middagsassistent. Har du noen preferanser eller ting du liker? For eksempel, er det noen spesielle ingredienser, kjøkkentype, eller retter du er interessert i?",
};

export default function Home() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    INITIAL_MESSAGE,
  ]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message: string) => {
    const userMessage: ChatMessageType = {
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const assistantMessage: ChatMessageType = {
        role: "assistant",
        content: data.message,
        recipes: data.recipes,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessageType = {
        role: "assistant",
        content: "Beklager, det oppstod en feil. Vennligst prøv igjen.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseRecipe = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* <YobrBanner /> */}
      <div className="flex-1 flex flex-col min-h-0">
        {selectedRecipe ? (
          <div className="flex-1 overflow-auto p-4">
            <div className="max-w-4xl mx-auto">
              <Button
                variant="ghost"
                onClick={handleCloseRecipe}
                className="mb-4"
              >
                ← Tilbake til samtalen
              </Button>
              <RecipeCard recipe={selectedRecipe} variant="large" />
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto p-4">
                {messages.map((message, index) => (
                  <ChatMessage
                    key={index}
                    message={message}
                    onRecipeSelect={handleRecipeSelect}
                  />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2">
                      <p>Tenker...</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            <ChatInput onSend={handleSend} disabled={isLoading} />
          </>
        )}
      </div>
    </div>
  );
}
