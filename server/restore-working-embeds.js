import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';

dotenv.config();

const restoreOriginalURLs = async () => {
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
      let lastUrl = '';
      
      for (let i = 0; i < blog.embeds.length; i++) {
        const embed = blog.embeds[i];
        
        if (embed.type === 'facebook') {
          // Restore ORIGINAL URLs that were working
          if (blog.title.includes('জীবনের')) {
            embed.url = 'https://www.facebook.com/share/p/18HD6uFw6Q/';
          } else if (blog.title === 'Hi') {
            embed.url = 'https://www.facebook.com/facebook/posts/10158706935111729/';
          } else if (blog.title === 'Our captain') {
            embed.url = 'https://www.facebook.com/share/p/17456j4NHP/';
          }
          
          lastUrl = embed.url;
          
          // Restore ORIGINAL Facebook SDK embed code
          embed.embedData.html = `
            <div style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div class="fb-post" 
                   data-href="${embed.url}" 
                   data-width="600" 
                   data-show-text="true">
              </div>
            </div>
          `;
          changed = true;
        }
      }
      
      if (changed) {
        await blog.save();
        updated++;
        console.log(`Restored blog: ${blog.title} with URL: ${lastUrl}`);
      }
    }

    console.log(`\n✅ Restored ${updated} blog(s) to original working state`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

restoreOriginalURLs();
