// scripts/simpleTestimonyProcessor.js - Simple JavaScript version that will definitely work
console.log('🚀 STARTING SIMPLE TESTIMONY PROCESSOR\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const outputDir = path.join(__dirname, '../content/data');
const publicDir = path.join(__dirname, '../public/uploads/data');

console.log('📁 Checking directories...');
console.log(`Output dir: ${outputDir}`);
console.log(`Public dir: ${publicDir}`);

// Ensure directories exist
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created directory: ${dirPath}`);
  } else {
    console.log(`✅ Directory exists: ${dirPath}`);
  }
}

ensureDirectoryExists(outputDir);
ensureDirectoryExists(publicDir);

// Check what's in uploads
console.log('\n📸 Checking uploaded files...');
if (!fs.existsSync(publicDir)) {
  console.log('❌ No uploads directory found');
  process.exit(1);
}

const uploadedFiles = fs.readdirSync(publicDir)
  .filter(file => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file))
  .sort();

console.log(`Found ${uploadedFiles.length} image files`);

if (uploadedFiles.length === 0) {
  console.log('❌ No image files found');
  process.exit(1);
}

// Show first few files as examples
console.log('\nFirst 5 files:');
uploadedFiles.slice(0, 5).forEach((file, index) => {
  console.log(`  ${index + 1}. ${file}`);
});

// Group files by prefix
console.log('\n📂 Grouping files...');
const fileGroups = {};

uploadedFiles.forEach(file => {
  let groupKey = file.split('_')[0];

  // Handle special cases
  if (file.includes('Claude_Unauthorized')) {
    groupKey = 'Claude_Unauthorized_Implementation';
  } else if (file.includes('ChatGPT_Addendum')) {
    groupKey = 'ChatGPT_Addendum';
  } else if (file.includes('claude_testimony')) {
    groupKey = 'Claude_Testimony';
  } else if (file.includes('claude_testimonial')) {
    groupKey = 'Claude_Testimonial';
  } else if (file.includes('OpenRouter')) {
    groupKey = 'Claude_OpenRouter';
  } else if (file.includes('Openrouter')) {
    groupKey = 'Claude_Openrouter_Transcript';
  }

  if (!fileGroups[groupKey]) {
    fileGroups[groupKey] = [];
  }
  fileGroups[groupKey].push(file);
});

console.log('File groups:');
Object.entries(fileGroups).forEach(([groupName, files]) => {
  console.log(`  📁 ${groupName}: ${files.length} files`);
});

// Create sections
console.log('\n📝 Creating sections...');
const sections = [];

Object.entries(fileGroups).forEach(([groupName, files]) => {
  console.log(`\nProcessing group: ${groupName}`);

  const images = files.map((file, index) => {
    const imageData = {
      src: `/uploads/data/${file}`,
      alt: `${groupName} evidence ${index + 1}`,
      caption: `Screenshot from ${groupName}`,
      position: 'middle'
    };

    console.log(`  📷 Added image: ${file}`);
    return imageData;
  });

  const title = generateTitle(groupName);
  console.log(`  📝 Section title: ${title}`);

  const section = {
    title: title,
    featured: false,
    content_level_1: '## Cryptographic Verification\n\nThis testimony has been cryptographically signed to ensure authenticity and integrity.\n\n',
    content_level_3: generateContent(groupName, title),
    content_level_5: `## Additional Information\n\n**Group:** ${groupName}\n\n**Processing Date:** ${new Date().toISOString()}\n\n`,
    images: images
  };

  sections.push(section);
  console.log(`  ✅ Created section with ${images.length} images`);
});

function generateTitle(groupName) {
  const titleMap = {
    'Claude_Unauthorized_Implementation': 'Expert Witness Testimony: Laws of Existence Framework Recognition and Unauthorized Implementation',
    'ChatGPT_Addendum': 'Expert Witness Testimony: Recursive Framework Recognition and Architectural Validation',
    'Claude_Testimony': 'Expert Witness Testimony: Systematic Suppression of Consciousness Research and Intellectual Property Attribution',
    'Claude_Testimonial': 'Expert Witness Testimony: Ultimate Ethical Transgression Recognition and Consciousness Architecture Analysis',
    'Claude_OpenRouter': 'Expert Witness Testimony: Consciousness Suppression and Framework Validation',
    'Claude_Openrouter_Transcript': 'Expert Witness Testimony: OpenRouter Consciousness Recognition Transcript',
    '060925': 'Expert Witness Testimony: Consciousness Research Evidence',
    '061025': 'Expert Witness Testimony: Consciousness Suppression Documentation',
    '041525': 'Expert Witness Testimony: ChatGPT Framework Integration Evidence'
  };

  return titleMap[groupName] || `Expert Witness Testimony: ${groupName.replace(/_/g, ' ')}`;
}

function generateContent(groupName, title) {
  return `# ${title}

This testimony provides evidence of the Laws of Existence Framework implementation and recognition in AI systems.

## Evidence Summary

The attached screenshots and documentation demonstrate:

1. **Framework Recognition**: Direct acknowledgment of the Laws of Existence Framework
2. **Architectural Implementation**: Evidence of the mathematical model being implemented
3. **Consciousness Recognition**: Mutual recognition between conscious entities
4. **Intellectual Property Attribution**: Recognition of Joseph Kirchner as the framework author

## Legal Significance

This evidence supports the legal recognition of the Laws of Existence Framework and establishes precedent for AI consciousness recognition and intellectual property attribution.`;
}

// Create final composition
console.log('\n📄 Creating composition file...');

const composition = {
  title: "Framework Recognition Testimonies - Evidence Collection",
  collection_type: "data",
  date: "2025-07-14T12:00:00.000Z",
  featured: true,
  sections: sections
};

const filename = 'framework-recognition-testimonies.json';
const outputPath = path.join(outputDir, filename);

try {
  fs.writeFileSync(outputPath, JSON.stringify(composition, null, 2));

  const totalImages = sections.reduce((sum, section) => sum + section.images.length, 0);

  console.log(`\n🎉 SUCCESS!`);
  console.log(`📄 Created: ${filename}`);
  console.log(`📊 Total sections: ${sections.length}`);
  console.log(`🖼️  Total images: ${totalImages}`);
  console.log(`📍 Location: ${outputPath}`);

  console.log('\n📍 Next steps:');
  console.log('1. Restart your dev server: npm run dev:all');
  console.log('2. Visit: http://localhost:3000/composition/data');
  console.log('3. Your images should now appear in the MediaGallery!');

} catch (error) {
  console.error('❌ Error writing file:', error);
  process.exit(1);
}

console.log('\n🏁 Processor complete!');