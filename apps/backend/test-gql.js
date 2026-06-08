const axios = require('axios');

async function run() {
  try {
    const res = await axios.post('http://localhost:5000/graphql', {
      query: `
        query {
          products(page: 1, limit: 10, includeOutOfStock: true, includeArchived: false) {
            meta {
              totalCount
            }
          }
        }
      `
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    if (err.response) console.error(JSON.stringify(err.response.data, null, 2));
    else console.error(err.message);
  }
}
run();
