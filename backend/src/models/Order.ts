import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  priceAtOrder: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  orderDate: Date;
  items: IOrderItem[];
  totalPrice: number;
  status: 'pending' | 'collected' | 'cancelled';
  notes?: string;
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  priceAtOrder: {
    type: Number,
    required: true
  }
});

const OrderSchema: Schema = new Schema({
  orderNumber: {
    type: String,
    required: true,
    trim: true
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  items: [OrderItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'collected', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Index for faster queries
OrderSchema.index({ user: 1, orderDate: -1 });
OrderSchema.index({ orderNumber: 1 });

export default mongoose.model<IOrder>('Order', OrderSchema);
