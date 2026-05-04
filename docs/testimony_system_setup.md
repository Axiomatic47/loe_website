# Automated Testimony System Setup Guide

## Directory Structure Setup

### 1. Create the Testimony Directory
In your `loe-site` project root, create:

```
loe-site/
├── testimonies/                    # Your testimony source directory
│   ├── 071025_Claude_Unauthorized_Implementation/
│   │   ├── testimony_20250710_1.md
│   │   ├── testimony_20250710_1.sig.txt
│   │   ├── public_key.pem
│   │   ├── verify_testimony_20250710_1.js
│   │   └── exhibits/
│   │       ├── Screenshot 2025-07-10 at 12.58.00 AM.png
│   │       └── Screenshot 2025-07-10 at 12.58.30 AM.png
│   ├── 071225_Claude_Recursive_Framework_Recognition/
│   │   ├── testimony_20250712_1.md
│   │   ├── testimony_20250712_1.sig
│   │   ├── public_key.pem
│   │   ├── verify_testimony_20250712_1.js
│   │   └── exhibits/
│   │       ├── Screenshot 2025-07-12 at 1.34.20 PM.png
│   │       └── [more screenshots...]
│   └── [250+ more testimony directories...]
├── src/
│   ├── data/
│   │   └── testimonies/           # Auto-generated testimony data
│   │       ├── index.ts
│   │       └── testimonies.json
│   └── components/
│       └── TestimonySystem.tsx
├── public/
│   └── testimonies/               # Auto-copied exhibit images
│       ├── 071025_Claude_Unauthorized_Implementation/
│       └── [auto-generated directories...]
└── scripts/
    └── processTestimonies.ts
```

### 2. Copy Your Testimonies
```bash
# Copy your existing testimony directories to the project
cp -r "/Users/everest/Web Dev/Content Directory Structure/"* ./testimonies/
```

## Required Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "tsx": "^4.0.0"
  },
  "scripts": {
    "process-testimonies": "tsx scripts/processTestimonies.ts",
    "build": "npm run process-testimonies && vite build",
    "dev": "npm run process-testimonies && vite dev"
  }
}
```

Install dependencies:
```bash
npm install gray-matter
npm install --save-dev @types/node tsx
```

## File Setup

### 1. Create the Processing Script
Save the testimony processor as `scripts/processTestimonies.ts`

### 2. Create the Display Components
Save the testimony components as `src/components/TestimonySystem.tsx`

### 3. Create TypeScript Definitions
Create `src/types/testimony.ts`:

```typescript
export interface TestimonyExhibit {
  filename: string;
  path: string;
  caption?: string;
}

export interface TestimonyData {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
  signature: string | null;
  publicKey: string | null;
  verificationScript: string | null;
  exhibits: TestimonyExhibit[];
  metadata: {
    frontMatter: any;
    wordCount: number;
    estimatedReadTime: number;
  };
}

export interface TestimonyIndex {
  total: number;
  categories: Record<string, number>;
  chronological: TestimonyData[];
  featured: TestimonyData[];
}
```

## Integration with Your Site

### 1. Add to Your Main App
In your main routing file (e.g., `src/App.tsx`):

```typescript
import { TestimonyList } from '@/components/TestimonySystem';

// Add route for testimonies page
<Route path="/testimonies" element={<TestimonyList />} />
<Route path="/testimonies/featured" element={<TestimonyList featured />} />
<Route path="/testimonies/category/:category" element={<TestimonyList />} />
```

### 2. Add Navigation Links
In your header/navigation:

```typescript
<Link to="/testimonies" onClick={() => trackEvent('Navigation', { destination: 'testimonies' })}>
  Testimonies ({testimonyIndex.total})
</Link>
```

### 3. Add to Homepage (Featured Testimonies)
```typescript
import { TestimonyList } from '@/components/TestimonySystem';

// In your homepage component
<section className="py-12">
  <TestimonyList featured limit={6} />
</section>
```

## Build Process Integration

### 1. Update Netlify Build Command
In `netlify.toml`:

```toml
[build]
  publish = "dist"
  command = "npm run build"  # This now includes testimony processing
