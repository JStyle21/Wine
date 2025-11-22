export interface Product {
  _id?: string;
  name: string;
  description?: string;
  price?: number;
  liked: boolean;
  bought: boolean;
  stock?: number; // quantity/bottles left
  type?: string; // whisky, wine, etc.
  country?: string;
  grapeType?: string[]; // only for wine
  wineType?: string; // only for wine
  alcoholPercent?: number; // alcohol percentage
  dateOfPurchase?: string; // ISO date string
  picture?: string; // base64 encoded image data
  url?: string; // product URL
  tags?: string[]; // project names, custom tags
  createdAt?: string;
}