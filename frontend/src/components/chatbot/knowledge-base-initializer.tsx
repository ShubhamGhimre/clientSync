'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Zap,
  Settings,
  Download,
  Trash2,
  Eye,
  Activity,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';

interface KnowledgeBaseInitializerProps {
  chatbotId: string;
}

interface ProcessingStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  currentStep: string;
  totalFiles: number;
  processedFiles: number;
  totalChunks: number;
  error?: string;
}

export default function KnowledgeBaseInitializer({ chatbotId }: KnowledgeBaseInitializerProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'chunks'>('overview');
  const [isPolling, setIsPolling] = useState(false);

  // Mock data for demo purposes
  const mockFiles = [
    { fileName: 'product-documentation.pdf', processed: true, chunksCount: 45 },
    { fileName: 'user-manual.docx', processed: true, chunksCount: 32 },
    { fileName: 'faq-document.txt', processed: true, chunksCount: 18 },
    { fileName: 'api-reference.md', processed: false, chunksCount: 0 },
  ];

  const mockProgressData = {
    status: 'completed',
    progress: 100,
    currentStep: 'Completed',
    totalChunks: 95,
    lastUpdated: new Date().toISOString(),
    error: null
  };

  const isKnowledgeInitialized = true;
  const processedFiles = mockFiles.filter(file => file.processed);
  
  const knowledgeStats = {
    totalChunks: mockProgressData?.totalChunks || 0,
    totalFiles: processedFiles.length,
    lastUpdated: mockProgressData?.lastUpdated || new Date().toISOString(),
    isInitialized: isKnowledgeInitialized,
    sources: mockFiles.map((file) => ({
      name: file.fileName,
      chunks: file.chunksCount || 0,
      status: file.processed ? 'processed' : 'pending'
    }))
  };

  const processingStatus: ProcessingStatus = {
    status: (mockProgressData?.status as ProcessingStatus['status']) || (isKnowledgeInitialized ? 'completed' : 'idle'),
    progress: mockProgressData?.progress || (isKnowledgeInitialized ? 100 : 0),
    currentStep: mockProgressData?.currentStep || '',
    totalFiles: mockFiles.length,
    processedFiles: processedFiles.length,
    totalChunks: mockProgressData?.totalChunks || 0,
    error: mockProgressData?.error ?? undefined
  };

  const handleInitializeKnowledge = async () => {
    console.log('Initializing knowledge base...');
    setIsPolling(true);
  };

  const handleReinitialize = async () => {
    if (!confirm('Are you sure you want to reinitialize the knowledge base? This will recreate all chunks and embeddings.')) {
      return;
    }
    await handleInitializeKnowledge();
  };

  const handleClearKnowledge = async () => {
    if (!confirm('Are you sure you want to clear the knowledge base? This action cannot be undone.')) {
      return;
    }
    console.log('Clear functionality would be implemented here');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefreshAll = async () => {
    console.log('Refreshing all data...');
  };

  const canInitialize = processedFiles.length > 0 && !isKnowledgeInitialized;
  const isProcessing = processingStatus.status === 'processing';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600';
      case 'processing':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-amber-600';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'processed':
        return 'default';
      case 'pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Knowledge Base</h1>
            <p className="text-slate-600 mt-1">Manage your chatbot's knowledge and content processing</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setViewMode(viewMode === 'overview' ? 'chunks' : 'overview')}
              className="bg-white shadow-sm border-slate-200 hover:bg-slate-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              {viewMode === 'overview' ? 'View Chunks' : 'Overview'}
            </Button>
            <Button
              variant="outline"
              onClick={handleRefreshAll}
              className="bg-white shadow-sm border-slate-200 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Total Chunks</CardTitle>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Database className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{knowledgeStats.totalChunks.toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">
                Semantic text chunks
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Source Files</CardTitle>
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{knowledgeStats.totalFiles}</div>
              <p className="text-xs text-slate-500 mt-1">
                Processed documents
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Status</CardTitle>
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Activity className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(processingStatus.status)}`}>
                {knowledgeStats.isInitialized ? 'Ready' : 
                 processingStatus.status === 'processing' ? 'Processing' :
                 processingStatus.status === 'error' ? 'Error' : 'Pending'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Knowledge base status
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-slate-200/60 hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-slate-700">Last Updated</CardTitle>
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-slate-900">
                {knowledgeStats.lastUpdated ? formatDate(knowledgeStats.lastUpdated) : 'Never'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Knowledge base refresh
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <Card className="bg-white shadow-sm border-slate-200/60">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                Processing Knowledge Base
              </CardTitle>
              <CardDescription className="text-slate-600">
                {processingStatus.currentStep || 'Processing your files...'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <Progress value={processingStatus.progress} className="w-full h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-medium">Progress: {Math.round(processingStatus.progress)}%</span>
                <span className="text-slate-500">
                  Files: {processingStatus.processedFiles}/{processingStatus.totalFiles}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Status */}
        {processingStatus.status === 'error' && processingStatus.error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              {processingStatus.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Management Card */}
            <Card className="bg-white shadow-sm border-slate-200/60">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-slate-900">Knowledge Base Management</CardTitle>
                <CardDescription className="text-slate-600">
                  Initialize and manage your chatbot's knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                
                {/* Status Alert */}
                {!knowledgeStats.isInitialized ? (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      {processedFiles.length === 0 
                        ? 'No processed files found. Upload and process files first.' 
                        : 'Knowledge base is not initialized. Click "Initialize Knowledge Base" to get started.'
                      }
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert className="bg-emerald-50 border-emerald-200">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-800">
                      Knowledge base is ready! Your chatbot can now answer questions based on uploaded content.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  {!isKnowledgeInitialized ? (
                    <Button
                      onClick={handleInitializeKnowledge}
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Initializing...' : 'Initialize Knowledge Base'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleReinitialize}
                      disabled={isProcessing}
                      variant="outline"
                      className="bg-white border-slate-200 hover:bg-slate-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Reinitializing...' : 'Reinitialize'}
                    </Button>
                  )}

                  {knowledgeStats.isInitialized && (
                    <>
                      <Button
                        variant="outline"
                        className="bg-white border-slate-200 hover:bg-slate-50"
                        onClick={() => console.log('Export functionality')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleClearKnowledge}
                        className="bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Source Files */}
            {viewMode === 'overview' && knowledgeStats.sources.length > 0 && (
              <Card className="bg-white shadow-sm border-slate-200/60">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-slate-900">Source Files</CardTitle>
                  <CardDescription className="text-slate-600">
                    Files processed for knowledge base creation
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {knowledgeStats.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors duration-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-50 rounded-lg">
                            <FileText className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{source.name}</p>
                            <p className="text-sm text-slate-500">
                              {source.chunks > 0 ? `${source.chunks} chunks generated` : 'No chunks yet'}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={getStatusBadgeVariant(source.status)}
                          className={
                            source.status === 'processed' 
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                              : "bg-amber-100 text-amber-700 border-amber-200"
                          }
                        >
                          {source.status === 'processed' ? 'Processed' : 'Pending'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Knowledge Chunks View */}
            {viewMode === 'chunks' && (
              <Card className="bg-white shadow-sm border-slate-200/60">
                <CardHeader className="border-b border-slate-100">
                  <CardTitle className="text-slate-900">Knowledge Chunks</CardTitle>
                  <CardDescription className="text-slate-600">
                    {knowledgeStats.totalChunks > 0 
                      ? `Showing sample chunks from your knowledge base (${knowledgeStats.totalChunks} total)`
                      : 'No chunks available yet. Initialize the knowledge base first.'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {knowledgeStats.totalChunks > 0 ? (
                    <div className="space-y-4">
                      <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-sm text-slate-600">
                          Chunks will be displayed here once the knowledge base is populated with real data.
                          You can implement a separate API endpoint to fetch sample chunks.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 border border-slate-200 rounded-xl text-center">
                      <Database className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                      <p className="text-sm text-slate-500">
                        No chunks available. Initialize the knowledge base to see content here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white shadow-sm border-slate-200/60">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <Button variant="outline" className="w-full justify-start bg-white border-slate-200 hover:bg-slate-50">
                  <Settings className="h-4 w-4 mr-3" />
                  Configuration
                </Button>
                <Button variant="outline" className="w-full justify-start bg-white border-slate-200 hover:bg-slate-50">
                  <Database className="h-4 w-4 mr-3" />
                  Vector Database
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start bg-white border-slate-200 hover:bg-slate-50"
                  onClick={handleRefreshAll}
                >
                  <RefreshCw className="h-4 w-4 mr-3" />
                  Sync Status
                </Button>
              </CardContent>
            </Card>

            {/* Processing Info */}
            <Card className="bg-white shadow-sm border-slate-200/60">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-slate-900">Processing Info</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-slate-600">Bot Status:</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {isKnowledgeInitialized ? 'Initialized' : 'Not Initialized'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100">
                    <span className="text-sm text-slate-600">Total Files:</span>
                    <span className="text-sm font-semibold text-slate-900">{mockFiles.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100">
                    <span className="text-sm text-slate-600">Processed Files:</span>
                    <span className="text-sm font-semibold text-slate-900">{processedFiles.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100">
                    <span className="text-sm text-slate-600">Total Chunks:</span>
                    <span className="text-sm font-semibold text-slate-900">{knowledgeStats.totalChunks}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100">
                    <span className="text-sm text-slate-600">Status:</span>
                    <span className={`text-sm font-semibold capitalize ${getStatusColor(processingStatus.status)}`}>
                      {processingStatus.status}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}