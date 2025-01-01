interface ValueProfileItem {
  title: string;
  description: string;
}

export function parseValueProfile(valueProfile: string | undefined): ValueProfileItem[] {
  if (!valueProfile) return [];

  // Split by double newlines
  const parts = valueProfile.split('\n\n').filter(Boolean);
  const items: ValueProfileItem[] = [];
  let currentItem: Partial<ValueProfileItem> = {};

  for (const part of parts) {
    if (part.includes('->')) {
      // If we have a previous item with incomplete data, add it
      if (currentItem.title && currentItem.description) {
        items.push(currentItem as ValueProfileItem);
      }
      
      // Start a new item
      const [title, description] = part.split('->').map(s => s.trim());
      currentItem = { title, description };
    } else if (currentItem.title && currentItem.description) {
      // Append to current item's description
      currentItem.description += '\n\n' + part.trim();
    }
  }

  // Add the last item if it's complete
  if (currentItem.title && currentItem.description) {
    items.push(currentItem as ValueProfileItem);
  }

  return items;
}