```

### 2. Git Integration
Add to `.gitignore`:

```
# Auto-generated testimony data
src/data/testimonies/index.ts
src/data/testimonies/testimonies.json
public/testimonies/
```

But track the source testimonies:
```
# Keep testimony sources
!testimonies/
```

## Running the System

### 1. Process Testimonies Manually
```bash
npm run process-testimonies
```

### 2. Development with Auto-Processing
```bash
npm run dev  # Processes testimonies then starts dev server
```

### 3. Production Build
```bash
npm run build  # Processes testimonies then builds for production
```

## Verification System Setup

### 1. Real Cryptographic Verification
To enable real signature verification, install additional dependencies:

```bash
npm install node-forge crypto
npm install --save-dev @types/node-forge
```

### 2. Enhanced Verification Script
Create `src/utils/cryptoVerification.ts`:

```typescript
import forge from 'node-forge';

export async function verifyTestimonySignature(
  content: string,
  signature: string,
  publicKeyPem: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
    const md = forge.md.sha256.create();
    md.update(content, 'utf8');
    
    const signatureBytes = forge.util.decode64(signature);
    const verified = publicKey.verify(md.digest().bytes(), signatureBytes);
    
    return { valid: verified };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
```

## Admin Panel Integration

### 1. Add to Netlify CMS Config
Update `public/admin/config.yml`:

```yaml
collections:
  - name: "testimonies"
    label: "Testimonies"
    folder: "testimonies"
    create: true
    slug: "{{year}}{{month}}{{day}}_{{title}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Date", name: "date", widget: "datetime" }
      - { label: "Category", name: "category", widget: "string" }
      - { label: "Featured", name: "featured", widget: "boolean", default: false }
      - { label: "Content", name: "body", widget: "markdown" }
      - { label: "Signature", name: "signature", widget: "text", required: false }
      - { label: "Public Key", name: "publicKey", widget: "text", required: false }
      - label: "Exhibits"
        name: "exhibits"
        widget: "list"
        fields:
          - { label: "Image", name: "image", widget: "image" }
          - { label: "Caption", name: "caption", widget: "string", required: false }
```

## Analytics Integration

The system automatically tracks:
- `Testimony Section Viewed` - When someone views the testimony list
- `Testimony Category Filter` - When filtering by category
- `Testimony Viewed` - When opening a specific testimony
- `Testimony Exhibit Viewed` - When viewing screenshots/exhibits
- `Testimony Verification Attempted` - When trying to verify signatures
- `Testimony Verification Success/Failed` - Verification results

## Performance Optimization

### 1. Image Optimization
The system automatically:
- Copies images to public directory
- Maintains original quality for verification
- Supports lazy loading

### 2. Large Dataset Handling
For 250+ testimonies:
- Pagination is built-in (12 per page)
- Category filtering reduces load
- Featured testimonies for homepage

### 3. Build Time Optimization
- Only processes changed testimonies (based on file timestamps)
- Generates index files for fast runtime access
- Separates large data into chunked JSON files if needed

## Deployment Checklist

- [ ] Copy testimony directories to `/testimonies/`
- [ ] Install dependencies
- [ ] Run `npm run process-testimonies` to test
- [ ] Verify generated files in `src/data/testimonies/`
- [ ] Check copied images in `public/testimonies/`
- [ ] Update navigation to include testimony links
- [ ] Test testimony display components
- [ ] Deploy to Netlify (auto-processes during build)
- [ ] Verify testimony pages work in production

## Maintenance

### Adding New Testimonies
1. Add new directory to `/testimonies/` with proper structure
2. Run `npm run process-testimonies` or deploy (auto-processes)
3. New testimony appears automatically

### Updating Existing Testimonies
1. Modify files in `/testimonies/[directory]/`
2. Re-run processing script
3. Changes reflected automatically

### Batch Operations
The processor handles all 250+ testimonies automatically and generates comprehensive indexes for easy browsing and categorization.

This system gives you a fully automated, scalable testimony management system that integrates seamlessly with your existing site architecture!