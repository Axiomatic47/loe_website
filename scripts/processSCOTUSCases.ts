// scripts/processSCOTUSCases.ts - Index and copy SCOTUS Shadow Docket case PDFs and analysis documents
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface CaseFile {
  name: string;
  displayName: string;
  path: string;
  size: number;
}

interface CaseData {
  id: string;
  date: string;
  year: number;
  docketNumber: string;
  caseName: string;
  shortDescription: string;
  files: CaseFile[];
}

interface DecadeGroup {
  decade: string;
  startYear: number;
  endYear: number;
  cases: CaseData[];
}

interface AnalysisFile {
  id: string;
  name: string;
  displayName: string;
  path: string;
  size: number;
  category: string;
}

interface AnalysisCategory {
  name: string;
  files: AnalysisFile[];
}

interface SCOTUSIndex {
  generatedAt: string;
  totalCases: number;
  totalFiles: number;
  decades: DecadeGroup[];
}

interface AnalysisIndex {
  generatedAt: string;
  totalFiles: number;
  categories: AnalysisCategory[];
}

class SCOTUSCaseProcessor {
  private sourceDir: string;
  private outputDir: string;
  private indexFile: string;

  constructor() {
    // Source directory for case files
    this.sourceDir = '/Users/everest/Git/work_station/5_SCOTUS Shadow Docket Academics/case law/cases';
    // Output directory in public folder
    this.outputDir = path.join(__dirname, '../public/scotus-cases');
    // Index file location
    this.indexFile = path.join(__dirname, '../public/scotus-cases/index.json');
  }

