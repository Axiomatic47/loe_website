// src/utils/compositionLoader.ts - Loads JSON content collections into the Zustand store.
import { Composition, ImageData } from './compositionData';

const DEV = import.meta.env.DEV;

export const loadCompositions = async (): Promise<Composition[]> => {
  try {
    const manuscriptFiles = import.meta.glob('/content/manuscript/*.json', {
      eager: false,
      import: 'default',
      query: '?raw',
    });
    const dataFiles = import.meta.glob('/content/data/*.json', {
      eager: false,
      import: 'default',
      query: '?raw',
    });
    const constitutionalFiles = import.meta.glob('/content/constitutional/*.json', {
      eager: false,
      import: 'default',
      query: '?raw',
    });
    const mapFiles = import.meta.glob('/content/map/*.json', {
      eager: false,
      import: 'default',
      query: '?raw',
    });
    const copyrightFiles = import.meta.glob('/content/copyright/*.json', {
      eager: false,
      import: 'default',
      query: '?raw',
    });
    const timelineFiles = import.meta.glob('/content/timeline/*.json', {
      eager: false,
      import: 'default',
      query: '?raw',
    });

    const compositions: Composition[] = [];

    // Bounded concurrency: fully-parallel loads can swamp Vite's dev server
    // and cause some imports to time out, surfacing as "Error Loading" fallbacks.
    const CONCURRENCY = 8;
    const allTasks: Array<() => Promise<void>> = [
      ...Object.entries(manuscriptFiles).map(([p, l]) =>
        () => processFileWithErrorHandling(p, l, 'manuscript', compositions),
      ),
      ...Object.entries(dataFiles).map(([p, l]) =>
        () => processFileWithErrorHandling(p, l, 'data', compositions),
      ),
      ...Object.entries(constitutionalFiles).map(([p, l]) =>
        () => processFileWithErrorHandling(p, l, 'constitutional', compositions),
      ),
      ...Object.entries(mapFiles).map(([p, l]) =>
        () => processFileWithErrorHandling(p, l, 'map', compositions),
      ),
      ...Object.entries(copyrightFiles).map(([p, l]) =>
        () => processFileWithErrorHandling(p, l, 'copyright', compositions),
      ),
      ...Object.entries(timelineFiles).map(([p, l]) =>
        () => processTimelineFileWithErrorHandling(p, l, compositions),
      ),
    ];

    for (let i = 0; i < allTasks.length; i += CONCURRENCY) {
      const chunk = allTasks.slice(i, i + CONCURRENCY);
      await Promise.all(chunk.map(fn => fn()));
    }

    if (compositions.length === 0) {
      return getSampleCompositions();
    }

    return compositions.sort((a, b) => {
      const typeOrder = { manuscript: 0, data: 1, constitutional: 2, copyright: 3, timeline: 4, map: 5 };
      const aOrder = typeOrder[a.collection_type] ?? 999;
      const bOrder = typeOrder[b.collection_type] ?? 999;
      if (aOrder !== bOrder) return aOrder - bOrder;
      if (a.featured !== b.featured) return b.featured ? 1 : -1;
      return a.title.localeCompare(b.title);
    });
  } catch (error) {
    console.error('Critical error loading compositions:', error);
    return getSampleCompositions();
  }
};

async function processFileWithErrorHandling(
  path: string,
  loader: () => Promise<any>,
  expectedType: string,
  compositions: Composition[],
): Promise<void> {
  try {
    const data = await loader();
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    const composition = processCompositionData(parsedData, expectedType, path);
    if (composition) {
      composition.id = compositions.length + 1;
      compositions.push(composition);
    }
  } catch (error) {
    if (DEV) console.error(`Error processing ${expectedType} file:`, path, error);
    const fallbackComposition = createFallbackComposition(path, expectedType, compositions.length + 1);
    compositions.push(fallbackComposition);
  }
}

async function processTimelineFileWithErrorHandling(
  path: string,
  loader: () => Promise<any>,
  compositions: Composition[],
): Promise<void> {
  try {
    const data = await loader();
    const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
    const timelineComposition = processTimelineData(parsedData, path);
    if (timelineComposition) {
      timelineComposition.id = compositions.length + 1;
      compositions.push(timelineComposition);
    }
  } catch (error) {
    if (DEV) console.error('Error processing timeline file:', path, error);
    const fallbackTimeline = createFallbackTimelineComposition(path, compositions.length + 1);
    compositions.push(fallbackTimeline);
  }
}

function processTimelineData(data: any, _filePath: string): Composition | null {
  if (!data || typeof data !== 'object') return null;

  const title = data.title || 'Timeline';
  const description = data.description || '';
  const events = Array.isArray(data.events) ? data.events : [];

  const timelineSection = {
    title,
    featured: true,
    content_level_1: '',
    content_level_3: generateTimelineMarkdown(title, description, events),
    content_level_5: '',
    images: extractTimelineImages(events),
  };

  return {
    id: 0,
    title,
    collection_type: 'timeline' as const,
    section: 1,
    section_title: title,
    featured: true,
    content_level_1: '',
    content_level_3: timelineSection.content_level_3,
    content_level_5: '',
    sections: [timelineSection],
  };
}

