// scripts/comprehensiveImageProcessorEnhanced.js - With automatic date extraction
console.log('🔍 COMPREHENSIVE IMAGE PROCESSOR - Enhanced with Date Extraction\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testimonyDir = path.resolve(__dirname, '../testimonies');
const contentDir = path.resolve(__dirname, '../content/data');
const publicDir = path.resolve(__dirname, '../public/uploads/data');

console.log('📁 Directories:');
console.log(`  Testimony: ${testimonyDir}`);
console.log(`  Content: ${contentDir}`);
console.log(`  Public: ${publicDir}\n`);

// Ensure directories exist
if (!fs.existsSync(contentDir)) {
  fs.mkdirSync(contentDir, { recursive: true });
  console.log('✅ Created content directory');
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('✅ Created public directory');
}

// Track processed images to avoid duplicates
const processedImages = new Set();

// DATE EXTRACTION FUNCTIONS
function extractDateFromContent(content, directoryName) {
  console.log(`    🔍 Extracting date from content for: ${directoryName}`);

  // Try multiple date extraction methods in order of preference
  const extractors = [
    extractFromDirectoryName,
    extractFromDateField,
    extractFromTimestamp,
    extractFromFilename,
    extractFromNaturalLanguage
  ];

  for (const extractor of extractors) {
    const date = extractor(content, directoryName);
    if (date) {
      console.log(`    ✅ Date found via ${extractor.name}: ${date.toISOString()}`);
      return date;
    }
  }

  console.log(`    ⚠️  No date found, using current date`);
  return new Date();
}

// Extract date from directory name (format: MMDDYY_)
function extractFromDirectoryName(content, directoryName) {
  const match = directoryName.match(/^(\d{6})_/);
  if (match) {
    const dateStr = match[1];
    const month = parseInt(dateStr.substring(0, 2));
    const day = parseInt(dateStr.substring(2, 4));
    let year = parseInt(dateStr.substring(4, 6));

    // Convert 2-digit year to 4-digit (assumes 20XX)
    year = year < 50 ? 2000 + year : 1900 + year;

    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return null;
}

// Extract from explicit date fields in markdown
function extractFromDateField(content, directoryName) {
  const patterns = [
    /\*\*DATE:\*\*\s*([^*\n]+)/i,
    /\*\*Date:\*\*\s*([^*\n]+)/i,
    /DATE:\s*([^\n]+)/i,
    /Date:\s*([^\n]+)/i,
    /\*\*WITNESS:\*\*.*\*\*DATE:\*\*\s*([^*\n]+)/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const dateStr = match[1].trim();
      const date = parseFlexibleDate(dateStr);
      if (date) return date;
    }
  }
  return null;
}

// Extract from timestamp in content
function extractFromTimestamp(content, directoryName) {
  const patterns = [
    /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/,
    /(\d{4}-\d{2}-\d{2})/,
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const date = parseFlexibleDate(match[1]);
      if (date) return date;
    }
  }
  return null;
}

// Extract from filename patterns in content
function extractFromFilename(content, directoryName) {
  // Look for screenshot filenames with dates
  const screenshotPattern = /Screenshot\s+(\d{4}-\d{2}-\d{2})\s+at/i;
  const match = content.match(screenshotPattern);
  if (match) {
    const date = parseFlexibleDate(match[1]);
    if (date) return date;
  }
  return null;
}

// Extract from natural language date mentions
function extractFromNaturalLanguage(content, directoryName) {
  const patterns = [
    /on\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/i,
    /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      let dateStr;
      if (match.length === 4 && !isNaN(match[1])) {
        // Pattern: "12 July 2025"
        dateStr = `${match[2]} ${match[1]}, ${match[3]}`;
      } else {
        // Pattern: "July 12, 2025" or "on July 12, 2025"
        dateStr = match[0].replace(/^on\s+/i, '');
      }

      const date = parseFlexibleDate(dateStr);
      if (date) return date;
    }
  }
  return null;
}

