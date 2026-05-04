// src/utils/compositionLoader.ts - Enhanced with constitutional collection support
import { Composition, ImageData } from './compositionData';

export const loadCompositions = async (): Promise<Composition[]> => {
  console.log('🔄 Starting composition loading:', new Date().toISOString());

  try {
    const compositions: Composition[] = [];

    // Use a more robust approach that handles JSON loading errors gracefully
    console.log('📁 Loading compositions via import.meta.glob with error handling');

    // Define the glob patterns but handle them more carefully
    const manuscriptFiles = import.meta.glob('/content/manuscript/*.json', {
      eager: false,
      import: 'default',
      query: '?raw'
    });

    const dataFiles = import.meta.glob('/content/data/*.json', {
      eager: false,
      import: 'default',
      query: '?raw'
    });

    const constitutionalFiles = import.meta.glob('/content/constitutional/*.json', {
      eager: false,
      import: 'default',
      query: '?raw'
    });

    const mapFiles = import.meta.glob('/content/map/*.json', {
      eager: false,
      import: 'default',
      query: '?raw'
    });

    const copyrightFiles = import.meta.glob('/content/copyright/*.json', {
      eager: false,
      import: 'default',
      query: '?raw'
    });

    // Timeline files handled separately with special error handling
    const timelineFiles = import.meta.glob('/content/timeline/*.json', {
      eager: false,
      import: 'default',
      query: '?raw'
    });

    console.log('📄 Found files:', {
      manuscript: Object.keys(manuscriptFiles).length,
      data: Object.keys(dataFiles).length,
      constitutional: Object.keys(constitutionalFiles).length,
      map: Object.keys(mapFiles).length,
      copyright: Object.keys(copyrightFiles).length,
      timeline: Object.keys(timelineFiles).length
    });

    // Process manuscript files
    for (const [path, loader] of Object.entries(manuscriptFiles)) {
      await processFileWithErrorHandling(path, loader, 'manuscript', compositions);
    }

    // Process data files
    for (const [path, loader] of Object.entries(dataFiles)) {
      await processFileWithErrorHandling(path, loader, 'data', compositions);
    }

    // Process constitutional files
    for (const [path, loader] of Object.entries(constitutionalFiles)) {
      await processFileWithErrorHandling(path, loader, 'constitutional', compositions);
    }

    // Process map files
    for (const [path, loader] of Object.entries(mapFiles)) {
      await processFileWithErrorHandling(path, loader, 'map', compositions);
    }

    // Process copyright files
    for (const [path, loader] of Object.entries(copyrightFiles)) {
      await processFileWithErrorHandling(path, loader, 'copyright', compositions);
    }

    // Process timeline files with special handling
    for (const [path, loader] of Object.entries(timelineFiles)) {
      await processTimelineFileWithErrorHandling(path, loader, compositions);
    }

    console.log(`✅ Total compositions loaded: ${compositions.length}`);

    // If no compositions were loaded, provide samples
    if (compositions.length === 0) {
      console.log('📚 No compositions found, providing samples');
      return getSampleCompositions();
    }

    // Sort compositions by collection type and featured status
    return compositions.sort((a, b) => {
      // First sort by collection type priority
      const typeOrder = { manuscript: 0, data: 1, constitutional: 2, copyright: 3, timeline: 4, map: 5 };
      const aOrder = typeOrder[a.collection_type] ?? 999;
      const bOrder = typeOrder[b.collection_type] ?? 999;

      if (aOrder !== bOrder) return aOrder - bOrder;

      // Then by featured status (featured first)
      if (a.featured !== b.featured) return b.featured ? 1 : -1;

      // Finally by title
      return a.title.localeCompare(b.title);
    });

  } catch (error) {
    console.error('❌ Critical error loading compositions:', error);
    return getSampleCompositions();
  }
};

async function processFileWithErrorHandling(
  path: string,
  loader: () => Promise<any>,
  expectedType: string,
  compositions: Composition[]
): Promise<void> {
  console.log(`📄 Processing ${expectedType} file:`, path);
  try {
    const data = await loader();

    // Handle raw import
    let parsedData;
    if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    } else {
      parsedData = data;
    }

    const composition = processCompositionData(parsedData, expectedType, path);
    if (composition) {
      composition.id = compositions.length + 1;
      compositions.push(composition);
      console.log('✅ Added composition:', composition.title);
    }
  } catch (error) {
    console.error(`❌ Error processing ${expectedType} file:`, path, error);

    // Create fallback composition
    const fallbackComposition = createFallbackComposition(path, expectedType, compositions.length + 1);
    compositions.push(fallbackComposition);
    console.log('🔄 Added fallback composition for:', path);
  }
}

