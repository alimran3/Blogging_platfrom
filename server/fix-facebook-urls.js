import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';

dotenv.config();

const fixFacebookURLs = async () => {
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
          let url = embed.url;
          
          // Extract the post ID from any Facebook URL format
          const shareMatch = url.match(/facebook\.com\/share\/p\/([A-Za-z0-9_-]+)\/?/);
          
          if (shareMatch) {
            // Convert to format Facebook plugin understands
            url = `https://www.facebook.com/${shareMatch[1]}`;
            console.log(`Converting: ${embed.url} -> ${url}`);
          }
          
          // Update iframe with corrected URL
          embed.embedData.html = `<iframe src="https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(url)}&show_text=true&width=600" width="600" height="1500" style="border:none;overflow:visible;background:transparent;" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"></iframe>`;
          embed.url = url;
          changed = true;
        }
      }
      
      if (changed) {
        await blog.save();
        updated++;
        console.log(`Fixed blog: ${blog.title}`);
      }
    }

    console.log(`\n✅ Fixed ${updated} blog(s)`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixFacebookURLs();
