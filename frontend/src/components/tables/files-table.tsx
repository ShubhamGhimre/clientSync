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
import {
  EmptyState,
  IconTile,
  SkeletonRows,
  StatusPill,
  TableScroll,
  TableShell,
  TableToolbar,
  menuContentClass,
  rowActionClass,
  rowClass,
  tdClass,
  thClass,
} from './table-kits';

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
};

type FilesApiResponse = {
  data: FileItem[];
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

const formatFileSize = (sizeInMB?: number) => {
  if (!sizeInMB) return 'Unknown size';
  if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(0)} KB`;
  return `${sizeInMB.toFixed(1)} MB`;
};

export function FilesTable({ chatbotId }: FilesTableProps) {
  const { data, isLoading, error } = useFiles(chatbotId) as {
    data?: FilesApiResponse;
    isLoading: boolean;
    error: unknown;
  };
  const deleteFileMutation = useDeleteFile();
  const files = data?.data || [];

  // Only the row being deleted shows the spinner
  const deletingId = deleteFileMutation.isPending
    ? (deleteFileMutation.variables as string | undefined)
    : undefined;

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

  if (error) {
    return (
      <TableShell>
        <EmptyState
          tone="danger"
          icon={<AlertCircle className="size-5 shrink-0" />}
          title="Couldn't load files"
          description="Refresh the page to try again."
        />
      </TableShell>
    );
  }

  if (!isLoading && files.length === 0) {
    return (
      <TableShell>
        <EmptyState
          icon={<FileText className="size-5 shrink-0" />}
          title="No files yet"
          description="Upload your first document to start building this chatbot's knowledge base."
        />
      </TableShell>
    );
  }

  return (
    <TableShell>
      <TableToolbar>
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Uploaded files
          </h3>
          <p className="tabular mt-0.5 text-xs text-muted-foreground">
            {isLoading
              ? 'Loading...'
              : `${files.length} ${files.length === 1 ? 'file' : 'files'} in your knowledge base`}
          </p>
        </div>
      </TableToolbar>

      <TableScroll>
        <table
          className="w-full border-collapse text-left text-sm"
          aria-busy={isLoading}
        >
          <thead>
            <tr className="border-b border-border/60">
              <th scope="col" className={thClass}>
                File
              </th>
              <th scope="col" className={thClass}>
                Status
              </th>
              <th scope="col" className={thClass}>
                Uploaded
              </th>
              <th scope="col" className={thClass}>
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows columns={4} rows={4} />
            ) : (
              files.map((file) => {
                const Icon = getFileIcon(file.fileType);
                const isDeleting = deletingId === file.id;
                return (
                  <tr key={file.id} className={rowClass}>
                    <td className={tdClass}>
                      <div className="flex min-w-0 items-center gap-3">
                        <IconTile>
                          <Icon className="size-4 shrink-0" />
                        </IconTile>
                        <div className="min-w-0 max-w-[22rem]">
                          <p className="truncate text-sm font-medium text-foreground">
                            {file.fileName}
                          </p>
                          <p className="tabular mt-0.5 text-xs text-muted-foreground">
                            {normalizeType(file.fileType) || 'FILE'} ·{' '}
                            {formatFileSize(file.fileSize)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className={tdClass}>
                      {file.processed ? (
                        <StatusPill tone="primary">Processed</StatusPill>
                      ) : (
                        <StatusPill tone="warning" pulse>
                          Processing
                        </StatusPill>
                      )}
                    </td>

                    <td
                      className={`${tdClass} whitespace-nowrap text-sm text-muted-foreground`}
                    >
                      {file.uploadedAt
                        ? formatDistanceToNow(new Date(file.uploadedAt), {
                            addSuffix: true,
                          })
                        : '-'}
                    </td>

                    <td className={`${tdClass} text-right`}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className={rowActionClass}
                            aria-label={`Actions for ${file.fileName}`}
                          >
                            {isDeleting ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="size-4" />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className={`w-40 ${menuContentClass}`}
                        >
                          <DropdownMenuItem disabled>
                            <Eye className="mr-2 size-4 shrink-0" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="mr-2 size-4 shrink-0" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteFile(file.id)}
                            disabled={deleteFileMutation.isPending}
                          >
                            <Trash2 className="mr-2 size-4 shrink-0" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </TableScroll>
    </TableShell>
  );
}