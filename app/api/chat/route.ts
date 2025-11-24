import { openai } from '@ai-sdk/openai';
import { createUIMessageStream, createUIMessageStreamResponse, convertToCoreMessages } from 'ai';
import { streamText } from 'ai';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // DefaultChatTransport sends messages in the body
    // The format might be different, let's check what we're receiving
    console.log('Received request body:', JSON.stringify(body, null, 2));
    
    let messages = body.messages || body;
    
    // If messages is not an array, try to extract it
    if (!Array.isArray(messages)) {
      if (typeof messages === 'object' && messages.messages) {
        messages = messages.messages;
      } else {
        return new Response(
          JSON.stringify({ error: 'Invalid request: messages must be an array', received: typeof messages }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: messages array required and must not be empty' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY is not configured' }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Normalize messages to CoreMessage format for streamText
    // The messages from DefaultChatTransport are already close to CoreMessage format
    console.log('Messages received:', JSON.stringify(messages, null, 2));
    
    // Convert messages to CoreMessage format
    // CoreMessages have: { role: 'user'|'assistant'|'system', content: string }
    const coreMessages = messages.map((msg: any) => {
      // If it's already a CoreMessage (has role and string content), use it
      if (msg.role && typeof msg.content === 'string') {
        // Remove any extra fields like 'id' that CoreMessage doesn't need
        return {
          role: msg.role,
          content: msg.content
        };
      }
      
      // If it's a UIMessage with parts, extract text content
      if (msg.role && msg.parts && Array.isArray(msg.parts)) {
        const textParts = msg.parts.filter((p: any) => p.type === 'text' || p.text);
        const content = textParts.map((p: any) => p.text || p.content || '').join('\n');
        return {
          role: msg.role,
          content: content || ''
        };
      }
      
      // Fallback: try to extract content from various formats
      const content = msg.content?.text || msg.text || (typeof msg.content === 'string' ? msg.content : '');
      return {
        role: msg.role || 'user',
        content: typeof content === 'string' ? content : JSON.stringify(content)
      };
    });

    console.log('Core messages for streamText:', JSON.stringify(coreMessages, null, 2));

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: coreMessages,
    });

    // Create a UIMessage stream using createUIMessageStream
    const uiMessageStream = createUIMessageStream({
      execute: async ({ writer }) => {
        // Write the assistant message start chunk
        writer.write({ type: 'text-start', id: 'assistant-message' } as any);
        
        // Stream the text from streamText
        for await (const chunk of result.textStream) {
          writer.write({ type: 'text-delta', id: 'assistant-message', delta: chunk } as any);
        }
        
        // Write the message end chunk
        writer.write({ type: 'text-end', id: 'assistant-message' } as any);
      },
      originalMessages: messages as any,
    });

    // Return as UIMessage stream response for DefaultChatTransport
    return createUIMessageStreamResponse({
      stream: uiMessageStream,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

