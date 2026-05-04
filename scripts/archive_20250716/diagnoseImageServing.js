// scripts/diagnoseImageServing.js - Test image serving and path resolution
console.log('🔍 DIAGNOSING IMAGE SERVING ISSUES\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentFile = path.join(__dirname, '../content/data/framework-recognition-testimonies.json');
const publicDir = path.join(__dirname, '../public/uploads/data');

console.log('📄 Reading composition file...');
if (!fs.existsSync(contentFile)) {
  console.log('❌ Composition file not found!');
  process.exit(1);
}

const composition = JSON.parse(fs.readFileSync(contentFile, 'utf-8'));
console.log(`✅ Found composition with ${composition.sections.length} sections`);

// Test first few images from the composition
console.log('\n🔍 Testing image paths from composition...');

let testCount = 0;
for (const section of composition.sections) {
  if (section.images && section.images.length > 0) {
    console.log(`\n📂 Section: ${section.title}`);
    console.log(`   Images: ${section.images.length}`);

    // Test first 3 images from this section
    const imagesToTest = section.images.slice(0, 3);

    for (const img of imagesToTest) {
      testCount++;
      console.log(`\n  🖼️  Image ${testCount}:`);
      console.log(`     JSON path: ${img.src}`);

      // Extract filename from path
      const filename = img.src.replace('/uploads/data/', '');
      console.log(`     Filename: ${filename}`);

      // Check if file exists
      const filePath = path.join(publicDir, filename);
      const exists = fs.existsSync(filePath);
      console.log(`     File exists: ${exists ? '✅' : '❌'} ${filePath}`);

      if (exists) {
        const stats = fs.statSync(filePath);
        console.log(`     File size: ${(stats.size / 1024).toFixed(1)} KB`);
        console.log(`     Permissions: ${stats.mode.toString(8)}`);
      }

      // Check for URL encoding issues
      const encodedFilename = encodeURIComponent(filename);
      if (encodedFilename !== filename) {
        console.log(`     URL encoded: ${encodedFilename}`);

        // Test if encoded version exists
        const encodedPath = path.join(publicDir, encodedFilename);
        if (fs.existsSync(encodedPath)) {
          console.log(`     ⚠️  Encoded file exists instead!`);
        }
      }

      // Generate test URLs
      console.log(`     Test URLs:`);
      console.log(`       Direct: http://localhost:3000${img.src}`);
      console.log(`       Encoded: http://localhost:3000/uploads/data/${encodedFilename}`);

      if (testCount >= 5) break; // Don't test too many
    }
    if (testCount >= 5) break;
  }
}

// Check for common filename issues
console.log('\n🔍 Checking for filename issues...');

const uploadedFiles = fs.readdirSync(publicDir)
  .filter(file => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file));

console.log(`📁 Total files in uploads: ${uploadedFiles.length}`);

// Check for problematic characters
const problematicFiles = uploadedFiles.filter(file => {
  return file.includes(' ') || file.includes('%') || file.includes('#') || file.includes('&');
});

if (problematicFiles.length > 0) {
  console.log(`\n⚠️  Files with problematic characters: ${problematicFiles.length}`);
  problematicFiles.slice(0, 5).forEach(file => {
    console.log(`   - ${file}`);
  });
}

// Test if we can create a simple test HTML file
console.log('\n🧪 Creating test HTML file...');

const testImages = uploadedFiles.slice(0, 5);
const testHtml = `<!DOCTYPE html>
<html>
<head>
    <title>Image Serving Test</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-image { margin: 20px 0; border: 1px solid #ccc; padding: 10px; }
        img { max-width: 300px; height: auto; }
        .error { color: red; }
        .success { color: green; }
    </style>
</head>
<body>
    <h1>Image Serving Test</h1>
    <p>Testing if images can be served directly...</p>

    ${testImages.map((file, index) => `
    <div class="test-image">
        <h3>Test ${index + 1}: ${file}</h3>
        <p><strong>Path:</strong> /uploads/data/${file}</p>
        <img src="/uploads/data/${file}"
             alt="Test image ${index + 1}"
             onload="this.nextElementSibling.innerHTML='<span class=\\"success\\">✅ Loaded successfully</span>'"
             onerror="this.nextElementSibling.innerHTML='<span class=\\"error\\">❌ Failed to load</span>'">
        <div>Loading...</div>
    </div>
    `).join('')}

    <script>
        console.log('🧪 Image test page loaded');

        // Test fetch API for each image
        const testImages = ${JSON.stringify(testImages.map(file => `/uploads/data/${file}`))};

        testImages.forEach(async (imagePath, index) => {
            try {
                const response = await fetch(imagePath, { method: 'HEAD' });
                console.log(\`Image \${index + 1} (\${imagePath}): \${response.ok ? '✅' : '❌'} \${response.status}\`);
            } catch (error) {
                console.error(\`Image \${index + 1} (\${imagePath}): ❌ Error\`, error);
            }
        });
    </script>
</body>
</html>`;

const testHtmlPath = path.join(__dirname, '../public/test-images.html');
fs.writeFileSync(testHtmlPath, testHtml);

console.log(`✅ Created test HTML file: ${testHtmlPath}`);
console.log(`🌐 Visit: http://localhost:3000/test-images.html`);

// Summary and recommendations
console.log('\n📋 DIAGNOSIS SUMMARY:');
console.log(`- Composition file: ✅ Created with ${composition.sections.length} sections`);
console.log(`- Total images in composition: ${composition.sections.reduce((sum, s) => sum + (s.images?.length || 0), 0)}`);
console.log(`- Files in uploads directory: ${uploadedFiles.length}`);
console.log(`- Files with problematic characters: ${problematicFiles.length}`);

console.log('\n💡 NEXT STEPS:');
console.log('1. Visit http://localhost:3000/test-images.html to test direct image serving');
console.log('2. Check browser console for fetch API results');
console.log('3. Hard refresh your evidence page (Ctrl+Shift+R)');
console.log('4. Check browser network tab to see what URLs are being requested');
console.log('5. Verify your vite.config.ts has the correct uploadsStaticPlugin fix');

console.log('\n🔧 If images still don\'t load:');
console.log('- Check browser dev tools Network tab for 404 errors');
console.log('- Try accessing a direct image URL manually');
console.log('- Check file permissions: chmod -R 755 public/uploads/');

console.log('\n🏁 Diagnosis complete!');