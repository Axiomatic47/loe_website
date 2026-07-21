// scripts/ultimateTestimonyProcessor.js - Comprehensive image processing + automatic date extraction
console.log('🚀 ULTIMATE TESTIMONY PROCESSOR - Comprehensive Processing + Date Extraction\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// Canonical URL slugs: emit them at generation time so freshly (re)processed
// testimony compositions carry the same slug fields as enrich-content-slugs.mjs.
import { deriveSectionSlug, deriveCompositionSlug } from './lib/content-model.mjs';
import { classifyFile, roleLabel, sha256 } from './lib/testimony-package.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testimonyDir = path.resolve(__dirname, '../testimonies');
const contentDir = path.resolve(__dirname, '../content/data');
const publicDir = path.resolve(__dirname, '../public/uploads/data');

console.log('📁 Directories:');
console.log(`  Testimony Source: ${testimonyDir}`);
console.log(`  Content Output: ${contentDir}`);
console.log(`  Public Uploads: ${publicDir}\n`);

/**
 * Enhanced Date Extraction Class
 */
class DateExtractor {
  constructor() {
    this.patterns = {
      // MMDDYY format (062325)
      mmddyy: /(\d{2})(\d{2})(\d{2})/,
      // MMDDYY-MMDDYY range (062325-071625)
      mmddyyRange: /(\d{2})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/,
      // YYYYMMDD format
      yyyymmdd: /(\d{4})(\d{2})(\d{2})/,
      // ISO date (2025-07-17)
      isoDate: /(\d{4})-(\d{2})-(\d{2})/,
      // Content date patterns
      contentDate: /DATE:\s*(\d{4})-(\d{2})-(\d{2})/i,
      contentDateAlt: /\*\*DATE:\*\*\s*(\d{4})-(\d{2})-(\d{2})/i
    };
  }

  extractDate(source, type = 'auto') {
    console.log(`  🔍 Extracting date from: "${source}" (${type})`);

    // Try different extraction methods
    const methods = [
      () => this.extractFromString(source),
      () => type === 'content' ? this.extractFromContent(source) : null,
      () => this.extractFromPath(source)
    ];

    for (const method of methods) {
      try {
        const result = method();
        if (result) {
          console.log(`  ✅ Date found: ${result.display} (${result.source})`);
          return result;
        }
      } catch (error) {
        console.log(`  ⚠️ Method failed: ${error.message}`);
      }
    }

    console.log(`  ❌ No date found`);
    return null;
  }

  extractFromString(text) {
    console.log(`    🔍 Trying patterns on: "${text}"`);

    // Try MMDDYY-MMDDYY range first (use start date)
    let match = text.match(this.patterns.mmddyyRange);
    if (match) {
      console.log(`    📅 Found range pattern: ${match[0]}`);
      const [, mm, dd, yy] = match;
      console.log(`    📅 Parsed as: MM=${mm}, DD=${dd}, YY=${yy}`);
      return this.formatDate(`20${yy}`, mm, dd, 'mmddyy-range');
    }

    // Try MMDDYY format
    match = text.match(this.patterns.mmddyy);
    if (match) {
      console.log(`    📅 Found mmddyy pattern: ${match[0]}`);
      const [, mm, dd, yy] = match;
      console.log(`    📅 Parsed as: MM=${mm}, DD=${dd}, YY=${yy}`);
      return this.formatDate(`20${yy}`, mm, dd, 'mmddyy');
    }

    // Try YYYYMMDD format
    match = text.match(this.patterns.yyyymmdd);
    if (match) {
      console.log(`    📅 Found yyyymmdd pattern: ${match[0]}`);
      const [, yyyy, mm, dd] = match;
      console.log(`    📅 Parsed as: YYYY=${yyyy}, MM=${mm}, DD=${dd}`);
      return this.formatDate(yyyy, mm, dd, 'yyyymmdd');
    }

    // Try ISO format
    match = text.match(this.patterns.isoDate);
    if (match) {
      console.log(`    📅 Found ISO pattern: ${match[0]}`);
      const [, yyyy, mm, dd] = match;
      console.log(`    📅 Parsed as: YYYY=${yyyy}, MM=${mm}, DD=${dd}`);
      return this.formatDate(yyyy, mm, dd, 'iso');
    }

    console.log(`    ❌ No valid date patterns found`);
    return null;
  }

  extractFromContent(filePath) {
    if (!fs.existsSync(filePath) || !filePath.endsWith('.md')) {
      return null;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n').slice(0, 20);

      for (const line of lines) {
        // Look for DATE: patterns
        let match = line.match(this.patterns.contentDate);
        if (!match) match = line.match(this.patterns.contentDateAlt);

        if (match) {
          const [, yyyy, mm, dd] = match;
          return this.formatDate(yyyy, mm, dd, 'content');
        }
      }
    } catch (error) {
      console.log(`  ⚠️ Error reading content: ${error.message}`);
    }

    return null;
  }

  extractFromPath(fullPath) {
    const pathParts = fullPath.split(path.sep);

    for (const part of pathParts.reverse()) {
      const result = this.extractFromString(part);
      if (result) {
        result.source = 'path';
        return result;
      }
    }

    return null;
  }

  formatDate(year, month, day, source) {
    try {
      const y = parseInt(year);
      const m = parseInt(month);
      const d = parseInt(day);

      // More strict validation
      if (y < 2020 || y > 2030) {
        console.log(`    ❌ Invalid year: ${y} (must be 2020-2030)`);
        return null;
      }
      if (m < 1 || m > 12) {
        console.log(`    ❌ Invalid month: ${m} (must be 1-12)`);
        return null;
      }
      if (d < 1 || d > 31) {
        console.log(`    ❌ Invalid day: ${d} (must be 1-31)`);
        return null;
      }

      // Check if the date is actually valid (e.g., not Feb 30th)
      const date = new Date(y, m - 1, d, 12, 0, 0, 0);
      if (isNaN(date.getTime()) ||
          date.getFullYear() !== y ||
          date.getMonth() !== m - 1 ||
          date.getDate() !== d) {
        console.log(`    ❌ Invalid date combination: ${m}/${d}/${y}`);
        return null;
      }

      return {
        formatted: date.toISOString(),
        display: `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`,
        source: source,
        year: y,
        month: m,
        day: d
      };
    } catch (error) {
      console.log(`    ❌ Date formatting error: ${error.message}`);
      return null;
    }
  }
}

// Ensure directories exist
function ensureDirectories() {
  [contentDir, publicDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
}

// Track processed images to avoid duplicates
const processedImages = new Set();
const dateExtractor = new DateExtractor();

// Find all testimony directories (comprehensive search)
function findTestimonyDirectories() {
  const testimonies = [];

  if (!fs.existsSync(testimonyDir)) {
    console.log('❌ Testimony directory not found');
    return testimonies;
  }

  // Search both flat structure and collection structure
  function searchDirectory(dir, parentCollection = null) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        // Check if this directory contains testimony files
        if (hasTestimonyContent(itemPath)) {
          testimonies.push({
            collection: parentCollection || 'Root',
            name: item,
            path: itemPath
          });
        } else {
          // Recurse into subdirectories (for collection structure)
          searchDirectory(itemPath, item);
        }
      }
    }
  }

  searchDirectory(testimonyDir);
  return testimonies;
}

