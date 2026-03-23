import sharp from 'sharp';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;

const compressImage = async (req, res, next) => {
  if (!req.file && !req.files) {
    return next();
  }

  try {
    const processFile = async (file) => {
      const originalSize = file.size;
      const originalSizeMB = (originalSize / 1024 / 1024).toFixed(2);

      // Skip compression if already under 2MB
      if (originalSize <= MAX_FILE_SIZE) {
        console.log(`✓ Image OK: ${file.originalname} (${originalSizeMB}MB)`);
        return file;
      }

      console.log(`🗜️ Compressing: ${file.originalname} | Original: ${originalSizeMB}MB`);

      const image = sharp(file.buffer);
      const metadata = await image.metadata();
      const originalFormat = file.mimetype;

      // Build transformation pipeline
      let transform = image;

      // Resize if dimensions exceed max
      if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
        transform = transform.resize({
          width: MAX_WIDTH,
          height: MAX_HEIGHT,
          fit: 'inside',
          withoutEnlargement: true
        });
        console.log(`  Resized to: ${Math.min(metadata.width, MAX_WIDTH)}x${Math.min(metadata.height, MAX_HEIGHT)}`);
      }

      // Compress based on format
      let compressedBuffer;
      let quality = 85;
      let attempts = 0;
      const maxAttempts = 8;

      do {
        quality = Math.max(10, quality - (attempts * 5));

        if (originalFormat === 'image/png') {
          // Convert PNG to JPEG for better compression if still too large
          if (originalSize > MAX_FILE_SIZE * 2) {
            compressedBuffer = await transform
              .jpeg({ quality, mozjpeg: true, progressive: true })
              .toBuffer();
          } else {
            compressedBuffer = await transform
              .png({ compressionLevel: 9, palette: true })
              .toBuffer();
          }
        } else if (originalFormat === 'image/webp') {
          compressedBuffer = await transform
            .webp({ quality, effort: 6 })
            .toBuffer();
        } else {
          // JPEG
          compressedBuffer = await transform
            .jpeg({ quality, mozjpeg: true, progressive: true })
            .toBuffer();
        }

        attempts++;
      } while (compressedBuffer.length > MAX_FILE_SIZE && attempts < maxAttempts);

      const finalSizeMB = (compressedBuffer.length / 1024 / 1024).toFixed(2);
      const compressionRatio = ((1 - compressedBuffer.length / originalSize) * 100).toFixed(1);

      console.log(`  ✓ Compressed: ${finalSizeMB}MB (Reduced by ${compressionRatio}%)`);

      // Determine new format
      let newMimetype = file.mimetype;
      if (originalFormat === 'image/png' && originalSize > MAX_FILE_SIZE * 2) {
        newMimetype = 'image/jpeg';
      }

      return {
        ...file,
        buffer: compressedBuffer,
        size: compressedBuffer.length,
        mimetype: newMimetype
      };
    };

    // Process single file
    if (req.file) {
      req.file = await processFile(req.file);
    }

    // Process multiple files
    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files = await Promise.all(req.files.map(processFile));
      } else {
        for (const fieldName in req.files) {
          req.files[fieldName] = await Promise.all(
            req.files[fieldName].map(processFile)
          );
        }
      }
    }

    next();
  } catch (error) {
    console.error('❌ Image compression error:', error.message);
    res.status(500).json({
      success: false,
      message: `Image compression failed: ${error.message}`
    });
  }
};

export default compressImage;
