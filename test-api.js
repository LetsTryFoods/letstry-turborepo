const fetch = require('node-fetch');

const query = `
  query SearchProducts($searchTerm: String!) {
    searchProducts(searchTerm: $searchTerm) {
      items {
        name
        availableVariants {
          stockQuantity
          availabilityStatus
        }
        defaultVariant {
          stockQuantity
          availabilityStatus
        }
      }
    }
  }
`;

fetch('https://api.letstryfoods.com/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { searchTerm: "Peanut Party Mix" } })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
