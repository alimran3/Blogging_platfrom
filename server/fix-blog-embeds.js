import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';
import embedService from './services/embedService.js';

dotenv.config();

const fixBlogEmbeds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const blog = await Blog.findOne({ slug: 'its-happening-mmqsycwl' });
    
    if (!blog) {
      console.log('Blog not found');
      process.exit(1);
    }

    console.log('Fixing blog:', blog.title);
    console.log('Current embeds:', blog.embeds);

    // Re-parse all Facebook embeds
    for (let i = 0; i < blog.embeds.length; i++) {
      const embed = blog.embeds[i];
      if (embed.url && embed.url.includes('facebook.com')) {
        console.log('Re-parsing Facebook URL:', embed.url);
        const newEmbed = await embedService.parseEmbed(embed.url);
        blog.embeds[i] = newEmbed;
        console.log('New embed type:', newEmbed.type);
      }
    }

    await blog.save();
    console.log('\n✅ Blog updated successfully!');
    console.log('New embeds:', JSON.stringify(blog.embeds, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixBlogEmbeds();
