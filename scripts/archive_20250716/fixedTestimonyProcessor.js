// scripts/fixedTestimonyProcessor.js - Fixed testimony processor with proper image handling
console.log('🔧 PROCESSING TESTIMONIES WITH CORRECT IMAGE PATHS\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const testimonySourceDir = path.join(__dirname, '../testimonies');
const contentDir = path.join(__dirname, '../content/data');
const publicUploadsDir = path.join(__dirname, '../public/uploads/data');

// Ensure directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

// Process images from exhibits folder
function processExhibits(testimonyDir, testimonyId) {
  const exhibitsDir = path.join(testimonyDir, 'exhibits');

  if (!fs.existsSync(exhibitsDir)) {
    console.log(`   📷 No exhibits folder found in ${testimonyId}`);
    return [];
  }

  const files = fs.readdirSync(exhibitsDir);
  const imageFiles = files.filter(file =>
    /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
  );

  console.log(`   📷 Found ${imageFiles.length} image files in ${testimonyId}`);

  const images = [];

  imageFiles.forEach((file, index) => {
    const sourcePath = path.join(exhibitsDir, file);

    // Create a clean filename (remove timestamps and clean up)
    const cleanFilename = `${testimonyId}_${index + 1}_${file}`;
    const destPath = path.join(publicUploadsDir, cleanFilename);

    try {
      // Copy file to correct uploads directory
      fs.copyFileSync(sourcePath, destPath);

      // Create image data object with correct path format
      const imageData = {
        src: `/uploads/data/${cleanFilename}`, // This matches what resolveImagePath expects
        alt: generateAltFromFilename(file, testimonyId),
        caption: generateCaptionFromFilename(file),
        position: 'middle'
      };

      images.push(imageData);
      console.log(`   ✅ Copied: ${cleanFilename}`);

    } catch (error) {
      console.error(`   ❌ Error copying ${file}:`, error.message);
    }
  });

  return images;
}

// Generate alt text from filename
function generateAltFromFilename(filename, testimonyId) {
  const cleanName = filename
    .replace(/\.(png|jpg|jpeg|gif|webp|svg)$/i, '')
    .replace(/[_-]/g, ' ')
    .replace(/\d{4}-\d{2}-\d{2}/g, '')
    .replace(/at \d{1,2}\.\d{2}\.\d{2}/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleanName || `${testimonyId} evidence`;
}

// Generate caption from filename
function generateCaptionFromFilename(filename) {
  const timestampMatch = filename.match(/(\d{4}-\d{2}-\d{2}) at (\d{1,2}\.\d{2}\.\d{2})/);
  if (timestampMatch) {
    return `Screenshot from ${timestampMatch[1]} at ${timestampMatch[2]}`;
  }

  const cleanName = filename
    .replace(/\.(png|jpg|jpeg|gif|webp|svg)$/i, '')
    .replace(/[_-]/g, ' ')
    .trim();

  return cleanName || 'Evidence image';
}

// Process a single testimony directory
function processTestimonyDirectory(testimonyDir) {
  const dirName = path.basename(testimonyDir);
  console.log(`📂 Processing: ${dirName}`);

  // Parse directory name (MMDDYY_Description format)
  const parts = dirName.split('_');
  const datePart = parts[0];

  // Convert MMDDYY to proper date
  const month = datePart.substring(0, 2);
  const day = datePart.substring(2, 4);
  const year = '20' + datePart.substring(4, 6);
  const date = `${year}-${month}-${day}T12:00:00.000Z`;

  // Find main content file
  const files = fs.readdirSync(testimonyDir);
  const mainFile = files.find(file =>
    file.endsWith('.md') || file.endsWith('.txt')
  );

  let content = '';
  let title = '';

  if (mainFile) {
    const mainContent = fs.readFileSync(path.join(testimonyDir, mainFile), 'utf-8');
    content = mainContent;

    // Extract title from content
    const titleMatch = mainContent.match(/^#\s+(.+)$/m);
    title = titleMatch ? titleMatch[1].trim() : generateTitleFromDirectory(dirName);
  } else {
    title = generateTitleFromDirectory(dirName);
    content = `# ${title}\n\nTestimony content not found.`;
  }

  // Find signature files
  const signature = files.find(file => file.endsWith('.sig') || file.endsWith('.sig.txt'));
  const publicKey = files.find(file => file.includes('public_key'));

  let verificationContent = '';
  if (signature || publicKey) {
    verificationContent = '\n\n## Cryptographic Verification\n\n';
    verificationContent += 'This testimony includes cryptographic verification to ensure authenticity and integrity.\n\n';

    if (signature) {
      const sigContent = fs.readFileSync(path.join(testimonyDir, signature), 'utf-8');
      verificationContent += '### Digital Signature\n```\n';
      verificationContent += sigContent.substring(0, 500);
      if (sigContent.length > 500) verificationContent += '\n... (truncated for display)';
      verificationContent += '\n```\n\n';
    }

    if (publicKey) {
      const keyContent = fs.readFileSync(path.join(testimonyDir, publicKey), 'utf-8');
      verificationContent += '### Public Key\n```\n';
      verificationContent += keyContent.substring(0, 500);
      if (keyContent.length > 500) verificationContent += '\n... (truncated for display)';
      verificationContent += '\n```\n\n';
    }
  }

  // Process images
  const images = processExhibits(testimonyDir, dirName);

  // Create section data
  const section = {
    title: title,
    featured: false,
    content_level_1: '',
    content_level_3: content + verificationContent,
    content_level_5: '',
    images: images
  };

  return {
    testimonyId: dirName,
    title: title,
    date: date,
    section: section
  };
}

// Generate title from directory name
function generateTitleFromDirectory(dirName) {
  return dirName.split('_')
    .slice(1)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

// Main processing function
async function processAllTestimonies() {
  console.log('🚀 Starting testimony processing...\n');

  // Ensure directories exist
  ensureDirectoryExists(contentDir);
  ensureDirectoryExists(publicUploadsDir);

  // Check if testimonies directory exists
  if (!fs.existsSync(testimonySourceDir)) {
    console.error(`❌ Testimonies directory not found: ${testimonySourceDir}`);
    return;
  }

  // Get all testimony directories
  const testimonyDirs = fs.readdirSync(testimonySourceDir)
    .filter(item => {
      const fullPath = path.join(testimonySourceDir, item);
      return fs.statSync(fullPath).isDirectory();
    })
    .map(item => path.join(testimonySourceDir, item));

  console.log(`📁 Found ${testimonyDirs.length} testimony directories\n`);

  if (testimonyDirs.length === 0) {
    console.log('⚠️  No testimony directories found to process');
    return;
  }

  // Process each testimony
  const allSections = [];

  for (const testimonyDir of testimonyDirs) {
    try {
      const processed = processTestimonyDirectory(testimonyDir);
      allSections.push(processed.section);
      console.log(`✅ Successfully processed: ${processed.title}\n`);
    } catch (error) {
      console.error(`❌ Error processing ${path.basename(testimonyDir)}:`, error.message);
    }
  }

  // Create the collection composition
  const composition = {
    title: "Framework Recognition Testimonies - Evidence Collection",
    collection_type: "data", // This is crucial - must be "data" for /composition/data route
    date: "2025-07-14T12:00:00.000Z",
    featured: true,
    sections: allSections
  };

  // Write the composition file
  const filename = 'framework-recognition-testimonies.json';
  const outputPath = path.join(contentDir, filename);

  try {
    fs.writeFileSync(outputPath, JSON.stringify(composition, null, 2));
    console.log(`📄 Created composition file: ${filename}`);
    console.log(`📍 Location: ${outputPath}`);
    console.log(`📊 Total sections: ${allSections.length}`);

    // Count total images
    const totalImages = allSections.reduce((sum, section) => sum + (section.images?.length || 0), 0);
    console.log(`🖼️  Total images: ${totalImages}`);

  } catch (error) {
    console.error('❌ Error writing composition file:', error);
  }

  console.log('\n🎉 Testimony processing complete!');
  console.log('📍 Check your evidence page at: http://localhost:3000/composition/data');
}

// Run the processor
processAllTestimonies().catch(console.error);