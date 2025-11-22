import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
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
  dateOfPurchase?: Date;
  picture?: string; // base64 encoded image data
  url?: string; // product URL
  tags?: string[]; // project names, custom tags
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, index: true, unique: true },
  description: { type: String, required: false },
  price: { type: Number, required: false },
  liked: { type: Boolean, default: false },
  bought: { type: Boolean, default: false },
  stock: { type: Number, required: false, min: 0 }, // quantity/bottles left
  type: { type: String, required: false }, // whisky, wine, etc.
  country: { type: String, required: false },
  grapeType: { type: [String], required: false }, // only for wine
  wineType: { type: String, required: false }, // only for wine
  alcoholPercent: { type: Number, required: false }, // alcohol percentage
  dateOfPurchase: { type: Date, required: false },
  picture: { type: String, required: false }, // base64 encoded image data
  url: { type: String, required: false }, // product URL
  tags: { type: [String], required: false }, // project names, custom tags
}, { timestamps: true });

ProductSchema.index({ name: 'text', description: 'text', grapeType: 'text', tags: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);