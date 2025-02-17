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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        email,
        display_name,
        services,
        website,
      }),
    });

    if (!response.ok) {
      // Try to get error details from response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = errorData.message || errorData.error || '';
      } catch {
        // Ignore JSON parse error
      }

      throw new Error(
        `Failed to get chatbot response: ${response.status}${
          errorDetails ? ` - ${errorDetails}` : ''
        }`
      );
    }

    const data = await response.json();

    // Validate response format
    if (!data?.body) {
      throw new Error('Invalid response format: missing body');
    }

    if (!data.body.response?.output) {
      throw new Error('Invalid response format: missing output field');
    }

    // Extract the actual message content from the nested structure.
    const rawOutput = data.body.response.output;
    let messageContent: string;

    if (
      typeof rawOutput === 'object' &&
      rawOutput?.body?.response &&
      typeof rawOutput.body.response === 'string'
    ) {
      // If the output is nested, use the inner response string.
      messageContent = rawOutput.body.response;
    } else if (typeof rawOutput === 'string') {
      // Otherwise, use the output as is.
      messageContent = rawOutput;
    } else {
      throw new Error(
        'Invalid response format: expected output to be a string or an object containing body.response'
      );
    }

    // Unescape newlines and truncate extremely long responses to prevent UI issues
    const maxResponseLength = 10000;
    const unescapedOutput = messageContent.replace(/\\n/g, '\n');
    const responseText =
      unescapedOutput.length > maxResponseLength
        ? unescapedOutput.slice(0, maxResponseLength) +
          '\n\n[Message truncated due to length]'
        : unescapedOutput;

    return {
      response: responseText,
      status: response.status,
    };
  } catch (error) {
    throw error;
  }
}
