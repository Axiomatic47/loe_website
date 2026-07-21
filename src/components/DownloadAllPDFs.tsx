// src/components/DownloadAllPDFs.tsx
import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useToast } from '@/components/ui/use-toast';

interface Section {
  title: string;
  pdf_file?: string;
}

interface DownloadAllPDFsProps {
  sections: Section[];
  compositionTitle: string;
}

export default function DownloadAllPDFs({ sections }: DownloadAllPDFsProps) {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  // Filter sections that have PDFs
  const pdfSections = sections.filter(section => section.pdf_file);

  const downloadAllPDFs = async () => {
    if (pdfSections.length === 0) {
      toast({
        title: "No PDFs Found",
        description: "This composition doesn't contain any PDF documents.",
        variant: "destructive"
      });
      return;
    }

    setDownloading(true);
    setProgress(0);

    try {
      const zip = new JSZip();
      const pdfFolder = zip.folder("Kirchner-v-Johnson-Case-Documents");

      // Download all PDFs and add to ZIP
      for (let i = 0; i < pdfSections.length; i++) {
        const section = pdfSections[i];
        const pdfUrl = section.pdf_file;

        if (!pdfUrl) continue;

        try {
          // Fetch the PDF
          const response = await fetch(pdfUrl);
          if (!response.ok) throw new Error(`Failed to fetch ${pdfUrl}`);

          const blob = await response.blob();

          // Extract filename from URL or use section title
          const filename = pdfUrl.split('/').pop() || `document-${i + 1}.pdf`;

          // Add to ZIP
          pdfFolder?.file(filename, blob);

          // Update progress
          setProgress(Math.round(((i + 1) / pdfSections.length) * 100));
        } catch (error) {
          console.error(`Failed to download ${section.title}:`, error);
          toast({
            title: "Download Warning",
            description: `Failed to include: ${section.title}`,
            variant: "destructive"
          });
        }
      }

      // Generate ZIP file
      toast({
        title: "Generating ZIP file...",
        description: "Please wait while we package the documents."
      });

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: "DEFLATE",
        compressionOptions: { level: 6 }
      });

      // Save the ZIP file
      saveAs(zipBlob, 'Kirchner-v-Johnson-Case-Documents.zip');

      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${pdfSections.length} documents as ZIP file.`
      });
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast({
        title: "Download Failed",
        description: "An error occurred while creating the download package.",
        variant: "destructive"
      });
    } finally {
      setDownloading(false);
      setProgress(0);
    }
  };

  return (
    <Button
      onClick={downloadAllPDFs}
      disabled={downloading || pdfSections.length === 0}
      className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
      size="lg"
    >
      {downloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading... {progress}%
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download All PDFs ({pdfSections.length} files)
        </>
      )}
    </Button>
  );
}