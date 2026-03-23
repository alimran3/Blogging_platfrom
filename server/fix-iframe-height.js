import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';

dotenv.config();

const fixFacebookIframeHeight = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const blogs = await Blog.find({
      'embeds.type': 'facebook'
    });

    console.log(`Found ${blogs.length} blogs with Facebook embeds`);

    let updated = 0;

    for (const blog of blogs) {
      let changed = false;
      
      for (let i = 0; i < blog.embeds.length; i++) {
        const embed = blog.embeds[i];
        
        if (embed.type === 'facebook' && embed.embedData?.html?.includes('iframe')) {
          // Increase height from 2000 to 3000
          embed.embedData.html = embed.embedData.html.replace('height="2000"', 'height="3000"');
          embed.embedData.html = embed.embedData.html.replace('height=2000', 'height=3000');
          changed = true;
        }
      }
      
      if (changed) {
        await blog.save();
        updated++;
        console.log(`Fixed: ${blog.title}`);
      }
    }

    console.log(`\n✅ Fixed ${updated} blog(s) with taller iframes`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixFacebookIframeHeight();
