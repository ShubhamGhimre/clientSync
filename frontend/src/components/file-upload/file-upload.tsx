'use client';

import { useState, useCallback } from 'react';
import { useUploadFile } from '@/hooks/api/useFiles';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  FileText,
  FileSpreadsheet,
  FileType,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  chatbotId?: string;
  onUploadComplete?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  id: string;
}

interface UploadedFile {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

const allowedTypes = {
  'application/pdf': { icon: FileText, label: 'PDF', color: 'bg-red-100 text-red-700' },
  'text/plain': { icon: FileType, label: 'TXT', color: 'bg-gray-100 text-gray-700' },
  'text/csv': { icon: FileSpreadsheet, label: 'CSV', color: 'bg-green-100 text-green-700' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    icon: FileText, 
    label: 'DOCX', 
    color: 'bg-blue-100 text-blue-700' 
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    icon: FileSpreadsheet, 
    label: 'XLSX', 
    color: 'bg-green-100 text-green-700' 
  },
};

export function FileUpload({ 
  chatbotId,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  className 
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [completedFiles, setCompletedFiles] = useState<UploadedFile[]>([]);

  const uploadFileMutation = useUploadFile();

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} is not a supported file type`);
          } else {
            toast.error(`Error with ${file.name}: ${error.message}`);
          }
        });
      });
    }

    // Check if adding these files would exceed the limit
    const totalFiles = uploadingFiles.length + completedFiles.length + acceptedFiles.length;
    if (totalFiles > maxFiles) {
      toast.error(`Cannot upload more than ${maxFiles} files`);
      return;
    }

    // Initialize uploading files
    const newUploadingFiles = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
      id: Math.random().toString(36).substr(2, 9),
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);


    // Real file upload using API
    for (const uploadingFile of newUploadingFiles) {
      try {
        // Simulate progress updates (optional, for UI feedback)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev =>
            prev.map(uf =>
              uf.id === uploadingFile.id
                ? { ...uf, progress: Math.min(uf.progress + 10, 90) }
                : uf
            )
          );
        }, 200);

        // Prepare FormData
        const formData = new FormData();
        formData.append('file', uploadingFile.file);
        if (chatbotId) formData.append('chatBotId', chatbotId);

        // Upload via API
        const res = await uploadFileMutation.mutateAsync(formData);

        clearInterval(progressInterval);

        // Mark as completed
        setUploadingFiles(prev =>
          prev.map(uf =>
            uf.id === uploadingFile.id
              ? { ...uf, progress: 100, status: 'completed' }
              : uf
          )
        );

        // Add to completed files
        const completedFile: UploadedFile = {
          id: res?.data?.id || uploadingFile.id,
          fileName: res?.data?.fileName || uploadingFile.file.name,
          fileSize: res?.data?.fileSize || uploadingFile.file.size,
          fileType: res?.data?.fileType || uploadingFile.file.type,
          uploadedAt: res?.data?.uploadedAt || new Date().toISOString(),
        };

        setCompletedFiles(prev => [...prev, completedFile]);
        toast.success(`${uploadingFile.file.name} uploaded successfully`);

        // Remove from uploading after a delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(uf => uf.id !== uploadingFile.id));
        }, 2000);

      } catch (error: any) {
        setUploadingFiles(prev =>
          prev.map(uf =>
            uf.id === uploadingFile.id
              ? {
                  ...uf,
                  status: 'error',
                  error: error.message || 'Upload failed'
                }
              : uf
          )
        );
        toast.error(`Failed to upload ${uploadingFile.file.name}`);
      }
    }

    // Call completion callback
    if (onUploadComplete && completedFiles.length > 0) {
      onUploadComplete(completedFiles);
    }
  }, [chatbotId, maxFiles, maxSize, onUploadComplete, uploadingFiles.length, completedFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: Object.keys(allowedTypes).reduce((acc, key) => {
      acc[key] = [];
      return acc;
    }, {} as Record<string, string[]>),
    multiple: true,
    maxSize,
    maxFiles,
  });

  const removeUploadingFile = (id: string) => {
    setUploadingFiles(prev => prev.filter(uf => uf.id !== id));
  };

  const removeCompletedFile = (id: string) => {
    setCompletedFiles(prev => prev.filter(cf => cf.id !== id));
  };

  const getFileIcon = (fileType: string) => {
    const typeInfo = allowedTypes[fileType as keyof typeof allowedTypes];
    return typeInfo ? typeInfo.icon : FileType;
  };

  const getFileLabel = (fileType: string) => {
    const typeInfo = allowedTypes[fileType as keyof typeof allowedTypes];
    return typeInfo ? typeInfo.label : 'Unknown';
  };

  const getFileColor = (fileType: string) => {
    const typeInfo = allowedTypes[fileType as keyof typeof allowedTypes];
    return typeInfo ? typeInfo.color : 'bg-gray-100 text-gray-700';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? 'Drop files here' : 'Upload training files'}
              </p>
              <p className="text-sm text-muted-foreground">
                Drag and drop files here, or click to browse
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                {Object.entries(allowedTypes).map(([type, info]) => (
                  <Badge key={type} variant="outline" className={info.color}>
                    {info.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum file size: {maxSize / (1024 * 1024)}MB • Maximum files: {maxFiles}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Uploading Files</h3>
            <div className="space-y-3">
              {uploadingFiles.map((uploadingFile) => {
                const Icon = getFileIcon(uploadingFile.file.type);
                
                return (
                  <div key={uploadingFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">
                          {uploadingFile.file.name}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getFileColor(uploadingFile.file.type)}>
                            {getFileLabel(uploadingFile.file.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(uploadingFile.file.size)}
                          </span>
                          {uploadingFile.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {uploadingFile.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          {uploadingFile.status === 'uploading' && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeUploadingFile(uploadingFile.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {uploadingFile.status === 'uploading' && (
                        <div className="space-y-1">
                          <Progress value={uploadingFile.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {uploadingFile.progress}% uploaded
                          </p>
                        </div>
                      )}
                      
                      {uploadingFile.status === 'error' && uploadingFile.error && (
                        <p className="text-xs text-red-500">{uploadingFile.error}</p>
                      )}
                      
                      {uploadingFile.status === 'completed' && (
                        <p className="text-xs text-green-600">Upload completed</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Files */}
      {completedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-4">Successfully Uploaded ({completedFiles.length})</h3>
            <div className="space-y-2">
              {completedFiles.map((file) => {
                const Icon = getFileIcon(file.fileType);
                
                return (
                  <div key={file.id} className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Icon className="h-4 w-4 text-green-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-green-800">
                        {file.fileName}
                      </p>
                      <p className="text-xs text-green-600">
                        {formatFileSize(file.fileSize)} • Uploaded {new Date(file.uploadedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                        {getFileLabel(file.fileType)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCompletedFile(file.id)}
                        className="h-6 w-6 p-0 hover:bg-green-100"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

