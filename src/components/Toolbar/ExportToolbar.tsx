import { useState } from 'react';
import { Download } from 'lucide-react';
import { ExportModal } from '@/components/Export/ExportModal';

export function ExportToolbar() {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowExportModal(true)}
        className="h-8 px-3 flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 rounded text-sm transition-colors"
        title="Export image or video"
      >
        <Download className="w-4 h-4" />
        <span>Export</span>
      </button>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </>
  );
}
