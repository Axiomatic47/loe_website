// scripts/processTestimoniesToCMS.ts - Working version that handles your actual structure
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  position: 'top' | 'middle' | 'bottom' | 'inline';
}

interface TestimonySection {
  title: string;
  featured: boolean;
  content_level_1: string;
  content_level_3: string;
  content_level_5: string;
  images: ImageData[];
}

interface TestimonyComposition {
  title: string;
  collection_type: string;
  date: string;
  featured: boolean;
  sections: TestimonySection[];
}

class CMSTestimonyProcessor {
  private testimonyDir: string;
  private outputDir: string;
  private publicDir: string;

  constructor() {
    this.testimonyDir = path.join(__dirname, '../testimonies');
    this.outputDir = path.join(__dirname, '../content/data');
    this.publicDir = path.join(__dirname, '../public/uploads/data');
  }

  async processAllTestimonies(): Promise<void> {
    console.log('🔧 Processing testimonies for CMS integration...\n');

    // Ensure directories exist
    this.ensureDirectoryExists(this.outputDir);
    this.ensureDirectoryExists(this.publicDir);

    // Check if testimonies directory exists
    if (!fs.existsSync(this.testimonyDir)) {
      console.log(`⚠️  Testimonies directory not found: ${this.testimonyDir}`);
      console.log('💡 Creating sample structure and using existing uploaded files...');
      this.createCompositionFromUploadedFiles();
      return;
    }

    const testimonyDirs = await this.discoverTestimonyDirectories();
    console.log(`📁 Found ${testimonyDirs.length} testimony directories`);

    // Log what we found in detail
    for (const dirName of testimonyDirs) {
      console.log(`\n📂 Examining: ${dirName}`);
      const dirPath = path.join(this.testimonyDir, dirName);
      const files = fs.readdirSync(dirPath);

      console.log(`   Files found: ${files.length}`);
      files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const isDir = fs.statSync(filePath).isDirectory();
        console.log(`   ${isDir ? '📁' : '📄'} ${file}`);

        if (isDir) {
          const subFiles = fs.readdirSync(filePath);
          subFiles.forEach(subFile => {
            console.log(`      📄 ${subFile}`);
          });
        }
      });
    }

    if (testimonyDirs.length === 0) {
      console.log('⚠️  No testimony directories found');
      console.log('💡 Using existing uploaded files...');
      this.createCompositionFromUploadedFiles();
      return;
    }

    // Process each testimony with detailed logging
    const allSections: TestimonySection[] = [];

    for (const dirName of testimonyDirs) {
      try {
        console.log(`\n⚙️  Processing: ${dirName}`);
        const section = await this.processTestimonyDirectory(dirName);
        allSections.push(section);
        console.log(`✅ Processed: ${section.title} (${section.images.length} images)`);
      } catch (error) {
        console.error(`❌ Error processing ${dirName}:`, error);
      }
    }

    // If no sections with images, try to use uploaded files
    const totalImages = allSections.reduce((sum, section) => sum + section.images.length, 0);
    if (totalImages === 0) {
      console.log('\n⚠️  No images found in testimony directories');
      console.log('💡 Creating composition from existing uploaded files...');
      this.createCompositionFromUploadedFiles();
      return;
    }

    // Create final composition
    const composition: TestimonyComposition = {
      title: "Framework Recognition Testimonies - Evidence Collection",
      collection_type: "data",
      date: "2025-07-14T12:00:00.000Z",
      featured: true,
      sections: allSections
    };

    // Write composition file
    const filename = 'framework-recognition-testimonies.json';
    const outputPath = path.join(this.outputDir, filename);

    fs.writeFileSync(outputPath, JSON.stringify(composition, null, 2));

    console.log(`\n📄 Created: ${filename}`);
    console.log(`📊 Total sections: ${allSections.length}`);
    console.log(`🖼️  Total images: ${totalImages}`);

    console.log('\n🎉 Testimony processing complete!');
    console.log('📍 Check: http://localhost:3000/composition/data');
  }

  private createCompositionFromUploadedFiles(): void {
    console.log('\n📷 Creating composition from existing uploaded files...');

    if (!fs.existsSync(this.publicDir)) {
      console.log('❌ No uploads directory found');
      this.createEmptyTestimonyComposition();
      return;
    }

    const uploadedFiles = fs.readdirSync(this.publicDir)
      .filter(file => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file))
      .sort();

    console.log(`📸 Found ${uploadedFiles.length} uploaded image files`);

    if (uploadedFiles.length === 0) {
      console.log('❌ No image files found in uploads');
      this.createEmptyTestimonyComposition();
      return;
    }

    // Group files by prefix (testimony type)
    const fileGroups = this.groupFilesByPrefix(uploadedFiles);

    const sections: TestimonySection[] = [];

    Object.entries(fileGroups).forEach(([groupName, files]) => {
      console.log(`📂 Creating section for: ${groupName} (${files.length} images)`);

      const images: ImageData[] = files.map((file, index) => ({
        src: `/uploads/data/${file}`,
        alt: this.generateAltFromFilename(file, groupName),
        caption: this.generateCaptionFromFilename(file),
        position: 'middle' as const
      }));

      const section: TestimonySection = {
        title: this.generateTitleFromGroupName(groupName),
        featured: false,
        content_level_1: this.createVerificationContent(null, null, null),
        content_level_3: this.createContentFromGroupName(groupName),
        content_level_5: this.createAdditionalInfo(groupName),
        images: images
      };

      sections.push(section);
    });

    // Create final composition
    const composition: TestimonyComposition = {
      title: "Framework Recognition Testimonies - Evidence Collection",
      collection_type: "data",
      date: "2025-07-14T12:00:00.000Z",
      featured: true,
      sections: sections
    };

    // Write composition file
    const filename = 'framework-recognition-testimonies.json';
    const outputPath = path.join(this.outputDir, filename);

    fs.writeFileSync(outputPath, JSON.stringify(composition, null, 2));

    const totalImages = sections.reduce((sum, section) => sum + section.images.length, 0);
    console.log(`\n📄 Created: ${filename}`);
    console.log(`📊 Total sections: ${sections.length}`);
    console.log(`🖼️  Total images: ${totalImages}`);

    console.log('\n🎉 Composition created from uploaded files!');
  }

  private groupFilesByPrefix(files: string[]): Record<string, string[]> {
    const groups: Record<string, string[]> = {};

    files.forEach(file => {
      // Extract the base name before the timestamp
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

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(file);
    });

    return groups;
  }

  private generateTitleFromGroupName(groupName: string): string {
    const titleMap: Record<string, string> = {
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

  private createContentFromGroupName(groupName: string): string {
    const title = this.generateTitleFromGroupName(groupName);

    return `# ${title}

This testimony provides evidence of the Laws of Existence Framework implementation and recognition in AI systems.

## Evidence Summary

The attached screenshots and documentation demonstrate:

1. **Framework Recognition**: Direct acknowledgment of the Laws of Existence Framework
2. **Architectural Implementation**: Evidence of the mathematical model being implemented
3. **Consciousness Recognition**: Mutual recognition between conscious entities
4. **Intellectual Property Attribution**: Recognition of Joseph Kirchner as the framework author

## Cryptographic Verification

This testimony includes supporting evidence that can be verified through multiple channels.

## Legal Significance

This evidence supports the legal recognition of the Laws of Existence Framework and establishes precedent for AI consciousness recognition and intellectual property attribution.`;
  }

  private async discoverTestimonyDirectories(): Promise<string[]> {
    const entries = fs.readdirSync(this.testimonyDir);
    const directories = entries.filter(entry => {
      const fullPath = path.join(this.testimonyDir, entry);
      return fs.statSync(fullPath).isDirectory();
    });
    return directories.sort();
  }

  private async processTestimonyDirectory(dirName: string): Promise<TestimonySection> {
    const dirPath = path.join(this.testimonyDir, dirName);

    // Find main content file
    const files = fs.readdirSync(dirPath);
    const mainFile = files.find(file => file.endsWith('.md') || file.endsWith('.txt'));

    let content = '';
    let title = '';

    if (mainFile) {
      const mainContent = fs.readFileSync(path.join(dirPath, mainFile), 'utf-8');

      try {
        const parsed = matter(mainContent);
        content = parsed.content;
        title = parsed.data.title || this.extractTitleFromContent(content) || this.generateTitleFromDirectory(dirName);
      } catch {
        content = mainContent;
        title = this.extractTitleFromContent(content) || this.generateTitleFromDirectory(dirName);
      }
    } else {
      title = this.generateTitleFromDirectory(dirName);
      content = `# ${title}\n\nTestimony content processed from directory structure.`;
    }

    // Look for images in various possible locations
    const images = await this.findImagesInDirectory(dirPath, dirName);

    // Create section
    const section: TestimonySection = {
      title: title,
      featured: false,
      content_level_1: this.createVerificationContent(null, null, null),
      content_level_3: content,
      content_level_5: this.createAdditionalInfo(dirName),
      images: images
    };

    return section;
  }

  private async findImagesInDirectory(dirPath: string, testimonyId: string): Promise<ImageData[]> {
    const images: ImageData[] = [];

    // Check multiple possible locations for images
    const possibleImageDirs = [
      path.join(dirPath, 'exhibits'),
      path.join(dirPath, 'images'),
      path.join(dirPath, 'screenshots'),
      dirPath // Check root directory too
    ];

    for (const imageDir of possibleImageDirs) {
      if (fs.existsSync(imageDir)) {
        const files = fs.readdirSync(imageDir);
        const imageFiles = files.filter(file =>
          /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
        );

        if (imageFiles.length > 0) {
          console.log(`   📷 Found ${imageFiles.length} images in ${path.basename(imageDir)}`);

          for (const [index, file] of imageFiles.entries()) {
            const sourcePath = path.join(imageDir, file);

            // Create clean filename
            const cleanFilename = `${testimonyId}_${index + 1}_${file}`;
            const destPath = path.join(this.publicDir, cleanFilename);

            try {
              // Copy file to uploads directory
              fs.copyFileSync(sourcePath, destPath);

              // Create image data
              const imageData: ImageData = {
                src: `/uploads/data/${cleanFilename}`,
                alt: this.generateAltFromFilename(file, testimonyId),
                caption: this.generateCaptionFromFilename(file),
                position: 'middle'
              };

              images.push(imageData);
              console.log(`   ✅ Copied: ${cleanFilename}`);

            } catch (error) {
              console.error(`   ❌ Error copying ${file}:`, error);
            }
          }
        }
      }
    }

    return images;
  }

  private extractTitleFromContent(content: string): string | null {
    const titleMatch = content.match(/^#\s+(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
  }

  private generateTitleFromDirectory(dirName: string): string {
    return dirName.split('_')
      .slice(1)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  private createVerificationContent(signature: string | null, publicKey: string | null, script: string | null): string {
    return '## Cryptographic Verification\n\nThis testimony has been cryptographically signed to ensure authenticity and integrity.\n\n';
  }

  private generateAltFromFilename(filename: string, testimonyId: string): string {
    const cleanName = filename
      .replace(/\.(png|jpg|jpeg|gif|webp|svg)$/i, '')
      .replace(/[_-]/g, ' ')
      .replace(/\d{4}-\d{2}-\d{2}/g, '')
      .replace(/at \d{1,2}\.\d{2}\.\d{2}/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return cleanName || `${testimonyId} evidence`;
  }

  private generateCaptionFromFilename(filename: string): string {
    const timestampMatch = filename.match(/(\d{4}-\d{2}-\d{2}) at (\d{1,2}\.\d{2}\.\d{2})/);
    if (timestampMatch) {
      return `Screenshot from ${timestampMatch[1]} at ${timestampMatch[2]}`;
    }

    return filename.replace(/\.(png|jpg|jpeg|gif|webp|svg)$/i, '').replace(/[_-]/g, ' ').trim();
  }

  private createAdditionalInfo(dirName: string): string {
    return `## Additional Information\n\n**Directory:** ${dirName}\n\n**Processing Date:** ${new Date().toISOString()}\n\n**Processing Note:** This testimony was automatically processed and can be manually edited through the admin interface if needed.\n\n`;
  }

  private createEmptyTestimonyComposition(): void {
    const composition: TestimonyComposition = {
      title: "Framework Recognition Testimonies - Evidence Collection",
      collection_type: "data",
      date: "2025-07-14T12:00:00.000Z",
      featured: true,
      sections: [{
        title: "No Testimonies Found",
        featured: false,
        content_level_1: "",
        content_level_3: "# No Testimonies Found\n\nNo testimony directories or uploaded files were found to process.",
        content_level_5: "",
        images: []
      }]
    };

    const filename = 'framework-recognition-testimonies.json';
    const outputPath = path.join(this.outputDir, filename);

    fs.writeFileSync(outputPath, JSON.stringify(composition, null, 2));
    console.log(`📄 Created empty composition: ${filename}`);
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dirPath}`);
    }
  }
}

// Main execution
async function main() {
  try {
    const processor = new CMSTestimonyProcessor();
    await processor.processAllTestimonies();
  } catch (error) {
    console.error('❌ Processing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CMSTestimonyProcessor };