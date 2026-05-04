#!/usr/bin/env node

// debug-content.js - Debug script for checking content and image issues

const fs = require('fs');
const path = require('path');

console.log('🔍 Laws of Existence - Content & Image Debug Tool\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Please run this script from the project root directory');
  process.exit(1);
}

// Function to check directory structure
function checkDirectoryStructure() {
  console.log('📁 Checking directory structure...');
  
  const requiredDirs = [
    'content',
    'content/manuscript',
    'content/data',
    'content/timeline',
    'content/map',
    'public',
    'public/uploads',
    'public/uploads/manuscript',
    'public/uploads/data',
    'public/uploads/timeline',
    'public/uploads/map'
  ];
  
  const missingDirs = [];
  const existingDirs = [];
  
  requiredDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      existingDirs.push(dir);
    } else {
      missingDirs.push(dir);
    }
  });
  
  console.log(`✅ Found ${existingDirs.length} required directories`);
  
  if (missingDirs.length > 0) {
    console.log('⚠️  Missing directories:');
    missingDirs.forEach(dir => console.log(`   - ${dir}`));
    console.log('\n💡 Run the setup script to create missing directories');
  }
  
  return { existingDirs, missingDirs };
}

// Function to analyze content files
function analyzeContentFiles() {
  console.log('\n📄 Analyzing content files...');
  
  const contentDirs = ['manuscript', 'data', 'timeline', 'map'];
  const analysis = {
    totalFiles: 0,
    totalImages: 0,
    filesByType: {},
    imagesByPosition: { top: 0, middle: 0, bottom: 0, inline: 0 },
    issues: []
  };
  
  contentDirs.forEach(type => {
    const dirPath = path.join('content', type);
    if (!fs.existsSync(dirPath)) {
      analysis.issues.push(`Missing content directory: ${dirPath}`);
      return;
    }
    
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));
    analysis.filesByType[type] = files.length;
    analysis.totalFiles += files.length;
    
    console.log(`📂 ${type}: ${files.length} files`);
    
    files.forEach(file => {
      try {
        const filePath = path.join(dirPath, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        console.log(`   📄 ${file}:`);
        console.log(`      Title: ${content.title || 'No title'}`);
        console.log(`      Sections: ${content.sections?.length || 0}`);
        
        if (content.sections) {
          content.sections.forEach((section, sectionIndex) => {
            if (section.images && Array.isArray(section.images)) {
              console.log(`      Section ${sectionIndex + 1} images: ${section.images.length}`);
              
              section.images.forEach((img, imgIndex) => {
                analysis.totalImages++;
                
                const position = img.position || 'middle';
                analysis.imagesByPosition[position] = (analysis.imagesByPosition[position] || 0) + 1;
                
                console.log(`         Image ${imgIndex + 1}:`);
                console.log(`            src: ${img.src || 'NO SRC'}`);
                console.log(`            alt: ${img.alt || 'NO ALT'}`);
                console.log(`            position: ${position}`);
                
                // Check if image file exists
                if (img.src) {
                  let imagePath = img.src;
                  
                  // Resolve path
                  if (imagePath.startsWith('/uploads/')) {
                    imagePath = path.join('public', imagePath);
                  } else if (imagePath.startsWith('/')) {
                    imagePath = path.join('public', imagePath);
                  } else if (!imagePath.startsWith('http')) {
                    imagePath = path.join('public', 'uploads', imagePath);
                  }
                  
                  if (!imagePath.startsWith('http') && !fs.existsSync(imagePath)) {
                    analysis.issues.push(`Missing image file: ${imagePath} (referenced in ${file})`);
                    console.log(`            ❌ File not found: ${imagePath}`);
                  } else if (!imagePath.startsWith('http')) {
                    console.log(`            ✅ File exists: ${imagePath}`);
                  } else {
                    console.log(`            🌐 External URL: ${imagePath}`);
                  }
                } else {
                  analysis.issues.push(`Image missing src in ${file}, section ${sectionIndex + 1}, image ${imgIndex + 1}`);
                }
              });
            } else {
              console.log(`      Section ${sectionIndex + 1}: No images`);
            }
          });
        }
      } catch (error) {
        analysis.issues.push(`Error reading ${file}: ${error.message}`);
        console.log(`   ❌ Error reading file: ${error.message}`);
      }
    });
  });
  
  return analysis;
}