async function processTimelineFileWithErrorHandling(
  path: string,
  loader: () => Promise<any>,
  compositions: Composition[]
): Promise<void> {
  console.log('📅 Processing timeline file:', path);
  try {
    const data = await loader();

    // Handle raw import
    let parsedData;
    if (typeof data === 'string') {
      parsedData = JSON.parse(data);
    } else {
      parsedData = data;
    }

    // Timeline files have a different structure - they contain events, not sections
    const timelineComposition = processTimelineData(parsedData, path);
    if (timelineComposition) {
      timelineComposition.id = compositions.length + 1;
      compositions.push(timelineComposition);
      console.log('✅ Added timeline composition:', timelineComposition.title);
    }
  } catch (error) {
    console.error('❌ Error processing timeline file:', path, error);
    console.log('🔄 Creating minimal timeline structure');

    // Create a minimal timeline composition
    const fallbackTimeline = createFallbackTimelineComposition(path, compositions.length + 1);
    compositions.push(fallbackTimeline);
    console.log('🔄 Added fallback timeline composition for:', path);
  }
}

function processTimelineData(data: any, filePath: string): Composition | null {
  console.log('📅 Processing timeline data:', { filePath, data });

  if (!data || typeof data !== 'object') {
    console.warn('⚠️ Invalid timeline data:', filePath);
    return null;
  }

  const title = data.title || 'Timeline';
  const description = data.description || '';
  const events = Array.isArray(data.events) ? data.events : [];

  // Convert timeline events into a single section
  const timelineSection = {
    title: title,
    featured: true,
    content_level_1: '',
    content_level_3: generateTimelineMarkdown(title, description, events),
    content_level_5: '',
    images: extractTimelineImages(events)
  };

  const composition: Composition = {
    id: 0, // Will be set later
    title,
    collection_type: 'timeline' as const,
    section: 1,
    section_title: title,
    featured: true,
    content_level_1: '',
    content_level_3: timelineSection.content_level_3,
    content_level_5: '',
    sections: [timelineSection]
  };

  console.log('✅ Processed timeline composition:', {
    title: composition.title,
    eventsCount: events.length,
    imagesCount: timelineSection.images?.length || 0
  });

  return composition;
}

function generateTimelineMarkdown(title: string, description: string, events: any[]): string {
  let markdown = `# ${title}\n\n`;

  if (description) {
    markdown += `${description}\n\n`;
  }

  markdown += `## Timeline Events\n\n`;
  markdown += `This timeline contains ${events.length} events.\n\n`;

  if (events.length > 0) {
    markdown += `### Recent Events\n\n`;

    // Show first few events as examples
    const recentEvents = events.slice(0, 5);
    recentEvents.forEach(event => {
      if (event.date && event.title) {
        markdown += `- **${event.date}**: ${event.title}\n`;
        if (event.description) {
          markdown += `  ${event.description}\n`;
        }
        markdown += `\n`;
      }
    });

    if (events.length > 5) {
      markdown += `*...and ${events.length - 5} more events*\n\n`;
    }
  }

  markdown += `*Navigate to the Timeline page to view the interactive timeline.*`;

  return markdown;
}

function extractTimelineImages(events: any[]): ImageData[] {
  const images: ImageData[] = [];

  events.forEach((event, eventIndex) => {
    if (event.images && Array.isArray(event.images)) {
      event.images.forEach((img: any, imgIndex: number) => {
        const imageData = processImageData(img, `timeline-event-${eventIndex}-img-${imgIndex}`);
        if (imageData) {
          images.push(imageData);
        }
      });
    }
  });

  return images;
}

