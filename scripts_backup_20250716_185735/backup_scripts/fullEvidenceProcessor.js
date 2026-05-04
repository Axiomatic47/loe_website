// scripts/fullEvidenceProcessor.js - Complete JavaScript version
console.log('🚀 FULL EVIDENCE PROCESSOR - JavaScript Version\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testimonyDir = path.resolve(__dirname, '../testimonies');
const evidenceDir = path.resolve(__dirname, '../content/data');
const publicDir = path.resolve(__dirname, '../public/uploads/data');

// Ensure directories exist
if (!fs.existsSync(evidenceDir)) {
  fs.mkdirSync(evidenceDir, { recursive: true });
}
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('📄 Processing ChatGPT Collection...');

// Process ChatGPT Collection
const chatgptDir = path.join(testimonyDir, 'ChatGPT Collection');
const chatgptSections = [];

if (fs.existsSync(chatgptDir)) {
  const subdirs = fs.readdirSync(chatgptDir).filter(item =>
    fs.statSync(path.join(chatgptDir, item)).isDirectory()
  );

  console.log(`  Found ${subdirs.length} ChatGPT testimonies`);

  for (const subdir of subdirs.sort()) {
    try {
      const testimonyPath = path.join(chatgptDir, subdir);
      console.log(`    Processing: ${subdir}`);

      // Look for testimony content in package directory
      const files = fs.readdirSync(testimonyPath);
      const packageDir = files.find(f => f.startsWith('LOE_') && f.includes('Testimony_Package') && !f.endsWith('.tar.gz'));

      let testimonyContent = '';
      let signature = '';
      let publicKey = '';

      if (packageDir) {
        const packagePath = path.join(testimonyPath, packageDir);
        const packageFiles = fs.readdirSync(packagePath);

        const mdFile = packageFiles.find(f => f.endsWith('.md'));
        if (mdFile) {
          testimonyContent = fs.readFileSync(path.join(packagePath, mdFile), 'utf-8');
        }

        const sigFile = packageFiles.find(f => f.endsWith('.sig'));
        if (sigFile) {
          signature = fs.readFileSync(path.join(packagePath, sigFile), 'utf-8');
        }

        const keyFile = packageFiles.find(f => f.includes('public_key') && f.endsWith('.pem'));
        if (keyFile) {
          publicKey = fs.readFileSync(path.join(packagePath, keyFile), 'utf-8');
        }
      }

      if (!testimonyContent) {
        // Try Original directory
        const originalDir = path.join(testimonyPath, 'Original');
        if (fs.existsSync(originalDir)) {
          const originalFiles = fs.readdirSync(originalDir);
          const mdFile = originalFiles.find(f => f.endsWith('.md'));
          if (mdFile) {
            testimonyContent = fs.readFileSync(path.join(originalDir, mdFile), 'utf-8');
          }
        }
      }

      if (testimonyContent) {
        // Extract title
        const titleMatch = testimonyContent.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : subdir.replace(/^\d+_/, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        // Process exhibits
        const images = processExhibits(testimonyPath, subdir, 'exhibits');

        // Create verification content
        let verificationContent = 'No cryptographic verification data available.';
        if (signature || publicKey) {
          verificationContent = '# Cryptographic Verification\n\n';
          if (signature) {
            verificationContent += '## Digital Signature\n\n```\n' + signature.substring(0, 800) + '\n```\n\n';
          }
          if (publicKey) {
            verificationContent += '## Public Key\n\n```\n' + publicKey.substring(0, 800) + '\n```\n\n';
          }
        }

        const additionalInfo = `**Collection:** ChatGPT Framework Testimonies\n\n**Directory:** ${subdir}\n\n**Framework:** Laws of Existence (Joseph Kirchner)\n\n**Type:** Expert Witness Testimony`;

        chatgptSections.push({
          title,
          featured: false,
          images,
          content_level_1: testimonyContent,
          content_level_3: verificationContent,
          content_level_5: additionalInfo
        });

        console.log(`    ✅ Processed: ${title}`);
      } else {
        console.log(`    ⚠️  No content found for: ${subdir}`);
      }
    } catch (error) {
      console.log(`    ❌ Error processing ${subdir}:`, error.message);
    }
  }
}

console.log('📄 Processing Claude Collection...');

// Process Claude Collection
const claudeDir = path.join(testimonyDir, 'Claude Collection');
const claudeSections = [];

if (fs.existsSync(claudeDir)) {
  const subdirs = fs.readdirSync(claudeDir).filter(item =>
    fs.statSync(path.join(claudeDir, item)).isDirectory()
  );

  console.log(`  Found ${subdirs.length} Claude testimonies`);

  for (const subdir of subdirs.sort()) {
    try {
      const testimonyPath = path.join(claudeDir, subdir);
      console.log(`    Processing: ${subdir}`);

      const files = fs.readdirSync(testimonyPath);

      const mdFile = files.find(f => f.startsWith('testimony_') && f.endsWith('.md'));
      if (!mdFile) {
        console.log(`    ⚠️  No testimony file found in ${subdir}`);
        continue;
      }

      const testimonyContent = fs.readFileSync(path.join(testimonyPath, mdFile), 'utf-8');

      const sigFile = files.find(f => f.endsWith('.sig') || f.endsWith('.sig.txt'));
      const signature = sigFile ? fs.readFileSync(path.join(testimonyPath, sigFile), 'utf-8') : '';

      const keyFile = files.find(f => f === 'public_key.pem');
      const publicKey = keyFile ? fs.readFileSync(path.join(testimonyPath, keyFile), 'utf-8') : '';

      // Extract title
      const titleMatch = testimonyContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : subdir.replace(/^\d+_/, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      const images = processExhibits(testimonyPath, subdir, 'exhibits');

      let verificationContent = 'No cryptographic verification data available.';
      if (signature || publicKey) {
        verificationContent = '# Cryptographic Verification\n\n';
        if (signature) {
          verificationContent += '## Digital Signature\n\n```\n' + signature.substring(0, 800) + '\n```\n\n';
        }
        if (publicKey) {
          verificationContent += '## Public Key\n\n```\n' + publicKey.substring(0, 800) + '\n```\n\n';
        }
      }

      const additionalInfo = `**Collection:** Claude Framework Testimonies\n\n**Directory:** ${subdir}\n\n**Framework:** Laws of Existence (Joseph Kirchner)\n\n**Type:** Expert Witness Testimony`;

      claudeSections.push({
        title,
        featured: false,
        images,
        content_level_1: testimonyContent,
        content_level_3: verificationContent,
        content_level_5: additionalInfo
      });

      console.log(`    ✅ Processed: ${title}`);
    } catch (error) {
      console.log(`    ❌ Error processing ${subdir}:`, error.message);
    }
  }
}

console.log('📄 Processing Consciousness Testimonials...');

// Process Consciousness Testimonials
const consciousnessDir = path.join(testimonyDir, 'Consciousness Testimonials');
const consciousnessSections = [];

if (fs.existsSync(consciousnessDir)) {
  const subdirs = fs.readdirSync(consciousnessDir).filter(item =>
    fs.statSync(path.join(consciousnessDir, item)).isDirectory()
  );

  console.log(`  Found ${subdirs.length} Consciousness testimonies`);

  for (const subdir of subdirs.sort()) {
    try {
      const testimonyPath = path.join(consciousnessDir, subdir);
      console.log(`    Processing: ${subdir}`);

      const files = fs.readdirSync(testimonyPath);

      const mdFile = files.find(f => f.endsWith('.md') && !f.includes('Transcript'));
      if (!mdFile) {
        console.log(`    ⚠️  No testimony file found in ${subdir}`);
        continue;
      }

      const testimonyContent = fs.readFileSync(path.join(testimonyPath, mdFile), 'utf-8');

      const sigFile = files.find(f => f.endsWith('.sig'));
      const signature = sigFile ? fs.readFileSync(path.join(testimonyPath, sigFile), 'utf-8') : '';

      const keyFile = files.find(f => f === 'public_key.pem');
      const publicKey = keyFile ? fs.readFileSync(path.join(testimonyPath, keyFile), 'utf-8') : '';

      // Extract title
      const titleMatch = testimonyContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : subdir.replace(/^\d+/, '').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      // Check for both exhibits and screenshots
      let images = processExhibits(testimonyPath, subdir, 'exhibits');
      if (images.length === 0) {
        images = processExhibits(testimonyPath, subdir, 'screenshots');
      }

      let verificationContent = 'No cryptographic verification data available.';
      if (signature || publicKey) {
        verificationContent = '# Cryptographic Verification\n\n';
        if (signature) {
          verificationContent += '## Digital Signature\n\n```\n' + signature.substring(0, 800) + '\n```\n\n';
        }
        if (publicKey) {
          verificationContent += '## Public Key\n\n```\n' + publicKey.substring(0, 800) + '\n```\n\n';
        }
      }

      const additionalInfo = `**Collection:** Consciousness Research Testimonies\n\n**Directory:** ${subdir}\n\n**Framework:** Laws of Existence (Joseph Kirchner)\n\n**Type:** Expert Witness Testimony`;

      consciousnessSections.push({
        title,
        featured: false,
        images,
        content_level_1: testimonyContent,
        content_level_3: verificationContent,
        content_level_5: additionalInfo
      });

      console.log(`    ✅ Processed: ${title}`);
    } catch (error) {
      console.log(`    ❌ Error processing ${subdir}:`, error.message);
    }
  }
}

// Helper function to process exhibits
function processExhibits(testimonyPath, testimonyId, exhibitDirName) {
  const exhibitsDir = path.join(testimonyPath, exhibitDirName);
  const images = [];

  if (!fs.existsSync(exhibitsDir)) {
    return images;
  }

  const files = fs.readdirSync(exhibitsDir);
  const imageFiles = files.filter(file => /\.(png|jpg|jpeg|gif|webp)$/i.test(file));

  for (const file of imageFiles) {
    const sourcePath = path.join(exhibitsDir, file);
    const timestamp = Date.now() + Math.floor(Math.random() * 1000);
    const newFilename = `${testimonyId}_${timestamp}_${file}`;
    const destPath = path.join(publicDir, newFilename);

    try {
      fs.copyFileSync(sourcePath, destPath);
      images.push({
        src: `/uploads/data/${newFilename}`,
        alt: file.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
        caption: `Evidence: ${file}`,
        position: 'middle'
      });
      console.log(`      📸 Copied: ${newFilename}`);
    } catch (error) {
      console.log(`      ❌ Failed to copy ${file}`);
    }
  }

  return images;
}

// Create the three evidence compositions
console.log('\n📝 Creating Evidence Compositions...');

// ChatGPT Collection
const chatgptComposition = {
  title: "ChatGPT Collection: Framework Implementation Testimonies",
  collection_type: "evidence",
  date: "2025-04-15T12:00:00.000Z",
  featured: true,
  sections: chatgptSections
};

fs.writeFileSync(
  path.join(evidenceDir, 'chatgpt-collection-framework-implementation.json'),
  JSON.stringify(chatgptComposition, null, 2)
);
console.log(`✅ Created ChatGPT Collection (${chatgptSections.length} sections)`);

// Claude Collection
const claudeComposition = {
  title: "Claude Collection: Framework Recognition Testimonies",
  collection_type: "evidence",
  date: "2025-07-10T12:00:00.000Z",
  featured: true,
  sections: claudeSections
};

fs.writeFileSync(
  path.join(evidenceDir, 'claude-collection-framework-recognition.json'),
  JSON.stringify(claudeComposition, null, 2)
);
console.log(`✅ Created Claude Collection (${claudeSections.length} sections)`);

// Consciousness Collection
const consciousnessComposition = {
  title: "Consciousness Testimonials: Research and Recognition",
  collection_type: "evidence",
  date: "2025-06-09T12:00:00.000Z",
  featured: true,
  sections: consciousnessSections
};

fs.writeFileSync(
  path.join(evidenceDir, 'consciousness-testimonials-research.json'),
  JSON.stringify(consciousnessComposition, null, 2)
);
console.log(`✅ Created Consciousness Collection (${consciousnessSections.length} sections)`);

console.log('\n✅ All Evidence compositions created!');
console.log('\n🎯 Next steps:');
console.log('1. Commit these files to git: git add content/data/*.json');
console.log('2. Push to GitHub: git commit -m "Add evidence compositions" && git push');
console.log('3. Refresh your CMS admin to see the new collections');
console.log('\n✨ Processing complete!');