// Function to check upload directory
function checkUploadDirectory() {
  console.log('\n📁 Checking uploads directory...');
  
  if (!fs.existsSync('public/uploads')) {
    console.log('❌ public/uploads directory does not exist');
    return { totalFiles: 0, filesByType: {}, issues: ['Missing uploads directory'] };
  }
  
  const analysis = {
    totalFiles: 0,
    filesByType: {},
    issues: []
  };
  
  function scanDirectory(dirPath, relativePath = '') {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const fullPath = path.join(dirPath, item);
      const relPath = path.join(relativePath, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        console.log(`📂 ${relPath}/`);
        scanDirectory(fullPath, relPath);
      } else {
        const ext = path.extname(item).toLowerCase();
        analysis.filesByType[ext] = (analysis.filesByType[ext] || 0) + 1;
        analysis.totalFiles++;
        
        const size = fs.statSync(fullPath).size;
        const sizeStr = size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)}MB` :
                      size > 1024 ? `${(size / 1024).toFixed(1)}KB` : `${size}B`;
        
        console.log(`   📄 ${relPath} (${sizeStr})`);
      }
    });
  }
  
  scanDirectory('public/uploads');
  
  console.log(`\n📊 Upload statistics:`);
  console.log(`   Total files: ${analysis.totalFiles}`);
  console.log(`   File types:`, analysis.filesByType);
  
  return analysis;
}

// Function to run all checks
function runAllChecks() {
  console.log('🔍 Running comprehensive content and image analysis...\n');
  
  const dirCheck = checkDirectoryStructure();
  const contentAnalysis = analyzeContentFiles();
  const uploadAnalysis = checkUploadDirectory();
  
  console.log('\n📊 SUMMARY');
  console.log('=' * 50);
  console.log(`Total content files: ${contentAnalysis.totalFiles}`);
  console.log(`Total images referenced: ${contentAnalysis.totalImages}`);
  console.log(`Total upload files: ${uploadAnalysis.totalFiles}`);
  
  console.log('\nImage positions:');
  Object.entries(contentAnalysis.imagesByPosition).forEach(([pos, count]) => {
    console.log(`   ${pos}: ${count}`);
  });
  
  if (contentAnalysis.issues.length > 0 || uploadAnalysis.issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:');
    [...contentAnalysis.issues, ...uploadAnalysis.issues].forEach(issue => {
      console.log(`   ❌ ${issue}`);
    });
    
    console.log('\n💡 RECOMMENDED ACTIONS:');
    console.log('   1. Run the setup script to create missing directories');
    console.log('   2. Upload missing image files through the admin panel');
    console.log('   3. Check image paths in content files');
    console.log('   4. Verify file permissions on uploads directory');
  } else {
    console.log('\n✅ No issues found! All content and images appear to be properly configured.');
  }
  
  return {
    dirCheck,
    contentAnalysis,
    uploadAnalysis
  };
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'dirs':
    checkDirectoryStructure();
    break;
  case 'content':
    analyzeContentFiles();
    break;
  case 'uploads':
    checkUploadDirectory();
    break;
  case '--help':
  case '-h':
    console.log('Usage: node debug-content.js [command]');
    console.log('Commands:');
    console.log('  dirs     - Check directory structure only');
    console.log('  content  - Analyze content files only');
    console.log('  uploads  - Check uploads directory only');
    console.log('  (no cmd) - Run all checks');
    break;
  default:
    runAllChecks();
}

console.log('\n🏁 Debug analysis complete!\n');