function createFallbackComposition(filePath: string, expectedType: string, id: number): Composition {
  const filename = filePath.split('/').pop()?.replace('.json', '') || 'untitled';
  const title = `${filename} (Error Loading)`;

  return {
    id,
    title,
    collection_type: expectedType as 'manuscript' | 'data' | 'constitutional' | 'copyright' | 'timeline' | 'map',
    section: 1,
    section_title: title,
    featured: false,
    content_level_1: '',
    content_level_3: `# ${title}\n\nThere was an error loading this content file. Please check the JSON syntax in: \`${filePath}\`\n\nYou can edit this content through the admin panel to fix any issues.`,
    content_level_5: '',
    sections: [{
      title: title,
      featured: false,
      content_level_1: '',
      content_level_3: `# ${title}\n\nError loading content from ${filePath}. Please check the file syntax.`,
      content_level_5: '',
      images: []
    }]
  };
}

function createFallbackTimelineComposition(filePath: string, id: number): Composition {
  const filename = filePath.split('/').pop()?.replace('.json', '') || 'timeline';
  const title = `${filename} (Error Loading)`;

  return {
    id,
    title,
    collection_type: 'timeline' as const,
    section: 1,
    section_title: title,
    featured: false,
    content_level_1: '',
    content_level_3: `# ${title}\n\nThere was an error loading this timeline file. Please check the JSON syntax in: \`${filePath}\`\n\nYou can edit this timeline through the admin panel to fix any issues.`,
    content_level_5: '',
    sections: [{
      title: title,
      featured: false,
      content_level_1: '',
      content_level_3: `# ${title}\n\nError loading timeline from ${filePath}. Please check the file syntax.`,
      content_level_5: '',
      images: []
    }]
  };
}

function processCompositionData(data: any, expectedType: string, filePath: string): Composition | null {
  console.log('🔍 Processing:', { filePath, expectedType, data });

  if (!data || typeof data !== 'object') {
    console.warn('⚠️ Invalid data:', filePath);
    return null;
  }

  // Extract title
  let title = data.title || data.name || 'Untitled';
  console.log('📌 Title:', title);

  // Extract collection type
  let collection_type = data.collection_type || expectedType;
  console.log('📂 Collection type:', collection_type);

  // Extract sections
  let sections: any[] = [];

  if (Array.isArray(data.sections) && data.sections.length > 0) {
    sections = data.sections;
    console.log('📄 Found sections:', sections.length);
  } else if (data.content || data.body) {
    // Single section from content
    sections = [{
      title: title,
      featured: false,
      content_level_1: '',
      content_level_3: data.content || data.body,
      content_level_5: '',
      images: []
    }];
    console.log('📄 Created single section from content');
  } else {
    // Create placeholder section
    sections = [{
      title: title,
      featured: false,
      content_level_1: '',
      content_level_3: `# ${title}\n\nThis content was created in the admin panel. Please edit it to add more sections and images.`,
      content_level_5: '',
      images: []
    }];
    console.log('📄 Created placeholder section');
  }

  // Process images with comprehensive debugging and validation
  sections = sections.map((section, sectionIndex) => {
    console.log(`🔧 Processing section ${sectionIndex + 1}:`, section.title);

    // Process images if they exist
    let processedImages: ImageData[] = [];

    if (section.images && Array.isArray(section.images)) {
      console.log(`📸 Section ${sectionIndex + 1} raw images:`, section.images);

      processedImages = section.images.map((img: any, imgIndex: number) => {
        return processImageData(img, `${filePath}-section-${sectionIndex}-img-${imgIndex}`);
      }).filter((img): img is ImageData => img !== null);

      console.log(`📸 Section ${sectionIndex + 1} processed ${processedImages.length} valid images from ${section.images.length} total`);
    } else if (section.images) {
      console.log(`📸 Section ${sectionIndex + 1} has invalid images array:`, typeof section.images, section.images);
    } else {
      console.log(`📸 Section ${sectionIndex + 1} has no images`);
    }

    return {
      title: section.title || `Section ${sectionIndex + 1}`,
      featured: Boolean(section.featured),
      content_level_1: section.content_level_1 || '',
      content_level_3: section.content_level_3 || section.content || '',
      content_level_5: section.content_level_5 || '',
      pdf_file: section.pdf_file || undefined,      // ← ADD THIS
      description: section.description || undefined, // ← ADD THIS
      images: processedImages
    };
  });

  const composition: Composition = {
    id: 0, // Will be set later
    title,
    collection_type: collection_type as 'manuscript' | 'data' | 'constitutional' | 'copyright' | 'timeline' | 'map',
    section: 1,
    section_title: sections[0]?.title || title,
    featured: sections[0]?.featured || false,
    content_level_1: sections[0]?.content_level_1 || '',
    content_level_3: sections[0]?.content_level_3 || '',
    content_level_5: sections[0]?.content_level_5 || '',
    sections: sections
  };

  const totalImages = composition.sections.reduce((total, section) => total + (section.images?.length || 0), 0);
  console.log('✅ Processed composition:', {
    title: composition.title,
    sectionsCount: composition.sections.length,
    totalImages: totalImages
  });

  return composition;
}

