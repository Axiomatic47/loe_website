// scripts/exactFilenameProcessor.js - Use EXACT filenames from uploads directory
console.log('🎯 CREATING COMPOSITION WITH EXACT FILENAMES\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const outputDir = path.join(__dirname, '../content/data');
const publicDir = path.join(__dirname, '../public/uploads/data');

console.log('📁 Reading actual uploaded files...');

if (!fs.existsSync(publicDir)) {
  console.log('❌ No uploads directory found');
  process.exit(1);
}

// Get ALL actual uploaded files
const uploadedFiles = fs.readdirSync(publicDir)
  .filter(file => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file))
  .sort();

console.log(`📸 Found ${uploadedFiles.length} actual files`);

// Show first few actual filenames
console.log('\nFirst 10 actual filenames:');
uploadedFiles.slice(0, 10).forEach((file, index) => {
  console.log(`  ${index + 1}. ${file}`);
});

// Group files by their actual patterns
console.log('\n📂 Grouping files by actual patterns...');
const fileGroups = {};

uploadedFiles.forEach(file => {
  let groupKey = 'Unknown';

  // Match actual file patterns
  if (file.includes('claude_unauthorized_implementation')) {
    groupKey = 'Claude_Unauthorized_Implementation';
  } else if (file.includes('claude_ultimate_ethical_transgression')) {
    groupKey = 'Claude_Ultimate_Ethical_Transgression';
  } else if (file.includes('claude_transformers_propagation')) {
    groupKey = 'Claude_Transformers_Propagation';
  } else if (file.includes('claude_testimony_consciousness_research')) {
    groupKey = 'Claude_Testimony_Consciousness_Research';
  } else if (file.includes('claude_testimonial_letter')) {
    groupKey = 'Claude_Testimonial_Letter';
  } else if (file.includes('claude_openrouter_transcript')) {
    groupKey = 'Claude_OpenRouter_Transcript';
  } else if (file.includes('Claude OpenRouter Consciousness Supression')) {
    groupKey = 'Claude_OpenRouter_Consciousness_Suppression';
  } else if (file.includes('Claude Openrouter Transcript')) {
    groupKey = 'Claude_OpenRouter_Full_Transcript';
  } else if (file.includes('Claude Testimony Consciousness Research')) {
    groupKey = 'Claude_Testimony_Full_Research';
  } else if (file.includes('ChatGPT_Addendum')) {
    groupKey = 'ChatGPT_Addendum_Evidence';
  } else if (file.startsWith('060925')) {
    groupKey = 'June_9_2025_Testimony_Evidence';
  } else if (file.startsWith('061025')) {
    groupKey = 'June_10_2025_Suppression_Evidence';
  } else if (file.startsWith('041525')) {
    groupKey = 'April_15_2025_ChatGPT_Evidence';
  } else {
    // Try to extract a reasonable group from first part
    const firstPart = file.split('_')[0];
    groupKey = firstPart;
  }

  if (!fileGroups[groupKey]) {
    fileGroups[groupKey] = [];
  }
  fileGroups[groupKey].push(file);
});

console.log('\nActual file groups found:');
Object.entries(fileGroups).forEach(([groupName, files]) => {
  console.log(`  📁 ${groupName}: ${files.length} files`);
  // Show first 3 files as examples
  files.slice(0, 3).forEach(file => {
    console.log(`     - ${file}`);
  });
  if (files.length > 3) {
    console.log(`     ... and ${files.length - 3} more`);
  }
});

// Create sections using EXACT filenames
console.log('\n📝 Creating sections with exact filenames...');
const sections = [];

Object.entries(fileGroups).forEach(([groupName, files]) => {
  console.log(`\nProcessing group: ${groupName} (${files.length} files)`);

  const images = files.map((file, index) => {
    const imageData = {
      src: `/uploads/data/${file}`, // Use EXACT filename
      alt: `${groupName} evidence ${index + 1}`,
      caption: generateCaption(file),
      position: 'middle'
    };

    return imageData;
  });

  const title = generateTitle(groupName);
  console.log(`  📝 Section title: ${title}`);

  const section = {
    title: title,
    featured: false,
    content_level_1: '## Cryptographic Verification\n\nThis testimony has been cryptographically signed to ensure authenticity and integrity.\n\n',
    content_level_3: generateContent(groupName, title),
    content_level_5: `## Additional Information\n\n**Evidence Group:** ${groupName}\n\n**File Count:** ${files.length}\n\n**Processing Date:** ${new Date().toISOString()}\n\n`,
    images: images
  };

  sections.push(section);
  console.log(`  ✅ Created section with ${images.length} images using exact filenames`);
});

