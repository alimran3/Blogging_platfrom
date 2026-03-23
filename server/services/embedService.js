import axios from 'axios';
import * as cheerio from 'cheerio';

class EmbedService {
  constructor() {
    this.patterns = {
      twitter: /(?:twitter\.com|x\.com)\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/,
      facebook: /facebook\.com\/(?:photo\.php\?fbid=|[\w.]+\/(?:posts|photos|videos|share)\/|share\/)/,
      instagram: /instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/,
      youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]+)/,
      tiktok: /tiktok\.com\/@[\w.]+\/video\/(\d+)/,
      vimeo: /vimeo\.com\/(\d+)/
    };
  }

  detectPlatform(url) {
    for (const [platform, pattern] of Object.entries(this.patterns)) {
      if (pattern.test(url)) {
        return platform;
      }
    }
    return 'link';
  }

  async parseEmbed(url) {
    try {
      const platform = this.detectPlatform(url);

      switch (platform) {
        case 'twitter':
          return await this.parseTwitter(url);
        case 'facebook':
          return await this.parseFacebook(url);
        case 'instagram':
          return await this.parseInstagram(url);
        case 'youtube':
          return await this.parseYouTube(url);
        case 'vimeo':
          return await this.parseVimeo(url);
        default:
          return await this.parseGenericLink(url);
      }
    } catch (error) {
      console.error('Embed parsing error:', error);
      return {
        type: 'link',
        url,
        embedData: {
          title: url,
          description: '',
          thumbnail: ''
        }
      };
    }
  }

  async parseTwitter(url) {
    try {
      // Using Twitter's oEmbed API
      const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}`;
      const response = await axios.get(oembedUrl);

      return {
        type: 'twitter',
        url,
        embedData: {
          html: response.data.html,
          authorName: response.data.author_name,
          authorUrl: response.data.author_url,
          providerName: 'Twitter'
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async parseFacebook(url) {
    try {
      // Use Facebook SDK embed - shows the post with full interactivity
      return {
        type: 'facebook',
        url,
        embedData: {
          html: `
            <div style="width: 100%; max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <div class="fb-post" 
                   data-href="${url}" 
                   data-width="600" 
                   data-show-text="true">
              </div>
            </div>
          `,
          providerName: 'Facebook',
          authorName: 'Facebook Post'
        }
      };
    } catch (error) {
      console.error('Facebook embed error:', error.message);

      return {
        type: 'facebook',
        url,
        embedData: {
          html: `
            <div style="width: 100%; max-width: 600px; margin: 0 auto;">
              <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: block; padding: 20px; background: #f0f2f5; border-radius: 8px; text-decoration: none; color: #1c1e21; font-family: system-ui;">
                <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">Facebook Post</div>
                <div style="font-size: 14px; color: #65676b;">Click to view on Facebook</div>
              </a>
            </div>
          `,
          providerName: 'Facebook'
        }
      };
    }
  }

  async parseInstagram(url) {
    try {
      const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}`;
      const response = await axios.get(oembedUrl);

      return {
        type: 'instagram',
        url,
        embedData: {
          html: response.data.html,
          thumbnail: response.data.thumbnail_url,
          title: response.data.title,
          authorName: response.data.author_name,
          providerName: 'Instagram'
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async parseYouTube(url) {
    const match = url.match(this.patterns.youtube);
    if (!match) throw new Error('Invalid YouTube URL');

    const videoId = match[1];

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await axios.get(oembedUrl);

      return {
        type: 'youtube',
        url,
        embedData: {
          html: `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          title: response.data.title,
          authorName: response.data.author_name,
          authorUrl: response.data.author_url,
          providerName: 'YouTube'
        }
      };
    } catch (error) {
      return {
        type: 'youtube',
        url,
        embedData: {
          html: `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`,
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          providerName: 'YouTube'
        }
      };
    }
  }

  async parseVimeo(url) {
    const match = url.match(this.patterns.vimeo);
    if (!match) throw new Error('Invalid Vimeo URL');

    const videoId = match[1];

    try {
      const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`;
      const response = await axios.get(oembedUrl);

      return {
        type: 'video',
        url,
        embedData: {
          html: response.data.html,
          thumbnail: response.data.thumbnail_url,
          title: response.data.title,
          authorName: response.data.author_name,
          providerName: 'Vimeo'
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async parseGenericLink(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BlogBot/1.0)'
        },
        timeout: 5000
      });

      const $ = cheerio.load(response.data);

      // Extract Open Graph data
      const title = $('meta[property="og:title"]').attr('content') ||
                    $('meta[name="twitter:title"]').attr('content') ||
                    $('title').text() || '';

      const description = $('meta[property="og:description"]').attr('content') ||
                          $('meta[name="twitter:description"]').attr('content') ||
                          $('meta[name="description"]').attr('content') || '';

      const thumbnail = $('meta[property="og:image"]').attr('content') ||
                        $('meta[name="twitter:image"]').attr('content') || '';

      const siteName = $('meta[property="og:site_name"]').attr('content') || '';

      return {
        type: 'link',
        url,
        embedData: {
          title: title.trim(),
          description: description.trim().substring(0, 200),
          thumbnail,
          providerName: siteName
        }
      };
    } catch (error) {
      return {
        type: 'link',
        url,
        embedData: {
          title: url,
          description: '',
          thumbnail: ''
        }
      };
    }
  }

  async parseMultipleEmbeds(urls) {
    const results = await Promise.allSettled(
      urls.map(url => this.parseEmbed(url))
    );

    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value);
  }
}

export default new EmbedService();