// Check if directory has testimony content
function hasTestimonyContent(dirPath) {
  try {
    const files = fs.readdirSync(dirPath);
    return files.some(file =>
      file.endsWith('.md') ||
      file.endsWith('.sig') ||
      file.endsWith('.pdf') ||
      file.includes('testimony') ||
      /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
    );
  } catch {
    return false;
  }
}

// Enhanced image search in multiple locations
function findImagesInTestimony(testimonyPath, testimonyName) {
  const images = [];
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
        console.log(`    📸 Found ${imageFiles.length} images in ${searchPath.prefix}`);

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
                caption: generateCaption(imageFile, testimonyName),
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

// Authentication materials — the full chain, downloadable.
//
// Every file needed for INDEPENDENT verification is copied into
// public/uploads/data under a stable `<package>_auth_<name>` filename and
// linked from the section: the signed testimony .md (the signature covers its
// exact bytes — the rendered page is not byte-identical), the detached .sig,
// the public key .pem, the verify script (.js or .sh), formal PDFs, sealed
// original bundles, and the generated manifest.json.
function processVerificationFiles(testimonyPath, testimonyName) {
  // Post-normalization everything sits at the top level; mnt/data is searched
  // as a fallback so pre-standard packages still publish correctly.
  const searchDirs = [testimonyPath, path.join(testimonyPath, 'mnt', 'data')];
  const chainFiles = []; // {abs, name, role}
  const seen = new Set();
  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir).sort()) {
      const abs = path.join(dir, name);
      if (!fs.statSync(abs).isFile() || seen.has(name)) continue;
      const role = classifyFile(name);
      if (['testimony', 'document_md', 'signature', 'public_key', 'verify_script', 'document_pdf', 'manifest'].includes(role)) {
        chainFiles.push({ abs, name, role });
        seen.add(name);
      }
    }
  }
  // Sealed original bundles are published verbatim alongside the chain.
  const originalDir = path.join(testimonyPath, 'original');
  if (fs.existsSync(originalDir)) {
    for (const name of fs.readdirSync(originalDir).sort()) {
      const abs = path.join(originalDir, name);
      if (fs.statSync(abs).isFile() && !seen.has(name)) {
        chainFiles.push({ abs, name, role: 'original_bundle' });
        seen.add(name);
      }
    }
  }

  if (chainFiles.length === 0) return '';

  let verification = '## Authentication Materials\n\n';
  verification += 'Every file below is provided for independent verification of this testimony: the signed source markdown (the signature covers its exact bytes), the detached signature, the signer public key, an executable verification script, and any formal documents or sealed original bundles.\n\n';
  verification += '| File | Purpose | Size | SHA-256 |\n|---|---|---|---|\n';

  const order = { testimony: 0, signature: 1, public_key: 2, verify_script: 3, document_pdf: 4, document_md: 5, original_bundle: 6, manifest: 7 };
  chainFiles.sort((a, b) => (order[a.role] ?? 9) - (order[b.role] ?? 9) || a.name.localeCompare(b.name));

  for (const f of chainFiles) {
    const cleanFilename = `${testimonyName}_auth_${f.name}`;
    const destPath = path.join(publicDir, cleanFilename);
    let hash = '';
    try {
      fs.copyFileSync(f.abs, destPath);
      hash = sha256(f.abs);
      console.log(`      🔏 Auth file: ${f.name} → ${cleanFilename}`);
    } catch (error) {
      console.log(`      ❌ Failed to copy auth file ${f.name}: ${error.message}`);
      continue;
    }
    const kb = Math.max(1, Math.round(fs.statSync(f.abs).size / 1024));
    verification += `| [\`${f.name}\`](/uploads/data/${encodeURIComponent(cleanFilename)}) | ${roleLabel(f.role)} | ${kb} KB | \`${hash.slice(0, 16)}…\` |\n`;
  }
  verification += '\n';

  const scripts = chainFiles.filter((f) => f.role === 'verify_script');
  if (scripts.length > 0) {
    const s = scripts[0];
    const isSh = s.name.endsWith('.sh');
    verification += '### How to Verify\n\n';
    verification += '1. Download the files above into one directory (keep the original filenames)\n';
    verification += `2. Run the verification script: \`${isSh ? 'sh' : 'node'} ${s.name}\`${isSh ? '' : ' (requires Node.js)'}\n`;
    verification += '3. The script checks the signature over the testimony file against the public key\n\n';
    try {
      const scriptContent = fs.readFileSync(s.abs, 'utf-8');
      verification += `**Script content (\`${s.name}\`):**\n\n`;
      verification += '```' + (isSh ? 'bash' : 'javascript') + '\n';
      verification += scriptContent;
      verification += '\n```\n\n';
    } catch (error) {
      verification += `Error reading script file: ${error.message}\n\n`;
    }
  }

  verification += '**What This Proves:**\n\n';
  verification += '- **Authenticity:** Created by the holder of the private key\n';
  verification += '- **Integrity:** Content has not been modified since signing\n';
  verification += '- **Non-repudiation:** Signer cannot deny creating this testimony\n\n';

  return verification;
}

