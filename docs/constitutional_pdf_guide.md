# Constitutional Challenges - PDF Upload & Display Setup Guide

This guide will help you convert the Constitutional Challenges section to support PDF uploads and viewing while maintaining sidebar navigation.

## 📋 Overview

The Constitutional Challenges section will now:
- ✅ Support PDF file uploads through the CMS
- ✅ Display PDFs in a full-featured viewer with zoom, download, and new tab options
- ✅ Maintain sidebar navigation to switch between different PDF documents
- ✅ Optionally show markdown summaries below the PDF
- ✅ Fall back to regular markdown if no PDF is uploaded

---

## 🚀 Installation Steps

### Step 1: Update CMS Configuration

**File:** `public/admin/config.yml`

Find the `constitutional` collection (around line 160) and replace it with the configuration from artifact `constitutional_pdf_config`.

**Key Changes:**
- Added `pdf_file` field with file widget
- Made dates optional with `required: false`
- Added `description` field for document descriptions
- Made markdown content optional (PDF is now primary)

---

### Step 2: Create PDF Viewer Component

**File:** `src/components/PDFViewer.tsx` (new file)

Copy the entire content from artifact `pdf_viewer_component`.

**Features:**
- Full-screen PDF iframe viewer
- Zoom controls (50% - 200%)
- Download button
- Open in new tab option
- Loading and error states
- Responsive design

---

### Step 3: Update TypeScript Types

**File:** `src/utils/compositionData.ts`

Add the new fields to the `Section` interface as shown in artifact `constitutional_types_update`.

This adds:
- `pdf_file?: string` - URL to the PDF document
- `description?: string` - Brief description of the document

---

### Step 4: Update SectionPage Component

**File:** `src/pages/SectionPage.tsx`

Make these changes:

#### 4a. Add Import (top of file, around line 20)
```typescript
import PDFViewer from '@/components/PDFViewer';
```

#### 4b. Add PDF Detection Logic (after getting currentSection, around line 100)
```typescript
// Check if this is a constitutional section with a PDF
const isConstitutionalPDF = compositionId === 'constitutional' && currentSection?.pdf_file;
```

#### 4c. Replace Main Content Rendering (around line 450)

Find this section:
```typescript
{/* Main Content WITHOUT images in markdown */}
<div className="relative mb-8">
```

Replace the entire content block with the code from artifact `constitutional_section_logic`.

---

### Step 5: Create Upload Directory

Create the directory structure for PDF uploads:

```bash
mkdir -p public/uploads/constitutional/pdfs
```

---

### Step 6: Test the Setup

1. **Start Development Server:**
   ```bash
   npm run dev:all
   ```

2. **Go to CMS Admin:**
   - Navigate to `http://localhost:3000/admin`
   - Select "Constitutional Challenges"

3. **Create or Edit Entry:**
   - Add a new section
   - Click "PDF Document" field
   - Upload a PDF file
   - Add title and optional description
   - Save

4. **View on Site:**
   - Navigate to Evidence page
   - Click on the constitutional challenge
   - PDF should display with full controls

---

## 🎨 How It Works

### Sidebar Navigation
The sidebar will show all sections as usual. When you click on a section:
- **If PDF exists:** Shows PDF viewer
- **If no PDF:** Shows regular markdown content

### Content Display Priority
1. **PDF Document** (if uploaded) - primary content
2. **Summary** (content_level_1) - optional, shows below PDF
3. **Full Analysis** (content_level_3) - optional, for non-PDF sections
4. **Technical Notes** (content_level_5) - optional

### PDF Viewer Controls
- **Zoom:** 50% to 200% in 25% increments
- **Download:** Downloads PDF with sanitized filename
- **New Tab:** Opens PDF in browser's native viewer
- **Pan:** Click and drag within iframe
- **Scroll:** Navigate through pages

---

## 📝 Usage in CMS

### Uploading PDFs

1. In CMS admin, go to Constitutional Challenges
2. Create or edit a composition
3. Add or edit a section
4. Click the "PDF Document" field
5. Upload your PDF file (will be saved to `/uploads/constitutional/pdfs/`)
6. Add Section Title
7. Optionally add description (shows below title in viewer)
8. Optionally add Summary (content_level_1) for additional context
9. Save

### Best Practices

