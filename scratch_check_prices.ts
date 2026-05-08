import { checkServiceability } from './lib/nimbuspost';
import { parseWeightToKg } from './lib/weight';

async function test() {
  const pincode = '302028'; // from the screenshot
  const result1 = await checkServiceability({
    pincode,
    weight: 0.5,
    order_amount: 400,
    payment_method: 'prepaid',
  });
  console.log('0.5kg:', result1.data.map((c: any) => c.total_charges).sort((a: number,b: number)=>a-b)[0]);

  const result2 = await checkServiceability({
    pincode,
    weight: 2.5,
    order_amount: 2000,
    payment_method: 'prepaid',
  });
  console.log('2.5kg:', result2.data.map((c: any) => c.total_charges).sort((a: number,b: number)=>a-b)[0]);
}
test();