// Enhanced content processing with date extraction
function processTestimonyContent(testimonyPath, testimonyName) {
  console.log(`  📝 Processing content for: ${testimonyName}`);

  // Extract date from directory name first
  let dateInfo = dateExtractor.extractDate(testimonyName, 'directory');

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

    // Try to extract date from content if not found in directory name
    if (!dateInfo) {
      dateInfo = dateExtractor.extractDate(markdownPath, 'content');
    }

    // Extract title from content
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }
  }

  // Process verification files
  const verificationContent = processVerificationFiles(testimonyPath, testimonyName);

  return {
    title: title,
    content: content,
    verification: verificationContent,
    dateInfo: dateInfo
  };
}

// Generate helper functions
function generateAltText(filename, testimonyName, _prefix) {
  const cleanName = filename.replace(/\.(png|jpg|jpeg|gif|webp|svg|bmp|tiff)$/i, '');

  if (cleanName.toLowerCase().includes('screenshot')) {
    return `Screenshot from ${testimonyName} testimony`;
  }

  return `Evidence from ${testimonyName}: ${cleanName.replace(/[_-]/g, ' ')}`;
}

function generateCaption(filename, testimonyName) {
  // Extract timestamp if present
  const timestampMatch = filename.match(/(\d{4}-\d{2}-\d{2}) at (\d{1,2}\.\d{2}\.\d{2})/);
  if (timestampMatch) {
    return `Screenshot from ${timestampMatch[1]} at ${timestampMatch[2]}`;
  }

  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return `Evidence from ${dateMatch[1]}`;
  }

  const cleanName = filename
    .replace(/\.(png|jpg|jpeg|gif|webp|svg|bmp|tiff)$/i, '')
    .replace(/[_-]/g, ' ')
    .trim();

  return cleanName || `${testimonyName} evidence`;
}

