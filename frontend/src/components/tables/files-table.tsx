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
        <div className="flex flex-col gap-2 p-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton doc-icon" />
              <div className="skeleton min-w-0 flex-1 p-1" />
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
        <AlertCircle className="size-8 shrink-0 text-destructive" />
        <h3 className="text-base font-semibold">Couldn&apos;t load files</h3>
        <p className="max-w-sm text-sm text-muted-foreground">Refresh the page to try again.</p>
      </div>
    );
  }

  /* ---------- Empty ---------- */
  if (files.length === 0) {
    return (
      <div className="empty-state">
        <FileText className="size-8 shrink-0 text-muted-foreground" />
        <h3 className="text-base font-semibold">No files yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Upload your first document to start building this chatbot&apos;s knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <h3 className="text-lg font-semibold">Uploaded files</h3>
        <p className="field-hint mt-1">
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
              <th scope="col" className="text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => {
              const Icon = getFileIcon(file.fileType);
              return (
                <tr key={file.id}>
                  <td>
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="doc-icon">
                        <Icon className="size-5 shrink-0" />
                      </span>
                      <p className="font-medium overflow-hidden text-ellipsis whitespace-nowrap min-w-0 flex-1">{file.fileName}</p>
                    </div>
                  </td>

                  <td>
                    <span className="badge badge-outline">
                      {normalizeType(file.fileType) || 'FILE'}
                    </span>
                  </td>

                  <td className="text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                    {formatFileSize(file.fileSize)}
                  </td>

                  <td>
                    {file.processed ? (
                      <span className="badge badge-success">Processed</span>
                    ) : (
                      <span className="badge badge-warning">
                        <span className="status-dot is-busy animate-pulse" />
                        Processing
                      </span>
                    )}
                  </td>

                  <td className="text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                    {file.uploadedAt
                      ? formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })
                      : '-'}
                  </td>

                  <td className="text-right">
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
                          <Eye className="size-4 shrink-0 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(file)}>
                          <Download className="size-4 shrink-0 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteFile(file.id)}
                          disabled={deleteFileMutation.isPending}
                        >
                          {deleteFileMutation.isPending ? (
                            <Loader2 className="size-4 shrink-0 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="size-4 shrink-0 mr-2" />
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
