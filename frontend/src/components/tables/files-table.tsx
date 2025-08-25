'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { FileText, MoreHorizontal, Download, Trash2, Eye, Clock, CheckCircle, AlertCircle, File, FileSpreadsheet, FileType } from 'lucide-react';
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
      case 'PDF': 
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'DOCX': 
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'TXT': 
        return <FileType className="h-5 w-5 text-slate-500" />;
      case 'CSV': 
        return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
      case 'XLSX': 
        return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
      default: 
        return <File className="h-5 w-5 text-slate-400" />;
    }
  };

  const getFileTypeColor = (fileType: string) => {
    const type = fileType?.replace('.', '').toUpperCase();
    switch (type) {
      case 'PDF': 
        return 'bg-red-50 text-red-600 border-red-200';
      case 'DOCX': 
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'TXT': 
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'CSV': 
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'XLSX': 
        return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      default: 
        return 'bg-slate-50 text-slate-600 border-slate-200';
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
    return (
      <div className="py-12 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-slate-600">Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-6 w-6 text-red-500" />
        </div>
        <p className="text-red-600 font-medium mb-1">Error loading files</p>
        <p className="text-slate-600 text-sm">Please try refreshing the page</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-3">No files uploaded yet</h3>
        <p className="text-slate-600 max-w-md mx-auto">
          Upload your first training document to start building your chatbot's knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Uploaded Files</h3>
          <p className="text-sm text-slate-600">{files.length} files in your knowledge base</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-slate-200/60">
              <TableHead className="font-semibold text-slate-700 py-4">File</TableHead>
              <TableHead className="font-semibold text-slate-700">Type</TableHead>
              <TableHead className="font-semibold text-slate-700">Size</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700">Uploaded</TableHead>
              <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file: any, index) => (
              <TableRow
                key={file.id}
                className={`hover:bg-slate-50/70 transition-colors border-slate-200/40 ${
                  index === files.length - 1 ? 'border-b-0' : ''
                }`}
              >
                <TableCell className="py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 truncate hover:text-blue-600 transition-colors cursor-pointer">
                        {file.fileName}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`${getFileTypeColor(file.fileType)} font-medium`}>
                    {file.fileType?.replace('.', '').toUpperCase()}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-slate-600">
                    {formatFileSize(file.fileSize)}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {file.processed ? (
                      <>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                          Processed
                        </Badge>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium">
                          Processing
                        </Badge>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-slate-500">
                    {file.uploadedAt
                      ? formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })
                      : '-'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 hover:bg-slate-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem className="cursor-pointer">
                        <Eye className="mr-3 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDownload(file)}
                        className="cursor-pointer"
                      >
                        <Download className="mr-3 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50"
                        onClick={() => handleDeleteFile(file.id)}
                        disabled={deleteFileMutation.isPending}
                      >
                        <Trash2 className="mr-3 h-4 w-4" />
                        {deleteFileMutation.isPending ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}