import { NextRequest, NextResponse } from 'next/server';
import { processMessage } from '@/lib/agent';
import { ChatMessage, AgentResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: message },
    ];

    const response: AgentResponse = await processMessage(messages, conversationHistory);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

