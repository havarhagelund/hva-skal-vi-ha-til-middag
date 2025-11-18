"use client";

import { ChatMessage as ChatMessageType, Recipe } from "@/lib/types";
import { RecipeCard, RecipeCardList } from "./RecipeCard";

interface ChatMessageProps {
  message: ChatMessageType;
  onRecipeSelect?: (recipe: Recipe) => void;
}

export function ChatMessage({ message, onRecipeSelect }: ChatMessageProps) {
  const isUser = message.role === "user";

  // If there are recipes, split the message into intro and follow-up
  // The intro should be short (first sentence or first line), rest is follow-up
  let introMessage = message.content;
  let followUpMessage = "";

  if (message.recipes && message.recipes.length > 0 && !isUser) {
    // Split on double newline or after first sentence/question mark
    const parts = message.content.split(/\n\n+/);
    if (parts.length > 1) {
      // First part is intro, rest is follow-up
      introMessage = parts[0].trim();
      followUpMessage = parts.slice(1).join("\n\n").trim();
    } else {
      // Try splitting on sentence boundary
      const sentenceMatch = message.content.match(
        /^([^.!?]+[.!?]?)\s+([\s\S]+)$/
      );
      if (sentenceMatch) {
        introMessage = sentenceMatch[1].trim();
        followUpMessage = sentenceMatch[2].trim();
      } else {
        // Just use first line as intro, rest as follow-up
        const lines = message.content.split("\n");
        introMessage = lines[0].trim();
        followUpMessage = lines.slice(1).join("\n").trim();
      }
    }
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? "order-2" : "order-1"}`}>
        {/* Show intro message only if it's not empty */}
        {introMessage && (
          <div
            className={`rounded-lg px-4 py-2 ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <p className="whitespace-pre-wrap">{introMessage}</p>
          </div>
        )}
        {message.recipes && message.recipes.length > 0 && (
          <div className="mt-4">
            {onRecipeSelect ? (
              <RecipeCardList
                recipes={message.recipes}
                onSelect={onRecipeSelect}
              />
            ) : (
              <RecipeCardList recipes={message.recipes} onSelect={() => {}} />
            )}
          </div>
        )}
        {/* Show follow-up message after cards */}
        {followUpMessage && (
          <div
            className={`rounded-lg px-4 py-2 mt-4 ${
              isUser
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <p className="whitespace-pre-wrap">{followUpMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}
