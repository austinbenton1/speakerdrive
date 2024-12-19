export interface StoredImage {
  id: string;
  image_url: string;
  lead_name: string;
  lead_type: 'Event' | 'Contact';
  industry: string;
  organization: string;
  image_persistence: boolean;
}
