export function cleanDetailedInfo(text: string | undefined | null): string {
  if (!text) return '';
  return text.replace(/\*/g, '');
}