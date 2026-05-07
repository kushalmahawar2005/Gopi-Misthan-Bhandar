const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:3000/api/delivery/check-pincode', {
      pincode: '302028',
      weight: 2.5,
      orderAmount: 2000
    });
    console.log('2.5kg response:', JSON.stringify(res.data, null, 2));

    const res2 = await axios.post('http://localhost:3000/api/delivery/check-pincode', {
      pincode: '302028',
      weight: 4.5,
      orderAmount: 2520
    });
    console.log('4.5kg response:', JSON.stringify(res2.data, null, 2));

  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