function generateTimelineMarkdown(title: string, description: string, events: any[]): string {
  let markdown = `# ${title}\n\n`;
  if (description) markdown += `${description}\n\n`;
  markdown += `## Timeline Events\n\nThis timeline contains ${events.length} events.\n\n`;

  if (events.length > 0) {
    markdown += `### Recent Events\n\n`;
    const recentEvents = events.slice(0, 5);
    recentEvents.forEach(event => {
      if (event.date && event.title) {
        markdown += `- **${event.date}**: ${event.title}\n`;
        if (event.description) markdown += `  ${event.description}\n`;
        markdown += `\n`;
      }
    });
    if (events.length > 5) markdown += `*...and ${events.length - 5} more events*\n\n`;
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
        if (imageData) images.push(imageData);
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
    sections: [
      {
        title,
        featured: false,
        content_level_1: '',
        content_level_3: `# ${title}\n\nError loading content from ${filePath}. Please check the file syntax.`,
        content_level_5: '',
        images: [],
      },
    ],
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
    sections: [
      {
        title,
        featured: false,
        content_level_1: '',
        content_level_3: `# ${title}\n\nError loading timeline from ${filePath}. Please check the file syntax.`,
        content_level_5: '',
        images: [],
      },
    ],
  };
}

function processCompositionData(data: any, expectedType: string, filePath: string): Composition | null {
  if (!data || typeof data !== 'object') return null;

  const title = data.title || data.name || 'Untitled';
  const collection_type = data.collection_type || expectedType;

  let sections: any[] = [];

  if (Array.isArray(data.sections) && data.sections.length > 0) {
    sections = data.sections;
  } else if (data.content || data.body) {
    sections = [
      {
        title,
        featured: false,
        content_level_1: '',
        content_level_3: data.content || data.body,
        content_level_5: '',
        images: [],
      },
    ];
  } else {
    sections = [
      {
        title,
        featured: false,
        content_level_1: '',
        content_level_3: `# ${title}\n\nThis content was created in the admin panel. Please edit it to add more sections and images.`,
        content_level_5: '',
        images: [],
      },
    ];
  }

  sections = sections.map((section, sectionIndex) => {
    let processedImages: ImageData[] = [];
    if (section.images && Array.isArray(section.images)) {
      processedImages = section.images
        .map((img: any, imgIndex: number) =>
          processImageData(img, `${filePath}-section-${sectionIndex}-img-${imgIndex}`),
        )
        .filter((img: ImageData | null): img is ImageData => img !== null);
    }

    return {
      title: section.title || `Section ${sectionIndex + 1}`,
      featured: Boolean(section.featured),
      featured_order: typeof section.featured_order === 'number' ? section.featured_order : undefined,
      content_level_1: section.content_level_1 || '',
      content_level_3: section.content_level_3 || section.content || '',
      content_level_5: section.content_level_5 || '',
      pdf_file: section.pdf_file || undefined,
      description: section.description || undefined,
      images: processedImages,
      case_group: section.case_group || undefined,
      date: section.date || undefined,
    };
  });

  return {
    id: 0,
    title,
    collection_type: collection_type as 'manuscript' | 'data' | 'constitutional' | 'copyright' | 'timeline' | 'map',
    section: 1,
    section_title: sections[0]?.title || title,
    featured: sections[0]?.featured || false,
    content_level_1: sections[0]?.content_level_1 || '',
    content_level_3: sections[0]?.content_level_3 || '',
    content_level_5: sections[0]?.content_level_5 || '',
    sections,
    hidden_case_groups: Array.isArray(data.hidden_case_groups) ? data.hidden_case_groups : undefined,
  };
}

function processImageData(img: any, _debugId: string): ImageData | null {
  let imageSrc = '';

  if (typeof img === 'string') {
    imageSrc = img;
  } else if (img && typeof img === 'object') {
    let srcCandidate = img.src || img.image || img.url || img.path || img.file || '';
    if (Array.isArray(srcCandidate)) {
      srcCandidate = srcCandidate.length > 0 ? srcCandidate[0] : '';
    }
    if (typeof srcCandidate === 'object' && srcCandidate !== null) {
      srcCandidate = srcCandidate.path || srcCandidate.src || srcCandidate.url || srcCandidate.file || '';
    }
    imageSrc = srcCandidate;
    if (!imageSrc && img.name && img.size) {
      imageSrc = img.name;
    }
  }

  if (!imageSrc || typeof imageSrc !== 'string') return null;
  imageSrc = imageSrc.trim();

  return {
    src: imageSrc,
    alt: extractStringValue(img?.alt || img?.alt_text || img?.title || 'Image'),
    caption: extractStringValue(img?.caption || img?.description || ''),
    position: validatePosition(img?.position || 'middle'),
  };
}

function extractStringValue(value: any): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && value.toString) return value.toString();
  return String(value || '');
}

function validatePosition(position: any): 'top' | 'middle' | 'bottom' | 'inline' {
  const validPositions = ['top', 'middle', 'bottom', 'inline'];
  if (validPositions.includes(position)) {
    return position as 'top' | 'middle' | 'bottom' | 'inline';
  }
  return 'middle';
}

function getSampleCompositions(): Composition[] {
  return [
    {
      id: 1,
      title: 'Create Content in Admin Panel',
      collection_type: 'manuscript',
      section: 1,
      section_title: 'Getting Started',
      featured: true,
      content_level_1: 'Use the admin panel to create content.',
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
      content_level_5: '',
      sections: [
        {
          title: 'Getting Started',
          featured: true,
          content_level_1: 'Use the admin panel to create content.',
          content_level_3: `## Getting Started

Create content in the admin panel to see it here. If there were loading errors, check the browser console for details.`,
          content_level_5: '',
          images: [],
        },
      ],
    },
  ];
}
