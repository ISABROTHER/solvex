import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
  Maximize2,
  Minimize2,
  Loader2,
} from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface EnhancedPdfViewerProps {
  pdfUrl: string;
  title: string;
  onClose: () => void;
}

const EnhancedPdfViewer: React.FC<EnhancedPdfViewerProps> = ({ pdfUrl, title, onClose }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = title || 'document.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        aria-labelledby="pdf-title"
        role="dialog"
        aria-modal="true"
      >
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`relative bg-gray-900 rounded-lg shadow-2xl flex flex-col ${
            isFullScreen ? 'w-full h-full' : 'w-full max-w-5xl h-[90vh]'
          }`}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-gray-700">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <h3 id="pdf-title" className="text-white font-semibold truncate">
                {title}
              </h3>
              {numPages > 0 && (
                <span className="text-gray-400 text-sm flex-shrink-0">
                  Page {pageNumber} of {numPages}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <button
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-gray-400 text-sm min-w-[60px] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={scale >= 3.0}
                className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={20} />
              </button>

              <div className="w-px h-6 bg-gray-700 mx-1" />

              {/* Download Button */}
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                title="Download PDF"
              >
                <Download size={20} />
              </button>

              {/* Full Screen Toggle */}
              <button
                onClick={toggleFullScreen}
                className="p-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white transition-colors"
                aria-label="Close document viewer"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* PDF Content */}
          <div className="flex-1 overflow-auto bg-gray-800 flex items-center justify-center p-4">
            {loading && (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 text-[#FF5722] animate-spin" />
                <p className="text-gray-400">Loading document...</p>
              </div>
            )}

            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={null}
              error={
                <div className="text-center p-8">
                  <p className="text-red-400 font-semibold mb-2">Failed to load PDF</p>
                  <p className="text-gray-400 text-sm mb-4">
                    The document could not be loaded. Please try downloading it instead.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-[#FF5722] text-white rounded-lg hover:bg-[#E64A19] transition-colors"
                  >
                    Download PDF
                  </button>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="shadow-2xl"
              />
            </Document>
          </div>

          {/* Footer Navigation */}
          {numPages > 1 && (
            <div className="flex-shrink-0 p-4 flex justify-center items-center gap-4 border-t border-gray-700">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={18} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={numPages}
                  value={pageNumber}
                  onChange={(e) => {
                    const page = parseInt(e.target.value, 10);
                    if (page >= 1 && page <= numPages) {
                      setPageNumber(page);
                    }
                  }}
                  className="w-16 px-2 py-1 text-center bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#FF5722]"
                />
                <span className="text-gray-400">/ {numPages}</span>
              </div>

              <button
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnhancedPdfViewer;
