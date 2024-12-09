export interface DetailedInfoBlock {
  title: string;
  content: string;
}

export function parseDetailedInfo(detailedInfo: string | undefined | null): DetailedInfoBlock[] {
  if (!detailedInfo) return [];

  // Clean up the text by removing asterisks
  const cleanInfo = detailedInfo.replace(/\*/g, '');

  // Split by newlines and remove empty lines
  const lines = cleanInfo.split('\n').filter(line => line.trim());

  // Group lines into pairs (title and content)
  const blocks: DetailedInfoBlock[] = [];
  for (let i = 0; i < lines.length; i += 2) {
    if (i + 1 < lines.length) {
      blocks.push({
        title: lines[i].trim(),
        content: lines[i + 1].trim()
      });
    }
  }

  return blocks;
}