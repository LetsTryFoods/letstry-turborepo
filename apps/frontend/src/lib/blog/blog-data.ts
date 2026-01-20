export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  date: string;
  author: string;
  category: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'healthy-snacking-habits-for-kids',
    title: 'Stories of Good Food and Better Choices',
    excerpt: 'Snacks are more than just quick bites—they are a part of your daily nutrition. Discover how to make healthier snacking choices for you and your family.',
    content: `
      <h2>The Importance of Healthy Snacking</h2>
      <p>Snacks are more than just quick bites—they are a part of your daily nutrition. Whether you're reaching for something mid-morning or need an afternoon pick-me-up, the choices you make can significantly impact your overall health and wellbeing.</p>
      
      <h2>Why Choose Healthy Snacks?</h2>
      <p>Healthy snacking helps maintain energy levels throughout the day, prevents overeating during main meals, and provides essential nutrients that support your body's functions. When you choose nutritious snacks, you're investing in your long-term health.</p>
      
      <h2>Making Better Choices</h2>
      <p>At Let's Try, we believe in making healthy snacking accessible and delicious. Our range of organic and healthy snacks are made with natural ingredients, free from artificial preservatives, and packed with nutrients your body needs.</p>
      
      <h3>Tips for Healthy Snacking:</h3>
      <ul>
        <li>Choose whole grain options over refined grains</li>
        <li>Look for snacks with minimal added sugars</li>
        <li>Include protein-rich snacks to keep you fuller longer</li>
        <li>Stay hydrated throughout the day</li>
        <li>Practice portion control</li>
      </ul>
      
      <h2>Our Commitment to Quality</h2>
      <p>Every product in our store is carefully selected to ensure it meets our high standards for taste and nutrition. From traditional namkeen to innovative healthy cookies, we offer a wide variety of options for every palate.</p>
      
      <p>Remember, healthy snacking is not about restriction—it's about making informed choices that nourish your body while satisfying your taste buds.</p>
    `,
    image: '/placeholder-image.svg',
    date: 'Mar 24, 2025',
    author: "Let's Try Team",
    category: 'Healthy Eating',
  },
  {
    id: '2',
    slug: 'avoiding-processed-foods',
    title: 'Stories of Good Food and Better Choices',
    excerpt: 'Snacks are more than just quick bites—they are a part of your daily nutrition. Learn how to identify and avoid heavily processed foods in your diet.',
    content: `
      <h2>Understanding Processed Foods</h2>
      <p>In today's fast-paced world, processed foods have become a staple in many households. However, not all processing is bad. Understanding the difference between minimally processed and heavily processed foods is key to making better dietary choices.</p>
      
      <h2>What Are Processed Foods?</h2>
      <p>Processed foods are those that have been altered from their natural state. This can range from minimal processing like washing and packaging to extensive processing involving multiple ingredients and chemical additives.</p>
      
      <h3>Types of Processing:</h3>
      <ul>
        <li><strong>Minimally Processed:</strong> Cleaned, cut, or packaged foods like bagged salads or roasted nuts</li>
        <li><strong>Moderately Processed:</strong> Foods with added ingredients like canned vegetables with salt</li>
        <li><strong>Heavily Processed:</strong> Foods with many added ingredients, preservatives, and artificial flavors</li>
      </ul>
      
      <h2>Why Avoid Heavily Processed Foods?</h2>
      <p>Heavily processed foods often contain high levels of added sugars, unhealthy fats, and sodium. They may also lack essential nutrients and fiber that your body needs for optimal health.</p>
      
      <h2>Making Better Choices</h2>
      <p>At Let's Try, we focus on bringing you snacks that are minimally processed, made with real ingredients, and free from artificial additives. Our products are prepared using traditional methods that preserve the natural goodness of the ingredients.</p>
      
      <h3>How to Identify Processed Foods:</h3>
      <ul>
        <li>Read ingredient labels carefully</li>
        <li>Look for products with fewer ingredients</li>
        <li>Avoid items with ingredients you can't pronounce</li>
        <li>Choose products with recognizable whole food ingredients</li>
      </ul>
      
      <p>By being mindful of what goes into your snacks, you can enjoy delicious treats while supporting your health goals.</p>
    `,
    image: '/placeholder-image.svg',
    date: 'Mar 24, 2025',
    author: "Let's Try Team",
    category: 'Nutrition',
  },
  {
    id: '3',
    slug: 'benefits-of-organic-snacking',
    title: 'Stories of Good Food and Better Choices',
    excerpt: 'Snacks are more than just quick bites—they are a part of your daily nutrition. Explore the numerous benefits of choosing organic snacks for your family.',
    content: `
      <h2>The Organic Advantage</h2>
      <p>Organic snacking has gained popularity in recent years, and for good reason. When you choose organic, you're choosing foods that are grown and processed without synthetic pesticides, fertilizers, or genetically modified organisms.</p>
      
      <h2>Health Benefits of Organic Snacks</h2>
      <p>Organic snacks offer numerous health benefits that make them worth considering for your family's diet. They contain fewer pesticide residues, more antioxidants, and are often fresher than their conventional counterparts.</p>
      
      <h3>Key Benefits:</h3>
      <ul>
        <li>Reduced exposure to harmful chemicals</li>
        <li>Higher nutritional value in many cases</li>
        <li>Better for the environment</li>
        <li>Support for sustainable farming practices</li>
        <li>No artificial colors, flavors, or preservatives</li>
      </ul>
      
      <h2>Organic Ingredients in Our Products</h2>
      <p>At Let's Try, we prioritize using organic ingredients wherever possible. From our organic cookies to healthy munchies, each product is crafted with care to ensure you get the best quality snacks.</p>
      
      <h2>Making the Switch</h2>
      <p>Transitioning to organic snacks doesn't have to be overwhelming. Start by replacing one or two of your regular snacks with organic alternatives and gradually expand from there.</p>
      
      <h3>Tips for Organic Snacking:</h3>
      <ul>
        <li>Start with snacks you eat most frequently</li>
        <li>Look for certified organic labels</li>
        <li>Buy in bulk when possible to save money</li>
        <li>Support local organic farmers and brands</li>
        <li>Store organic snacks properly to maintain freshness</li>
      </ul>
      
      <p>Choosing organic is an investment in your health and the planet's future. Every small choice adds up to make a big difference.</p>
    `,
    image: '/placeholder-image.svg',
    date: 'Mar 24, 2025',
    author: "Let's Try Team",
    category: 'Organic Living',
  },
  {
    id: '4',
    slug: 'traditional-indian-snacks-made-healthy',
    title: 'Stories of Good Food and Better Choices',
    excerpt: 'Snacks are more than just quick bites—they are a part of your daily nutrition. Discover how traditional Indian snacks can be made healthier without losing their authentic taste.',
    content: `
      <h2>The Rich Heritage of Indian Snacks</h2>
      <p>Indian cuisine boasts a rich variety of traditional snacks that have been enjoyed for generations. From crispy namkeen to sweet treats, these snacks are an integral part of Indian culture and celebrations.</p>
      
      <h2>Modernizing Traditional Recipes</h2>
      <p>At Let's Try, we honor these traditional recipes while adapting them for modern health-conscious consumers. Our approach involves using better oils, reducing unnecessary additives, and maintaining authentic flavors.</p>
      
      <h3>Our Healthy Innovations:</h3>
      <ul>
        <li>Using 100% groundnut oil instead of palm oil</li>
        <li>Reducing salt content without compromising taste</li>
        <li>Baking instead of deep-frying where appropriate</li>
        <li>Adding whole grains and natural ingredients</li>
        <li>Eliminating artificial colors and flavors</li>
      </ul>
      
      <h2>Popular Traditional Snacks We Offer</h2>
      <p>Our range includes beloved favorites like Purani Delhi namkeen, bhujia, munchies, and cookies—all made with a healthy twist that doesn't sacrifice the authentic taste you love.</p>
      
      <h3>Why Choose Traditional Snacks?</h3>
      <ul>
        <li>Rich in cultural heritage and nostalgia</li>
        <li>Made with time-tested recipes</li>
        <li>Versatile for any occasion</li>
        <li>Perfect for sharing with family and friends</li>
      </ul>
      
      <h2>Quality Ingredients Matter</h2>
      <p>We source the finest ingredients to ensure every bite is as good as homemade. From premium spices to high-quality grains, we never compromise on ingredient quality.</p>
      
      <p>Experience the perfect blend of tradition and health with Let's Try—where every snack tells a story of good food and better choices.</p>
    `,
    image: '/placeholder-image.svg',
    date: 'Mar 24, 2025',
    author: "Let's Try Team",
    category: 'Traditional Foods',
  },
];

export function getBlogBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getAllBlogs(): BlogPost[] {
  return blogPosts;
}
