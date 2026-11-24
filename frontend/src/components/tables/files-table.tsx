'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  FileText,
  MoreHorizontal,
  Download,
  Trash2,
  Eye,
  AlertCircle,
  File,
  FileSpreadsheet,
  FileType as FileTypeIcon,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

import { useFiles, useDeleteFile } from '@/hooks/api/useFiles';

interface FilesTableProps {
  chatbotId: string;
}

type FileItem = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  processed?: boolean;
  uploadedAt?: string;
  // add other fields as needed
};

type FilesApiResponse = {
  data: FileItem[];
  // add other fields as needed
};

const normalizeType = (fileType?: string) =>
  fileType?.replace('.', '').toUpperCase() ?? '';

const getFileIcon = (fileType?: string) => {
  switch (normalizeType(fileType)) {
    case 'PDF':
    case 'DOCX':
      return FileText;
    case 'TXT':
      return FileTypeIcon;
    case 'CSV':
    case 'XLSX':
      return FileSpreadsheet;
    default:
      return File;
  }
};

export function FilesTable({ chatbotId }: FilesTableProps) {
  const { data, isLoading, error } = useFiles(chatbotId) as {
    data?: FilesApiResponse;
    isLoading: boolean;
    error: unknown;
  };
  const deleteFileMutation = useDeleteFile();
  const files = data?.data || [];

  const formatFileSize = (sizeInMB?: number) => {
    if (!sizeInMB) return 'Unknown';
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFileMutation.mutateAsync(fileId);
      toast.success('File deleted');
    } catch (err) {
      console.error('Error deleting file:', err);
      toast.error('Failed to delete file');
    }
  };

  const handleDownload = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = `/api/files/download/${file.id}`;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="table-wrap" aria-busy="true" aria-label="Loading files">
        <div className="stack-sm pad-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="row g-3">
              <div className="skeleton doc-icon" />
              <div className="skeleton flex-fill pad-1" />
              <div className="skeleton badge" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="empty-state" role="alert">
        <AlertCircle className="ico-2xl t-danger" />
        <h3 className="empty-state-title">Couldn&apos;t load files</h3>
        <p className="empty-state-text">Refresh the page to try again.</p>
      </div>
    );
  }

  /* ---------- Empty ---------- */
  if (files.length === 0) {
    return (
      <div className="empty-state">
        <FileText className="ico-2xl t-muted" />
        <h3 className="empty-state-title">No files yet</h3>
        <p className="empty-state-text">
          Upload your first document to start building this chatbot&apos;s knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <h3 className="section-title">Uploaded files</h3>
        <p className="field-hint space-t-1">
          {files.length} {files.length === 1 ? 'file' : 'files'} in your knowledge base
        </p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">File</th>
              <th scope="col">Type</th>
              <th scope="col">Size</th>
              <th scope="col">Status</th>
              <th scope="col">Uploaded</th>
              <th scope="col" className="align-right">
                <span className="sr">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => {
              const Icon = getFileIcon(file.fileType);
              return (
                <tr key={file.id}>
                  <td>
                    <div className="row g-3 min-zero">
                      <span className="doc-icon">
                        <Icon className="ico-lg" />
                      </span>
                      <p className="t-medium ellipsis flex-fill">{file.fileName}</p>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-outline">
                      {normalizeType(file.fileType) || 'FILE'}
                    </span>
                  </td>

                  <td className="t-muted ellipsis">
                    {formatFileSize(file.fileSize)}
                  </td>

                  <td>
                    {file.processed ? (
                      <span className="badge badge-success">Processed</span>
                    ) : (
                      <span className="badge badge-warning">
                        <span className="status-dot is-busy pulse" />
                        Processing
                      </span>
                    )}
                  </td>

                  <td className="t-muted ellipsis">
                    {file.uploadedAt
                      ? formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })
                      : '-'}
                  </td>

                  <td className="align-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="btn btn-ghost btn-icon btn-sm"
                          aria-label={`Actions for ${file.fileName}`}
                        >
                          <MoreHorizontal />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem disabled>
                          <Eye className="ico space-r-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="ico space-r-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="t-danger"
                          onClick={() => handleDeleteFile(file.id)}
                          disabled={deleteFileMutation.isPending}
                        >
                          {deleteFileMutation.isPending ? (
                            <Loader2 className="ico space-r-2 spin" />
                          ) : (
                            <Trash2 className="ico space-r-2" />
                          )}
                          {deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
