import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { createHash } from 'crypto';

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'avif';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

const DEFAULT_OPTIONS: Required<ImageProcessingOptions> = {
  width: 800,
  height: 600,
  quality: 80,
  format: 'webp',
  fit: 'cover',
};

/**
 * Process an image file and save the result
 */
export async function processImageFile(
  inputPath: string,
  outputDir: string,
  options: ImageProcessingOptions = {}
): Promise<string> {
  // Create output directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });
  
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Process the image
  let processor = sharp(inputPath)
    .resize({
      width: mergedOptions.width,
      height: mergedOptions.height,
      fit: mergedOptions.fit,
    });
  
  // Convert to the specified format
  switch (mergedOptions.format) {
    case 'webp':
      processor = processor.webp({ quality: mergedOptions.quality });
      break;
    case 'jpeg':
      processor = processor.jpeg({ quality: mergedOptions.quality });
      break;
    case 'avif':
      processor = processor.avif({ quality: mergedOptions.quality });
      break;
  }
  
  // Generate a unique filename based on the input path and options
  const hash = createHash('md5')
    .update(inputPath + JSON.stringify(options))
    .digest('hex')
    .slice(0, 8);
  
  const ext = options.format || DEFAULT_OPTIONS.format;
  const filename = `${path.parse(inputPath).name}-${hash}.${ext}`;
  const outputPath = path.join(outputDir, filename);
  
  // Write the output file
  await processor.toFile(outputPath);
  
  return outputPath;
}

/**
 * Generate a placeholder blur data URL for an image
 */
export async function generateBlurDataURL(inputPath: string): Promise<string> {
  const placeholderBuffer = await sharp(inputPath)
    .resize(10, 10, { fit: 'inside' })
    .webp({ quality: 20 })
    .toBuffer();
  
  return `data:image/webp;base64,${placeholderBuffer.toString('base64')}`;
}

/**
 * Generate responsive image sizes for different viewports
 */
export async function generateResponsiveImages(
  inputPath: string,
  outputDir: string,
  baseName: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): Promise<{ paths: string[]; sizes: string }> {
  const paths: string[] = [];
  
  // Create output directory if it doesn't exist
  await fs.mkdir(outputDir, { recursive: true });
  
  // Generate images for each width
  for (const width of widths) {
    const filename = `${baseName}-${width}.webp`;
    const outputPath = path.join(outputDir, filename);
    
    await sharp(inputPath)
      .resize({
        width,
        height: undefined, // Maintain aspect ratio
        fit: 'cover',
      })
      .webp({ quality: 80 })
      .toFile(outputPath);
    
    paths.push(outputPath);
  }
  
  // Generate sizes attribute for responsive images
  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  
  return { paths, sizes };
}

/**
 * Create an optimized image component
 */
export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

/**
 * Process a batch of images
 */
export async function processBatchImages(
  inputPaths: string[],
  outputDir: string,
  options: ImageProcessingOptions = {}
): Promise<string[]> {
  const outputPaths: string[] = [];
  
  for (const inputPath of inputPaths) {
    const outputPath = await processImageFile(inputPath, outputDir, options);
    outputPaths.push(outputPath);
  }
  
  return outputPaths;
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  imagePath: string
): Promise<{ width: number; height: number }> {
  const metadata = await sharp(imagePath).metadata();
  
  return {
    width: metadata.width || 0,
    height: metadata.height || 0,
  };
}
