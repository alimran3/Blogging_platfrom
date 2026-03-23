import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';

dotenv.config();

const restoreFacebookEmbeds = async () => {
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
          // Restore original URL format
          const postsMatch = embed.url.match(/facebook\.com\/facebook\/posts\/([A-Za-z0-9_-]+)/);
          if (postsMatch) {
            // Convert back to share format
            embed.url = `https://www.facebook.com/share/p/${postsMatch[1]}/`;
          }
          
          // Restore original HTML
          embed.embedData.html = `
            <div style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <iframe src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(embed.url)}&show_text=true&width=600&appId"
                width="100%"
                height="1000"
                style="border:none;overflow:hidden;background:transparent;"
                scrolling="no"
                frameborder="0"
                allowfullscreen="true"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen">
              </iframe>
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

    console.log(`\n✅ Restored ${updated} blog(s)`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

restoreFacebookEmbeds();
