import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  HiOutlinePhotograph,
  HiOutlineLink,
  HiOutlineX,
  HiOutlinePlus,
  HiChat,
  HiOutlineCode
} from 'react-icons/hi';
import ImageUpload from '../Common/ImageUpload';
import { blogService } from '../../services/blogService';
import toast from 'react-hot-toast';

const categories = [
  'technology', 'lifestyle', 'travel', 'food',
  'health', 'business', 'entertainment', 'sports',
  'education', 'other'
];

const BlogEditor = ({ 
  initialData = {}, 
  onSubmit, 
  isSubmitting = false,
  submitLabel = 'Publish'
}) => {
  const [title, setTitle] = useState(initialData.title || '');
  const [content, setContent] = useState(initialData.content || '');
  const [excerpt, setExcerpt] = useState(initialData.excerpt || '');
  const [category, setCategory] = useState(initialData.category || 'other');
  const [tags, setTags] = useState(initialData.tags?.join(', ') || '');
  const [coverImage, setCoverImage] = useState(initialData.coverImage || null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [embeds, setEmbeds] = useState(initialData.embeds || []);
  const [embedUrl, setEmbedUrl] = useState('');
  const [isParsingEmbed, setIsParsingEmbed] = useState(false);
  const contentRef = useRef(null);

  const handleCoverImageChange = useCallback((file, preview) => {
    setCoverImageFile(file);
    setCoverImage({ url: preview });
  }, []);

  const applyFormat = (format) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const before = content.substring(0, start);
    const after = content.substring(end);
    
    let newText = '';
    if (format === '**') {
      newText = before + '**' + selectedText + '**' + after;
    } else if (format === '*') {
      newText = before + '*' + selectedText + '*' + after;
    } else if (format === '__') {
      newText = before + '__' + selectedText + '__' + after;
    } else if (format === '- ') {
      newText = before + '- ' + selectedText + after;
    } else if (format === '1. ') {
      newText = before + '1. ' + selectedText + after;
    } else if (format === '> ') {
      newText = before + '> ' + selectedText + after;
    } else if (format === '`') {
      newText = before + '`' + selectedText + '`' + after;
    }
    
    setContent(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + format.length, end + format.length);
    }, 0);
  };

  const handleAddEmbed = async () => {
    if (!embedUrl.trim()) return;

    setIsParsingEmbed(true);
    try {
      const response = await blogService.parseEmbed(embedUrl);
      setEmbeds(prev => [...prev, response.embed]);
      setEmbedUrl('');
      toast.success('Embed added successfully!');
    } catch (error) {
      toast.error('Failed to parse embed URL');
    } finally {
      setIsParsingEmbed(false);
    }
  };

  const handleRemoveEmbed = (index) => {
    setEmbeds(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!content.trim()) {
      toast.error('Please add some content');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('excerpt', excerpt);
    formData.append('category', category);
    formData.append('tags', tags);
    formData.append('status', 'published');

    if (coverImageFile) {
      formData.append('coverImage', coverImageFile);
    }

    if (embeds.length > 0) {
      formData.append('embeds', JSON.stringify(embeds.map(e => e.url)));
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Cover Image */}
      <div className="card p-6">
        <label className="block text-sm font-semibold text-navy-700 mb-3">
          Cover Image <span className="text-navy-400 font-normal">(optional)</span>
        </label>
        <p className="text-xs text-navy-500 mb-3">
          Add a cover image to make your blog more visually appealing. Max 2MB.
        </p>
        {coverImage ? (
          <div className="relative rounded-2xl overflow-hidden">
            <img
              src={coverImage.url}
              alt="Cover"
              className="w-full h-64 object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setCoverImage(null);
                setCoverImageFile(null);
              }}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full
                         hover:bg-red-600 transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-navy-200 rounded-2xl p-8
                          bg-navy-50 hover:bg-navy-100 transition-colors">
            <ImageUpload
              onImageSelect={handleCoverImageChange}
              maxSize={2}
              className="h-48"
            />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="card p-6">
        <label className="block text-sm font-semibold text-navy-700 mb-3">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter an engaging title..."
          className="input-elegant font-serif text-2xl"
          maxLength={200}
        />
        <p className="text-sm text-navy-400 mt-2 text-right">
          {title.length}/200
        </p>
      </div>

      {/* Excerpt */}
      <div className="card p-6">
        <label className="block text-sm font-semibold text-navy-700 mb-3">
          Excerpt (optional)
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A brief summary of your blog..."
          className="input-elegant resize-none"
          rows={3}
          maxLength={500}
        />
        <p className="text-sm text-navy-400 mt-2 text-right">
          {excerpt.length}/500
        </p>
      </div>

      {/* Content */}
      <div className="card p-6">
        <label className="block text-sm font-semibold text-navy-700 mb-3">
          Content *
        </label>
        <div className="border-2 border-navy-200 rounded-2xl overflow-hidden bg-white">
          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-navy-200 bg-navy-50">
            <ToolbarButton onClick={() => applyFormat('**')} label="Bold"><span className="font-bold">B</span></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('*')} label="Italic"><span className="italic">I</span></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('__')} label="Underline"><span className="underline">U</span></ToolbarButton>
            <div className="w-px h-6 bg-navy-200 mx-2" />
            <ToolbarButton onClick={() => applyFormat('- ')} label="Bullet List"><span className="text-sm">•</span></ToolbarButton>
            <ToolbarButton onClick={() => applyFormat('1. ')} label="Numbered List"><span className="text-sm">1.</span></ToolbarButton>
            <div className="w-px h-6 bg-navy-200 mx-2" />
            <ToolbarButton onClick={() => applyFormat('> ')} icon={<HiChat />} label="Quote" />
            <ToolbarButton onClick={() => applyFormat('`')} icon={<HiOutlineCode />} label="Code" />
          </div>
          {/* Editor */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tell your story...

Use Markdown-style formatting:
**bold** or __bold__ for bold text
*italic* for italic text
- for bullet lists
1. for numbered lists
> for quotes
`code` for inline code
# Heading 1
## Heading 2
### Heading 3"
            className="w-full min-h-[400px] p-4 outline-none resize-y font-sans text-base leading-relaxed"
          />
        </div>
      </div>

      {/* Embeds */}
      <div className="card p-6">
        <label className="block text-sm font-semibold text-navy-700 mb-3">
          External Embeds
        </label>
        <p className="text-sm text-navy-500 mb-4">
          Add content from Twitter, Instagram, YouTube, Facebook, or any website
        </p>
        
        <div className="flex gap-3 mb-4">
          <input
            type="url"
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="Paste URL here..."
            className="input-elegant flex-1"
          />
          <button
            type="button"
            onClick={handleAddEmbed}
            disabled={isParsingEmbed || !embedUrl.trim()}
            className="btn-secondary flex items-center gap-2"
          >
            {isParsingEmbed ? (
              <span className="w-5 h-5 border-2 border-navy-300 border-t-navy-600 
                               rounded-full animate-spin" />
            ) : (
              <HiOutlinePlus className="w-5 h-5" />
            )}
            Add
          </button>
        </div>

        {/* Embed List */}
        {embeds.length > 0 && (
          <div className="space-y-3">
            {embeds.map((embed, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 bg-navy-50 rounded-xl"
              >
                <div className="w-10 h-10 bg-navy-200 rounded-lg flex items-center justify-center">
                  <HiOutlineLink className="w-5 h-5 text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-800 truncate">
                    {embed.embedData?.title || embed.url}
                  </p>
                  <p className="text-sm text-navy-500 capitalize">
                    {embed.type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEmbed(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <HiOutlineX className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Category & Tags */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <label className="block text-sm font-semibold text-navy-700 mb-3">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-elegant capitalize"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="capitalize">
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="card p-6">
          <label className="block text-sm font-semibold text-navy-700 mb-3">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="technology, coding, web (comma separated)"
            className="input-elegant"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          className="btn-secondary"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-gold min-w-[150px]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-5 h-5 border-2 border-navy-300 border-t-navy-600 
                               rounded-full animate-spin" />
              Publishing...
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};

const ToolbarButton = ({ onClick, icon, label, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className="p-2 text-navy-600 hover:bg-navy-100 hover:text-navy-900 rounded-lg transition-colors"
  >
    {children || icon}
  </button>
);

export default BlogEditor;