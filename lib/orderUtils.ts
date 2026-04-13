import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import { checkPincodeServiceability } from '@/lib/delivery';

export interface CartItem {
  productId: string;
  quantity: number;
  weight?: string; // Add weight to match frontend selection
}


export interface CalculationResult {
  success: boolean;
  finalAmount: number;
  breakdown: {
    subtotal: number;
    discount: number;
    deliveryCharge: number;
  };
  error?: string;
  products?: any[]; // For further use if needed
}

export const calculateOrderAmount = async (
  cartItems: CartItem[],
  couponCode?: string,
  deliveryPincode?: string,
  courierCharge?: number
): Promise<CalculationResult> => {
  try {
    let subtotal = 0;
    const validatedProducts = [];

    // 1. Fetch products and check stock
    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return { success: false, finalAmount: 0, breakdown: { subtotal: 0, discount: 0, deliveryCharge: 0 }, error: `Product with ID ${item.productId} not found` };
      }

      if (product.stock !== undefined && product.stock < item.quantity) {
        return { success: false, finalAmount: 0, breakdown: { subtotal: 0, discount: 0, deliveryCharge: 0 }, error: `Insufficient stock for ${product.name}. Available: ${product.stock}` };
      }

      // Find the correct price based on weight if sizes exist
      let itemPrice = product.price; // Default to base price
      
      if (item.weight && product.sizes && product.sizes.length > 0) {
        const matchingSize = product.sizes.find(s => s.weight === item.weight);
        if (matchingSize) {
          itemPrice = matchingSize.price;
        }
      }

      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;
      validatedProducts.push({
        _id: product._id,
        name: product.name,
        price: itemPrice,
        quantity: item.quantity,
        image: product.image,
        weight: item.weight || product.defaultWeight
      });
    }


    let discount = 0;

    // 2. Validate and apply coupon
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      
      if (coupon) {
        const now = new Date();
        if (now >= coupon.startDate && now <= coupon.endDate) {
          if (subtotal >= coupon.minimumPurchase) {
            if (coupon.discountType === 'percentage') {
              discount = (subtotal * coupon.discountValue) / 100;
              if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
                discount = coupon.maximumDiscount;
              }
            } else if (coupon.discountType === 'fixed') {
              discount = coupon.discountValue;
            }
          }
        }
      }
    }

    // 3. Calculate delivery charge
    let deliveryCharge = courierCharge || 0;
    
    // If no courierCharge but pincode is provided, we can't accurately calculate anymore
    // using the old method if we want to stick to NimbusPost.
    // However, some old flows might still use this.
    if (courierCharge === undefined && deliveryPincode) {
      const { checkPincodeServiceability } = await import('@/lib/delivery');
      const deliveryInfo = checkPincodeServiceability(deliveryPincode, subtotal);
      deliveryCharge = deliveryInfo.deliveryCharge;
    }

    const finalAmount = Math.max(0, subtotal - discount + deliveryCharge);

    return {
      success: true,
      finalAmount,
      breakdown: {
        subtotal,
        discount,
        deliveryCharge
      },
      products: validatedProducts
    };
  } catch (error: any) {
    console.error('Error in calculateOrderAmount:', error);
    return { success: false, finalAmount: 0, breakdown: { subtotal: 0, discount: 0, deliveryCharge: 0 }, error: error.message };
  }
};