function processImageData(img: any, debugId: string): ImageData | null {
  console.log(`🖼️ Processing image ${debugId}:`, img);

  // Enhanced image source resolution
  let imageSrc = '';

  if (typeof img === 'string') {
    imageSrc = img;
  } else if (img && typeof img === 'object') {
    // Handle various NetlifyCMS output formats
    let srcCandidate = img.src || img.image || img.url || img.path || img.file || '';

    // CRITICAL FIX: Handle array format from NetlifyCMS
    if (Array.isArray(srcCandidate)) {
      console.log(`📁 Source is array, extracting first item:`, srcCandidate);
      srcCandidate = srcCandidate.length > 0 ? srcCandidate[0] : '';
    }

    // Handle object in src field (NetlifyCMS file object)
    if (typeof srcCandidate === 'object' && srcCandidate !== null) {
      console.log(`📁 Source is object, extracting path:`, srcCandidate);
      srcCandidate = srcCandidate.path || srcCandidate.src || srcCandidate.url || srcCandidate.file || '';
    }

    imageSrc = srcCandidate;

    // Special handling for NetlifyCMS file objects
    if (!imageSrc && img.name && img.size) {
      // This looks like a File object from NetlifyCMS
      imageSrc = img.name;
      console.log(`📁 Detected NetlifyCMS file object:`, img);
    }
  }

  // Validate and clean the image source
  if (!imageSrc || typeof imageSrc !== 'string') {
    console.warn(`⚠️ Invalid image src for ${debugId}:`, {
      originalImg: img,
      extractedSrc: imageSrc,
      srcType: typeof imageSrc
    });
    return null;
  }

  // Clean and normalize the path
  imageSrc = imageSrc.trim();

  // Enhanced image data processing
  const imageData: ImageData = {
    src: imageSrc,
    alt: extractStringValue(img?.alt || img?.alt_text || img?.title || 'Image'),
    caption: extractStringValue(img?.caption || img?.description || ''),
    position: validatePosition(img?.position || 'middle')
  };

  console.log(`✅ Processed image ${debugId}:`, imageData);
  return imageData;
}

// Helper function to extract string values from potentially complex objects
function extractStringValue(value: any): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && value.toString) return value.toString();
  return String(value || '');
}

// Helper function to validate position values
function validatePosition(position: any): 'top' | 'middle' | 'bottom' | 'inline' {
  const validPositions = ['top', 'middle', 'bottom', 'inline'];
  if (validPositions.includes(position)) {
    return position as 'top' | 'middle' | 'bottom' | 'inline';
  }
  console.warn(`⚠️ Invalid position "${position}", defaulting to "middle"`);
  return 'middle';
}

function getSampleCompositions(): Composition[] {
  console.log('📚 Using sample compositions');

  return [
    {
      id: 1,
      title: "Create Content in Admin Panel",
      collection_type: 'manuscript',
      section: 1,
      section_title: "Getting Started",
      featured: true,
      content_level_1: "Use the admin panel to create content.",
      content_level_3: `## Getting Started

No content files were found or they could not be loaded. Use the admin panel at \`/admin\` to create new Research and Evidence content.

### Steps:
1. Go to \`/admin\`
2. Create new content
3. It will appear here automatically

### Troubleshooting JSON Issues
If you're seeing this message, there might be JSON syntax errors in your content files. Check the browser console for detailed error messages and ensure all JSON files have valid syntax.

### Adding Images
You can add images to your sections using the admin panel. Images can be positioned at the top, middle, bottom, or inline with your content.`,
      content_level_5: "",
      sections: [{
        title: "Getting Started",
        featured: true,
        content_level_1: "Use the admin panel to create content.",
        content_level_3: `## Getting Started

Create content in the admin panel to see it here. If there were loading errors, check the browser console for details.`,
        content_level_5: "",
        images: []
      }]
    }
  ];
}