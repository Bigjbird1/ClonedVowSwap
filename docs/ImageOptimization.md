# Image Optimization for VowSwap

This document outlines the image optimization strategy implemented for VowSwap, focusing on performance improvements for wedding-related imagery.

## Overview

Wedding imagery is a critical component of the VowSwap marketplace, as users need to see high-quality images of wedding dresses, decorations, and other items. However, high-quality images can significantly impact page load times and overall performance. Our optimization strategy addresses this challenge by implementing a comprehensive image optimization pipeline.

## Key Components

### 1. OptimizedImage Component

The `OptimizedImage` component is a wrapper around Next.js's Image component that provides additional optimizations:

```tsx
import OptimizedImage from "../Components/MainComponents/OptimizedImage/OptimizedImage";

// Usage
<OptimizedImage
  src="https://example.com/wedding-dress.jpg"
  alt="Beautiful wedding dress"
  width={800}
  height={600}
  quality={85}
  priority={false}
/>
```

**Features:**
- Automatic WebP conversion
- Responsive sizing based on viewport
- Lazy loading for off-screen images
- Blur-up image loading
- Priority loading for critical above-the-fold images

### 2. Image Optimization API

The `/api/image/optimize` API route handles server-side image processing and caching:

```
/api/image/optimize?url=https://example.com/image.jpg&width=800&height=600&quality=85&format=webp&fit=cover
```

**Parameters:**
- `url`: The source image URL (required)
- `width`: Desired width (default: 800)
- `height`: Desired height (default: 600)
- `quality`: Image quality (default: 80)
- `format`: Output format (webp, jpeg, avif) (default: webp)
- `fit`: Resize mode (cover, contain, fill, inside, outside) (default: cover)

### 3. Image Processing Utilities

The `libs/imageProcessing.ts` file contains utilities for processing images using Sharp:

```typescript
import { processImageFile, generateResponsiveImages } from "../libs/imageProcessing";

// Process a single image
const outputPath = await processImageFile(
  "path/to/input.jpg",
  "public/cache/images",
  { width: 800, height: 600, quality: 85, format: "webp" }
);

// Generate responsive images
const { paths, sizes } = await generateResponsiveImages(
  "path/to/input.jpg",
  "public/cache/images",
  "wedding-dress",
  [320, 640, 960, 1280, 1920]
);
```

## Performance Benefits

### 1. Reduced File Size

- WebP format reduces file size by 25-35% compared to JPEG at equivalent visual quality
- Automatic quality optimization balances visual fidelity with file size
- Responsive images serve appropriately sized images for each device

### 2. Faster Loading

- Lazy loading defers off-screen images until they're needed
- Blur-up loading provides immediate visual feedback
- Caching prevents redundant processing of the same image

### 3. Improved User Experience

- Progressive loading reduces perceived load time
- Prioritization ensures critical images load first
- Consistent image quality across the platform

## Implementation Details

### Caching Strategy

Images are cached at multiple levels:

1. **Server-side cache**: Processed images are stored in `/public/cache/images/` with hash-based filenames
2. **CDN cache**: Cache-Control headers enable CDN caching
3. **Browser cache**: Long cache lifetimes for static assets

### Error Handling

The image optimization pipeline includes robust error handling:

- Fallback to original image if processing fails
- Graceful degradation for unsupported formats
- Logging for debugging and monitoring

### Security Considerations

- Input validation to prevent path traversal attacks
- Rate limiting to prevent abuse
- Restricted file types and sizes

## Usage Guidelines

### When to Use OptimizedImage

Use the `OptimizedImage` component for:

- Product listings
- Detail pages
- Gallery views
- Any place where wedding-related imagery is displayed

### Priority Loading

Set `priority={true}` for:

- Hero images
- Above-the-fold product images
- Critical UI elements

### Quality Settings

Recommended quality settings:

- Wedding dresses: 85-90
- Decorations: 80-85
- Venue photos: 80-85
- Thumbnails: 70-75

## Example Implementation

See the example implementation at `/src/app/examples/optimized-images/page.tsx` for a demonstration of the OptimizedImage component in action.

## Future Improvements

Planned enhancements to the image optimization pipeline:

1. **AI-powered cropping**: Automatically identify and focus on the most important parts of wedding images
2. **AVIF support**: Add support for the newer AVIF format for even better compression
3. **Color profile optimization**: Preserve color accuracy for wedding dresses and decorations
4. **Perceptual compression**: Use perceptual metrics to optimize compression based on image content
5. **Integration with CDN**: Direct integration with a CDN for edge processing

## Monitoring and Analytics

The image optimization pipeline includes monitoring for:

- Cache hit rates
- Processing times
- Error rates
- Bandwidth savings

This data is available in the analytics dashboard to track performance improvements over time.
