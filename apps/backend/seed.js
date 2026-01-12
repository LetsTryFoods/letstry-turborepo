const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const mongoUri = process.env.DATABASE_URL || 'mongodb://admin:password@localhost:27017/letstry_dev?authSource=admin';

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    imageUrl: String,
    description: String,
    codeValue: String,
    inCodeSet: String,
    productCount: { type: Number, default: 0 },
    isArchived: { type: Boolean, default: false }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    categoryIds: [String],
    brand: String,
    currency: { type: String, default: 'INR' },
    ingredients: String,
    shelfLife: String,
    isVegetarian: { type: Boolean, default: true },
    isGlutenFree: { type: Boolean, default: false },
    variants: [{
        sku: String,
        name: String,
        price: Number,
        mrp: Number,
        discountPercent: Number,
        discountSource: String,
        weight: Number,
        weightUnit: String,
        packageSize: String,
        length: Number,
        height: Number,
        breadth: Number,
        stockQuantity: Number,
        availabilityStatus: String,
        images: [{ url: String, alt: String }],
        thumbnailUrl: String,
        isDefault: Boolean,
        isActive: Boolean
    }],
    images: [{ url: String, alt: String }],
    isArchived: { type: Boolean, default: false }
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const Product = mongoose.model('Product', ProductSchema);

const PackerSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    passwordHash: { type: String, required: true },
    status: { type: String, enum: ['idle', 'packing', 'offline', 'on_break'], default: 'offline' },
    totalOrdersPacked: { type: Number, default: 0 },
    accuracyRate: { type: Number, default: 0 },
    averagePackTime: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    lastActiveAt: Date,
    currentOrderId: String,
    shiftInfo: {
        shiftStart: Date,
        shiftEnd: Date
    }
}, { timestamps: true });

const PackingOrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    orderNumber: { type: String, required: true },
    status: { type: String, enum: ['pending', 'assigned', 'packing', 'completed', 'failed'], default: 'pending' },
    priority: { type: Number, required: true },
    assignedTo: String,
    assignedAt: Date,
    items: [{
        productId: String,
        sku: String,
        ean: String,
        name: String,
        quantity: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number,
            weight: Number,
            unit: String
        },
        isFragile: Boolean,
        imageUrl: String
    }],
    hasErrors: { type: Boolean, default: false },
    retrospectiveErrors: [{
        errorType: String,
        flaggedAt: Date,
        flaggedBy: String,
        notes: String,
        severity: String,
        source: String
    }],
    packingStartedAt: Date,
    packingCompletedAt: Date,
    estimatedPackTime: Number,
    specialInstructions: String,
    isExpress: { type: Boolean, default: false }
}, { timestamps: true });

const PackingEvidenceSchema = new mongoose.Schema({
    packingOrderId: { type: String, required: true },
    packerId: { type: String, required: true },
    prePackImages: [String],
    postPackImages: [String],
    recommendedBox: {
        code: String,
        dimensions: { l: Number, w: Number, h: Number }
    },
    actualBox: {
        code: String,
        dimensions: { l: Number, w: Number, h: Number }
    },
    boxMismatch: { type: Boolean, default: false },
    detectedBoxDimensions: { l: Number, w: Number, h: Number },
    dimensionConfidence: Number,
    uploadedAt: Date
}, { timestamps: true });

const BoxSizeSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    internalDimensions: { l: Number, w: Number, h: Number },
    maxWeight: { type: Number, required: true },
    cost: { type: Number, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    identityId: mongoose.Schema.Types.ObjectId,
    placerContact: {
        phone: String,
        email: String
    },
    recipientContact: {
        phone: { type: String, required: true },
        email: String
    },
    paymentOrderId: mongoose.Schema.Types.ObjectId,
    cartId: mongoose.Schema.Types.ObjectId,
    totalAmount: { type: String, required: true },
    subtotal: String,
    discount: { type: String, default: '0' },
    deliveryCharge: { type: String, default: '0' },
    currency: { type: String, required: true },
    orderStatus: {
        type: String,
        enum: ['CONFIRMED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED'],
        default: 'CONFIRMED'
    },
    shippingAddressId: mongoose.Schema.Types.ObjectId,
    items: [{
        variantId: mongoose.Schema.Types.ObjectId,
        quantity: Number
    }],
    deliveredAt: Date,
    cancelledAt: Date,
    trackingNumber: String,
    cancellationReason: String,
    metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const Packer = mongoose.model('Packer', PackerSchema);
const PackingOrder = mongoose.model('PackingOrder', PackingOrderSchema);
const PackingEvidence = mongoose.model('PackingEvidence', PackingEvidenceSchema);
const BoxSize = mongoose.model('BoxSize', BoxSizeSchema);
const Order = mongoose.model('Order', OrderSchema);

const AddressSchema = new mongoose.Schema({
    identityId: { type: String, required: true },
    addressType: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    recipientName: { type: String, required: true },
    buildingName: { type: String, required: true },
    floor: String,
    streetArea: String,
    landmark: String,
    addressLocality: { type: String, required: true },
    addressRegion: { type: String, required: true },
    postalCode: { type: String, required: true },
    addressCountry: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    formattedAddress: { type: String, required: true },
    placeId: String
}, { timestamps: true });

const Address = mongoose.model('Address', AddressSchema);

const IdentitySchema = new mongoose.Schema({
    identityId: { type: String, required: true, unique: true },
    phoneNumber: String,
    email: String,
    firstName: String,
    lastName: String,
    status: { type: String, default: 'active' },
    role: { type: String, default: 'user' }
}, { timestamps: true });

const PaymentEventSchema = new mongoose.Schema({
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', required: true },
    identityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Identity', required: true },
    totalAmount: { type: String, required: true },
    currency: { type: String, required: true },
    isPaymentDone: { type: Boolean, default: false },
    metadata: { type: Object }
}, { timestamps: true });

const PaymentOrderSchema = new mongoose.Schema({
    paymentOrderId: { type: String, required: true, unique: true },
    paymentEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentEvent', required: true },
    identityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Identity', required: true },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    amount: { type: String, required: true },
    currency: { type: String, required: true },
    paymentOrderStatus: { type: String, default: 'SUCCESS' },
    paymentMethod: String,
    pspTxnId: String,
    pspOrderId: String,
    pspToken: String,
    bankTxnId: String,
    cardType: String,
    cardNumber: String,
    paymentMode: String,
    cardScheme: String,
    cardToken: String,
    bankName: String,
    bankId: String,
    paymentMethodId: String,
    cardHashId: String,
    productDescription: String,
    pspTxnTime: Date,
    idempotencyKey: String,
    idempotencyKeyExpiresAt: Date,
    ledgerUpdated: { type: Boolean, default: false },
    retryCount: { type: Number, default: 0 },
    pspResponseCode: String,
    pspResponseMessage: String,
    failureReason: String,
    executedAt: Date,
    completedAt: Date,
    pspRawResponse: { type: Object }
}, { timestamps: true });

const Identity = mongoose.model('Identity', IdentitySchema);
const PaymentEvent = mongoose.model('PaymentEvent', PaymentEventSchema);
const PaymentOrder = mongoose.model('PaymentOrder', PaymentOrderSchema);

const categoryImageUrl = 'https://d11a0m43ek7ap8.cloudfront.net/eaffe2ce9255d74a4ee81d3a20bdace9.webp';
const productImageUrl = 'https://d11a0m43ek7ap8.cloudfront.net/baf14c8fb442c0eadd20e2939de06905.webp';

const categoryNames = [
    'Fruits & Vegetables', 'Dairy & Bakery', 'Snacks & Branded Foods', 'Beverages',
    'Personal Care', 'Home Care', 'Baby Care', 'Meat & Seafood',
    'Breakfast & Instant Food', 'Grains, Oils & Masala', 'Kitchen & Dining', 'Cleaning & Household',
    'Beauty & Hygiene', 'Gourmet & World Food', 'Eggs, Meat & Fish', 'Health & Wellness',
    'Stationery & Office', 'Pet Care', 'Frozen Food', 'Organic & Healthy'
];

async function seed() {
    try {
        await mongoose.connect(mongoUri);

        await Category.deleteMany({});
        await Product.deleteMany({});
        await Address.deleteMany({});
        await Identity.deleteMany({});
        await PaymentEvent.deleteMany({});
        await PaymentOrder.deleteMany({});
        await Packer.deleteMany({});
        await PackingOrder.deleteMany({});
        await PackingEvidence.deleteMany({});
        await BoxSize.deleteMany({});
        await Order.deleteMany({});

        const boxSizes = await BoxSize.insertMany([
            { code: 'BOX-S', name: 'Small Box', internalDimensions: { l: 20, w: 15, h: 10 }, maxWeight: 5, cost: 10, isActive: true },
            { code: 'BOX-M', name: 'Medium Box', internalDimensions: { l: 30, w: 25, h: 15 }, maxWeight: 10, cost: 15, isActive: true },
            { code: 'BOX-L', name: 'Large Box', internalDimensions: { l: 40, w: 35, h: 25 }, maxWeight: 20, cost: 25, isActive: true },
            { code: 'BOX-XL', name: 'Extra Large Box', internalDimensions: { l: 50, w: 45, h: 35 }, maxWeight: 30, cost: 35, isActive: true }
        ]);

        const passwordHash = await bcrypt.hash('packer123', 10);

        const packers = await Packer.insertMany([
            {
                employeeId: 'PKR001',
                name: 'Rajesh Kumar',
                phone: '9876543210',
                email: 'rajesh@letstry.com',
                passwordHash,
                status: 'idle',
                totalOrdersPacked: 45,
                accuracyRate: 96.5,
                averagePackTime: 180,
                isActive: true,
                lastActiveAt: new Date()
            },
            {
                employeeId: 'PKR002',
                name: 'Priya Sharma',
                phone: '9876543211',
                email: 'priya@letstry.com',
                passwordHash,
                status: 'packing',
                totalOrdersPacked: 38,
                accuracyRate: 98.2,
                averagePackTime: 165,
                isActive: true,
                lastActiveAt: new Date()
            },
            {
                employeeId: 'PKR003',
                name: 'Amit Patel',
                phone: '9876543212',
                email: 'amit@letstry.com',
                passwordHash,
                status: 'offline',
                totalOrdersPacked: 52,
                accuracyRate: 94.8,
                averagePackTime: 195,
                isActive: true,
                lastActiveAt: new Date(Date.now() - 86400000)
            },
            {
                employeeId: 'PKR004',
                name: 'Sunita Verma',
                phone: '9876543213',
                email: 'sunita@letstry.com',
                passwordHash,
                status: 'offline',
                totalOrdersPacked: 28,
                accuracyRate: 91.5,
                averagePackTime: 210,
                isActive: false,
                lastActiveAt: new Date(Date.now() - 604800000)
            },
            {
                employeeId: 'PKR005',
                name: 'Vikram Singh',
                phone: '9876543214',
                email: 'vikram@letstry.com',
                passwordHash,
                status: 'on_break',
                totalOrdersPacked: 41,
                accuracyRate: 97.1,
                averagePackTime: 175,
                isActive: true,
                lastActiveAt: new Date()
            }
        ]);

        const allProducts = [];
        for (let i = 0; i < categoryNames.length; i++) {
            const catName = categoryNames[i];
            const catSlug = catName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');

            const category = await Category.create({
                name: catName,
                slug: catSlug,
                imageUrl: categoryImageUrl,
                description: `Premium ${catName} for your daily needs.`,
                codeValue: `CAT${(i + 1).toString().padStart(3, '0')}`,
                inCodeSet: 'CATEGORIES'
            });

            const productsToInsert = [];
            for (let j = 1; j <= 10; j++) {
                const productName = `${catName} Item ${j}`;
                const productSlug = `${catSlug}-item-${j}`;
                const images = [
                    { url: productImageUrl, alt: `${productName} image 1` },
                    { url: productImageUrl, alt: `${productName} image 2` },
                    { url: productImageUrl, alt: `${productName} image 3` }
                ];

                productsToInsert.push({
                    name: productName,
                    slug: productSlug,
                    description: `High quality ${productName} sourced from the best suppliers. This product is part of our ${catName} collection.`,
                    categoryIds: [category._id.toString()],
                    brand: 'LetsTry',
                    currency: 'INR',
                    ingredients: 'Natural ingredients, no artificial preservatives.',
                    shelfLife: '12 months',
                    isVegetarian: true,
                    isGlutenFree: false,
                    images: images,
                    variants: [
                        {
                            sku: `${productSlug}-v1`,
                            name: `${productName} - Standard`,
                            price: 100 + (j * 10),
                            mrp: 120 + (j * 10),
                            discountPercent: 15,
                            discountSource: 'product',
                            weight: 500,
                            weightUnit: 'g',
                            packageSize: 'Medium',
                            length: 10, height: 15, breadth: 5,
                            stockQuantity: 50,
                            availabilityStatus: 'in_stock',
                            images: images,
                            thumbnailUrl: productImageUrl,
                            isDefault: true,
                            isActive: true
                        },
                        {
                            sku: `${productSlug}-v2`,
                            name: `${productName} - Large`,
                            price: 180 + (j * 15),
                            mrp: 220 + (j * 15),
                            discountPercent: 18,
                            discountSource: 'product',
                            weight: 1,
                            weightUnit: 'kg',
                            packageSize: 'Large',
                            length: 15, height: 20, breadth: 8,
                            stockQuantity: 30,
                            availabilityStatus: 'in_stock',
                            images: images,
                            thumbnailUrl: productImageUrl,
                            isDefault: false,
                            isActive: true
                        }
                    ]
                });
            }

            const insertedProducts = await Product.insertMany(productsToInsert);
            allProducts.push(...insertedProducts);

            const count = await Product.countDocuments({ categoryIds: category._id.toString() });
            await Category.updateOne({ _id: category._id }, { productCount: count });
        }

        const identities = [];
        for (let i = 0; i < 30; i++) {
            identities.push({
                identityId: `IDENTITY_${Date.now()}_${i}`,
                phoneNumber: `98765432${10 + i}`,
                email: `customer${i}@example.com`,
                firstName: `Customer`,
                lastName: `${i}`,
                status: 'active',
                role: 'user'
            });
        }
        const createdIdentities = await Identity.insertMany(identities);

        const addresses = [];
        const cities = [
            { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777 },
            { name: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025 },
            { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946 },
            { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867 },
            { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707 }
        ];

        for (let i = 0; i < 30; i++) {
            const city = cities[i % cities.length];
            addresses.push({
                identityId: createdIdentities[i]._id.toString(),
                addressType: ['home', 'work', 'other'][Math.floor(Math.random() * 3)],
                recipientPhone: `98765432${10 + i}`,
                recipientName: `Customer ${i}`,
                buildingName: `${Math.floor(Math.random() * 999) + 1}, Building ${Math.floor(Math.random() * 50) + 1}`,
                floor: `Floor ${Math.floor(Math.random() * 10) + 1}`,
                streetArea: `Street ${Math.floor(Math.random() * 100) + 1}, Area ${Math.floor(Math.random() * 20) + 1}`,
                landmark: ['Near Mall', 'Near Park', 'Near School', 'Near Hospital', 'Near Temple'][Math.floor(Math.random() * 5)],
                addressLocality: city.name,
                addressRegion: city.state,
                postalCode: `${400000 + Math.floor(Math.random() * 99999)}`,
                addressCountry: 'India',
                isDefault: i % 5 === 0,
                latitude: city.lat + (Math.random() - 0.5) * 0.1,
                longitude: city.lng + (Math.random() - 0.5) * 0.1,
                formattedAddress: `${Math.floor(Math.random() * 999) + 1}, Street ${Math.floor(Math.random() * 100) + 1}, ${city.name}, ${city.state}, India`
            });
        }

        const createdAddresses = await Address.insertMany(addresses);

        const paymentEvents = [];
        for (let i = 0; i < 25; i++) {
            const amount = Math.floor(Math.random() * 1500) + 300;
            paymentEvents.push({
                cartId: new mongoose.Types.ObjectId(),
                identityId: createdIdentities[i % createdIdentities.length]._id,
                totalAmount: amount.toString(),
                currency: 'INR',
                isPaymentDone: true,
                metadata: { source: 'seed' }
            });
        }
        const createdPaymentEvents = await PaymentEvent.insertMany(paymentEvents);

        const paymentOrders = [];
        for (let i = 0; i < 25; i++) {
            const amount = createdPaymentEvents[i].totalAmount;
            const method = ['UPI', 'CARD', 'NET_BANKING', 'WALLET'][Math.floor(Math.random() * 4)];
            const completedAt = new Date(Date.now() - Math.random() * 604800000);
            const pspOrderId = `PSP_ORD_${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
            const pspTxnId = `TXN${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
            
            paymentOrders.push({
                paymentOrderId: `PAY_${Date.now()}_${i}`,
                paymentEventId: createdPaymentEvents[i]._id,
                identityId: createdIdentities[i % createdIdentities.length]._id,
                amount: amount,
                currency: 'INR',
                paymentOrderStatus: 'SUCCESS',
                paymentMethod: method,
                pspTxnId: pspTxnId,
                pspOrderId: pspOrderId,
                pspToken: method === 'CARD' ? `TOKEN_${Math.random().toString(36).substring(2, 12).toUpperCase()}` : null,
                bankTxnId: `BANK${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
                cardType: method === 'CARD' ? ['CREDIT', 'DEBIT'][Math.floor(Math.random() * 2)] : null,
                cardNumber: method === 'CARD' ? `XXXX-XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}` : null,
                paymentMode: method,
                cardScheme: method === 'CARD' ? ['VISA', 'MASTERCARD', 'RUPAY'][Math.floor(Math.random() * 3)] : null,
                cardToken: method === 'CARD' ? `CARD_${Math.random().toString(36).substring(2, 12).toUpperCase()}` : null,
                bankName: method === 'NET_BANKING' ? ['HDFC', 'ICICI', 'SBI', 'AXIS'][Math.floor(Math.random() * 4)] : null,
                bankId: method === 'NET_BANKING' ? `BANK_${Math.floor(Math.random() * 1000)}` : null,
                paymentMethodId: `PM_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                cardHashId: method === 'CARD' ? `HASH_${Math.random().toString(36).substring(2, 15).toUpperCase()}` : null,
                productDescription: 'E-commerce Purchase',
                pspTxnTime: completedAt,
                ledgerUpdated: true,
                retryCount: 0,
                pspResponseCode: '200',
                pspResponseMessage: 'Transaction successful',
                executedAt: completedAt,
                completedAt: completedAt,
                pspRawResponse: { 
                    status: 'SUCCESS',
                    txnId: pspTxnId,
                    orderId: pspOrderId,
                    amount: amount,
                    method: method
                }
            });
        }
        const createdPaymentOrders = await PaymentOrder.insertMany(paymentOrders);

        const orders = [];
        for (let i = 0; i < 25; i++) {
            const orderNumber = `ORD${(1000 + i).toString()}`;
            const itemCount = Math.floor(Math.random() * 4) + 1;
            const orderItems = [];
            let totalAmount = 0;

            for (let j = 0; j < itemCount; j++) {
                const product = allProducts[Math.floor(Math.random() * allProducts.length)];
                const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
                const quantity = Math.floor(Math.random() * 3) + 1;
                const itemSubtotal = variant.price * quantity;
                orderItems.push({
                    variantId: variant._id,
                    quantity
                });
                totalAmount += itemSubtotal;
            }

            const subtotal = totalAmount;
            const discount = Math.random() > 0.7 ? Math.floor(totalAmount * 0.1) : 0;
            const deliveryCharge = totalAmount > 500 ? 0 : 50;
            totalAmount = totalAmount - discount + deliveryCharge;

            let orderStatus = 'CONFIRMED';
            let deliveredAt = null;
            let cancelledAt = null;
            let trackingNumber = null;

            const statusRand = Math.random();
            if (statusRand < 0.2) {
                orderStatus = 'CONFIRMED';
            } else if (statusRand < 0.4) {
                orderStatus = 'PACKED';
            } else if (statusRand < 0.6) {
                orderStatus = 'SHIPPED';
                trackingNumber = `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            } else if (statusRand < 0.8) {
                orderStatus = 'IN_TRANSIT';
                trackingNumber = `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            } else {
                orderStatus = 'DELIVERED';
                deliveredAt = new Date(Date.now() - Math.random() * 604800000);
                trackingNumber = `TRK${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
            }

            orders.push({
                orderId: orderNumber,
                identityId: createdIdentities[i % createdIdentities.length]._id,
                placerContact: {
                    phone: `98765432${10 + i}`,
                    email: `customer${i}@example.com`
                },
                recipientContact: {
                    phone: `98765432${10 + i}`,
                    email: `customer${i}@example.com`
                },
                paymentOrderId: createdPaymentOrders[i]._id,
                cartId: new mongoose.Types.ObjectId(),
                totalAmount: totalAmount.toString(),
                subtotal: subtotal.toString(),
                discount: discount.toString(),
                deliveryCharge: deliveryCharge.toString(),
                currency: 'INR',
                orderStatus,
                shippingAddressId: createdAddresses[i % createdAddresses.length]._id,
                items: orderItems,
                deliveredAt,
                cancelledAt,
                trackingNumber,
                metadata: {
                    source: 'seed',
                    isSeedData: true
                }
            });
        }

        const createdOrders = await Order.insertMany(orders);

        for (let i = 0; i < createdPaymentOrders.length; i++) {
            await PaymentOrder.findByIdAndUpdate(
                createdPaymentOrders[i]._id,
                { orderId: createdOrders[i]._id }
            );
        }

        const packingOrders = [];

        for (let i = 0; i < 15; i++) {
            const orderNumber = `ORD${(1000 + i).toString()}`;
            const orderId = new mongoose.Types.ObjectId().toString();
            const itemCount = Math.floor(Math.random() * 3) + 1;
            const items = [];

            for (let j = 0; j < itemCount; j++) {
                const product = allProducts[Math.floor(Math.random() * allProducts.length)];
                const variant = product.variants[0];
                items.push({
                    productId: product._id.toString(),
                    sku: variant.sku,
                    ean: `EAN${Math.random().toString().slice(2, 15)}`,
                    name: product.name,
                    quantity: Math.floor(Math.random() * 3) + 1,
                    dimensions: {
                        length: variant.length || 10,
                        width: variant.breadth || 10,
                        height: variant.height || 10,
                        weight: variant.weight || 500,
                        unit: 'cm'
                    },
                    isFragile: Math.random() > 0.7,
                    imageUrl: variant.thumbnailUrl
                });
            }

            let status = 'pending';
            let assignedTo = null;
            let assignedAt = null;
            let packingStartedAt = null;
            let packingCompletedAt = null;

            if (i < 3) {
                status = 'pending';
            } else if (i < 7) {
                status = 'assigned';
                assignedTo = packers[i % packers.length]._id.toString();
                assignedAt = new Date(Date.now() - Math.random() * 3600000);
            } else if (i < 11) {
                status = 'packing';
                assignedTo = packers[i % packers.length]._id.toString();
                assignedAt = new Date(Date.now() - Math.random() * 7200000);
                packingStartedAt = new Date(Date.now() - Math.random() * 3600000);
            } else {
                status = 'completed';
                assignedTo = packers[i % packers.length]._id.toString();
                assignedAt = new Date(Date.now() - Math.random() * 86400000);
                packingStartedAt = new Date(Date.now() - Math.random() * 86400000);
                packingCompletedAt = new Date(Date.now() - Math.random() * 43200000);
            }

            packingOrders.push({
                orderId,
                orderNumber,
                status,
                priority: Math.floor(Math.random() * 100),
                assignedTo,
                assignedAt,
                items,
                hasErrors: Math.random() > 0.9,
                packingStartedAt,
                packingCompletedAt,
                estimatedPackTime: 180 + Math.random() * 120,
                specialInstructions: i % 5 === 0 ? 'Handle with care - fragile items' : '',
                isExpress: i % 7 === 0
            });
        }

        const insertedOrders = await PackingOrder.insertMany(packingOrders);

        const evidences = [];
        for (let order of insertedOrders) {
            if (order.status === 'completed') {
                const recommendedBox = boxSizes[Math.floor(Math.random() * boxSizes.length)];
                const actualBox = Math.random() > 0.2 ? recommendedBox : boxSizes[Math.floor(Math.random() * boxSizes.length)];

                evidences.push({
                    packingOrderId: order._id.toString(),
                    packerId: order.assignedTo,
                    prePackImages: [
                        'https://d11a0m43ek7ap8.cloudfront.net/evidence-pre-1.jpg',
                        'https://d11a0m43ek7ap8.cloudfront.net/evidence-pre-2.jpg'
                    ],
                    postPackImages: [
                        'https://d11a0m43ek7ap8.cloudfront.net/evidence-post-1.jpg'
                    ],
                    recommendedBox: {
                        code: recommendedBox.code,
                        dimensions: recommendedBox.internalDimensions
                    },
                    actualBox: {
                        code: actualBox.code,
                        dimensions: actualBox.internalDimensions
                    },
                    boxMismatch: recommendedBox.code !== actualBox.code,
                    uploadedAt: order.packingCompletedAt
                });
            }
        }

        if (evidences.length > 0) {
            await PackingEvidence.insertMany(evidences);
        }

        process.exit(0);
    } catch (error) {
        console.error('Seed failed:', error);
        process.exit(1);
    }
}

seed();
