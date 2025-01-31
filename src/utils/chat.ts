/**
 * Safely formats chat messages by handling line breaks and long content
 */
export function formatChatMessage(content: string): string {
  if (!content) return '';

  try {
    // Replace multiple consecutive line breaks with max two
    const normalizedContent = content.replace(/\n{3,}/g, '\n\n');

    // Handle extremely long words by adding zero-width spaces
    return normalizedContent.split(' ').map(word => {
      // Add zero-width spaces every 50 characters for very long words
      if (word.length > 50) {
        return word.match(/.{1,50}/g)?.join('\u200B') || word;
      }
      return word;
    }).join(' ');
  } catch (error) {
    console.error('Error formatting chat message:', error);
    return content;
  }
}