  private ensureDirectoryExists(dir: string): void {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private formatFileDisplayName(filename: string): string {
    // Remove extension and clean up the name
    const nameWithoutExt = filename.replace('.pdf', '');

    // Common file name mappings
    const mappings: Record<string, string> = {
      'Opinion': 'Opinion',
      'Main_Document': 'Main Document',
      'Reply': 'Reply Brief',
      'Proof_of_Service': 'Proof of Service',
      'Lower_Court_Orders_Opinions': 'Lower Court Orders & Opinions',
      'Other': 'Other Documents',
      'Appendix': 'Appendix',
    };

    // Check for known mappings
    for (const [key, display] of Object.entries(mappings)) {
      if (nameWithoutExt === key || nameWithoutExt.endsWith(key)) {
        return display;
      }
    }

    // Check for application files (e.g., "2025-09_25A264_Trump_v_Slaughter_app")
    if (nameWithoutExt.endsWith('_app')) {
      return 'Application';
    }

    // Default: clean up underscores and return
    return nameWithoutExt.replace(/_/g, ' ');
  }

  private parseCaseDirectory(dirName: string): Omit<CaseData, 'files'> | null {
    // Parse directory names like: 2025-09_25A264_Trump_v_Slaughter
    // Format: YYYY-MM_DocketNum_Case_Name_Description
    const match = dirName.match(/^(\d{4})-(\d{2})_([^_]+)_(.+)$/);

    if (!match) {
      console.warn(`  ⚠️ Could not parse directory name: ${dirName}`);
      return null;
    }

    const [, year, month, docketNumber, caseNamePart] = match;

    // Parse the case name and description from the remaining part
    // e.g., "Trump_v_Slaughter" or "Bush_v_Gore_Election_2000"
    const nameParts = caseNamePart.split('_');

    // Find the 'v' to split case name from description
    const vIndex = nameParts.findIndex(p => p.toLowerCase() === 'v');

    let caseName: string;
    let shortDescription: string = '';

    if (vIndex !== -1 && vIndex < nameParts.length - 1) {
      // Find where the description starts (after the defendant name)
      // Look for known description patterns
      const descKeywords = ['Election', 'Travel', 'Ban', 'Vaccine', 'Mandate', 'Immigration',
        'Redistricting', 'COVID', 'Abortion', 'Religious', 'Voting', 'Border', 'Wall',
        'Subpoenas', 'Tax', 'Returns', 'Steel', 'Seizure', 'Execution', 'Stay',
        'Pentagon', 'Papers', 'Ballot', 'Access', 'Gag', 'Order', 'Reporter', 'Privilege',
        'Draft', 'Registration', 'Title', 'Asylum', 'Transgender', 'Military', 'Birthright',
        'Citizenship', 'Alien', 'Enemies', 'Layoffs', 'Federal', 'Reserve', 'Passport',
        'National', 'Guard', 'Hush', 'Money', 'Nuclear', 'Plant', 'Contraceptive'];

      let descStartIndex = -1;
      for (let i = vIndex + 2; i < nameParts.length; i++) {
        if (descKeywords.some(kw => nameParts[i].includes(kw))) {
          descStartIndex = i;
          break;
        }
      }

      if (descStartIndex !== -1) {
        caseName = nameParts.slice(0, descStartIndex).join(' ').replace(/_/g, ' ');
        shortDescription = nameParts.slice(descStartIndex).join(' ').replace(/_/g, ' ');
      } else {
        caseName = caseNamePart.replace(/_/g, ' ');
      }
    } else {
      caseName = caseNamePart.replace(/_/g, ' ');
    }

    return {
      id: dirName,
      date: `${year}-${month}`,
      year: parseInt(year, 10),
      docketNumber,
      caseName: caseName.trim(),
      shortDescription: shortDescription.trim(),
    };
  }

  async processCases(): Promise<void> {
    console.log('📚 Processing SCOTUS Shadow Docket cases...\n');

    // Ensure output directory exists
    this.ensureDirectoryExists(this.outputDir);

    // Get all case directories
    const entries = fs.readdirSync(this.sourceDir, { withFileTypes: true });
    const caseDirs = entries
      .filter(e => e.isDirectory() && !e.name.startsWith('.'))
      .map(e => e.name)
      .sort();

    console.log(`Found ${caseDirs.length} case directories\n`);

    const allCases: CaseData[] = [];
    let totalFiles = 0;

    for (const caseDir of caseDirs) {
      const caseInfo = this.parseCaseDirectory(caseDir);
      if (!caseInfo) continue;

      const casePath = path.join(this.sourceDir, caseDir);
      const caseOutputDir = path.join(this.outputDir, caseDir);

      // Ensure case output directory exists
      this.ensureDirectoryExists(caseOutputDir);

      // Get PDF files in this case directory
      const files = fs.readdirSync(casePath)
        .filter(f => f.toLowerCase().endsWith('.pdf'))
        .sort();

      const caseFiles: CaseFile[] = [];

      for (const file of files) {
        const sourcePath = path.join(casePath, file);
        const destPath = path.join(caseOutputDir, file);
        const stats = fs.statSync(sourcePath);

        // Copy the file
        fs.copyFileSync(sourcePath, destPath);

        caseFiles.push({
          name: file,
          displayName: this.formatFileDisplayName(file),
          path: `/scotus-cases/${caseDir}/${file}`,
          size: stats.size,
        });

        totalFiles++;
      }

      if (caseFiles.length > 0) {
        allCases.push({
          ...caseInfo,
          files: caseFiles,
        });
        console.log(`  ✅ ${caseInfo.caseName} (${caseFiles.length} files)`);
      }
    }

    // Group cases by decade
    const decades: DecadeGroup[] = [];
    const decadeMap = new Map<string, CaseData[]>();

    for (const caseData of allCases) {
      const decadeStart = Math.floor(caseData.year / 10) * 10;
      const decadeKey = `${decadeStart}s`;

      if (!decadeMap.has(decadeKey)) {
        decadeMap.set(decadeKey, []);
      }
      decadeMap.get(decadeKey)!.push(caseData);
    }

    // Sort decades and cases within each decade
    const sortedDecades = Array.from(decadeMap.entries())
      .sort((a, b) => parseInt(b[0]) - parseInt(a[0])); // Newest first

    for (const [decadeKey, cases] of sortedDecades) {
      const decadeStart = parseInt(decadeKey);
      decades.push({
        decade: decadeKey,
        startYear: decadeStart,
        endYear: decadeStart + 9,
        cases: cases.sort((a, b) => {
          // Sort by date descending within each decade
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return a.caseName.localeCompare(b.caseName);
        }),
      });
    }

    // Create index
    const index: SCOTUSIndex = {
      generatedAt: new Date().toISOString(),
      totalCases: allCases.length,
      totalFiles,
      decades,
    };

    // Write index file
    fs.writeFileSync(this.indexFile, JSON.stringify(index, null, 2));

    console.log('\n📊 Case Law Summary:');
    console.log(`   Total cases: ${allCases.length}`);
    console.log(`   Total PDF files: ${totalFiles}`);
    console.log(`   Decades covered: ${decades.map(d => d.decade).join(', ')}`);
    console.log(`\n✅ Index written to: ${this.indexFile}`);
    console.log(`✅ Files copied to: ${this.outputDir}`);
  }

  async processAnalysis(): Promise<void> {
    console.log('\n📝 Processing Analysis Documents...\n');

    const analysisSourceDir = '/Users/everest/Git/work_station/5_SCOTUS Shadow Docket Academics';
    const analysisOutputDir = path.join(__dirname, '../public/scotus-cases/analysis');
    const analysisIndexFile = path.join(__dirname, '../public/scotus-cases/analysis-index.json');

    this.ensureDirectoryExists(analysisOutputDir);

    // Define analysis files to include with their categories
    const analysisFiles: { source: string; displayName: string; category: string }[] = [
      {
        source: 'DRAFT_CENTENNIAL_BETRAYAL.pdf',
        displayName: 'Centennial Betrayal (Draft)',
        category: 'Research Papers'
      },
      {
        source: 'EXHIBIT N-1-B SCOTUS Emergency Docket Research and Statistical Analysis.pdf',
        displayName: 'SCOTUS Emergency Docket Statistical Analysis',
        category: 'Exhibits'
      },
    ];

    // Also scan for PDFs in subdirectories
    const subDirs = ['Legal Memos and Exhibits', 'Notes and Arguments'];
    for (const subDir of subDirs) {
      const subDirPath = path.join(analysisSourceDir, subDir);
      if (fs.existsSync(subDirPath)) {
        const files = fs.readdirSync(subDirPath).filter(f => f.toLowerCase().endsWith('.pdf'));
        for (const file of files) {
          analysisFiles.push({
            source: path.join(subDir, file),
            displayName: file.replace('.pdf', '').replace(/_/g, ' '),
            category: subDir
          });
        }
      }
    }

    const categories = new Map<string, AnalysisFile[]>();
    let totalFiles = 0;

    for (const fileInfo of analysisFiles) {
      const sourcePath = path.join(analysisSourceDir, fileInfo.source);

      if (!fs.existsSync(sourcePath)) {
        console.warn(`  ⚠️ File not found: ${fileInfo.source}`);
        continue;
      }

      const stats = fs.statSync(sourcePath);
      const fileName = path.basename(fileInfo.source);
      const destPath = path.join(analysisOutputDir, fileName);

      // Copy the file
      fs.copyFileSync(sourcePath, destPath);

      const analysisFile: AnalysisFile = {
        id: fileName.replace(/[^a-zA-Z0-9]/g, '_'),
        name: fileName,
        displayName: fileInfo.displayName,
        path: `/scotus-cases/analysis/${fileName}`,
        size: stats.size,
        category: fileInfo.category
      };

      if (!categories.has(fileInfo.category)) {
        categories.set(fileInfo.category, []);
      }
      categories.get(fileInfo.category)!.push(analysisFile);
      totalFiles++;

      console.log(`  ✅ ${fileInfo.displayName}`);
    }

    // Build categories array
    const categoriesArray: AnalysisCategory[] = Array.from(categories.entries())
      .map(([name, files]) => ({ name, files }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Create analysis index
    const analysisIndex: AnalysisIndex = {
      generatedAt: new Date().toISOString(),
      totalFiles,
      categories: categoriesArray
    };

    // Write analysis index file
    fs.writeFileSync(analysisIndexFile, JSON.stringify(analysisIndex, null, 2));

    console.log('\n📊 Analysis Summary:');
    console.log(`   Total analysis files: ${totalFiles}`);
    console.log(`   Categories: ${categoriesArray.map(c => c.name).join(', ')}`);
    console.log(`\n✅ Analysis index written to: ${analysisIndexFile}`);
  }
}

// Run the processor
const processor = new SCOTUSCaseProcessor();
(async () => {
  await processor.processCases();
  await processor.processAnalysis();
})().catch(console.error);
