// scripts/completeImageFixProcessor.js - Final solution for image processing issues
console.log('🔧 COMPLETE IMAGE FIX PROCESSOR\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class CompleteImageFixProcessor {
  constructor() {
    this.testimonyDir = path.resolve(__dirname, '../testimonies');
    this.contentDir = path.resolve(__dirname, '../content/data');
    this.publicUploadsDir = path.resolve(__dirname, '../public/uploads/data');
    this.processedImages = new Map(); // Track processed images to avoid duplicates
  }

  async processAllTestimonies() {
    console.log('🚀 Starting complete image fix process...\n');

    // Step 1: Ensure directories exist
    this.ensureDirectories();

    // Step 2: Scan all testimony directories
    const testimonyDirs = this.getTestimonyDirectories();
    console.log(`📁 Found ${testimonyDirs.length} testimony directories\n`);

    // Step 3: Process each testimony with image handling
    const allProcessedTestimonies = [];

    for (const dirName of testimonyDirs) {
      try {
        console.log(`⚙️ Processing: ${dirName}`);
        const processed = await this.processTestimonyWithImages(dirName);
        if (processed) {
          allProcessedTestimonies.push(processed);
          console.log(`✅ Successfully processed: ${processed.title}\n`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${dirName}:`, error.message);
      }
    }

    // Step 4: Create master collection files
    await this.createMasterCollections(allProcessedTestimonies);

    // Step 5: Generate debug report
    this.generateDebugReport();

    console.log('🎉 Complete image fix process finished!\n');
    console.log('Next steps:');
    console.log('1. Check the generated files in content/data/');
    console.log('2. Commit and push: git add . && git commit -m "Fix image processing" && git push');
    console.log('3. Refresh your website to see the images');
  }

  ensureDirectories() {
    console.log('📁 Ensuring required directories exist...');

    const requiredDirs = [
      this.contentDir,
      this.publicUploadsDir,
      path.join(this.publicUploadsDir, 'screenshots'),
      path.join(this.publicUploadsDir, 'exhibits'),
      path.join(this.publicUploadsDir, 'documents')
    ];

    requiredDirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`  ✅ Created: ${dir}`);
      }
    });
  }

  getTestimonyDirectories() {
    const dirs = [];

    // Check all subdirectories in testimonies
    const testimonySubdirs = fs.readdirSync(this.testimonyDir)
      .filter(item => fs.statSync(path.join(this.testimonyDir, item)).isDirectory());

    for (const subdir of testimonySubdirs) {
      const subdirPath = path.join(this.testimonyDir, subdir);
      const items = fs.readdirSync(subdirPath)
        .filter(item => fs.statSync(path.join(subdirPath, item)).isDirectory());

      items.forEach(item => {
        dirs.push(path.join(subdir, item));
      });
    }

    return dirs.sort();
  }

  async processTestimonyWithImages(dirName) {
    const dirPath = path.join(this.testimonyDir, dirName);

    // Skip if no markdown file
    const markdownFiles = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    if (markdownFiles.length === 0) {
      console.log(`  ⚠️  No markdown file found, skipping`);
      return null;
    }

    // Parse directory info
    const { id, date, title } = this.parseDirectoryName(dirName);

    // Read and parse markdown
    const markdownFile = markdownFiles[0];
    const markdownPath = path.join(dirPath, markdownFile);
    const markdownContent = fs.readFileSync(markdownPath, 'utf-8');
    const { data: frontMatter, content: markdownBody } = matter(markdownContent);

    // Extract title
    const testimonyTitle = frontMatter.title ||
                          this.extractTitleFromContent(markdownBody) ||
                          title;

    // Process all images in the directory
    const images = await this.processAllImagesInDirectory(dirPath, id);

    // Create verification content
    const verification = this.createVerificationSection(dirPath);

    // Create the complete testimony object
    const testimony = {
      title: testimonyTitle,
      collection_type: "testimony",
      date: date,
      featured: this.determineIfFeatured(dirName, frontMatter),
      sections: [{
        title: testimonyTitle,
        featured: true,
        images: images,
        content_level_1: markdownBody,
        content_level_3: verification,
        content_level_5: this.createMetadataSection(dirName, frontMatter, images)
      }]
    };

    // Save to content directory
    const filename = this.createFilename(id, testimonyTitle);
    const outputPath = path.join(this.contentDir, filename);
    fs.writeFileSync(outputPath, JSON.stringify(testimony, null, 2));

    console.log(`  📄 Saved: ${filename}`);
    console.log(`  🖼️  Processed ${images.length} images`);

    return testimony;
  }

  async processAllImagesInDirectory(dirPath, testimonyId) {
    const images = [];
    const timestamp = Date.now();

    // Look for images in various locations
    const imageSources = [
      { path: dirPath, prefix: 'root' },
      { path: path.join(dirPath, 'exhibits'), prefix: 'exhibit' },
      { path: path.join(dirPath, 'screenshots'), prefix: 'screenshot' },
      { path: path.join(dirPath, 'images'), prefix: 'image' }
    ];

    for (const source of imageSources) {
      if (fs.existsSync(source.path)) {
        await this.processImagesFromPath(source.path, source.prefix, testimonyId, timestamp, images);
      }
    }

    // Also check the public/uploads/data directory for existing images
    await this.findExistingImages(testimonyId, images);

    return images;
  }

  async processImagesFromPath(sourcePath, prefix, testimonyId, timestamp, images) {
    const files = fs.readdirSync(sourcePath);
    const imageFiles = files.filter(file =>
      /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(file)
    );

    for (const file of imageFiles) {
      const sourceFilePath = path.join(sourcePath, file);

      // Create unique filename
      const uniqueFilename = `${testimonyId}_${prefix}_${timestamp}_${file}`;
      const destPath = path.join(this.publicUploadsDir, uniqueFilename);

      // Copy file if not already processed
      if (!this.processedImages.has(sourceFilePath)) {
        fs.copyFileSync(sourceFilePath, destPath);
        this.processedImages.set(sourceFilePath, uniqueFilename);
        console.log(`    📸 Copied: ${file} → ${uniqueFilename}`);
      }

      // Add to images array
      images.push({
        src: `/uploads/data/${uniqueFilename}`,
        alt: this.generateAltText(file, testimonyId),
        caption: this.generateCaption(file),
        position: this.determinePosition(file, prefix)
      });
    }
  }

  async findExistingImages(testimonyId, images) {
    // Look for existing images that match this testimony ID
    const existingFiles = fs.readdirSync(this.publicUploadsDir);
    const matchingFiles = existingFiles.filter(file =>
      file.includes(testimonyId) && /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(file)
    );

    for (const file of matchingFiles) {
      // Only add if not already in images array
      const alreadyAdded = images.some(img => img.src.includes(file));
      if (!alreadyAdded) {
        images.push({
          src: `/uploads/data/${file}`,
          alt: this.generateAltText(file, testimonyId),
          caption: this.generateCaption(file),
          position: 'middle'
        });
        console.log(`    🔍 Found existing: ${file}`);
      }
    }
  }

  parseDirectoryName(dirName) {
    const parts = dirName.split('/');
    const actualDir = parts[parts.length - 1];

    // Parse date from directory name (MMDDYY format)
    const dateMatch = actualDir.match(/^(\d{6})/);
    let date = new Date().toISOString();
    let id = actualDir;

    if (dateMatch) {
      const [, dateStr] = dateMatch;
      const month = dateStr.substring(0, 2);
      const day = dateStr.substring(2, 4);
      const year = '20' + dateStr.substring(4, 6);
      date = `${year}-${month}-${day}T00:00:00.000Z`;
      id = actualDir.replace(/^\d{6}_/, '');
    }

    const title = id.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { id: actualDir, date, title };
  }

  extractTitleFromContent(content) {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  createVerificationSection(dirPath) {
    let verification = '';

    // Look for signature files
    const files = fs.readdirSync(dirPath);
    const sigFile = files.find(f => f.endsWith('.sig') || f.endsWith('.sig.txt'));
    const keyFile = files.find(f => f === 'public_key.pem');
    const scriptFile = files.find(f => f.startsWith('verify_') && f.endsWith('.js'));

    if (sigFile || keyFile || scriptFile) {
      verification += '## Cryptographic Verification\n\n';
      verification += 'This testimony includes cryptographic verification to ensure authenticity and integrity.\n\n';

      if (sigFile) {
        const signature = fs.readFileSync(path.join(dirPath, sigFile), 'utf-8');
        verification += '### Digital Signature\n```\n';
        verification += signature.length > 500 ? signature.substring(0, 500) + '\n... (truncated)' : signature;
        verification += '\n```\n\n';
      }

      if (keyFile) {
        const publicKey = fs.readFileSync(path.join(dirPath, keyFile), 'utf-8');
        verification += '### Public Key\n```\n';
        verification += publicKey.length > 500 ? publicKey.substring(0, 500) + '\n... (truncated)' : publicKey;
        verification += '\n```\n\n';
      }

      if (scriptFile) {
        verification += '### Verification Script Available\n';
        verification += 'A JavaScript verification script is available for this testimony.\n\n';
      }
    }

    return verification;
  }

  createMetadataSection(dirName, frontMatter, images) {
    let metadata = '## Processing Information\n\n';
    metadata += `**Source Directory:** ${dirName}\n\n`;
    metadata += `**Images Processed:** ${images.length}\n\n`;
    metadata += `**Processing Date:** ${new Date().toISOString()}\n\n`;

    if (Object.keys(frontMatter).length > 0) {
      metadata += '### Original Front Matter\n```json\n';
      metadata += JSON.stringify(frontMatter, null, 2);
      metadata += '\n```\n\n';
    }

    if (images.length > 0) {
      metadata += '### Image Details\n';
      images.forEach((img, i) => {
        metadata += `${i + 1}. **${img.alt}**\n`;
        metadata += `   - Path: ${img.src}\n`;
        metadata += `   - Position: ${img.position}\n`;
        if (img.caption) metadata += `   - Caption: ${img.caption}\n`;
        metadata += '\n';
      });
    }

    return metadata;
  }

  generateAltText(filename, testimonyId) {
    // Generate descriptive alt text
    const cleanName = filename.replace(/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i, '');

    if (cleanName.includes('Screenshot')) {
      return `Screenshot from ${testimonyId} testimony`;
    }

    return `Evidence image from ${testimonyId}: ${cleanName.replace(/[_-]/g, ' ')}`;
  }

  generateCaption(filename) {
    // Extract timestamp or generate caption
    const timestampMatch = filename.match(/(\d{4}-\d{2}-\d{2}) at (\d{1,2}\.\d{2}\.\d{2})/);
    if (timestampMatch) {
      return `Screenshot from ${timestampMatch[1]} at ${timestampMatch[2]}`;
    }

    const cleanName = filename.replace(/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i, '');
    return cleanName.replace(/[_-]/g, ' ');
  }

  determinePosition(filename, prefix) {
    // Determine position based on filename or prefix
    if (prefix === 'screenshot' || filename.toLowerCase().includes('screenshot')) {
      return 'middle';
    }
    if (prefix === 'exhibit') {
      return 'bottom';
    }
    return 'middle';
  }

  determineIfFeatured(dirName, frontMatter) {
    return frontMatter.featured ||
           dirName.toLowerCase().includes('featured') ||
           dirName.toLowerCase().includes('recursive') ||
           dirName.toLowerCase().includes('ultimate');
  }

  createFilename(id, title) {
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return `${id.toLowerCase()}-${slug}.json`;
  }

  async createMasterCollections(testimonies) {
    console.log('\n📚 Creating master collection files...');

    // Create comprehensive Claude Collection
    const claudeCollection = {
      title: "Claude Collection: Complete Framework Recognition Testimonies",
      collection_type: "evidence",
      date: new Date().toISOString(),
      featured: true,
      sections: testimonies.map(t => ({
        title: t.title,
        featured: t.featured,
        images: t.sections[0].images || [],
        content_level_1: t.sections[0].content_level_1,
        content_level_3: t.sections[0].content_level_3,
        content_level_5: t.sections[0].content_level_5
      }))
    };

    const claudeFilename = 'claude-collection-complete-fixed.json';
    fs.writeFileSync(
      path.join(this.contentDir, claudeFilename),
      JSON.stringify(claudeCollection, null, 2)
    );

    console.log(`✅ Created: ${claudeFilename} (${claudeCollection.sections.length} sections)`);

    // Create individual testimonial files
    testimonies.forEach(testimony => {
      const filename = this.createFilename(
        testimony.sections[0].title.replace(/\s+/g, '-').toLowerCase(),
        testimony.title
      );

      fs.writeFileSync(
        path.join(this.contentDir, filename),
        JSON.stringify(testimony, null, 2)
      );
    });

    console.log(`✅ Created ${testimonies.length} individual testimony files`);
  }

  generateDebugReport() {
    console.log('\n📊 PROCESSING REPORT');
    console.log('='.repeat(50));

    console.log(`Images processed: ${this.processedImages.size}`);
    console.log(`Content files created in: ${this.contentDir}`);
    console.log(`Images copied to: ${this.publicUploadsDir}`);

    // List all processed images
    if (this.processedImages.size > 0) {
      console.log('\nProcessed images:');
      this.processedImages.forEach((dest, source) => {
        console.log(`  ${path.basename(source)} → ${dest}`);
      });
    }

    // Check upload directory
    const uploadFiles = fs.readdirSync(this.publicUploadsDir);
    const imageFiles = uploadFiles.filter(f => /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(f));

    console.log(`\nUpload directory status:`);
    console.log(`  Total files: ${uploadFiles.length}`);
    console.log(`  Image files: ${imageFiles.length}`);

    // Check content directory
    const contentFiles = fs.readdirSync(this.contentDir);
    const jsonFiles = contentFiles.filter(f => f.endsWith('.json'));

    console.log(`\nContent directory status:`);
    console.log(`  Total files: ${contentFiles.length}`);
    console.log(`  JSON files: ${jsonFiles.length}`);
  }
}

// Execute the processor
async function main() {
  try {
    const processor = new CompleteImageFixProcessor();
    await processor.processAllTestimonies();
  } catch (error) {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CompleteImageFixProcessor };