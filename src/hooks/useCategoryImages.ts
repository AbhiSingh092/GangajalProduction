import { useState, useEffect } from 'react';

const STORAGE_KEY = 'category_images';

interface CategoryImages {
  [key: string]: string[];
}

export const useCategoryImages = () => {
  const [images, setImages] = useState<CategoryImages>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
  }, [images]);

  const addImageToCategory = (categoryId: string, imageUrl: string) => {
    setImages(prev => ({
      ...prev,
      [categoryId]: [...(prev[categoryId] || []), imageUrl]
    }));
  };

  const getImagesForCategory = (categoryId: string): string[] => {
    return images[categoryId] || [];
  };

  return {
    addImageToCategory,
    getImagesForCategory
  };
};