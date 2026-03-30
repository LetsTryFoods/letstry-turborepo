// // Valid users with UNIQUE passwords
// export const USERS = [
//   { 
//     id: '100', 
//     username: 'admin', 
//     password: 'admin123', 
//     name: 'System Admin', 
//     role: 'Manager' 
//   },
//   { 
//     id: '401', 
//     username: 'raj', 
//     password: 'raj2024', 
//     name: 'Raj Kumar', 
//     role: 'Packer' 
//   },
//   { 
//     id: '402', 
//     username: 'ankush', 
//     password: 'ankush2024', 
//     name: 'Ankush Singh', 
//     role: 'Packer' 
//   },
// ];

// export const MOCK_ORDERS = [
//   {
//     id: 'ORD-9942',
//     itemsCount: 8,
//     status: 'Pending',
//     isUrgent: false,
//   },
//   {
//     id: 'ORD-9945',
//     itemsCount: 7, // Increased items count
//     status: 'Urgent',
//     isUrgent: true,
//     items: [
//       { 
//         id: 'i1', 
//         name: 'masala boondi', 
//         sku: 'MG-RD-01', 
//         ean: '8906161391310', // Test EAN 1
//         qty: 9, 
//         packed: false, 
//         imageUri: 'https://via.placeholder.com/100/AA0000/FFFFFF?text=Mug' 
//       },
//       { 
//         id: 'i2', 
//         name: 'Makhana Puff', 
//         sku: 'EL-MS-WL', 
//         ean: '8906161391051', // Test EAN 2
//         qty: 2, // Quantity 2 hai, matlab 2 baar scan karna padega
//         packed: false, 
//         imageUri: 'https://via.placeholder.com/100/333333/FFFFFF?text=Mouse' 
//       },

//     ]
//   },
//   {
//     id: 'ORD-9948',
//     itemsCount: 12,
//     status: 'Pending',
//     isUrgent: false,
//   },
// ];




import { INVENTORY } from './inventory';

// Valid users
export const USERS = [
  { id: '100', username: 'admin', password: 'admin123', name: 'System Admin', role: 'Manager' },
  { id: '401', username: 'raj', password: 'raj2024', name: 'Raj Kumar', role: 'Packer' },
  { id: '402', username: 'ankush', password: 'ankush2024', name: 'Ankush Singh', role: 'Packer' },
];

// Helper to get random items
const getRandomItems = (count) => {
  // Inventory ko shuffle karo
  const shuffled = [...INVENTORY].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, count).map((item, index) => {
    
    // --- FIX IMAGE URL HERE ---
    // Product ke naam ka pehla shabd utha ke URL banayenge taaki space ka issue na aaye
    const safeName = item.name.split(' ')[0]; 
    // Hum 'placehold.co' use karenge jo fast hai aur https support karta hai
    const dynamicImage = `https://placehold.co/150/e2e8f0/4338ca?text=${safeName}`;

    return {
      id: `i${index}`, 
      ...item,
      qty: Math.floor(Math.random() * 3) + 1, // Random Qty 1-3
      packed: false,
      scannedCount: 0,
      imageUri: dynamicImage, // <--- Nayi Generated Image
    };
  });
};

export const MOCK_ORDERS = [
  {
    id: 'ORD-9942',
    itemsCount: 5,
    status: 'Pending',
    isUrgent: false,
    items: getRandomItems(5),
  },
  {
    id: 'ORD-9945',
    itemsCount: 7,
    status: 'Urgent',
    isUrgent: true,
    items: getRandomItems(7), 
  },
  {
    id: 'ORD-9948',
    itemsCount: 12,
    status: 'Pending',
    isUrgent: false,
    items: getRandomItems(12),
  },
    {
    id: 'ORD-9949123',
    itemsCount: 7, // Increased items count
    status: 'Urgent',
    isUrgent: true,
    items: [
      { 
        id: 'i1', 
        name: 'masala boondi', 
        sku: 'MG-RD-01', 
        ean: '8906161391310', // Test EAN 1
        qty: 3, 
        packed: false, 
        imageUri: 'https://via.placeholder.com/100/AA0000/FFFFFF?text=Mug' 
      },
      { 
        id: 'i2', 
        name: 'Makhana Puff', 
        sku: 'EL-MS-WL', 
        ean: '8906161391051', // Test EAN 2
        qty: 2, // Quantity 2 hai, matlab 2 baar scan karna padega
        packed: false, 
        imageUri: 'https://via.placeholder.com/100/333333/FFFFFF?text=Mouse' 
      },

    ]
  },

  
];