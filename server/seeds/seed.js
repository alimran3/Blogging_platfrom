import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Blog from '../models/Blog.js';

dotenv.config();

const users = [
  {
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Tech enthusiast and passionate writer. Love exploring new ideas.',
    university: 'MIT',
    avatar: {
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200'
    }
  },
  {
    username: 'janedoe',
    email: 'jane@example.com',
    password: 'password123',
    bio: 'Travel blogger and photography lover.',
    university: 'Stanford University',
    avatar: {
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
    }
  },
  {
    username: 'alexsmith',
    email: 'alex@example.com',
    password: 'password123',
    bio: 'Full-stack developer sharing coding tips and tricks.',
    university: 'Harvard University',
    avatar: {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'
    }
  }
];

const blogTemplates = [
  {
    title: 'The Future of Artificial Intelligence in 2024',
    excerpt: 'Exploring the latest trends and breakthroughs in AI technology that are shaping our world.',
    content: `<h2>Introduction</h2>
      <p>Artificial Intelligence continues to evolve at an unprecedented pace. In this article, we explore the key trends that are defining the AI landscape in 2024.</p>
      <h2>Key Trends</h2>
      <p>From generative AI to autonomous systems, the possibilities seem endless. Let's dive into what makes this year particularly exciting for AI enthusiasts.</p>
      <blockquote>The best way to predict the future is to create it.</blockquote>
      <h2>Conclusion</h2>
      <p>As we continue to push the boundaries of what's possible, AI remains at the forefront of technological innovation.</p>`,
    category: 'technology',
    tags: ['ai', 'technology', 'future', 'innovation'],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200'
    }
  },
  {
    title: 'A Journey Through the Swiss Alps',
    excerpt: 'Discovering the breathtaking beauty of Switzerland through hiking and exploration.',
    content: `<h2>The Adventure Begins</h2>
      <p>There's something magical about standing at the foot of the Swiss Alps. The crisp mountain air fills your lungs as you gaze upon peaks that touch the sky.</p>
      <h2>Hidden Gems</h2>
      <p>Beyond the famous tourist spots lie hidden valleys and villages that offer authentic Swiss experiences.</p>
      <h2>Travel Tips</h2>
      <p>Planning your Swiss adventure? Here are some essential tips to make the most of your journey.</p>`,
    category: 'travel',
    tags: ['travel', 'switzerland', 'hiking', 'mountains'],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200'
    }
  },
  {
    title: 'Mastering React Hooks: A Complete Guide',
    excerpt: 'Everything you need to know about React Hooks and how to use them effectively.',
    content: `<h2>Understanding Hooks</h2>
      <p>React Hooks revolutionized how we write React components. Let's explore the most commonly used hooks and their best practices.</p>
      <h2>useState and useEffect</h2>
      <p>These two hooks form the foundation of functional component state management.</p>
      <pre><code>const [count, setCount] = useState(0);</code></pre>
      <h2>Custom Hooks</h2>
      <p>Learn how to create reusable logic with custom hooks.</p>`,
    category: 'technology',
    tags: ['react', 'javascript', 'webdev', 'programming'],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200'
    }
  },
  {
    title: 'The Art of Mindful Living',
    excerpt: 'Practical tips for incorporating mindfulness into your daily routine.',
    content: `<h2>What is Mindfulness?</h2>
      <p>Mindfulness is the practice of being fully present in the moment, aware of where we are and what we're doing.</p>
      <h2>Daily Practices</h2>
      <p>Simple exercises that can transform your day and reduce stress.</p>
      <h2>Benefits</h2>
      <p>From improved focus to better sleep, the benefits of mindfulness are numerous and well-documented.</p>`,
    category: 'lifestyle',
    tags: ['mindfulness', 'wellness', 'lifestyle', 'health'],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200'
    }
  },
  {
    title: 'Delicious Homemade Pasta Recipes',
    excerpt: 'Learn to make authentic Italian pasta from scratch with these easy recipes.',
    content: `<h2>The Basics</h2>
      <p>Making pasta at home is easier than you think. With just a few simple ingredients, you can create restaurant-quality dishes.</p>
      <h2>Classic Recipes</h2>
      <p>From carbonara to cacio e pepe, master the classics that have stood the test of time.</p>
      <h2>Tips for Perfect Pasta</h2>
      <p>The secrets to achieving that perfect al dente texture every time.</p>`,
    category: 'food',
    tags: ['food', 'cooking', 'recipes', 'italian'],
    coverImage: {
      url: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=1200'
    }
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-platform');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Blog.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      createdUsers.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Create blogs
    for (let i = 0; i < blogTemplates.length; i++) {
      const author = createdUsers[i % createdUsers.length];
      const blog = await Blog.create({
        ...blogTemplates[i],
        author: author._id,
        status: 'published',
        visibility: 'public',
        views: Math.floor(Math.random() * 1000),
        likesCount: Math.floor(Math.random() * 100)
      });

      // Update user's blog count
      await User.findByIdAndUpdate(author._id, {
        $inc: { totalBlogsPublished: 1 }
      });

      console.log(`Created blog: ${blog.title}`);
    }

    console.log('\nDatabase seeded successfully!');
    console.log('\nTest Accounts:');
    console.log('Email: john@example.com | Password: password123');
    console.log('Email: jane@example.com | Password: password123');
    console.log('Email: alex@example.com | Password: password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
