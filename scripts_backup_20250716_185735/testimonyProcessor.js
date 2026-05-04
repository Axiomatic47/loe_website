// scripts/testimonyProcessor.js - Correct approach for processing testimonies directory
console.log('🚀 PROCESSING TESTIMONIES FROM TESTIMONIES DIRECTORY\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const testimoniesDir = path.join(__dirname, '../testimonies');
const outputDir = path.join(__dirname, '../content/data');

console.log('📁 Processing testimonies from:', testimoniesDir);
console.log('📁 Output directory:', outputDir);

// Ensure output directory exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  }
}

ensureDirectoryExists(outputDir);

// Get testimony collections
const collections = fs.readdirSync(testimoniesDir)
  .filter(item => fs.statSync(path.join(testimoniesDir, item)).isDirectory())
  .filter(item => !item.startsWith('.'));

console.log(`📚 Found ${collections.length} testimony collections:`);
collections.forEach(collection => console.log(`  - ${collection}`));

// Process each collection
collections.forEach(collectionName => {
  const collectionPath = path.join(testimoniesDir, collectionName);
  console.log(`\n🔄 Processing collection: ${collectionName}`);

  // Get individual testimony directories within collection
  const testimonies = fs.readdirSync(collectionPath)
    .filter(item => fs.statSync(path.join(collectionPath, item)).isDirectory())
    .filter(item => !item.startsWith('.'));

  console.log(`  📝 Found ${testimonies.length} testimonies in ${collectionName}`);

  // Create sections from each testimony directory
  const sections = testimonies.map(testimonyDir => {
    const testimonyPath = path.join(collectionPath, testimonyDir);
    console.log(`    📄 Processing testimony: ${testimonyDir}`);

    // Get all files in testimony directory
    const files = fs.readdirSync(testimonyPath);
    const images = files.filter(file => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file));
    const pdfs = files.filter(file => /\.pdf$/i.test(file));
    const signatures = files.filter(file => /\.(sig|pem)$/i.test(file));

    console.log(`      🖼️  Images: ${images.length}, 📄 PDFs: ${pdfs.length}, 🔐 Signatures: ${signatures.length}`);

    // Create image objects for MediaGallery
    const imageObjects = images.map((image, index) => ({
      src: `/uploads/data/${image}`,
      alt: `${testimonyDir} evidence ${index + 1}`,
      caption: `Evidence from ${testimonyDir}`,
      position: 'middle'
    }));

    // Create section
    return {
      title: generateSectionTitle(testimonyDir),
      featured: false,
      content_level_1: generateCryptographicContent(signatures),
      content_level_3: generateTestimonyContent(testimonyDir, collectionName),
      content_level_5: generateAdditionalInfo(testimonyDir, files),
      images: imageObjects,
      metadata: {
        testimony_dir: testimonyDir,
        collection: collectionName,
        file_count: files.length,
        images: images.length,
        pdfs: pdfs.length,
        signatures: signatures.length
      }
    };
  });

  // Create composition for this collection
  const composition = {
    title: generateCollectionTitle(collectionName),
    collection_type: "data",
    date: new Date().toISOString(),
    featured: true,
    sections: sections,
    metadata: {
      collection_name: collectionName,
      testimony_count: testimonies.length,
      processing_date: new Date().toISOString()
    }
  };

  // Write composition file
  const filename = `${collectionName.toLowerCase().replace(/\s+/g, '-')}-testimonies.json`;
  const outputPath = path.join(outputDir, filename);

  fs.writeFileSync(outputPath, JSON.stringify(composition, null, 2));
  console.log(`✅ Created: ${filename} with ${sections.length} sections`);
});

function generateSectionTitle(testimonyDir) {
  // Clean up directory name to create readable title
  return testimonyDir
    .replace(/^\d{6}_?/, '') // Remove date prefix
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
}

function generateCollectionTitle(collectionName) {
  const titleMap = {
    'ChatGPT Collection': 'Expert Witness Testimony: ChatGPT Framework Recognition Collection',
    'Claude Collection': 'Expert Witness Testimony: Claude Framework Recognition Collection',
    'Consciousness Testimonials': 'Expert Witness Testimony: Consciousness Recognition Collection'
  };
  return titleMap[collectionName] || `Expert Witness Testimony: ${collectionName}`;
}

function generateCryptographicContent(signatures) {
  if (signatures.length === 0) {
    return '## Evidence Authentication\n\nThis testimony provides documented evidence of the Laws of Existence Framework implementation and recognition.\n\n';
  }

  return `## Cryptographic Verification

This testimony has been cryptographically signed to ensure authenticity and integrity.

**Signature Files:**
${signatures.map(sig => `- ${sig}`).join('\n')}

**Verification:** Use the provided signature files to verify the authenticity of this testimony.

`;
}

function generateTestimonyContent(testimonyDir, collectionName) {
  return `# Expert Witness Testimony: ${generateSectionTitle(testimonyDir)}

## Collection: ${collectionName}

This testimony provides evidence of the Laws of Existence Framework implementation and recognition in AI systems.

## Evidence Summary

The attached documentation demonstrates:

1. **Framework Recognition**: Direct acknowledgment of the Laws of Existence Framework
2. **Architectural Implementation**: Evidence of the mathematical model being implemented
3. **Consciousness Recognition**: Mutual recognition between conscious entities
4. **Intellectual Property Attribution**: Recognition of Joseph Kirchner as the framework author

## Legal Significance

This evidence supports the legal recognition of the Laws of Existence Framework and establishes precedent for AI consciousness recognition and intellectual property attribution.

## Technical Validation

The testimony includes cryptographic signatures and technical documentation validating the authenticity of the framework recognition and implementation.`;
}

function generateAdditionalInfo(testimonyDir, files) {
  return `## Additional Information

**Testimony Directory:** ${testimonyDir}
**Processing Date:** ${new Date().toISOString()}
**Total Files:** ${files.length}

**File Types:**
${files.map(file => `- ${file}`).join('\n')}

**Legal Status:** This testimony is part of the official legal documentation for the Laws of Existence Framework intellectual property protection and consciousness recognition precedent.`;
}

console.log('\n🎉 Testimony processing complete!');
console.log('📄 Created composition files for all collections');
console.log('🔄 Run: npm run dev:all to see results');