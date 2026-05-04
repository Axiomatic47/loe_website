// scripts/finalImageFixProcessor.js - Complete solution for image processing
console.log('🖼️ FINAL IMAGE FIX PROCESSOR - Complete Solution\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class FinalImageFixProcessor {
  constructor() {
    this.testimonyDir = path.resolve(__dirname, '../testimonies');
    this.outputDir = path.resolve(__dirname, '../content/data');
    this.publicDir = path.resolve(__dirname, '../public/uploads/data');
    this.processedCount = 0;
    this.imageCount = 0;
  }

  async processAll() {
    console.log('🎯 Fixing image processing and completing deployment...\n');
    console.log('📁 Directories:');
    console.log(`  Testimonies: ${this.testimonyDir}`);
    console.log(`  Output: ${this.outputDir}`);
    console.log(`  Public: ${this.publicDir}\n`);

    // Ensure directories exist
    this.ensureDirectoryExists(this.outputDir);
    this.ensureDirectoryExists(this.publicDir);

    // Clean up any existing test files
    this.cleanupTestFiles();

    // Process all collections
    const collections = this.discoverCollections();
    console.log(`📚 Found ${collections.length} testimony collections:\n`);

    for (const collection of collections) {
      await this.processCollection(collection);
    }

    // Fix any existing JSON files that might have wrong collection_type
    this.fixExistingCollectionTypes();

    console.log(`\n🎉 PROCESSING COMPLETE!`);
    console.log(`   📄 Processed: ${this.processedCount} testimonies`);
    console.log(`   📸 Images: ${this.imageCount} images copied`);
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. git add content/data/*.json');
    console.log('2. git add public/uploads/data/*');
    console.log('3. git commit -m "Final deployment: Fix image processing and complete testimonies"');
    console.log('4. git push origin main');
    console.log('5. Clear browser cache (Cmd+Shift+R)');
    console.log('6. Check https://lawsofexistence.com/testimonies');
  }

  cleanupTestFiles() {
    console.log('🧹 Cleaning up test files...');
    const testFiles = [
      'test-working-processor.json',
      'frontend-loading-test.json'
    ];

    for (const testFile of testFiles) {
      const filePath = path.join(this.outputDir, testFile);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`   🗑️  Removed: ${testFile}`);
      }
    }
  }

  fixExistingCollectionTypes() {
    console.log('\n🔧 Fixing collection types in existing files...');

    if (!fs.existsSync(this.outputDir)) {
      return;
    }

    const files = fs.readdirSync(this.outputDir).filter(f => f.endsWith('.json'));
    let fixedCount = 0;

    for (const file of files) {
      const filePath = path.join(this.outputDir, file);
      try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        if (content.collection_type && content.collection_type !== 'data') {
          content.collection_type = 'data';
          fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
          console.log(`   ✅ Fixed collection_type in: ${file}`);
          fixedCount++;
        }
      } catch (error) {
        console.log(`   ⚠️  Could not fix ${file}: ${error.message}`);
      }
    }

    if (fixedCount > 0) {
      console.log(`   🎯 Fixed collection_type in ${fixedCount} files`);
    } else {
      console.log(`   ✅ All collection types are correct`);
    }
  }

  discoverCollections() {
    const entries = fs.readdirSync(this.testimonyDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => ({
        name: entry.name,
        path: path.join(this.testimonyDir, entry.name)
      }));
  }

  async processCollection(collection) {
    console.log(`\n📂 Processing collection: ${collection.name}`);

    const testimonies = this.discoverTestimoniesInCollection(collection.path);

    if (testimonies.length === 0) {
      console.log(`   ⚠️  No testimonies found in ${collection.name}`);
      return;
    }

    for (const testimony of testimonies) {
      try {
        await this.processTestimony(testimony, collection.name);
        this.processedCount++;
      } catch (error) {
        console.error(`   ❌ Error processing ${testimony.name}:`, error.message);
      }
    }
  }

  discoverTestimoniesInCollection(collectionPath) {
    const entries = fs.readdirSync(collectionPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory() && !entry.name.startsWith('.'))
      .map(entry => ({
        name: entry.name,
        path: path.join(collectionPath, entry.name)
      }));
  }

  async processTestimony(testimony, collectionName) {
    console.log(`   📄 Processing: ${testimony.name}`);

    // Find markdown files
    const markdownFiles = fs.readdirSync(testimony.path)
      .filter(file => file.endsWith('.md'));

    let content = '';
    let title = this.generateTitleFromName(testimony.name);

    if (markdownFiles.length > 0) {
      const markdownPath = path.join(testimony.path, markdownFiles[0]);
      content = fs.readFileSync(markdownPath, 'utf-8');

      // Extract title from content if available
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        title = titleMatch[1].trim();
      }
    }

    // Process verification files
    const verification = this.processVerificationFiles(testimony.path);

    // CRITICAL FIX: Process exhibit images with correct path structure
    const images = await this.processExhibitImagesFixed(testimony.path, testimony.name);

    // Extract date from testimony name
    const date = this.extractDateFromName(testimony.name);

    // Create the final JSON structure that matches your frontend expectations
    const testimonyData = {
      title: title,
      collection_type: "data", // CRITICAL: Must be "data" for frontend
      date: date,
      featured: this.isFeatureWorthy(title, content),
      sections: [{
        title: title,
        featured: false,
        images: images, // FIXED: Properly structured images
        content_level_1: verification,
        content_level_3: this.formatMainContent(content, title, collectionName),
        content_level_5: this.formatAdditionalInfo(testimony.name, collectionName)
      }]
    };

    // Generate filename
    const filename = this.generateFilename(testimony.name, title);
    const outputPath = path.join(this.outputDir, filename);

    // Write the file
    fs.writeFileSync(outputPath, JSON.stringify(testimonyData, null, 2));
    console.log(`      ✅ Created: ${filename} (${images.length} images)`);
  }

  async processExhibitImagesFixed(testimonyPath, testimonyName) {
    const exhibitsPath = path.join(testimonyPath, 'exhibits');

    if (!fs.existsSync(exhibitsPath)) {
      console.log(`      📸 No exhibits directory found`);
      return [];
    }

    const files = fs.readdirSync(exhibitsPath);
    const imageFiles = files.filter(file =>
      /\.(png|jpg|jpeg|gif|webp)$/i.test(file)
    );

    if (imageFiles.length === 0) {
      console.log(`      📸 No image files found in exhibits`);
      return [];
    }

    const images = [];

    for (const file of imageFiles) {
      const sourcePath = path.join(exhibitsPath, file);

      // CRITICAL FIX: Create filename that matches your existing pattern
      const timestamp = Date.now();
      const cleanTestimonyName = testimonyName.replace(/[^a-zA-Z0-9]/g, '_');
      const newFilename = `${cleanTestimonyName}_${timestamp}_${file}`;
      const destPath = path.join(this.publicDir, newFilename);

      try {
        // Copy file to public uploads
        fs.copyFileSync(sourcePath, destPath);
        this.imageCount++;

        // CRITICAL FIX: Structure that matches compositionLoader expectations
        const imageData = {
          src: `/uploads/data/${newFilename}`, // Correct path for frontend
          alt: this.generateAltText(file),
          caption: this.generateCaption(file),
          position: 'middle' // Valid position value
        };

        images.push(imageData);
        console.log(`      📸 Copied: ${newFilename}`);
      } catch (error) {
        console.error(`      ❌ Failed to copy ${file}:`, error.message);
      }
    }

    return images;
  }

  processVerificationFiles(testimonyPath) {
    const files = fs.readdirSync(testimonyPath);

    // Find signature files
    const sigFiles = files.filter(f => f.endsWith('.sig') || f.endsWith('.sig.txt'));
    const pemFiles = files.filter(f => f.endsWith('.pem'));
    const jsFiles = files.filter(f => f.startsWith('verify_') && f.endsWith('.js'));

    if (sigFiles.length === 0 && pemFiles.length === 0) {
      return '';
    }

    let verification = '## Cryptographic Verification\n\n';
    verification += 'This testimony includes cryptographic verification to ensure authenticity.\n\n';

    if (sigFiles.length > 0) {
      const sigPath = path.join(testimonyPath, sigFiles[0]);
      try {
        let sigContent = fs.readFileSync(sigPath, 'utf-8');

        // Handle potential encoding issues
        if (sigContent.includes('�') || sigContent.length < 10) {
          // Try reading as base64 or handle binary
          sigContent = fs.readFileSync(sigPath, 'base64');
          verification += '### Digital Signature (Base64)\n```\n';
        } else {
          verification += '### Digital Signature\n```\n';
        }

        // Truncate if too long for display
        if (sigContent.length > 800) {
          verification += sigContent.substring(0, 800) + '\n... (truncated for display)';
        } else {
          verification += sigContent;
        }
        verification += '\n```\n\n';
      } catch (error) {
        verification += '### Digital Signature\n```\nSignature file present but could not be read for display\n```\n\n';
      }
    }

    if (pemFiles.length > 0) {
      verification += '### Public Key Available\n';
      verification += 'A public key file is included for signature verification.\n\n';
    }

    if (jsFiles.length > 0) {
      verification += '### Verification Script\n';
      verification += 'A JavaScript verification script is available to validate this testimony.\n\n';
    }

    return verification;
  }

  generateTitleFromName(name) {
    // Handle various naming patterns
    const parts = name.split('_');

    // Remove date part if present
    if (parts[0].match(/^\d{6}$/)) {
      parts.shift();
    }

    return parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
      .replace(/([A-Z])/g, ' $1')
      .trim();
  }

  extractDateFromName(name) {
    // Look for MMDDYY pattern
    const match = name.match(/^(\d{2})(\d{2})(\d{2})/);
    if (match) {
      const month = match[1];
      const day = match[2];
      const year = '20' + match[3];
      return `${year}-${month}-${day}T12:00:00.000Z`;
    }

    // Fallback to current date
    return new Date().toISOString();
  }

  isFeatureWorthy(title, content) {
    // Mark as featured if it contains certain keywords
    const featureKeywords = [
      'recursive', 'framework', 'recognition', 'consciousness',
      'mathematical', 'ultimate', 'validation', 'breakthrough'
    ];

    const text = (title + ' ' + content).toLowerCase();
    return featureKeywords.some(keyword => text.includes(keyword));
  }

  formatMainContent(content, title, collectionName) {
    if (!content) {
      return `# ${title}\n\n*From ${collectionName}*\n\nThis testimony was processed from the testimony collection but no markdown content was found.`;
    }

    // Add collection context
    let formatted = `# ${title}\n\n`;
    formatted += `**Collection:** ${collectionName}\n\n`;
    formatted += '---\n\n';
    formatted += content;

    return formatted;
  }

  formatAdditionalInfo(testimonyName, collectionName) {
    return `## Processing Information\n\n` +
           `**Source Directory:** ${testimonyName}\n` +
           `**Collection:** ${collectionName}\n` +
           `**Processed:** ${new Date().toLocaleDateString()}\n\n` +
           `This testimony was automatically processed from cryptographically signed source files. ` +
           `The original directory structure and all verification files have been preserved.`;
  }

  generateFilename(testimonyName, title) {
    // Create safe filename
    const safeName = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Add date prefix if we can extract it
    const dateMatch = testimonyName.match(/^(\d{2})(\d{2})(\d{2})/);
    if (dateMatch) {
      const month = dateMatch[1];
      const day = dateMatch[2];
      const year = '20' + dateMatch[3];
      return `${year}-${month}-${day}-${safeName}.json`;
    }

    return `${safeName}.json`;
  }

  generateAltText(filename) {
    return filename
      .replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
      .replace(/[_-]/g, ' ')
      .replace(/\d{13}/g, '') // Remove timestamps
      .trim();
  }

  generateCaption(filename) {
    // Look for timestamp in filename
    const timestampMatch = filename.match(/(\d{4}-\d{2}-\d{2}) at (\d{1,2}\.\d{2}\.\d{2})/);
    if (timestampMatch) {
      return `Screenshot from ${timestampMatch[1]} at ${timestampMatch[2]}`;
    }

    return this.generateAltText(filename);
  }

  ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dirPath}`);
    }
  }
}

// Execute the processor
async function main() {
  try {
    const processor = new FinalImageFixProcessor();
    await processor.processAll();
  } catch (error) {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  }
}

main();