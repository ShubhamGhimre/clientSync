'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, MoreHorizontal, Download, Trash2, Eye, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { useFiles, useDeleteFile } from '@/hooks/api/useFiles';

interface FilesTableProps {
  chatbotId: string;
}

export function FilesTable({ chatbotId }: FilesTableProps) {
  type FileType = {
    id: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
    processed?: boolean;
    uploadedAt?: string;
    // add other fields as needed
  };

  type FilesApiResponse = {
    data: FileType[];
    // add other fields as needed
  };

  const { data, isLoading, error } = useFiles(chatbotId) as { data?: FilesApiResponse; isLoading: boolean; error: unknown };
  const deleteFileMutation = useDeleteFile();
  const files = data?.data || [];

  const formatFileSize = (sizeInMB?: number) => {
    if (!sizeInMB) return 'Unknown';
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const getFileIcon = (fileType: string) => {
    const type = fileType?.replace('.', '').toUpperCase();
    switch (type) {
      case 'PDF': return <FileText className="h-5 w-5 text-red-500" />;
      case 'DOCX': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'TXT': return <FileText className="h-5 w-5 text-gray-500" />;
      case 'CSV': return <FileText className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      await deleteFileMutation.mutateAsync(fileId);
    } catch (error) {
      // Optionally show toast
      // eslint-disable-next-line no-console
      console.error('Error deleting file:', error);
    }
  };

  const handleDownload = (file: any) => {
    const link = document.createElement('a');
    link.href = `/api/files/download/${file.id}`;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading files...</div>;
  }
  if (error) {
    return (
      <div className="py-8 text-center text-destructive">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>Error loading files. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Table className="rounded-lg overflow-hidden border">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-1/3">File</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file: any) => (
            <TableRow
              key={file.id}
              className="hover:bg-accent/50 transition group border-b last:border-b-0"
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2 flex items-center justify-center">
                    {getFileIcon(file.fileType)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate max-w-[180px] group-hover:underline">{file.fileName}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="rounded px-2 py-1 text-xs">
                  {file.fileType?.replace('.', '').toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-xs font-mono">{formatFileSize(file.fileSize)}</span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {file.processed ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <Badge variant="default" className="bg-green-100 text-green-700 border-green-200">Processed</Badge>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 text-orange-500" />
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700 border-orange-200">Processing</Badge>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-xs text-muted-foreground">
                  {file.uploadedAt
                    ? formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })
                    : '-'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload(file)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={deleteFileMutation.isPending}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {files.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No files uploaded</h3>
          <p className="text-muted-foreground">Upload your first training file to get started.</p>
        </div>
      )}
    </div>
  );
}