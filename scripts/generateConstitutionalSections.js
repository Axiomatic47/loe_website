// scripts/generateConstitutionalSections.js
// Generates constitutional composition with properly formatted exhibit titles

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_DIR = path.join(__dirname, '../public/uploads/constitutional/pdfs');
const OUTPUT_DIR = path.join(__dirname, '../content/constitutional');
const OUTPUT_FILE = 'kirchner-v-johnson-case-documents.json';

// Acronyms that should stay uppercase
const ACRONYMS = new Set([
  'DOJ', 'FBI', 'AI', 'LOE', 'BDS', 'FEC', 'DHS', 'IP', 'DNS', 'HR', 'US', 'XAI',
  'ACR', 'CV', 'PDF', 'DARVO', 'CSP', 'API', 'URL', 'TOS', 'CEO', 'SEC'
]);

function extractExhibitInfo(filename) {
  // First check for range patterns like "exhibits-a-0-to-a-34"
  const rangeMatch = filename.match(/^\d+(?:-\d+)?_(exhibits?)-([a-z]+-\d+)-to-([a-z]+-\d+)/i);
  if (rangeMatch) {
    const type = rangeMatch[1].charAt(0).toUpperCase() + rangeMatch[1].slice(1).toLowerCase();
    const start = rangeMatch[2].toUpperCase();
    const end = rangeMatch[3].toUpperCase();
    return `${type} ${start} to ${end}`;
  }

  // Match single exhibit/appendix like "exhibit-c-1" or "appendix-i"
  const match = filename.match(/^\d+(?:-\d+)?_(exhibit|appendix)-([a-z]+)-?(\d*)/i);
  if (match) {
    const type = match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
    let id = match[2].toUpperCase();

    // Handle Roman numerals for appendices
    const romanMap = { 'I': 'I', 'II': 'II', 'III': 'III', 'IV': 'IV', 'V': 'V',
                       'VI': 'VI', 'VII': 'VII', 'VIII': 'VIII', 'IX': 'IX', 'X': 'X' };
    if (romanMap[id]) {
      id = romanMap[id];
    }

    // Add number if present (e.g., C-1)
    if (match[3]) {
      id += `-${match[3]}`;
    }

    return `${type} ${id}`;
  }

  return null;
}

function extractTitle(filename) {
  // Remove .pdf extension
  let title = filename.replace('.pdf', '');

  // Remove attachment number prefix (e.g., "05-10_")
  title = title.replace(/^\d+(?:-\d+)?_/, '');

  // Check if this is the main complaint (starts with "kirchner-v-johnson")
  const isMainComplaint = /^kirchner-v-johnson/i.test(title);

  if (isMainComplaint) {
    // Format case name: "kirchner-v-johnson" -> "Kirchner v. Johnson"
    let formatted = title.replace(/kirchner-v-johnson/i, 'Kirchner v. Johnson');

    // Format case number: "1-25-cv-02735-acr" -> "1:25-CV-02735-ACR"
    formatted = formatted.replace(/(\d+)-(\d+)-cv-(\d+)-([a-z]+)/i, (match, p1, p2, p3, p4) => {
      return `${p1}:${p2}-CV-${p3}-${p4.toUpperCase()}`;
    });

    // Don't remove hyphens for main complaint - case number needs them
    return formatted.trim();
  }

  // For exhibits/appendices: Remove exhibit/appendix prefix to get just the description
  title = title.replace(/^exhibits?-[a-z]+-\d+-to-[a-z]+-\d+-/i, '');
  title = title.replace(/^(exhibit|appendix)-[a-z]+(?:-\d+)?-/i, '');

  // Replace remaining hyphens with spaces
  title = title.replace(/-/g, ' ');

  // Split into words
  const words = title.split(/\s+/).filter(word => word.length > 0);

  // Capitalize properly
  const formatted = words.map((word, index) => {
    const upper = word.toUpperCase();

    // Check if it's an acronym
    if (ACRONYMS.has(upper)) {
      return upper;
    }

    // Keep numbers as-is
    if (/^\d+$/.test(word)) {
      return word;
    }

    // Small words (except at start)
    const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'v', 'vs', 'via'];
    const lower = word.toLowerCase();

    if (index > 0 && smallWords.includes(lower)) {
      return lower;
    }

    // Special case for possessives
    if (word.includes("'")) {
      const parts = word.split("'");
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase() + "'" + parts[1].toLowerCase();
    }

    // Proper case
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  return formatted;
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
}

function generateComposition() {
  console.log('📄 Generating Constitutional Composition from PDFs...\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  if (!fs.existsSync(PDF_DIR)) {
    console.error(`❌ PDF directory not found: ${PDF_DIR}`);
    return;
  }

  const files = fs.readdirSync(PDF_DIR)
    .filter(file => file.endsWith('.pdf'))
    .sort(naturalSort);

  console.log(`📂 Found ${files.length} PDF files\n`);

  const sections = files.map((filename, index) => {
    const exhibitInfo = extractExhibitInfo(filename);
    const title = extractTitle(filename);
    const pdfPath = `/uploads/constitutional/pdfs/${filename}`;

    // Extract CMECF identifier (e.g., "05-10_" from "05-10_exhibit-c-1...")
    const cmecfMatch = filename.match(/^(\d+(?:-\d+)?_)/);
    const cmecfId = cmecfMatch ? cmecfMatch[1] : '';

    // Format: "05-10_Exhibit C-1: Title" or "05_Title" for main complaint
    let displayTitle = '';
    if (exhibitInfo) {
      displayTitle = `${cmecfId}${exhibitInfo}: ${title}`;
    } else {
      displayTitle = `${cmecfId}${title}`;
    }

    console.log(`  ${index + 1}. ${displayTitle}`);

    return {
      title: displayTitle,
      date: "",
      featured: index === 0,
      pdf_file: pdfPath,
      description: exhibitInfo || `Document ${index + 1}`,
      images: [],
      content_level_1: "",
      content_level_3: "",
      content_level_5: ""
    };
  });

  const composition = {
    title: "Kirchner v. Johnson - Case Documents",
    collection_type: "constitutional",
    date: new Date().toISOString(),
    featured: true,
    sections: sections
  };

  const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
  fs.writeFileSync(outputPath, JSON.stringify(composition, null, 2));

  console.log(`\n✅ Generated: ${outputPath}`);
  console.log(`📊 Total sections: ${sections.length}`);
}

generateComposition();