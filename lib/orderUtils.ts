import Product from '@/models/Product';
import Coupon from '@/models/Coupon';

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
  appliedCouponCode?: string;
  error?: string;
  products?: any[]; // For further use if needed
}

function isCouponApplicableToCart(coupon: any, products: any[]): boolean {
  const applicableTo = coupon.applicableTo || 'all';

  if (applicableTo === 'all') {
    return true;
  }

  if (applicableTo === 'category') {
    const allowed = (coupon.categories || []).map((value: any) => String(value));
    if (allowed.length === 0) {
      return false;
    }

    return products.some((product) => {
      const category = String(product.category || '');
      const subcategory = String(product.subcategory || '');
      return allowed.includes(category) || (subcategory ? allowed.includes(subcategory) : false);
    });
  }

  if (applicableTo === 'product') {
    const allowedProductIds = (coupon.products || []).map((value: any) => String(value));
    if (allowedProductIds.length === 0) {
      return false;
    }

    return products.some((product) => allowedProductIds.includes(String(product._id)));
  }

  return false;
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
        category: product.category,
        subcategory: product.subcategory,
        price: itemPrice,
        quantity: item.quantity,
        image: product.image,
        weight: item.weight || product.defaultWeight
      });
    }


    let discount = 0;
    let appliedCouponCode: string | undefined;

    // 2. Validate and apply coupon
    if (couponCode) {
      const normalizedCouponCode = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({ code: normalizedCouponCode, isActive: true });

      if (!coupon) {
        return {
          success: false,
          finalAmount: 0,
          breakdown: { subtotal: 0, discount: 0, deliveryCharge: 0 },
          error: 'Invalid or inactive coupon code',
        };
      }

      const now = new Date();
      if (now < coupon.startDate || now > coupon.endDate) {
        return {
          success: false,
          finalAmount: 0,
          breakdown: { subtotal: 0, discount: 0, deliveryCharge: 0 },
          error: 'Coupon is not valid at this time',
        };
      }

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return {
          success: false,
          finalAmount: 0,
          breakdown: { subtotal: 0, discount: 0, deliveryCharge: 0 },
          error: 'Coupon usage limit has been reached',
        };
      }

      if (subtotal < coupon.minimumPurchase) {
        return {
          success: false,
          finalAmount: 0,
          breakdown: { subtotal: 0, discount: 0, deliveryCharge: 0 },
          error: `Minimum purchase of ${coupon.minimumPurchase} required for this coupon`,
        };
      }

      if (!isCouponApplicableToCart(coupon, validatedProducts)) {
        return {
          success: false,
          finalAmount: 0,
          breakdown: { subtotal: 0, discount: 0, deliveryCharge: 0 },
          error: 'Coupon is not applicable to selected cart items',
        };
      }

      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
          discount = coupon.maximumDiscount;
        }
      } else if (coupon.discountType === 'fixed') {
        discount = coupon.discountValue;
      }

      if (discount > 0) {
        appliedCouponCode = normalizedCouponCode;
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
      appliedCouponCode,
      products: validatedProducts
    };
  } catch (error: any) {
    console.error('Error in calculateOrderAmount:', error);
    return { success: false, finalAmount: 0, breakdown: { subtotal: 0, discount: 0, deliveryCharge: 0 }, error: error.message };
  }
};