**File Naming:**
- Use descriptive names: `first-amendment-challenge-2025.pdf`
- Avoid spaces: use hyphens or underscores
- Keep names under 50 characters

**File Size:**
- Recommended: Under 10MB for good performance
- Maximum: 50MB (adjust in Netlify settings if needed)

**Descriptions:**
- Brief: 1-2 sentences
- Include: Case name, court, date filed
- Example: "Constitutional challenge filed in District Court on October 1, 2025"

---

## 🔧 Customization Options

### Adjust PDF Viewer Height

In `PDFViewer.tsx`, find:
```typescript
style={{ height: 'calc(100vh - 300px)', minHeight: '600px' }}
```

Change values to adjust:
- `300px` - space for header/footer
- `600px` - minimum height

### Change Zoom Range

In `PDFViewer.tsx`, modify:
```typescript
const handleZoomIn = () => {
  setZoom(prev => Math.min(prev + 25, 200)); // Max 200%
};

const handleZoomOut = () => {
  setZoom(prev => Math.max(prev - 25, 50)); // Min 50%
};
```

### Add Page Navigation

The browser's native PDF viewer (in new tab) provides page navigation. For iframe, you can add URL parameters:
```typescript
src={`${pdfUrl}#page=2&zoom=150`}
```

---

## 🐛 Troubleshooting

### PDF Not Displaying

**Check:**
1. File path is correct in JSON: `/uploads/constitutional/pdfs/filename.pdf`
2. File exists in `public/uploads/constitutional/pdfs/`
3. Browser console for CORS errors
4. PDF file is not corrupted (test download)

**Solutions:**
- Clear browser cache
- Try opening in new tab
- Re-upload PDF through CMS
- Check file permissions

### Zoom Not Working

Some browsers handle iframe zoom differently. The zoom parameter may not work in all cases. Use "Open in New Tab" for full browser PDF viewer with better zoom support.

### Mobile Display Issues

PDFs in iframes can be problematic on mobile. Consider:
- Adding mobile-specific styling
- Forcing download on mobile devices
- Using a dedicated PDF.js library for better mobile support

---

## 📦 Optional Enhancements

### Add PDF.js for Better Control

Install react-pdf:
```bash
npm install react-pdf pdfjs-dist
```

This gives you:
- Page-by-page rendering
- Custom navigation controls
- Better mobile support
- Text selection and search

### Add Loading Progress

Track PDF load progress:
```typescript
const [loadProgress, setLoadProgress] = useState(0);
```

### Add Annotations

Allow users to highlight and comment on PDFs using PDF.js annotations.

---

## ✅ Verification Checklist

- [ ] CMS config updated with PDF upload field
- [ ] PDFViewer component created
- [ ] TypeScript types updated
- [ ] SectionPage logic updated with PDF detection
- [ ] Upload directory created
- [ ] Test PDF upload in CMS
- [ ] Test PDF display on site
- [ ] Test sidebar navigation between PDFs
- [ ] Test zoom controls
- [ ] Test download functionality
- [ ] Test "Open in New Tab"
- [ ] Test on mobile devices
- [ ] Test with large PDF files
- [ ] Deploy to production

---

## 🎯 Expected Behavior

### When Viewing Constitutional Section:

1. **Sidebar shows all sections** with titles
2. **Click section** → Main area updates
3. **If PDF uploaded** → Shows PDF viewer with controls
4. **If no PDF** → Shows regular markdown content
5. **Optional summary** appears below PDF if provided
6. **All PDF controls functional** (zoom, download, new tab)
7. **Images and additional content** still available in gallery below

### CMS Admin Experience:

1. **PDF upload widget** appears in section editor
2. **Upload new PDF** or select existing
3. **Preview not available** in CMS (view on site)
4. **File path auto-populated** in JSON
5. **Markdown content optional** when PDF present

---

## 🚀 Deployment Notes

### Netlify Settings

Ensure these settings in `netlify.toml`:
```toml
[[redirects]]
  from = "/uploads/*"
  to = "/uploads/:splat"
  status = 200
  force = true
```

### Build Command

No changes needed. PDFs are static files in public directory.

### Environment Variables

None required for PDF functionality.

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Verify file paths in JSON files
3. Test PDF file locally (open directly)
4. Check Netlify deploy logs
5. Review CMS configuration

---

Your Constitutional Challenges section is now ready for PDF uploads! 🎉