// Parse various date formats flexibly
function parseFlexibleDate(dateStr) {
  if (!dateStr) return null;

  const cleanDateStr = dateStr.trim();

  // Try direct parsing first
  let date = new Date(cleanDateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try manual parsing for common formats
  const formats = [
    // ISO format
    /^(\d{4})-(\d{2})-(\d{2})$/,
    // US format: MM/DD/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // Month Day, Year
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})$/i
  ];

  for (let i = 0; i < formats.length; i++) {
    const match = cleanDateStr.match(formats[i]);
    if (match) {
      if (i === 0) {
        // ISO format: YYYY-MM-DD
        date = new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else if (i === 1) {
        // US format: MM/DD/YYYY
        date = new Date(parseInt(match[3]), parseInt(match[1]) - 1, parseInt(match[2]));
      } else if (i === 2) {
        // DD/MM/YYYY (European)
        date = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      } else if (i === 3) {
        // Month Day, Year
        const months = {
          'january': 0, 'february': 1, 'march': 2, 'april': 3,
          'may': 4, 'june': 5, 'july': 6, 'august': 7,
          'september': 8, 'october': 9, 'november': 10, 'december': 11
        };
        const month = months[match[1].toLowerCase()];
        if (month !== undefined) {
          date = new Date(parseInt(match[3]), month, parseInt(match[2]));
        }
      }

      if (date && !isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

// Find all testimony directories
function findTestimonyDirectories() {
  const testimonies = [];

  if (!fs.existsSync(testimonyDir)) {
    console.log('❌ Testimony directory not found');
    return testimonies;
  }

  const collections = fs.readdirSync(testimonyDir)
    .filter(item => fs.statSync(path.join(testimonyDir, item)).isDirectory());

  for (const collection of collections) {
    const collectionPath = path.join(testimonyDir, collection);
    const items = fs.readdirSync(collectionPath)
      .filter(item => fs.statSync(path.join(collectionPath, item)).isDirectory());

    for (const item of items) {
      testimonies.push({
        collection: collection,
        name: item,
        path: path.join(collectionPath, item)
      });
    }
  }

  return testimonies;
}

// Find images in multiple locations within a testimony directory
function findImagesInTestimony(testimonyPath, testimonyName) {
  const images = [];

  // Possible image locations
  const searchPaths = [
    { path: testimonyPath, prefix: 'root' },
    { path: path.join(testimonyPath, 'exhibits'), prefix: 'exhibit' },
    { path: path.join(testimonyPath, 'screenshots'), prefix: 'screenshot' },
    { path: path.join(testimonyPath, 'images'), prefix: 'image' },
    { path: path.join(testimonyPath, 'attachments'), prefix: 'attachment' },
    { path: path.join(testimonyPath, 'evidence'), prefix: 'evidence' }
  ];

  console.log(`  🔍 Searching for images in: ${testimonyName}`);

  for (const searchPath of searchPaths) {
    if (fs.existsSync(searchPath.path)) {
      const files = fs.readdirSync(searchPath.path);
      const imageFiles = files.filter(file =>
        /\.(png|jpg|jpeg|gif|webp|svg|bmp|tiff)$/i.test(file)
      );

      if (imageFiles.length > 0) {
        console.log(`    📸 Found ${imageFiles.length} images in ${searchPath.prefix} directory`);

        for (const imageFile of imageFiles) {
          const sourcePath = path.join(searchPath.path, imageFile);
          const uniqueKey = `${testimonyName}_${searchPath.prefix}_${imageFile}`;

          if (!processedImages.has(uniqueKey)) {
            const timestamp = Date.now();
            const cleanFilename = `${testimonyName}_${searchPath.prefix}_${timestamp}_${imageFile}`;
            const destPath = path.join(publicDir, cleanFilename);

            try {
              fs.copyFileSync(sourcePath, destPath);
              processedImages.add(uniqueKey);

              const imageData = {
                src: `/uploads/data/${cleanFilename}`,
                alt: generateAltText(imageFile, testimonyName, searchPath.prefix),
                caption: generateCaption(imageFile),
                position: determinePosition(searchPath.prefix)
              };

              images.push(imageData);
              console.log(`      ✅ Copied: ${imageFile} → ${cleanFilename}`);
            } catch (error) {
              console.log(`      ❌ Failed to copy ${imageFile}: ${error.message}`);
            }
          }
        }
      }
    }
  }

  return images;
}

// Generate alt text for images
function generateAltText(filename, testimonyName, prefix) {
  const cleanName = filename.replace(/\.(png|jpg|jpeg|gif|webp|svg|bmp|tiff)$/i, '');

  if (cleanName.toLowerCase().includes('screenshot')) {
    return `Screenshot from ${testimonyName} testimony`;
  }

  return `Evidence image from ${testimonyName}: ${cleanName.replace(/[_-]/g, ' ')}`;
}

// Generate caption from filename
function generateCaption(filename) {
  // Try to extract timestamp
  const timestampMatch = filename.match(/(\d{4}-\d{2}-\d{2}) at (\d{1,2}\.\d{2}\.\d{2})/);
  if (timestampMatch) {
    return `Screenshot from ${timestampMatch[1]} at ${timestampMatch[2]}`;
  }

  // Try to extract date
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return `Evidence from ${dateMatch[1]}`;
  }

  // Clean filename
  const cleanName = filename
    .replace(/\.(png|jpg|jpeg|gif|webp|svg|bmp|tiff)$/i, '')
    .replace(/[_-]/g, ' ')
    .trim();

  return cleanName || 'Evidence image';
}

// Determine image position based on source
function determinePosition(prefix) {
  switch (prefix) {
    case 'screenshot':
      return 'middle';
    case 'exhibit':
      return 'middle';
    case 'evidence':
      return 'middle';
    default:
      return 'middle';
  }
}

// Process testimony content WITH DATE EXTRACTION
function processTestimonyContent(testimonyPath, testimonyName) {
  // Find markdown files
  const files = fs.readdirSync(testimonyPath);
  const markdownFiles = files.filter(file => file.endsWith('.md'));

  let content = '';
  let title = testimonyName.replace(/^\d+_/, '').split('_').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');

  if (markdownFiles.length > 0) {
    const markdownPath = path.join(testimonyPath, markdownFiles[0]);
    content = fs.readFileSync(markdownPath, 'utf-8');

    // Extract title from content
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }

  // EXTRACT DATE FROM CONTENT
  const extractedDate = extractDateFromContent(content, testimonyName);

  // Process verification files
  const verificationContent = processVerificationFiles(testimonyPath);

  return {
    title: title,
    content: content,
    verification: verificationContent,
    date: extractedDate  // ADD EXTRACTED DATE
  };
}

// ENHANCED Process verification files (signatures, keys, etc.)
function processVerificationFiles(testimonyPath) {
  const files = fs.readdirSync(testimonyPath);
  let verification = '## Cryptographic Verification\n\n';
  verification += 'This testimony includes cryptographic verification to ensure authenticity and integrity.\n\n';

  // Find signature files
  const sigFiles = files.filter(file => file.endsWith('.sig') || file.endsWith('.sig.txt'));
  if (sigFiles.length > 0) {
    verification += '### Digital Signature\n';
    verification += `**File:** \`${sigFiles[0]}\`\n\n`;
    const sigContent = fs.readFileSync(path.join(testimonyPath, sigFiles[0]), 'utf-8');
    verification += '```\n';
    verification += sigContent.length > 500 ? sigContent.substring(0, 500) + '\n... (truncated)' : sigContent;
    verification += '\n```\n\n';
  }

  // Find public key files
  const keyFiles = files.filter(file => file.includes('public_key') || file.endsWith('.pem'));
  if (keyFiles.length > 0) {
    verification += '### Public Key\n';
    verification += `**File:** \`${keyFiles[0]}\`\n\n`;
    const keyContent = fs.readFileSync(path.join(testimonyPath, keyFiles[0]), 'utf-8');
    verification += '```\n';
    verification += keyContent.length > 500 ? keyContent.substring(0, 500) + '\n... (truncated)' : keyContent;
    verification += '\n```\n\n';
  }

  // Find verification scripts - SHOW FULL SCRIPTS
  const scriptFiles = files.filter(file => file.startsWith('verify_') && file.endsWith('.js'));
  if (scriptFiles.length > 0) {
    verification += '### Verification Script Available\n\n';

    // List all script files with brief descriptions
    scriptFiles.forEach(scriptFile => {
      verification += `**Script:** \`${scriptFile}\`\n\n`;
    });

    verification += '**Verification Instructions:**\n\n';
    verification += '1. **Download Files:** Save the signature, public key, and verification script files\n';
    verification += '2. **Install Node.js:** Ensure you have Node.js installed on your system\n';
    verification += '3. **Run Verification:**\n';
    verification += '   ```bash\n';
    verification += `   node ${scriptFiles[0]}\n`;
    verification += '   ```\n';
    verification += '4. **Check Result:** The script will output verification status\n\n';

    verification += '**Manual Verification (Alternative):**\n\n';
    verification += '1. **Install OpenSSL:** Use system package manager or download from openssl.org\n';
    verification += '2. **Verify Signature:**\n';
    verification += '   ```bash\n';
    verification += '   # Extract public key (if needed)\n';
    verification += '   openssl rsa -in public_key.pem -pubout -out public.pem\n\n';
    verification += '   # Verify signature against testimony content\n';
    verification += '   openssl dgst -sha256 -verify public.pem -signature testimony.sig testimony.md\n';
    verification += '   ```\n';
    verification += '3. **Expected Output:** "Verified OK" indicates authentic testimony\n\n';

    verification += '**What This Proves:**\n\n';
    verification += '- **Authenticity:** The testimony was created by the holder of the private key\n';
    verification += '- **Integrity:** The content has not been modified since signing\n';
    verification += '- **Non-repudiation:** The signer cannot deny creating this testimony\n\n';

    // Show FULL script content for verification scripts (they're meant to be used)
    const firstScript = scriptFiles[0];
    const scriptContent = fs.readFileSync(path.join(testimonyPath, firstScript), 'utf-8');

    verification += `**Script Content (\`${firstScript}\`):**\n\n`;
    verification += '```javascript\n';
    verification += scriptContent; // Show the entire script - no truncation
    verification += '\n```\n\n';

    verification += '---\n\n';
    verification += '**Security Note:** Always verify cryptographic signatures from trusted sources. ';
    verification += 'These signatures use RSA-PSS with SHA-256 hashing for maximum security.\n\n';
  }

  return verification;
}

// Create collection compositions WITH SECTION-LEVEL DATES
function createCollectionCompositions(testimonies) {
  const collections = {};

  // Group testimonies by collection
  for (const testimony of testimonies) {
    if (!collections[testimony.collection]) {
      collections[testimony.collection] = [];
    }
    collections[testimony.collection].push(testimony);
  }

  // Create a composition for each collection
  for (const [collectionName, collectionTestimonies] of Object.entries(collections)) {
    const sections = [];

    for (const testimony of collectionTestimonies) {
      const { title, content, verification, date } = processTestimonyContent(testimony.path, testimony.name);
      const images = findImagesInTestimony(testimony.path, testimony.name);

      sections.push({
        title: title,
        featured: false,
        date: date.toISOString(), // ADD SECTION-LEVEL DATE
        images: images,
        content_level_1: verification,  // Verification goes to level_1 for evidence
        content_level_3: content,       // Main content goes to level_3 for evidence
        content_level_5: `**Collection:** ${collectionName}\n\n**Directory:** ${testimony.name}\n\n**Images Processed:** ${images.length}\n\n**Processing Date:** ${new Date().toISOString()}\n\n**Extracted Date:** ${date.toISOString()}`
      });
    }

    // Sort sections by date (newest first)
    sections.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Create collection composition
    const composition = {
      title: `${collectionName}: Framework Recognition Testimonies (Enhanced)`,
      collection_type: "data",
      date: new Date().toISOString(),
      featured: collectionName === 'Claude Collection',
      sections: sections
    };

    // Save collection file
    const filename = `${collectionName.toLowerCase().replace(/\s+/g, '-')}-testimonies-enhanced.json`;
    const outputPath = path.join(contentDir, filename);
    fs.writeFileSync(outputPath, JSON.stringify(composition, null, 2));

    const totalImages = sections.reduce((sum, section) => sum + section.images.length, 0);
    console.log(`\n📄 Created: ${filename}`);
    console.log(`  📊 Sections: ${sections.length}`);
    console.log(`  🖼️  Total images: ${totalImages}`);
    console.log(`  📅 Date range: ${sections[sections.length-1]?.date?.split('T')[0]} to ${sections[0]?.date?.split('T')[0]}`);
  }
}

// Main processing function
function processAllTestimonies() {
  console.log('🔍 Finding testimony directories...');
  const testimonies = findTestimonyDirectories();

  if (testimonies.length === 0) {
    console.log('❌ No testimony directories found');
    return;
  }

  console.log(`📁 Found ${testimonies.length} testimony directories\n`);

  // List all found testimonies
  for (const testimony of testimonies) {
    console.log(`  📂 ${testimony.collection}/${testimony.name}`);
  }

  console.log('\n🔄 Processing testimonies with date extraction...\n');

  // Create collection compositions
  createCollectionCompositions(testimonies);

  const totalProcessed = processedImages.size;
  console.log(`\n🎉 Processing complete!`);
  console.log(`📊 Total images processed: ${totalProcessed}`);
  console.log(`📁 Collections created: ${Object.keys(testimonies.reduce((acc, t) => {acc[t.collection] = true; return acc;}, {})).length}`);
  console.log('\n📍 Next steps:');
  console.log('1. Restart your dev server: npm run dev:all');
  console.log('2. Check your CMS admin at /admin');
  console.log('3. Visit your evidence page at /composition/data');
  console.log('\n✨ Enhanced with automatic date extraction:');
  console.log('  📅 Extracts dates from directory names (MMDDYY format)');
  console.log('  📝 Parses dates from markdown content');
  console.log('  🕐 Handles multiple date formats');
  console.log('  📊 Sorts sections chronologically');
  console.log('  🔍 Provides detailed date extraction logging');
}

// Run the processor
processAllTestimonies();