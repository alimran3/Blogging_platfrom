import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HiOutlineExternalLink } from 'react-icons/hi';

const EmbedRenderer = ({ embed }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Load Twitter widgets
    if (embed.type === 'twitter' && window.twttr) {
      window.twttr.widgets.load(containerRef.current);
    }

    // Load Instagram embeds
    if (embed.type === 'instagram' && window.instgrm) {
      window.instgrm.Embeds.process();
    }

    // Load Facebook SDK
    if (embed.type === 'facebook' && window.FB) {
      setTimeout(() => {
        window.FB.XFBML.parse(containerRef.current);
      }, 300);
    }
  }, [embed]);

  const renderEmbed = () => {
    switch (embed.type) {
      case 'youtube': {
        const videoId = extractYouTubeId(embed.url);
        return (
          <div className="aspect-video rounded-2xl overflow-hidden bg-navy-900 shadow-lg my-6">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube Video"
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      case 'twitter':
        return (
          <div
            ref={containerRef}
            className="twitter-embed flex justify-center my-6"
            dangerouslySetInnerHTML={{ __html: embed.embedData?.html || '' }}
          />
        );

      case 'instagram':
        return (
          <div
            ref={containerRef}
            className="instagram-embed flex justify-center my-6"
            dangerouslySetInnerHTML={{ __html: embed.embedData?.html || '' }}
          />
        );

      case 'facebook':
        return (
          <div
            ref={containerRef}
            className="facebook-embed w-full flex justify-center my-6"
            style={{ overflow: 'visible', minHeight: '800px' }}
          >
            {embed.embedData?.html && embed.embedData.html.includes('fb-post') ? (
              <div
                dangerouslySetInnerHTML={{ __html: embed.embedData.html }}
                style={{ overflow: 'visible', width: '100%', display: 'flex', justifyContent: 'center' }}
              />
            ) : (
              <iframe
                src={`https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(embed.url)}&show_text=true&width=600`}
                width="600"
                height="3000"
                style={{ border: 'none', overflow: 'visible', background: 'white', display: 'block' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
                title="Facebook Post"
              />
            )}
          </div>
        );

      case 'vimeo': {
        const videoId = extractVimeoId(embed.url);
        return (
          <div className="aspect-video rounded-2xl overflow-hidden bg-navy-900 shadow-lg my-6">
            <iframe
              src={`https://player.vimeo.com/video/${videoId}`}
              title="Vimeo Video"
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }

      default:
        return (
          <a
            href={embed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group my-6"
          >
            <div className="flex flex-col md:flex-row gap-6 p-6 bg-gradient-to-br from-navy-50 to-white rounded-2xl border-2 border-navy-200 hover:border-gold-400 hover:shadow-lg transition-all">
              {embed.embedData?.thumbnail && (
                <div className="md:w-64 flex-shrink-0">
                  <img
                    src={embed.embedData.thumbnail}
                    alt={embed.embedData.title || 'Link preview'}
                    className="w-full h-48 md:h-full object-cover rounded-xl shadow-md"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-bold text-lg text-navy-800 group-hover:text-gold-600 transition-colors line-clamp-2">
                    {embed.embedData?.title || embed.url}
                  </h4>
                  <HiOutlineExternalLink className="w-6 h-6 text-gold-500 flex-shrink-0 mt-1" />
                </div>
                {embed.embedData?.description && (
                  <p className="text-base text-navy-600 mt-3 line-clamp-3 leading-relaxed">
                    {embed.embedData.description}
                  </p>
                )}
                {embed.embedData?.providerName && (
                  <div className="flex items-center gap-2 mt-3">
                    <div className="px-3 py-1 bg-gold-100 text-gold-700 rounded-full text-sm font-semibold">
                      {embed.embedData.providerName}
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-4 text-gold-600 text-sm font-medium">
                  <span>Visit Link</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </div>
          </a>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="embed-container my-6"
      style={{ overflow: 'visible' }}
    >
      {renderEmbed()}
    </motion.div>
  );
};

const extractYouTubeId = (url) => {
  const match = url?.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]+)/);
  return match ? match[1] : '';
};

const extractVimeoId = (url) => {
  const match = url?.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : '';
};

export default EmbedRenderer;
