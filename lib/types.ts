export interface Recipe {
  title: string;
  image: string;
  url: string;
  intro: string;
  summary: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  recipes?: Recipe[];
}

export interface AgentResponse {
  message: string;
  recipes?: Recipe[];
}

