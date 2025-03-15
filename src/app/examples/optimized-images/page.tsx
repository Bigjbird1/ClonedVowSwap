"use client";

import { useState } from "react";
import OptimizedImage from "../../../Components/MainComponents/OptimizedImage/OptimizedImage";

export default function OptimizedImagesExample() {
  const [loading, setLoading] = useState(false);
  
  const weddingImages = [
    {
      src: "https://images.unsplash.com/photo-1519741497674-611481863552",
      alt: "Wedding dress",
      width: 800,
      height: 600,
    },
    {
      src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8",
      alt: "Wedding rings",
      width: 800,
      height: 600,
    },
    {
      src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6",
      alt: "Wedding flowers",
      width: 800,
      height: 600,
    },
    {
      src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc",
      alt: "Wedding cake",
      width: 800,
      height: 600,
    },
    {
      src: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4",
      alt: "Wedding venue",
      width: 800,
      height: 600,
    },
    {
      src: "https://images.unsplash.com/photo-1482482097755-0b595893ba63",
      alt: "Wedding shoes",
      width: 800,
      height: 600,
    },
  ];
  
  const handleLoadMore = () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        VowSwap Optimized Images Example
      </h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Performance Features:</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Automatic WebP conversion for modern browsers</li>
          <li>Responsive image sizes based on viewport</li>
          <li>Lazy loading for off-screen images</li>
          <li>Blur-up image loading for better user experience</li>
          <li>Server-side image caching for faster repeat views</li>
          <li>Optimized image quality for wedding-specific content</li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {weddingImages.map((image, index) => (
          <div
            key={index}
            className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="aspect-w-4 aspect-h-3">
              <OptimizedImage
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                className="w-full h-full object-cover"
                priority={index < 2} // Only prioritize the first two images
                quality={85}
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg">{image.alt}</h3>
              <p className="text-gray-600 text-sm mt-1">
                Optimized for faster loading and better user experience
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={handleLoadMore}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Loading...
            </span>
          ) : (
            "Load More Images"
          )}
        </button>
      </div>
      
      <div className="mt-12 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Technical Implementation:</h2>
        <div className="prose max-w-none">
          <p>
            This example demonstrates the use of our custom OptimizedImage component
            which leverages Next.js Image component with additional optimizations:
          </p>
          <ul>
            <li>Server-side image processing with Sharp</li>
            <li>Automatic format conversion to WebP</li>
            <li>Responsive sizing based on viewport</li>
            <li>Lazy loading with blur-up placeholders</li>
            <li>Caching for improved performance</li>
          </ul>
          <p>
            The implementation includes a custom API route at
            <code>/api/image/optimize</code> that handles image processing and
            caching, ensuring optimal delivery of wedding-related imagery.
          </p>
        </div>
      </div>
    </div>
  );
}
