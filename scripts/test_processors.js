// Test script to verify current processors are working
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Current Testimony Processors\n');

// Test 1: Check directory structure
console.log('📁 Directory Structure Test:');
const requiredDirs = [
  '../testimonies',
  '../content/data',
  '../public/uploads/data',
  '../scripts'
];

for (const dir of requiredDirs) {
  const fullPath = path.resolve(__dirname, dir);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✅' : '❌'} ${dir}: ${exists ? 'exists' : 'missing'}`);
}

// Test 2: Check current processors exist
console.log('\n🔧 Current Processors Test:');
const currentProcessors = [
  'simpleTestimonyProcessor.js',
  'processTestimoniesToCMS.ts',
  'processTestimoniesToEvidence.ts',
  'fixedTestimonyProcessor.js'
];

for (const processor of currentProcessors) {
  const processorPath = path.resolve(__dirname, '..', 'scripts', processor);
  const exists = fs.existsSync(processorPath);
  console.log(`  ${exists ? '✅' : '❌'} ${processor}: ${exists ? 'exists' : 'missing'}`);
}

// Test 3: Check for uploaded images
console.log('\n🖼️ Image Files Test:');
const uploadsDir = path.resolve(__dirname, '../public/uploads/data');
if (fs.existsSync(uploadsDir)) {
  const imageFiles = fs.readdirSync(uploadsDir)
    .filter(file => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file));
  console.log(`  ✅ Found ${imageFiles.length} image files`);

  if (imageFiles.length > 0) {
    console.log(`  📷 Sample files: ${imageFiles.slice(0, 3).join(', ')}${imageFiles.length > 3 ? '...' : ''}`);
  }
} else {
  console.log('  ❌ Uploads directory not found');
}

// Test 4: Check testimony source directories
console.log('\n📚 Testimony Sources Test:');
const testimonyDir = path.resolve(__dirname, '../testimonies');
if (fs.existsSync(testimonyDir)) {
  const collections = fs.readdirSync(testimonyDir)
    .filter(item => fs.statSync(path.join(testimonyDir, item)).isDirectory());
  console.log(`  ✅ Found ${collections.length} testimony collections:`);

  for (const collection of collections) {
    const collectionPath = path.join(testimonyDir, collection);
    const subdirs = fs.readdirSync(collectionPath)
      .filter(item => fs.statSync(path.join(collectionPath, item)).isDirectory());
    console.log(`    📁 ${collection}: ${subdirs.length} testimonies`);
  }
} else {
  console.log('  ❌ Testimonies directory not found');
}

// Test 5: Check existing content files
console.log('\n📄 Existing Content Test:');
const contentDir = path.resolve(__dirname, '../content/data');
if (fs.existsSync(contentDir)) {
  const contentFiles = fs.readdirSync(contentDir)
    .filter(file => file.endsWith('.json'));
  console.log(`  ✅ Found ${contentFiles.length} content files:`);

  for (const file of contentFiles) {
    console.log(`    📄 ${file}`);
  }
} else {
  console.log('  ❌ Content/data directory not found');
}

// Test 6: Create test file to verify write permissions
console.log('\n✍️ Write Permissions Test:');
try {
  const testFile = path.join(contentDir, 'test-write-permission.json');
  fs.writeFileSync(testFile, JSON.stringify({ test: true }, null, 2));
  fs.unlinkSync(testFile); // Clean up
  console.log('  ✅ Write permissions OK');
} catch (error) {
  console.log('  ❌ Write permissions failed:', error.message);
}

// Test 7: Check for obsolete processors
console.log('\n🗑️ Obsolete Processors Check:');
const scriptsDir = path.resolve(__dirname, '../scripts');
const obsoletePatterns = [
  /^debug/,
  /^diagnose/,
  /^test/,
  /ImageDebug/,
  /complete.*Fix/,
  /exact.*Filename/,
  /final.*Fix/,
  /proper.*Testimony/
];

if (fs.existsSync(scriptsDir)) {
  const allFiles = fs.readdirSync(scriptsDir);
  const obsoleteFiles = allFiles.filter(file =>
    obsoletePatterns.some(pattern => pattern.test(file))
  );

  if (obsoleteFiles.length > 0) {
    console.log(`  ⚠️ Found ${obsoleteFiles.length} potentially obsolete files:`);
    for (const file of obsoleteFiles) {
      console.log(`    🗑️ ${file}`);
    }
  } else {
    console.log('  ✅ No obviously obsolete files found');
  }
}

console.log('\n🎯 Test Summary:');
console.log('================');
console.log('If all essential tests pass ✅, you can proceed with:');
console.log('1. Running the cleanup script to remove obsolete files');
console.log('2. Using the recommended workflow to process testimonies');
console.log('3. Testing the current processors with real data');
console.log('\n✨ Test complete!');