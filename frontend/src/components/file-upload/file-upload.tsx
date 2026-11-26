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
      rejectedFiles.forEach((rejection) => {
        const { file, errors } = rejection;
        errors.forEach((error: any) => {
          if (error.code === 'file-too-large') {
            toast.error(
              `${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)} MB`
            );
          } else if (error.code === 'file-invalid-type') {
            toast.error(`${file.name} is not a supported file type`);
          } else {
            toast.error(`Error with ${file.name}: ${error.message}`);
          }
        });
      });

      const totalFiles =
        uploadingFiles.length + completedFiles.length + acceptedFiles.length;
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
              uf.id === uploadingFile.id
                ? { ...uf, progress: 100, status: 'completed' }
                : uf
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

          setTimeout(() => {
            setUploadingFiles((prev) =>
              prev.filter((uf) => uf.id !== uploadingFile.id)
            );
          }, 2000);
        } catch (error: any) {
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf.id === uploadingFile.id
                ? {
                    ...uf,
                    status: 'error',
                    error: error.message || 'Upload failed',
                  }
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
    [
      chatbotId,
      maxFiles,
      maxSize,
      onUploadComplete,
      uploadingFiles.length,
      completedFiles.length,
      uploadFileMutation,
    ]
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
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`relative flex cursor-pointer flex-col items-center justify-center gap-3.5 overflow-hidden rounded-2xl border-2 border-dashed p-8 text-center transition-all outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-ring/25 ${
          isDragActive
            ? 'border-primary bg-primary/10 shadow-soft'
            : 'border-border bg-card text-card-foreground shadow-xs hover:border-primary/40 hover:bg-secondary/35'
        }`}
      >
        <input {...getInputProps()} />

        <span
          className={`flex size-12 items-center justify-center rounded-2xl border transition-colors ${
            isDragActive
              ? 'border-primary/30 bg-primary text-primary-foreground shadow-xs'
              : 'border-primary/20 bg-primary/10 text-primary'
          }`}
        >
          <CloudUpload className="size-6 shrink-0" />
        </span>

        <div className="flex flex-col items-center justify-center gap-1.5">
          <p className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {isDragActive ? 'Drop files to upload' : 'Upload training files'}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag and drop files here, or{' '}
            <span className="font-semibold text-primary underline-offset-2 hover:underline">
              browse your computer
            </span>
          </p>
        </div>

        <div
          className="flex flex-wrap items-center justify-center gap-1.5"
          aria-label="Supported file types"
        >
          {Object.entries(allowedTypes).map(([type, info]) => {
            const TypeIcon = info.icon;
            return (
              <span
                key={type}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground"
              >
                <TypeIcon className="size-3 shrink-0 text-primary" />
                {info.label}
              </span>
            );
          })}
        </div>

        <p className="tabular text-xs text-muted-foreground">
          Up to {maxSize / (1024 * 1024)} MB per file, {maxFiles} files total
        </p>
      </div>

      {/* In progress */}
      {uploadingFiles.length > 0 && (
        <section
          className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs"
          aria-label="Uploading files"
        >
          <div className="border-b border-border bg-secondary/40 px-5 py-3.5">
            <h3 className="tabular text-sm font-semibold tracking-tight text-foreground">
              Uploading ({uploadingFiles.length})
            </h3>
          </div>

          <ul className="divide-y divide-border/70 p-4">
            {uploadingFiles.map((uploadingFile) => {
              const Icon = getFileIcon(uploadingFile.file.type);

              return (
                <li
                  key={uploadingFile.id}
                  className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-5 shrink-0" />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-foreground">
                        {uploadingFile.file.name}
                      </p>
                      <span className="tabular shrink-0 text-xs text-muted-foreground">
                        {getFileLabel(uploadingFile.file.type)},{' '}
                        {formatFileSize(uploadingFile.file.size)}
                      </span>
                    </div>

                    {uploadingFile.status === 'uploading' && (
                      <>
                        <div
                          className="h-2 w-full overflow-hidden rounded-full bg-secondary"
                          role="progressbar"
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={uploadingFile.progress}
                          aria-label={`Uploading ${uploadingFile.file.name}`}
                        >
                          <span
                            className="block h-full rounded-full bg-primary transition-all duration-200"
                            style={{ width: `${uploadingFile.progress}%` }}
                          />
                        </div>
                        <p className="tabular flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Loader2 className="size-3 shrink-0 animate-spin text-primary" />
                          Uploading, {uploadingFile.progress}%
                        </p>
                      </>
                    )}

                    {uploadingFile.status === 'completed' && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-primary">
                        <CheckCircle className="size-4 shrink-0" />
                        Upload complete
                      </p>
                    )}

                    {uploadingFile.status === 'error' && (
                      <p
                        className="flex items-center gap-1.5 text-xs font-medium text-destructive"
                        role="alert"
                      >
                        <AlertCircle className="size-4 shrink-0" />
                        {uploadingFile.error || 'Upload failed'}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    onClick={() => removeUploadingFile(uploadingFile.id)}
                    aria-label={`Remove ${uploadingFile.file.name}`}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Done */}
      {completedFiles.length > 0 && (
        <section
          className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs"
          aria-label="Uploaded files"
        >
          <div className="border-b border-border bg-secondary/40 px-5 py-3.5">
            <h3 className="tabular text-sm font-semibold tracking-tight text-foreground">
              Uploaded ({completedFiles.length})
            </h3>
          </div>

          <ul className="divide-y divide-border/70 p-4">
            {completedFiles.map((file) => {
              const Icon = getFileIcon(file.fileType);

              return (
                <li
                  key={file.id}
                  className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <Icon className="size-5 shrink-0" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-foreground">
                      {file.fileName}
                    </p>
                    <p className="tabular mt-0.5 text-xs text-muted-foreground">
                      {getFileLabel(file.fileType)},{' '}
                      {formatFileSize(file.fileSize)}, uploaded{' '}
                      {new Date(file.uploadedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <CheckCircle className="size-3 shrink-0" />
                    Done
                  </span>

                  <button
                    type="button"
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    onClick={() => removeCompletedFile(file.id)}
                    aria-label={`Dismiss ${file.fileName}`}
                  >
                    <X className="size-4" />
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