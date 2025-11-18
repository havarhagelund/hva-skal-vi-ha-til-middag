# Middagsassistent - Norwegian Dinner Recipe Chatbot

A Next.js chatbot application that helps users decide what to have for dinner using OpenAI Agents SDK and an MCP recipe search tool. The interface is in Norwegian with interactive recipe cards.

## Features

- 🤖 Conversational AI agent powered by OpenAI
- 🔍 Recipe search via MCP tool
- 🎴 Interactive recipe cards (small list view and large detail view)
- 🇳🇴 Norwegian language interface
- 💬 Natural conversation flow to gather preferences

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- OpenAI API key

### Installation

1. Install dependencies:

```bash
npm install
# or
pnpm install
```

2. Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key_here
TURSO_DATABASE_URL=your_turso_database_url
TURSO_AUTH_TOKEN=your_turso_auth_token
```

3. Run the development server:

```bash
npm run dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. The chatbot starts by asking about your preferences
2. It engages in conversation to gather enough information (ingredients, cuisine type, etc.)
3. When ready, it searches for recipes using the MCP tool
4. Results are displayed as clickable cards
5. Clicking a card shows a detailed view with a link to the full recipe
6. The conversation continues to refine suggestions based on your feedback

## Tech Stack

- **Next.js 14** (App Router) with TypeScript
- **OpenAI SDK** - for conversational AI agent
- **MCP Client** - to connect to recipe search at `https://recipes-mcp.fly.dev/mcp`
- **shadcn/ui** - for UI components
- **Tailwind CSS** - for styling

## Project Structure

```
/app
  /api/chat/route.ts          # Chat API endpoint
  /page.tsx                   # Main chat interface
/components
  RecipeCard.tsx              # Recipe card components
  ChatMessage.tsx             # Chat message display
  ChatInput.tsx               # Message input
/lib
  mcp-client.ts               # MCP recipe search client
  agent.ts                    # OpenAI agent setup
  types.ts                    # TypeScript types
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
