import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { promisify } from "util";

// Convert callback-based fs methods to promise-based
const mkdir = promisify(fs.mkdir);
const access = promisify(fs.access);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
import { createHash } from "crypto";

export const dynamic = "force-dynamic";

interface OptimizeImageParams {
  url: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "avif";
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";
}

const DEFAULT_OPTIONS = {
  width: 800,
  height: 600,
  quality: 80,
  format: "webp" as const,
  fit: "cover" as const,
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    
    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }
    
    // Parse parameters
    const params: OptimizeImageParams = {
      url: decodeURIComponent(url),
      width: searchParams.has("width")
        ? parseInt(searchParams.get("width") as string, 10)
        : DEFAULT_OPTIONS.width,
      height: searchParams.has("height")
        ? parseInt(searchParams.get("height") as string, 10)
        : DEFAULT_OPTIONS.height,
      quality: searchParams.has("quality")
        ? parseInt(searchParams.get("quality") as string, 10)
        : DEFAULT_OPTIONS.quality,
      format: (searchParams.get("format") as "webp" | "jpeg" | "avif") || DEFAULT_OPTIONS.format,
      fit: (searchParams.get("fit") as "cover" | "contain" | "fill" | "inside" | "outside") || DEFAULT_OPTIONS.fit,
    };
    
    // Generate a cache key based on the parameters
    const cacheKey = createHash("md5")
      .update(JSON.stringify(params))
      .digest("hex");
    
    // Define cache paths
    const cacheDir = path.join(process.cwd(), "public", "cache", "images");
    const cacheFileName = `${cacheKey}.${params.format}`;
    const cachePath = path.join(cacheDir, cacheFileName);
    const cachePublicPath = `/cache/images/${cacheFileName}`;
    
    // Create cache directory if it doesn't exist
    await mkdir(cacheDir, { recursive: true });
    
    // Check if the image is already cached
    try {
      await access(cachePath);
      // If we get here, the file exists, so redirect to it
      return NextResponse.redirect(new URL(cachePublicPath, request.url));
    } catch (error) {
      // File doesn't exist, continue with processing
    }
    
    // Process the image
    try {
      let inputPath: string;
      
      if (params.url.startsWith("/")) {
        // Local image
        inputPath = path.join(process.cwd(), "public", params.url);
      } else {
        // Remote image - download to temp file
        const response = await fetch(params.url);
        if (!response.ok) {
          return NextResponse.json(
            { error: "Failed to fetch image" },
            { status: 500 }
          );
        }
        
        const tempDir = path.join(process.cwd(), "public", "cache", "temp");
        await mkdir(tempDir, { recursive: true });
        
        const tempFileName = `temp-${Date.now()}.bin`;
        const tempFilePath = path.join(tempDir, tempFileName);
        
        const arrayBuffer = await response.arrayBuffer();
        await writeFile(tempFilePath, new Uint8Array(arrayBuffer));
        
        inputPath = tempFilePath;
      }
      
      // Process with sharp
      const sharpInstance = sharp(inputPath);
      
      // Resize
      sharpInstance.resize({
        width: params.width,
        height: params.height,
        fit: params.fit,
      });
      
      // Convert to the specified format
      switch (params.format) {
        case "webp":
          sharpInstance.webp({ quality: params.quality });
          break;
        case "jpeg":
          sharpInstance.jpeg({ quality: params.quality });
          break;
        case "avif":
          sharpInstance.avif({ quality: params.quality });
          break;
      }
      
      // Save to cache file
      await sharpInstance.toFile(cachePath);
      
      // Clean up temp file if it was a remote image
      if (!params.url.startsWith("/")) {
        try {
          await unlink(inputPath);
        } catch (error) {
          console.error("Failed to delete temp file:", error);
        }
      }
      
      // Redirect to the cached file
      return NextResponse.redirect(new URL(cachePublicPath, request.url));
    } catch (error) {
      console.error("Image processing error:", error);
      return NextResponse.json(
        { error: "Failed to process image" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Image optimization error:", error);
    return NextResponse.json(
      { error: "Failed to optimize image" },
      { status: 500 }
    );
  }
}
