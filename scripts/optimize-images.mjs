/**
 * ONIX Image Optimization Script
 * Converts images to WebP and optimizes PNG/JPEG
 *
 * Usage: node scripts/optimize-images.mjs
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Directories to process
const IMAGE_DIRS = [
    'public/images',
    'images/icons',
    'images/process',
    'logos',
    'public/logos'
];

// Quality settings
const QUALITY = {
    webp: 80,
    png: 80,
    jpeg: 80
};

// Stats tracking
const stats = {
    processed: 0,
    skipped: 0,
    errors: 0,
    totalSavedBytes: 0
};

async function optimizeImage(inputPath) {
    const ext = path.extname(inputPath).toLowerCase();
    const baseName = path.basename(inputPath, ext);
    const dirName = path.dirname(inputPath);

    // Skip already optimized files
    if (baseName.endsWith('-optimized') || baseName.endsWith('.webp')) {
        stats.skipped++;
        return;
    }

    try {
        const originalSize = fs.statSync(inputPath).size;
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        console.log(`\n📷 Processing: ${path.relative(projectRoot, inputPath)}`);
        console.log(`   Original: ${(originalSize / 1024).toFixed(1)}KB (${metadata.width}x${metadata.height})`);

        // Generate WebP version
        const webpPath = path.join(dirName, `${baseName}.webp`);
        await image
            .webp({ quality: QUALITY.webp })
            .toFile(webpPath);

        const webpSize = fs.statSync(webpPath).size;
        const webpSavings = ((1 - webpSize / originalSize) * 100).toFixed(1);
        console.log(`   WebP: ${(webpSize / 1024).toFixed(1)}KB (${webpSavings}% smaller)`);

        // Optimize original format too
        let optimizedPath = inputPath;
        let optimizedSize = originalSize;

        if (ext === '.png') {
            // Optimize PNG
            const tempPath = path.join(dirName, `${baseName}-temp.png`);
            await sharp(inputPath)
                .png({
                    quality: QUALITY.png,
                    compressionLevel: 9,
                    palette: true
                })
                .toFile(tempPath);

            optimizedSize = fs.statSync(tempPath).size;

            // Only replace if smaller
            if (optimizedSize < originalSize) {
                fs.unlinkSync(inputPath);
                fs.renameSync(tempPath, inputPath);
                const pngSavings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
                console.log(`   PNG optimized: ${(optimizedSize / 1024).toFixed(1)}KB (${pngSavings}% smaller)`);
            } else {
                fs.unlinkSync(tempPath);
                console.log(`   PNG: kept original (optimization didn't help)`);
            }
        } else if (ext === '.jpg' || ext === '.jpeg') {
            // Optimize JPEG
            const tempPath = path.join(dirName, `${baseName}-temp${ext}`);
            await sharp(inputPath)
                .jpeg({
                    quality: QUALITY.jpeg,
                    mozjpeg: true
                })
                .toFile(tempPath);

            optimizedSize = fs.statSync(tempPath).size;

            if (optimizedSize < originalSize) {
                fs.unlinkSync(inputPath);
                fs.renameSync(tempPath, inputPath);
                const jpegSavings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
                console.log(`   JPEG optimized: ${(optimizedSize / 1024).toFixed(1)}KB (${jpegSavings}% smaller)`);
            } else {
                fs.unlinkSync(tempPath);
                console.log(`   JPEG: kept original (optimization didn't help)`);
            }
        }

        stats.processed++;
        stats.totalSavedBytes += (originalSize - webpSize);

    } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        stats.errors++;
    }
}

async function processDirectory(dirPath) {
    const fullPath = path.join(projectRoot, dirPath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Directory not found: ${dirPath}`);
        return;
    }

    console.log(`\n📁 Scanning: ${dirPath}`);

    const files = fs.readdirSync(fullPath);

    for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            continue; // Skip subdirectories in this simple script
        }

        const ext = path.extname(file).toLowerCase();
        if (['.png', '.jpg', '.jpeg', '.gif'].includes(ext)) {
            await optimizeImage(filePath);
        }
    }
}

async function main() {
    console.log('🚀 ONIX Image Optimization');
    console.log('==========================\n');
    console.log(`Quality settings: WebP=${QUALITY.webp}%, PNG=${QUALITY.png}%, JPEG=${QUALITY.jpeg}%`);

    const startTime = Date.now();

    for (const dir of IMAGE_DIRS) {
        await processDirectory(dir);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('\n==========================');
    console.log('📊 Optimization Complete!');
    console.log(`   Processed: ${stats.processed} images`);
    console.log(`   Skipped: ${stats.skipped} images`);
    console.log(`   Errors: ${stats.errors}`);
    console.log(`   Total saved: ${(stats.totalSavedBytes / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Duration: ${duration}s`);
    console.log('\n💡 WebP versions created alongside originals.');
    console.log('   Update your HTML to use WebP with PNG/JPEG fallback:');
    console.log('   <picture>');
    console.log('     <source srcset="image.webp" type="image/webp">');
    console.log('     <img src="image.png" alt="...">');
    console.log('   </picture>');
}

main().catch(console.error);
