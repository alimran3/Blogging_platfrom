import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';

dotenv.config();

const useDirectIframes = async () => {
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
        
        if (embed.type === 'facebook' && embed.url) {
          // Use DIRECT iframe instead of SDK
          embed.embedData.html = `<iframe src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(embed.url)}&show_text=true&width=600" width="600" height="1500" style="border:none;overflow:visible;background:transparent;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"></iframe>`;
          changed = true;
        }
      }
      
      if (changed) {
        await blog.save();
        updated++;
        console.log(`Updated blog: ${blog.title}`);
      }
    }

    console.log(`\n✅ Updated ${updated} blog(s) to use direct iframes`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

useDirectIframes();
