import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';
import embedService from './services/embedService.js';

dotenv.config();

const fixAllFacebookEmbeds = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all blogs that have ANY Facebook URLs in embeds
    const blogs = await Blog.find({
      $or: [
        { 'embeds.url': /facebook\.com/ },
        { 'embeds.type': 'link' }
      ]
    });

    console.log(`Found ${blogs.length} blogs to check`);

    let fixedCount = 0;

    for (const blog of blogs) {
      let changed = false;
      
      for (let i = 0; i < blog.embeds.length; i++) {
        const embed = blog.embeds[i];
        
        // If it's a Facebook URL but stored as 'link', re-parse it
        if (embed.url && embed.url.includes('facebook.com') && embed.type !== 'facebook') {
          console.log(`\nFixing: ${blog.title}`);
          console.log(`  Old type: ${embed.type}`);
          console.log(`  URL: ${embed.url}`);
          
          const newEmbed = await embedService.parseEmbed(embed.url);
          blog.embeds[i] = newEmbed;
          
          console.log(`  New type: ${newEmbed.type}`);
          changed = true;
        }
      }
      
      if (changed) {
        await blog.save();
        fixedCount++;
        console.log(`  ✅ Fixed!`);
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} blog(s) total`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAllFacebookEmbeds();
