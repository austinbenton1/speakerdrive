export interface EventInfoBlock {
  title: string;
  content: string;
}

export function parseEventInfo(eventInfo: string | undefined | null): EventInfoBlock[] {
  if (!eventInfo) return [];

  return eventInfo
    .split('\n')
    .filter(block => block.trim() && block.includes(':'))
    .map(block => {
      const [title, ...contentParts] = block.split(':');
      const content = contentParts.join(':').trim();
      return {
        title: title.trim(),
        content: content || 'No information available'
      };
    })
    .filter(block => block.title && block.content);
}