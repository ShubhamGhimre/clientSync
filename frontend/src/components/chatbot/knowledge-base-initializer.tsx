"use client";

import { useState, useEffect } from "react";
import {
  Database,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  FileText,
  Zap,
  Activity,
  Clock,
  Loader2,
} from "lucide-react";
import { BrandMark } from "@/components/logo";
import { useChatBot } from "@/hooks/api/useChatBots";
import { useRagManager } from "@/hooks/api/useRag";
import { useFiles } from "@/hooks/api/useFiles";

interface KnowledgeBaseInitializerProps {
  chatbotId: string;
}

interface File {
  id: string;
  fileName?: string;
  name?: string;
  fileType?: string | null;
  fileSize?: number;
  processed?: boolean;
}

export default function KnowledgeBaseInitializer({
  chatbotId,
}: KnowledgeBaseInitializerProps) {
  const [chatbotPollingInterval, setChatbotPollingInterval] =
    useState<NodeJS.Timeout | null>(null);

  const {
    data: chatbotData,
    isLoading: chatbotLoading,
    refetch: refetchChatbot,
  } = useChatBot(chatbotId);
  const chatbot = chatbotData?.data;

  const {
    data: filesData,
    isLoading: filesLoading,
    refetch: refetchFiles,
  } = useFiles(chatbotId);

  const files: File[] =
    filesData?.data && Array.isArray(filesData.data) ? filesData.data : [];

  const ragManager = useRagManager(chatbotId);
  const {
    initialize,
    isInitializing,
    initializeError,
    progress: progressData,
    isProcessing,
    isCompleted,
    isFailed,
    progressError,
    refetchProgress,
    isActive,
    hasError,
  } = ragManager;

  const isKnowledgeInitialized = chatbot?.isKnowledgeInitialized || false;
  const totalChunks = chatbot?.totalChunks || 0;
  const lastUpdated = chatbot?.lastKnowledgeUpdate;

  const canInitialize =
    files.length > 0 && !isKnowledgeInitialized && !isActive;

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await refetchChatbot();
      } catch (error) {
        console.error("Chatbot polling error:", error);
      }
    }, 2 * 60 * 1000);

    setChatbotPollingInterval(interval);

    return () => {
      clearInterval(interval);
      setChatbotPollingInterval(null);
    };
  }, [chatbotId, refetchChatbot]);

  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(() => {
        refetchChatbot();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, refetchChatbot]);

  const handleInitializeKnowledge = async () => {
    try {
      await initialize();
    } catch (error) {
      console.error("Initialize error:", error);
    }
  };

  const handleReinitialize = async () => {
    if (
      !confirm(
        "Are you sure you want to reinitialize the knowledge base? This will recreate all chunks and embeddings."
      )
    ) {
      return;
    }
    await handleInitializeKnowledge();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProgress = () => {
    if (isKnowledgeInitialized && !isProcessing) return 100;
    if (progressData && isProcessing) return progressData.progress || 0;
    if (isCompleted) return 100;
    if (isFailed && progressData) return progressData.progress || 0;
    return 0;
  };

  const getCurrentStep = () => {
    if (isKnowledgeInitialized && !isProcessing) return "Completed";
    if (progressData && isProcessing) {
      return (
        progressData.currentStep || progressData.message || "Processing..."
      );
    }
    if (isCompleted) return "Finalizing...";
    if (isFailed) return "Failed";
    if (isInitializing) return "Starting initialization...";
    return "Ready to initialize";
  };

  const getOverallStatus = () => {
    if (isKnowledgeInitialized && !isActive) return "Ready";
    if (isActive) return "Processing";
    if (isFailed) return "Failed";
    return "Pending";
  };

  const getStatusDotClass = () => {
    if (isKnowledgeInitialized && !isActive) return "bg-primary";
    if (isActive) return "animate-pulse bg-chart-4";
    if (isFailed) return "bg-destructive";
    return "bg-muted-foreground";
  };

  const getErrorMessage = () => {
    if (initializeError) return initializeError.message;
    if (progressError) return "Failed to fetch progress updates";
    if (progressData?.error) return progressData.error;
    return "An unknown error occurred";
  };

  /* ---------- Loading ---------- */
  if (chatbotLoading) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6" aria-busy="true">
        <div className="h-28 w-full animate-pulse rounded-2xl bg-muted" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
        <div className="h-56 w-full animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  const progressValue = getProgress();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {/* Header */}
      <header className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-soft">
        <div
          className="pointer-events-none absolute inset-x-8 top-0 h-[2px] rounded-full opacity-80"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--chart-1), var(--chart-2), transparent)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 80% at 90% 20%, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%), radial-gradient(45% 70% at 70% 100%, color-mix(in oklab, var(--chart-2) 8%, transparent), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <BrandMark
          size={160}
          className="pointer-events-none absolute -bottom-10 right-6 text-primary opacity-[0.04]"
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Knowledge base
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Process your uploaded files so the chatbot can answer from them.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={`size-2 rounded-full ${
                    chatbotPollingInterval ? "bg-primary" : "bg-muted-foreground"
                  }`}
                />
                Refreshes every 2 minutes
              </span>
              {isActive && (
                <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                  <Loader2 className="size-3.5 shrink-0 animate-spin" />
                  Processing
                </span>
              )}
              {progressData?.timeElapsed && (
                <span className="tabular inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 shrink-0" />
                  {progressData.timeElapsed} elapsed
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-border bg-card px-4 text-xs font-medium text-foreground shadow-xs transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => {
              refetchChatbot();
              refetchFiles();
              refetchProgress();
            }}
            disabled={isActive}
          >
            <RefreshCw
              className={`size-3.5 ${isActive ? "animate-spin text-primary" : ""}`}
            />
            <span>Refresh now</span>
          </button>
        </div>
      </header>

      {/* Stats */}
      <section
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Knowledge base overview"
      >
        <div className="group flex flex-col justify-between gap-2 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xs transition-all hover:border-primary/30 hover:shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Chunks
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
              <Database className="size-4 shrink-0" />
            </span>
          </div>
          <span className="tabular text-2xl font-semibold tracking-tight text-foreground">
            {totalChunks.toLocaleString()}
          </span>
          <span className="border-t border-border/70 pt-2 text-xs text-muted-foreground">
            Searchable text segments
          </span>
        </div>

        <div className="group flex flex-col justify-between gap-2 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xs transition-all hover:border-primary/30 hover:shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Files
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground">
              <FileText className="size-4 shrink-0" />
            </span>
          </div>
          <span className="tabular text-2xl font-semibold tracking-tight text-foreground">
            {files.length}
          </span>
          <span className="border-t border-border/70 pt-2 text-xs text-muted-foreground">
            Uploaded documents
          </span>
        </div>

        <div className="group flex flex-col justify-between gap-2 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xs transition-all hover:border-primary/30 hover:shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Status
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground">
              <Activity className="size-4 shrink-0" />
            </span>
          </div>
          <span className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-foreground">
            <span
              className={`size-2.5 rounded-full ${getStatusDotClass()}`}
              aria-hidden="true"
            />
            {getOverallStatus()}
          </span>
          <span className="border-t border-border/70 pt-2 text-xs text-muted-foreground">
            Current state
          </span>
        </div>

        <div className="group flex flex-col justify-between gap-2 rounded-2xl border border-border bg-card p-4 text-card-foreground shadow-xs transition-all hover:border-primary/30 hover:shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Last updated
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-border bg-secondary text-muted-foreground">
              <Clock className="size-4 shrink-0" />
            </span>
          </div>
          <span className="text-base font-semibold leading-8 tracking-tight text-foreground">
            {formatDate(lastUpdated)}
          </span>
          <span className="border-t border-border/70 pt-2 text-xs text-muted-foreground">
            Last knowledge refresh
          </span>
        </div>
      </section>

      {/* Processing */}
      {isActive && (
        <section className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/40 px-5 py-4">
            <div>
              <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-foreground">
                <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                <span>Processing knowledge base</span>
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {getCurrentStep()}
              </p>
            </div>
            <span className="tabular inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {Math.round(progressValue)}%
            </span>
          </div>

          <div className="flex flex-col gap-4 p-5">
            <div
              className="h-2.5 w-full overflow-hidden rounded-full bg-secondary"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progressValue)}
              aria-label="Processing progress"
            >
              <span
                className="block h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${progressValue}%` }}
              />
            </div>

            <div className="tabular flex justify-between text-xs text-muted-foreground">
              <span>
                Files {progressData?.processedFiles || 0} of{" "}
                {progressData?.totalFiles || files.length}
              </span>
              {progressData && (progressData.processedChunks ?? 0) > 0 && (
                <span>
                  {progressData.processedChunks!.toLocaleString()} chunks
                </span>
              )}
            </div>

            {progressData && (
              <dl className="grid gap-3 border-t border-border/70 pt-3 text-xs sm:grid-cols-2">
                {progressData.estimatedTimeRemaining && (
                  <div className="flex items-center gap-2">
                    <Activity className="size-3.5 shrink-0 text-primary" />
                    <dt className="font-medium text-foreground">Remaining</dt>
                    <dd className="text-muted-foreground">
                      {progressData.estimatedTimeRemaining}
                    </dd>
                  </div>
                )}
                {progressData.totalChunks > 0 && (
                  <div className="flex items-center gap-2">
                    <Database className="size-3.5 shrink-0 text-primary" />
                    <dt className="font-medium text-foreground">Total chunks</dt>
                    <dd className="tabular text-muted-foreground">
                      {progressData.totalChunks.toLocaleString()}
                    </dd>
                  </div>
                )}
                {progressData.currentFile && (
                  <div className="flex min-w-0 items-center gap-2">
                    <FileText className="size-3.5 shrink-0 text-primary" />
                    <dt className="font-medium text-foreground">Current file</dt>
                    <dd className="overflow-hidden text-ellipsis whitespace-nowrap text-muted-foreground">
                      {progressData.currentFile}
                    </dd>
                  </div>
                )}
              </dl>
            )}
          </div>
        </section>
      )}

      {/* Error */}
      {hasError && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold">Processing failed</p>
            <p className="mt-1 text-xs text-destructive/90">
              {getErrorMessage()}
            </p>
            {progressData?.lastUpdated && (
              <p className="mt-2 text-xs text-muted-foreground">
                Last update{" "}
                {new Date(progressData.lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Management */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs">
        <div className="border-b border-border bg-secondary/40 px-5 py-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Manage knowledge base
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Build or rebuild the index your chatbot searches.
          </p>
        </div>

        <div className="flex flex-col gap-4 p-5">
          {!isKnowledgeInitialized && !isActive ? (
            <div className="flex items-start gap-3 rounded-xl border border-chart-4/30 bg-chart-4/10 p-4 text-sm text-foreground">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-chart-4" />
              <p className="text-xs leading-relaxed sm:text-sm">
                {files.length === 0
                  ? "No files yet. Upload files in the Files tab first."
                  : 'The knowledge base isn\'t initialized. Select "Initialize knowledge base" to start.'}
              </p>
            </div>
          ) : isKnowledgeInitialized && !isActive ? (
            <div className="flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/10 p-4 text-sm text-foreground">
              <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
              <div>
                <p className="font-semibold text-foreground">
                  Knowledge base is ready
                </p>
                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  Your chatbot can answer questions from your uploaded content.
                  {totalChunks > 0 &&
                    ` ${totalChunks.toLocaleString()} chunks are available for search.`}
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            {!isKnowledgeInitialized || isFailed ? (
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleInitializeKnowledge}
                disabled={!canInitialize || isActive}
              >
                {isActive ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Zap className="size-4" />
                )}
                <span>
                  {isActive
                    ? "Initializing..."
                    : isFailed
                    ? "Retry initialization"
                    : "Initialize knowledge base"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground shadow-xs transition-colors hover:border-primary/30 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleReinitialize}
                disabled={isActive}
              >
                {isActive ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                <span>
                  {isActive ? "Reinitializing..." : "Reinitialize"}
                </span>
              </button>
            )}

            {isActive && (
              <button
                type="button"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-secondary px-3 text-xs font-medium text-secondary-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => refetchProgress()}
              >
                <RefreshCw className="size-3.5" />
                <span>Refresh progress</span>
              </button>
            )}
          </div>

          {(isActive || isCompleted) && progressData && (
            <dl className="grid gap-3 rounded-xl border border-border bg-secondary/40 p-4 text-xs sm:grid-cols-2">
              <div className="flex items-center justify-between gap-3">
                <dt className="font-medium text-foreground">Status</dt>
                <dd className="text-muted-foreground">{progressData.status}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-medium text-foreground">Progress</dt>
                <dd className="tabular text-muted-foreground">
                  {Math.round(progressData.progress)}%
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="font-medium text-foreground">Files</dt>
                <dd className="tabular text-muted-foreground">
                  {progressData.processedFiles || 0} /{" "}
                  {progressData.totalFiles || files.length}
                </dd>
              </div>
              {progressData.processedChunks > 0 && (
                <div className="flex items-center justify-between gap-3">
                  <dt className="font-medium text-foreground">Chunks</dt>
                  <dd className="tabular text-muted-foreground">
                    {progressData.processedChunks.toLocaleString()}
                  </dd>
                </div>
              )}
              {progressData.currentStep && (
                <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 sm:col-span-2">
                  <dt className="font-medium text-foreground">Current step</dt>
                  <dd className="text-muted-foreground">
                    {progressData.currentStep}
                  </dd>
                </div>
              )}
              {progressData.startTime && (
                <p className="text-[11px] text-muted-foreground sm:col-span-2">
                  Started {new Date(progressData.startTime).toLocaleString()}
                </p>
              )}
            </dl>
          )}
        </div>
      </section>

      {/* Source files */}
      {files.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-xs">
          <div className="border-b border-border bg-secondary/40 px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Source files
            </h2>
            <p className="tabular mt-0.5 text-xs text-muted-foreground">
              {files.length} {files.length === 1 ? "file" : "files"} available
              for the knowledge base
            </p>
          </div>

          <ul className="divide-y divide-border/70 p-4">
            {files.map((file: File, index: number) => {
              const isCurrentFile =
                progressData?.currentFile === (file.fileName || file.name);
              const isProcessedFile = file.processed;

              return (
                <li
                  key={file.id || index}
                  className="flex items-center gap-3.5 py-3 first:pt-0 last:pb-0"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
                    <FileText className="size-4 shrink-0" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold text-foreground">
                      {file.fileName || file.name}
                    </p>
                    <p className="tabular text-xs text-muted-foreground">
                      {file.fileType || "Document"},{" "}
                      {file.fileSize
                        ? `${Math.round(file.fileSize / 1024)} KB`
                        : "unknown size"}
                    </p>
                  </div>

                  {isProcessedFile ? (
                    <span className="inline-flex shrink-0 items-center rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
                      Completed
                    </span>
                  ) : isCurrentFile ? (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-chart-2/25 bg-chart-2/10 px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                      <Loader2 className="size-3 shrink-0 animate-spin text-primary" />
                      Processing
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      Waiting
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* No files */}
      {files.length === 0 && !filesLoading && (
        <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-border bg-card px-6 py-12 text-center text-card-foreground shadow-xs">
          <span className="flex size-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <FileText className="size-5 shrink-0" />
          </span>
          <h3 className="text-base font-semibold text-foreground">
            No files yet
          </h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Upload files in the Files tab, then come back to build the knowledge
            base.
          </p>

          {process.env.NODE_ENV === "development" && (
            <details className="mt-2 w-full max-w-md cursor-pointer text-left text-sm">
              <summary className="cursor-pointer text-xs text-muted-foreground">
                Debug information
              </summary>
              <pre className="mt-2 overflow-x-auto rounded-xl border border-border bg-secondary/50 p-4 font-mono text-xs text-foreground">
                {JSON.stringify(
                  {
                    filesData,
                    filesLoading,
                    ragManagerState: {
                      isInitializing,
                      isProcessing,
                      isCompleted,
                      isFailed,
                      progressData,
                    },
                  },
                  null,
                  2
                )}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
}