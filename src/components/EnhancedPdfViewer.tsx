import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import {
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase/client'; // --- 1. Import Supabase client ---

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface EnhancedPdfViewerProps {
  storagePath: string; // --- 2. Change prop from pdfUrl to storagePath ---
  title: string;
  onClose: () => void;
}

const EnhancedPdfViewer: React.FC<EnhancedPdfViewerProps> = ({
  storagePath,
  title,
  onClose,
}) => {
  // --- 3. Add state for loading, error, and file blob ---
  const [file, setFile] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  // --- 4. Add useEffect to download the file blob ---
  useEffect(() => {
    if (!storagePath) {
      setError('No file path provided.');
      setIsLoading(false);
      return;
    }

    const downloadPdf = async () => {
      setIsLoading(true);
      setError(null);
      setFile(null);

      try {
        const { data, error } = await supabase.storage
          .from('employee_documents')
          .download(storagePath);

        if (error) {
          throw error;
        }

        if (data) {
          setFile(data);
        } else {
          throw new Error('No data returned from storage.');
        }
      } catch (err: any) {
        console.error('Error downloading PDF:', err);
        if (err.message.includes('Object not found')) {
          setError('File not found. It may have been deleted.');
        } else {
          setError(`Failed to load document: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    downloadPdf();
  }, [storagePath]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setPageNumber(1); // Reset to first page on new doc load
  }

  const goToPrevPage = () =>
    setPageNumber((prev) => (prev > 1 ? prev - 1 : prev));
  const goToNextPage = () =>
    setPageNumber((prev) => (numPages && prev < numPages ? prev + 1 : prev));

  const zoomIn = () => setScale((prev) => prev + 0.1);
  const zoomOut = () => setScale((prev) => (prev > 0.5 ? prev - 0.1 : prev));

  // --- 5. Add download handler for the blob ---
  const handleDownload = () => {
    if (file) {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = title.endsWith('.pdf') ? title : `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const renderContent = () => {
    // --- 6. Update render logic for new state ---
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white">
          <Loader2 className="w-12 h-12 animate-spin" />
          <p className="mt-4 text-lg">Loading document...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-white bg-red-500/20 p-8 rounded-lg">
          <AlertCircle className="w-16 h-16 text-red-300" />
          <p className="mt-4 text-xl font-semibold">Error</p>
          <p className="mt-2 text-center text-red-200">{error}</p>
        </div>
      );
    }

    if (file) {
      return (
        <div className="flex-1 overflow-auto p-4 md:p-8 w-full flex justify-center">
          <div className="relative" style={{ transform: `scale(${scale})` }}>
            <Document
              file={file} // --- 7. Pass the file blob to the Document component ---
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={(err) => {
                console.error('React-PDF load error:', err);
                setError(`Failed to render PDF: ${err.message}`);
              }}
              loading={
                <div className="flex items-center justify-center h-96 text-white">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          </div>
        </div>
      );
    }

    return null; // Should be covered by loading/error states
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-gray-900/90 backdrop-blur-sm"
      >
        {/* Header Bar */}
        <header className="flex-shrink-0 flex items-center justify-between w-full h-16 px-4 bg-gray-900/50 border-b border-gray-700">
          <div className="flex items-center min-w-0">
            <h2 className="text-lg font-semibold text-white truncate">
              {title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Page Controls */}
            {numPages && (
              <>
                <button
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                  className="p-2 text-white rounded-full hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-white">
                  {pageNumber} / {numPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  className="p-2 text-white rounded-full hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Zoom Controls */}
            <button
              onClick={zoomOut}
              disabled={scale <= 0.5}
              className="p-2 text-white rounded-full hover:bg-gray-700 disabled:opacity-50"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={zoomIn}
              className="p-2 text-white rounded-full hover:bg-gray-700"
            >
              <ZoomIn size={20} />
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={!file || isLoading}
              className="p-2 text-white rounded-full hover:bg-gray-700 disabled:opacity-50"
            >
              <Download size={20} />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-white rounded-full hover:bg-gray-700"
            >
              <X size={24} />
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 w-full h-full overflow-hidden flex justify-center items-center">
          {renderContent()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EnhancedPdfViewer;