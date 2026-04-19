import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  weight?: string;
}

export interface IShippingAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface IBillingAddress {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface IOrder extends Document {
  userId?: string;
  items: IOrderItem[];
  shipping: IShippingAddress;
  billing: IBillingAddress;
  appliedCouponCode?: string;
  couponDiscount?: number;
  shippingCost: number;
  subtotal: number;
  total: number;
  paymentMethod: 'cod' | 'card' | 'upi';
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentId?: string;
  razorpayOrderId?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'in_transit' | 'out_for_delivery' | 'failed' | 'expired';
  orderNumber: string;
  awbNumber?: string;
  courierName?: string;
  shipmentStatus?: 'pending' | 'shipped' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  trackingUrl?: string;
  deliveryCharge?: number;
  selectedCourier?: string;
  selectedCourierId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  weight: { type: String },
});

const ShippingAddressSchema = new Schema<IShippingAddress>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
});

const BillingAddressSchema = new Schema<IBillingAddress>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: [true, 'Billing email is required'], trim: true },
  phone: { type: String, required: [true, 'Billing phone is required'], trim: true },
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: String },
    items: [OrderItemSchema],
    shipping: { type: ShippingAddressSchema, required: true },
    billing: { type: BillingAddressSchema, required: true },
    appliedCouponCode: { type: String, trim: true, uppercase: true },
    couponDiscount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['cod', 'card', 'upi'],
      default: 'cod',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    paymentId: { type: String, unique: true, sparse: true },
    razorpayOrderId: { type: String },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'in_transit', 'out_for_delivery', 'failed', 'expired'],
      default: 'pending',
    },
    orderNumber: { type: String, required: true, unique: true },
    awbNumber: { type: String },
    courierName: { type: String },
    shipmentStatus: {
      type: String,
      enum: ['pending', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'failed'],
    },
    trackingUrl: { type: String },
    deliveryCharge: { type: Number },
    selectedCourier: { type: String },
    selectedCourierId: { type: String },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving (if not already set)
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber || this.orderNumber.trim() === '') {
    try {
      const count = await mongoose.models.Order?.countDocuments() || 0;
      this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
    } catch (error) {
      // Fallback if count fails
      this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    }
  }
  next();
});

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;

