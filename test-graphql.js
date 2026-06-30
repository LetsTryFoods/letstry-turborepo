const axios = require('axios');

async function testGraphQL() {
  const query = `
    mutation AssignBoxToOrder($input: AssignBoxToOrderInput!) {
      assignBoxToOrder(input: $input) {
        orderId
        boxId
        volumetricWeight
        region
        logisticsCost
      }
    }
  `;
  // Replace with an actual orderId that is in state to be packed. We just want to see what is returned.
  // First fetch an order
  const getQuery = `
    query {
      getAllOrders(input: { page: 1, limit: 1 }) {
        orders {
          orderId
        }
      }
    }
  `;
  try {
    const resOrders = await axios.post('http://localhost:5000/graphql', { query: getQuery }, {
      headers: { 'Content-Type': 'application/json' } // Add Auth token if needed?
    });
    console.log("Orders:", JSON.stringify(resOrders.data));
  } catch (e) { }
}
testGraphQL();
