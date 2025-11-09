// Delivery serviceability and charge calculation based on pincode

interface DeliveryZone {
  pincodes: string[] | string; // Array of pincodes or range like "450001-450050"
  zone: 'local' | 'nearby' | 'distant' | 'remote';
  baseCharge: number;
  perKmCharge?: number;
  minOrderForFree: number;
  estimatedDays: number;
}

// Define delivery zones (you can move this to database later)
const deliveryZones: DeliveryZone[] = [
  {
    pincodes: ['458441', '458001', '458002', '458003'], // Neemuch and nearby
    zone: 'local',
    baseCharge: 0,
    minOrderForFree: 500,
    estimatedDays: 1,
  },
  {
    pincodes: ['458004', '458005', '458010', '458020', '458030'], // Nearby areas
    zone: 'nearby',
    baseCharge: 30,
    minOrderForFree: 1000,
    estimatedDays: 2,
  },
  {
    pincodes: ['450001-450050', '451001-451050', '452001-452050'], // Distant areas
    zone: 'distant',
    baseCharge: 80,
    minOrderForFree: 2000,
    estimatedDays: 3,
  },
  {
    pincodes: 'all', // All other pincodes
    zone: 'remote',
    baseCharge: 150,
    minOrderForFree: 5000,
    estimatedDays: 5,
  },
];

// Store pincode (Neemuch)
const STORE_PINCODE = '458441';

export interface DeliveryInfo {
  isServiceable: boolean;
  deliveryCharge: number;
  estimatedDays: number;
  zone: string;
  message?: string;
}

export const checkPincodeServiceability = (pincode: string, orderAmount: number = 0): DeliveryInfo => {
  if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
    return {
      isServiceable: false,
      deliveryCharge: 0,
      estimatedDays: 0,
      zone: 'invalid',
      message: 'Invalid pincode',
    };
  }

  // Find matching zone
  let matchedZone: DeliveryZone | null = null;

  for (const zone of deliveryZones) {
    if (zone.pincodes === 'all') {
      matchedZone = zone;
      break;
    }

    if (Array.isArray(zone.pincodes)) {
      if (zone.pincodes.includes(pincode)) {
        matchedZone = zone;
        break;
      }
    } else if (typeof zone.pincodes === 'string' && zone.pincodes.includes('-')) {
      // Handle range like "450001-450050"
      const [start, end] = zone.pincodes.split('-').map(Number);
      const pincodeNum = Number(pincode);
      if (pincodeNum >= start && pincodeNum <= end) {
        matchedZone = zone;
        break;
      }
    }
  }

  if (!matchedZone) {
    // Default to remote zone
    matchedZone = deliveryZones[deliveryZones.length - 1];
  }

  // Calculate delivery charge
  let deliveryCharge = matchedZone.baseCharge;

  // Free delivery if order amount is above threshold
  if (orderAmount >= matchedZone.minOrderForFree) {
    deliveryCharge = 0;
  }

  return {
    isServiceable: true,
    deliveryCharge,
    estimatedDays: matchedZone.estimatedDays,
    zone: matchedZone.zone,
    message: deliveryCharge === 0 
      ? `Free delivery! Order above ₹${matchedZone.minOrderForFree}` 
      : `Delivery charge: ₹${deliveryCharge}`,
  };
};

export const getDeliveryZones = (): DeliveryZone[] => {
  return deliveryZones;
};

