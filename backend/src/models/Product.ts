import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description?: string;
  price?: number;
  liked: boolean;
  bought: boolean;
  type?: string; // whisky, wine, etc.
  country?: string;
  grapeType?: string[]; // only for wine
  wineType?: string; // only for wine
  kosher?: boolean; // only for wine
  alcoholPercent?: number; // alcohol percentage
  dateOfPurchase?: Date;
  picture?: string; // base64 encoded image data
  url?: string; // product URL
  tags?: string[]; // project names, custom tags
  // New fields
  pickupRange?: string; // e.g., "Feb-March"
  pickupStatus?: boolean; // picked up or not
  reviewed?: boolean; // reviewed checkbox
  interested?: boolean; // interested checkbox
  stock?: number; // how many in stock
  user: mongoose.Types.ObjectId; // owner of this product
}

const ProductSchema: Schema = new Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: false },
  price: { type: Number, required: false },
  liked: { type: Boolean, default: false },
  bought: { type: Boolean, default: false },
  type: { type: String, required: false }, // whisky, wine, etc.
  country: { type: String, required: false },
  grapeType: { type: [String], required: false }, // only for wine
  wineType: { type: String, required: false }, // only for wine
  kosher: { type: Boolean, default: false }, // only for wine
  alcoholPercent: { type: Number, required: false }, // alcohol percentage
  dateOfPurchase: { type: Date, required: false },
  picture: { type: String, required: false }, // base64 encoded image data
  url: { type: String, required: false }, // product URL
  tags: { type: [String], required: false }, // project names, custom tags
  // New fields
  pickupRange: { type: String, required: false }, // e.g., "Feb-March"
  pickupStatus: { type: Boolean, default: false }, // picked up or not
  reviewed: { type: Boolean, default: false }, // reviewed checkbox
  interested: { type: Boolean, default: false }, // interested checkbox
  stock: { type: Number, required: false, min: 0 }, // how many in stock
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // owner
}, { timestamps: true });

// Compound index for unique name per user
ProductSchema.index({ name: 1, user: 1 }, { unique: true });

ProductSchema.index({ name: 'text', description: 'text', grapeType: 'text', tags: 'text' });

export default mongoose.model<IProduct>('Product', ProductSchema);