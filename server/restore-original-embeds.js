import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';

dotenv.config();

const restoreOriginalEmbeds = async () => {
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
          // Restore ORIGINAL Facebook SDK embed code (like yesterday)
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
        console.log(`Restored blog: ${blog.title}`);
      }
    }

    console.log(`\n✅ Restored ${updated} blog(s) to original format`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

restoreOriginalEmbeds();
