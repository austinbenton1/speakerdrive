interface ChatbotRequest {
  message: string;
  email: string;
  display_name?: string;
  services?: string[];
  website?: string;
}

interface ChatbotResponse {
  response: string;
  status: number;
}

export async function sendChatMessage(
  message: string, 
  email: string, 
  display_name?: string,
  services?: string[],
  website?: string
): Promise<ChatbotResponse> {
  try {
    // Validate message length before sending
    if (message.length > 8000) {
      throw new Error('Message exceeds maximum length of 8000 characters');
    }

    const url = 'https://n8n.speakerdrive.com/webhook/ai-data';

    console.log('[Chatbot] Sending message to:', url);
    console.log(JSON.stringify({
      message,
      email,
      display_name,
      services,
      website
    }));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        email,
        display_name,
        services,
        website
      })
    });

    if (!response.ok) {
      console.error('[Chatbot] Error response:', {
        status: response.status,
        statusText: response.statusText
      });

      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || errorData.error || '';
      } catch {
        // Ignore JSON parse error
      }

      throw new Error(`Failed to get chatbot response: ${response.status}${errorDetails ? ` - ${errorDetails}` : ''}`);
    }

    const data = await response.json();
    console.log('[Chatbot] Response received:', data);
    
    // Validate response format and content
    if (!data) {
      throw new Error('Empty response from chatbot');
    }
    
    if (typeof data.response !== 'string') {
      throw new Error('Invalid response format: expected string response');
    }

    // Truncate extremely long responses to prevent UI issues
    const maxResponseLength = 10000;
    const responseText = data.response.length > maxResponseLength
      ? data.response.slice(0, maxResponseLength) + '\n\n[Message truncated due to length]'
      : data.response;

    return {
      response: responseText,
      status: response.status
    };
  } catch (error) {
    console.error('[Chatbot] Error sending message:', error);
    throw error;
  }
}