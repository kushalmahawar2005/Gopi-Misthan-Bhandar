require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

async function test() {
  const origin = process.env.SENDER_PINCODE || '302028';
  
  const tokenResp = await axios.post('https://api.nimbuspost.com/v1/users/login', {
      email: process.env.NIMBUSPOST_CLIENT_ID,
      password: process.env.NIMBUSPOST_API_KEY,
  });
  const token = tokenResp.data.data;
  
  const nimbusClient = axios.create({
    baseURL: 'https://api.nimbuspost.com/v1',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  try {
    const res1 = await nimbusClient.post('/courier/serviceability', {
        origin, destination: '302028', weight: 500, order_amount: 400, payment_method: 'prepaid', payment_type: 'prepaid'
    });
    console.log('0.5kg raw response data exists:', !!res1.data?.data);
    if(res1.data?.data) {
        const c1 = res1.data.data.map(c => Number(c.total_charges)).sort((a,b)=>a-b)[0];
        console.log('0.5kg (Base):', c1, 'Customer pays:', c1);
    } else {
        console.log('0.5kg API Error:', res1.data);
    }
    
    const res2 = await nimbusClient.post('/courier/serviceability', {
        origin, destination: '302028', weight: 2500, order_amount: 2000, payment_method: 'prepaid', payment_type: 'prepaid'
    });
    if(res2.data?.data) {
        const c2 = res2.data.data.map(c => Number(c.total_charges)).sort((a,b)=>a-b)[0];
        console.log('2.5kg (Base):', c2, 'Customer pays (30% off):', Math.round(c2 * 0.7));
    } else {
        console.log('2.5kg API Error:', res2.data);
    }
  } catch(e) {
      console.error(e.response ? e.response.data : e.message);
  }
}
test();
