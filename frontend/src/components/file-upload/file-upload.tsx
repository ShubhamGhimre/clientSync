'use client';

import { useState, useCallback } from 'react';
import { useUploadFile } from '@/hooks/api/useFiles';
import { useDropzone } from 'react-dropzone';
import {
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  FileSpreadsheet,
  FileType,
  Loader2,
  CloudUpload,
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
  'application/pdf': { icon: FileText, label: 'PDF' },
  'text/plain': { icon: FileType, label: 'TXT' },
  'text/csv': { icon: FileSpreadsheet, label: 'CSV' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    icon: FileText,
    label: 'DOCX',
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    icon: FileSpreadsheet,
    label: 'XLSX',
  },
};

const getFileIcon = (fileType: string) =>
  allowedTypes[fileType as keyof typeof allowedTypes]?.icon ?? FileType;

const getFileLabel = (fileType: string) =>
  allowedTypes[fileType as keyof typeof allowedTypes]?.label ?? 'FILE';

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FileUpload({
  chatbotId,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = '',
}: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [completedFiles, setCompletedFiles] = useState<UploadedFile[]>([]);

  const uploadFileMutation = useUploadFile();

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Report rejected files
      rejectedFiles.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            toast.error(`${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)} MB`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} is not a supported file type`);
          } else {
            toast.error(`Error with ${file.name}: ${error.message}`);
          }
        });
      });

      // Enforce the file limit
      const totalFiles = uploadingFiles.length + completedFiles.length + acceptedFiles.length;
      if (totalFiles > maxFiles) {
        toast.error(`Cannot upload more than ${maxFiles} files`);
        return;
      }

      const newUploadingFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
        id: Math.random().toString(36).slice(2, 11),
      }));

      setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

      const uploadedInThisBatch: UploadedFile[] = [];

      for (const uploadingFile of newUploadingFiles) {
        // Simulated progress for UI feedback
        const progressInterval = setInterval(() => {
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf.id === uploadingFile.id
                ? { ...uf, progress: Math.min(uf.progress + 10, 90) }
                : uf
            )
          );
        }, 200);

        try {
          const formData = new FormData();
          formData.append('file', uploadingFile.file);
          if (chatbotId) formData.append('chatBotId', chatbotId);

          const res = await uploadFileMutation.mutateAsync(formData);

          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf.id === uploadingFile.id ? { ...uf, progress: 100, status: 'completed' } : uf
            )
          );

          const completedFile: UploadedFile = {
            id: res?.data?.id || uploadingFile.id,
            fileName: res?.data?.fileName || uploadingFile.file.name,
            fileSize: res?.data?.fileSize || uploadingFile.file.size,
            fileType: res?.data?.fileType || uploadingFile.file.type,
            uploadedAt: res?.data?.uploadedAt || new Date().toISOString(),
          };

          uploadedInThisBatch.push(completedFile);
          setCompletedFiles((prev) => [...prev, completedFile]);
          toast.success(`${uploadingFile.file.name} uploaded`);

          // Clear the finished row after a short delay
          setTimeout(() => {
            setUploadingFiles((prev) => prev.filter((uf) => uf.id !== uploadingFile.id));
          }, 2000);
        } catch (error: any) {
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf.id === uploadingFile.id
                ? { ...uf, status: 'error', error: error.message || 'Upload failed' }
                : uf
            )
          );
          toast.error(`Failed to upload ${uploadingFile.file.name}`);
        } finally {
          clearInterval(progressInterval);
        }
      }

      if (onUploadComplete && uploadedInThisBatch.length > 0) {
        onUploadComplete(uploadedInThisBatch);
      }
    },
    [chatbotId, maxFiles, maxSize, onUploadComplete, uploadingFiles.length, completedFiles.length, uploadFileMutation]
  );

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

  const removeUploadingFile = (id: string) =>
    setUploadingFiles((prev) => prev.filter((uf) => uf.id !== id));

  const removeCompletedFile = (id: string) =>
    setCompletedFiles((prev) => prev.filter((cf) => cf.id !== id));

  return (
    <div className={`flex flex-col gap-8 ${className}`}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'is-dragging' : ''}`}
      >
        <input {...getInputProps()} />

        <span className="doc-icon !size-12 !rounded-xl">
          <CloudUpload className="size-6 shrink-0" />
        </span>

        <div className="flex flex-col gap-2 items-center justify-center">
          <p className="text-lg font-semibold">
            {isDragActive ? 'Drop files to upload' : 'Upload training files'}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag and drop files here, or{' '}
            <span className="font-medium text-brand-strong">browse your computer</span>
          </p>
        </div>

        <div className="cluster flex items-center justify-center" aria-label="Supported file types">
          {Object.entries(allowedTypes).map(([type, info]) => (
            <span key={type} className="badge badge-neutral">
              <info.icon className="size-3 shrink-0" />
              {info.label}
            </span>
          ))}
        </div>

        <p className="field-hint">
          Up to {maxSize / (1024 * 1024)} MB per file, {maxFiles} files total
        </p>
      </div>

      {/* In progress */}
      {uploadingFiles.length > 0 && (
        <section className="surface" aria-label="Uploading files">
          <div className="surface-header">
            <h3 className="text-lg font-semibold">Uploading ({uploadingFiles.length})</h3>
          </div>

          <ul className="surface-pad flex flex-col gap-2">
            {uploadingFiles.map((uploadingFile) => {
              const Icon = getFileIcon(uploadingFile.file.type);

              return (
                <li key={uploadingFile.id} className="doc-flex items-center">
                  <span className="doc-icon">
                    <Icon className="size-5 shrink-0" />
                  </span>

                  <div className="min-w-0 flex-1 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">{uploadingFile.file.name}</p>
                      <span className="field-hint shrink-0 tabular">
                        {getFileLabel(uploadingFile.file.type)}, {formatFileSize(uploadingFile.file.size)}
                      </span>
                    </div>

                    {uploadingFile.status === 'uploading' && (
                      <>
                        <div
                          className="progress"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={uploadingFile.progress}
                          aria-label={`Uploading ${uploadingFile.file.name}`}
                        >
                          <span style={{ width: `${uploadingFile.progress}%` }} />
                        </div>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground tabular">
                          <Loader2 className="size-3 shrink-0 animate-spin" />
                          Uploading, {uploadingFile.progress}%
                        </p>
                      </>
                    )}

                    {uploadingFile.status === 'completed' && (
                      <p className="flex items-center gap-1.5 text-sm font-medium text-success">
                        <CheckCircle className="size-4 shrink-0" />
                        Upload complete
                      </p>
                    )}

                    {uploadingFile.status === 'error' && (
                      <p className="flex items-center gap-1.5 text-sm text-destructive" role="alert">
                        <AlertCircle className="size-4 shrink-0" />
                        {uploadingFile.error || 'Upload failed'}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => removeUploadingFile(uploadingFile.id)}
                    aria-label={`Remove ${uploadingFile.file.name}`}
                  >
                    <X />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Done */}
      {completedFiles.length > 0 && (
        <section className="surface" aria-label="Uploaded files">
          <div className="surface-header">
            <h3 className="text-lg font-semibold">Uploaded ({completedFiles.length})</h3>
          </div>

          <ul className="surface-pad flex flex-col gap-2">
            {completedFiles.map((file) => {
              const Icon = getFileIcon(file.fileType);

              return (
                <li key={file.id} className="doc-flex items-center">
                  <span className="doc-icon">
                    <Icon className="size-5 shrink-0" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap font-medium">{file.fileName}</p>
                    <p className="field-hint tabular">
                      {getFileLabel(file.fileType)}, {formatFileSize(file.fileSize)}, uploaded{' '}
                      {new Date(file.uploadedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <span className="badge badge-success">
                    <CheckCircle className="size-3 shrink-0" />
                    Done
                  </span>

                  <button
                    type="button"
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => removeCompletedFile(file.id)}
                    aria-label={`Dismiss ${file.fileName}`}
                  >
                    <X />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