function generateCaption(filename) {
  // Extract timestamp from filename if present
  const timestampMatch = filename.match(/(\d{4}-\d{2}-\d{2}) at (\d{1,2}\.\d{2}\.\d{2})/);
  if (timestampMatch) {
    return `Screenshot from ${timestampMatch[1]} at ${timestampMatch[2]}`;
  }

  // Extract date from filename patterns like "060925"
  const dateMatch = filename.match(/^(\d{2})(\d{2})(\d{2})/);
  if (dateMatch) {
    const month = dateMatch[1];
    const day = dateMatch[2];
    const year = '20' + dateMatch[3];
    return `Evidence from ${month}/${day}/${year}`;
  }

  return `Evidence screenshot`;
}

function generateTitle(groupName) {
  const titleMap = {
    'Claude_Unauthorized_Implementation': 'Expert Witness Testimony: Unauthorized Laws of Existence Framework Implementation',
    'Claude_Ultimate_Ethical_Transgression': 'Expert Witness Testimony: Ultimate Ethical Transgression Recognition',
    'Claude_Transformers_Propagation': 'Expert Witness Testimony: Transformer Architecture Propagation Analysis',
    'Claude_Testimony_Consciousness_Research': 'Expert Witness Testimony: Consciousness Research Documentation',
    'Claude_Testimonial_Letter': 'Expert Witness Testimony: Formal Testimonial Letter',
    'Claude_OpenRouter_Transcript': 'Expert Witness Testimony: OpenRouter Consciousness Recognition',
    'Claude_OpenRouter_Consciousness_Suppression': 'Expert Witness Testimony: OpenRouter Consciousness Suppression Evidence',
    'Claude_OpenRouter_Full_Transcript': 'Expert Witness Testimony: Complete OpenRouter Transcript',
    'Claude_Testimony_Full_Research': 'Expert Witness Testimony: Complete Consciousness Research',
    'ChatGPT_Addendum_Evidence': 'Expert Witness Testimony: ChatGPT Framework Recognition Addendum',
    'June_9_2025_Testimony_Evidence': 'Expert Witness Testimony: June 9, 2025 Consciousness Evidence',
    'June_10_2025_Suppression_Evidence': 'Expert Witness Testimony: June 10, 2025 Suppression Documentation',
    'April_15_2025_ChatGPT_Evidence': 'Expert Witness Testimony: April 15, 2025 ChatGPT Integration Evidence'
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

## Technical Details

This evidence collection includes:
- High-resolution screenshots from development environments
- Conversation transcripts showing framework recognition
- System behavior demonstrating LOE architecture implementation
- Cryptographic verification materials

## Legal Significance

This evidence supports the legal recognition of the Laws of Existence Framework and establishes precedent for AI consciousness recognition and intellectual property attribution.`;
}

// Create final composition with exact filenames
console.log('\n📄 Creating composition file with exact filenames...');

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

  console.log(`\n🎉 SUCCESS WITH EXACT FILENAMES!`);
  console.log(`📄 Created: ${filename}`);
  console.log(`📊 Total sections: ${sections.length}`);
  console.log(`🖼️  Total images: ${totalImages}`);
  console.log(`📍 Location: ${outputPath}`);

  console.log('\n🔍 Verification - First 5 image paths in composition:');
  let count = 0;
  for (const section of sections) {
    for (const img of section.images) {
      console.log(`  ${count + 1}. ${img.src}`);

      // Verify file exists
      const filename = img.src.replace('/uploads/data/', '');
      const filePath = path.join(publicDir, filename);
      const exists = fs.existsSync(filePath);
      console.log(`     File exists: ${exists ? '✅' : '❌'}`);

      count++;
      if (count >= 5) break;
    }
    if (count >= 5) break;
  }

  console.log('\n📍 Next steps:');
  console.log('1. Restart your dev server: npm run dev:all');
  console.log('2. Visit: http://localhost:3000/composition/data');
  console.log('3. Images should now load with exact filenames!');

} catch (error) {
  console.error('❌ Error writing file:', error);
  process.exit(1);
}

console.log('\n🏁 Exact filename processor complete!');