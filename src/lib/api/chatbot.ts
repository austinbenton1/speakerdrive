interface ChatbotResponse {
  response: string;
  status: number;
}

export async function sendChatMessage(message: string): Promise<ChatbotResponse> {
  try {
    const params = new URLSearchParams({ message });
    const url = `https://n8n.speakerdrive.com/webhook/ai-data?${params}`;

    console.log('[Chatbot] Sending message to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
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
    
    return data;
  } catch (error) {
    console.error('[Chatbot] Error sending message:', error);
    throw error;
  }
}