function determinePosition(_prefix) {
  return 'middle'; // Default to middle for all images
}

// Create collection compositions with dates
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
    console.log(`\n📄 Creating collection: ${collectionName}`);
    const sections = [];
    let latestDate = null;
    // Composition slug + per-composition section-slug dedup set (data collection rules).
    const compSlug = deriveCompositionSlug(
      'data',
      `${collectionName.toLowerCase().replace(/\s+/g, '-')}-testimonies-enhanced.json`,
    );
    const usedSectionSlugs = new Set();

    for (const testimony of collectionTestimonies) {
      console.log(`  🔄 Processing: ${testimony.name}`);

      const { title, content, verification, dateInfo } = processTestimonyContent(testimony.path, testimony.name);
      const images = findImagesInTestimony(testimony.path, testimony.name);

      // Track latest date for collection
      if (dateInfo) {
        const testDate = new Date(dateInfo.formatted);
        if (!latestDate || testDate > latestDate) {
          latestDate = testDate;
        }
        console.log(`    📅 Date extracted: ${dateInfo.display} (${dateInfo.source})`);
      } else {
        console.log(`    📅 No date found, using current date`);
      }

      sections.push({
        title: title,
        slug: deriveSectionSlug('data', compSlug, { title }, sections.length + 1, usedSectionSlugs),
        featured: false,
        images: images,
        content_level_1: verification,
        content_level_3: content,
        content_level_5: `**Collection:** ${collectionName}\n\n**Directory:** ${testimony.name}\n\n**Images Processed:** ${images.length}\n\n**Date Extracted:** ${dateInfo ? dateInfo.display + ' (' + dateInfo.source + ')' : 'None'}\n\n**Processing Date:** ${new Date().toISOString()}`
      });

      console.log(`    ✅ Created section with ${images.length} images`);
    }

    // Use latest extracted date or current date for composition
    const compositionDate = latestDate ? latestDate.toISOString() : new Date().toISOString();

    const composition = {
      title: `${collectionName}: Framework Recognition Testimonies (Enhanced)`,
      collection_type: "data",
      slug: compSlug,
      date: compositionDate,
      featured: collectionName === 'Claude Collection',
      sections: sections
    };

    // Save collection file
    const filename = `${collectionName.toLowerCase().replace(/\s+/g, '-')}-testimonies-enhanced.json`;
    const outputPath = path.join(contentDir, filename);
    fs.writeFileSync(outputPath, JSON.stringify(composition, null, 2));

    const totalImages = sections.reduce((sum, section) => sum + section.images.length, 0);
    const datedSections = sections.filter(s => !s.content_level_5.includes('Date Extracted:** None')).length;
    
    console.log(`  📄 Created: ${filename}`);
    console.log(`  📊 Sections: ${sections.length}`);
    console.log(`  📅 Sections with dates: ${datedSections}/${sections.length}`);
    console.log(`  🖼️  Total images: ${totalImages}`);
    console.log(`  📅 Collection date: ${compositionDate.split('T')[0]}`);
  }
}

// Main processing function
function processAllTestimonies() {
  console.log('🔍 Starting comprehensive testimony processing with date extraction...');
  
  ensureDirectories();
  
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

  console.log('\n🔄 Processing testimonies with enhanced verification and date extraction...\n');

  // Create collection compositions
  createCollectionCompositions(testimonies);

  const totalProcessed = processedImages.size;
  const collections = [...new Set(testimonies.map(t => t.collection))];
  
  console.log(`\n🎉 Ultimate processing complete!`);
  console.log(`📊 Total images processed: ${totalProcessed}`);
  console.log(`📁 Collections created: ${collections.length}`);
  console.log(`📅 Automatic date extraction enabled`);
  console.log('\n📍 Next steps:');
  console.log('1. Restart your dev server: npm run dev');
  console.log('2. Check your CMS admin at /admin');
  console.log('3. Visit your evidence page at /composition/data');
  console.log('4. Verify dates were auto-populated in CMS entries');
  console.log('\n✨ Features included:');
  console.log('  🔍 Comprehensive image search (exhibits/, screenshots/, etc.)');
  console.log('  📁 File copying from source to uploads');
  console.log('  🔐 Enhanced verification sections');
  console.log('  📅 Automatic date extraction from filenames');
  console.log('  📝 Detailed content generation');
  console.log('  🛡️  Cryptographic verification processing');
}

// Run the ultimate processor
processAllTestimonies();