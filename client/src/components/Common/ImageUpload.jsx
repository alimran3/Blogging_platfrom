import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { HiOutlinePhotograph, HiOutlineX } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ImageUpload = ({ 
  onImageSelect, 
  maxSize = 2, // MB
  className = '',
  currentImage = null 
}) => {
  const [preview, setPreview] = useState(currentImage);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const error = rejectedFiles[0].errors[0];
      if (error.code === 'file-too-large') {
        toast.error(`File is too large. Max size is ${maxSize}MB`);
      } else {
        toast.error('Invalid file type. Please upload an image.');
      }
      return;
    }

    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
        onImageSelect(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [maxSize, onImageSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp']
    },
    maxSize: maxSize * 1024 * 1024,
    multiple: false
  });

  const handleRemove = (e) => {
    e.stopPropagation();
    setPreview(null);
    onImageSelect(null, null);
  };

  return (
    <div
      {...getRootProps()}
      className={`relative border-2 border-dashed rounded-2xl cursor-pointer
                 transition-colors ${className}
                 ${isDragActive 
                   ? 'border-gold-400 bg-gold-50' 
                   : 'border-navy-200 hover:border-gold-300 hover:bg-navy-50'
                 }`}
    >
      <input {...getInputProps()} />
      
      {preview ? (
        <div className="relative w-full h-full">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-2xl"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full
                       hover:bg-red-600 transition-colors shadow-lg"
          >
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full p-8">
          <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center mb-4">
            <HiOutlinePhotograph className="w-8 h-8 text-navy-400" />
          </div>
          <p className="text-navy-700 font-medium text-center">
            {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
          </p>
          <p className="text-sm text-navy-400 mt-2">
            JPEG, PNG, GIF, WebP up to {maxSize}MB
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;