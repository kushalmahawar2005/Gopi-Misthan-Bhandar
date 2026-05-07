const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/delivery/check-pincode', {
      pincode: '302028',
      weight: 0.5,
      orderAmount: 400
    });
    console.log('0.5kg response:', JSON.stringify(res.data, null, 2));

  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
