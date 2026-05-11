const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://127.0.0.1:5000/graphql', {
      operationName: "GetGuestOrders",
      query: `query GetGuestOrders {
        getGuestOrders(input: {page: 1, limit: 5}) {
          orders { orderId }
        }
      }`
    }, {
      headers: {
        'content-type': 'application/json',
        'x-session-id': 'dummy-session-id',
        'x-mobile-key': 'ltf-mob-78a855de2fbd6b5da0f0430a60a502a9'
      }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error(err.response?.data || err.message);
  }
}
test();
