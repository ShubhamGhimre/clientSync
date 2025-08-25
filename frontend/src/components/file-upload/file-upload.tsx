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
  Loader2,
  CloudUpload,
  Plus
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
  'application/pdf': { icon: FileText, label: 'PDF', color: 'bg-red-50 text-red-600 border-red-200' },
  'text/plain': { icon: FileType, label: 'TXT', color: 'bg-slate-50 text-slate-600 border-slate-200' },
  'text/csv': { icon: FileSpreadsheet, label: 'CSV', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { 
    icon: FileText, 
    label: 'DOCX', 
    color: 'bg-blue-50 text-blue-600 border-blue-200' 
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { 
    icon: FileSpreadsheet, 
    label: 'XLSX', 
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200' 
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
    return typeInfo ? typeInfo.color : 'bg-slate-50 text-slate-600 border-slate-200';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <Card className="border-0 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <div
            {...getRootProps()}
            className={`relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-blue-400 bg-blue-50/50 scale-[1.02]'
                : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
            }`}
          >
            <input {...getInputProps()} />
            
            {/* Upload Icon */}
            <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              isDragActive ? 'bg-blue-100 scale-110' : 'bg-slate-100'
            }`}>
              <CloudUpload className={`h-8 w-8 transition-colors duration-300 ${
                isDragActive ? 'text-blue-600' : 'text-slate-600'
              }`} />
            </div>

            {/* Upload Text */}
            <div className="space-y-3">
              <div className="space-y-1">
                <p className={`text-xl font-semibold transition-colors duration-300 ${
                  isDragActive ? 'text-blue-900' : 'text-slate-900'
                }`}>
                  {isDragActive ? 'Drop your files here' : 'Upload training files'}
                </p>
                <p className="text-slate-600">
                  Drag and drop files here, or{' '}
                  <span className="text-blue-600 font-medium">click to browse</span>
                </p>
              </div>

              {/* Supported File Types */}
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {Object.entries(allowedTypes).map(([type, info]) => (
                  <Badge key={type} variant="outline" className={`${info.color} font-medium`}>
                    <info.icon className="w-3 h-3 mr-1.5" />
                    {info.label}
                  </Badge>
                ))}
              </div>

              {/* File Limits */}
              <div className="flex items-center justify-center gap-6 text-xs text-slate-500 pt-2">
                <span>Max size: {maxSize / (1024 * 1024)}MB</span>
                <span>•</span>
                <span>Max files: {maxFiles}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Upload className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Uploading Files ({uploadingFiles.length})</h3>
            </div>
            
            <div className="space-y-4">
              {uploadingFiles.map((uploadingFile) => {
                const Icon = getFileIcon(uploadingFile.file.type);
                
                return (
                  <div key={uploadingFile.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                      <Icon className="h-5 w-5 text-slate-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-slate-900 truncate pr-4">
                          {uploadingFile.file.name}
                        </p>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <Badge variant="outline" className={getFileColor(uploadingFile.file.type)}>
                            {getFileLabel(uploadingFile.file.type)}
                          </Badge>
                          <span className="text-sm text-slate-500">
                            {formatFileSize(uploadingFile.file.size)}
                          </span>
                        </div>
                      </div>
                      
                      {uploadingFile.status === 'uploading' && (
                        <div className="space-y-2">
                          <Progress value={uploadingFile.progress} className="h-2" />
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-600">
                              Uploading... {uploadingFile.progress}%
                            </p>
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          </div>
                        </div>
                      )}
                      
                      {uploadingFile.status === 'completed' && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          <p className="text-sm text-emerald-600 font-medium">Upload completed</p>
                        </div>
                      )}
                      
                      {uploadingFile.status === 'error' && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <p className="text-sm text-red-600">{uploadingFile.error || 'Upload failed'}</p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadingFile(uploadingFile.id)}
                      className="h-8 w-8 p-0 hover:bg-slate-200 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Files */}
      {completedFiles.length > 0 && (
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Successfully Uploaded ({completedFiles.length})</h3>
            </div>
            
            <div className="grid gap-3">
              {completedFiles.map((file) => {
                const Icon = getFileIcon(file.fileType);
                
                return (
                  <div key={file.id} className="flex items-center gap-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/60">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-emerald-200">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-emerald-900 truncate pr-4">
                          {file.fileName}
                        </p>
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300 flex-shrink-0">
                          {getFileLabel(file.fileType)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-emerald-700">
                        <span>{formatFileSize(file.fileSize)}</span>
                        <span>•</span>
                        <span>Uploaded {new Date(file.uploadedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCompletedFile(file.id)}
                      className="h-8 w-8 p-0 hover:bg-emerald-100 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
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