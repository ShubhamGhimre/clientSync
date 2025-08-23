'use client'
import React, { useState } from 'react';
import { 
  Bot, Upload, FileText, CheckCircle, X, ArrowLeft, ArrowRight
} from 'lucide-react';
import { useCreateChatBot } from '@/hooks/api/useChatBots';
import { useUploadFile } from '@/hooks/api/useFiles';

interface ChatbotForm {
  name: string;
  description: string;
  files: File[];
}

const Training = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [chatbotForm, setChatbotForm] = useState<ChatbotForm>({ name: '', description: '', files: [] });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const createChatBot = useCreateChatBot();
  const uploadFile = useUploadFile();

  const steps = [
    { number: 1, title: 'Basic Info', description: 'Set up chatbot details' },
    { number: 2, title: 'Upload Data', description: 'Add training files' },
    { number: 3, title: 'Review', description: 'Confirm and create' }
  ];

  // Step 3: Review & Create
  const handleCreateChatbot = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      // 1. Create the chatbot
      const chatbot = await createChatBot.mutateAsync({
        name: chatbotForm.name,
        description: chatbotForm.description,
      });

      // 2. Upload all files (one by one)
      for (const file of chatbotForm.files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('chatBotId', chatbot.id);
        await uploadFile.mutateAsync(formData);
      }

      setSuccess('Chatbot created and files uploaded!');
      setChatbotForm({ name: '', description: '', files: [] });
      setCurrentStep(1);
    } catch (err: any) {
      setError(err?.message || 'Failed to create chatbot or upload files.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 xs:p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 xs:mb-6 lg:mb-8">
        <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Training Center
        </h1>
        <p className="text-sm xs:text-base text-gray-600 mt-1 xs:mt-2">
          Create and train your AI chatbots with custom data
        </p>
      </div>
      
      {/* Step 1: Basic Information */}
      {currentStep === 1 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg xs:rounded-xl lg:rounded-2xl shadow-sm p-4 xs:p-6 lg:p-8 border border-gray-100">
            {/* Step Header */}
            <div className="mb-6 xs:mb-8 text-center">
              <div className="w-12 h-12 xs:w-16 xs:h-16 bg-blue-100 rounded-lg xs:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
                <Bot className="h-6 w-6 xs:h-8 xs:w-8 text-blue-600" />
              </div>
              <h2 className="text-lg xs:text-xl lg:text-2xl font-bold text-gray-900 mb-1 xs:mb-2">
                Create New Chatbot
              </h2>
              <p className="text-sm xs:text-base text-gray-600">
                Let's start by setting up your chatbot's basic information
              </p>
            </div>
            
            {/* Progress Steps - Responsive */}
            <div className="mb-8 xs:mb-12">
              {/* Mobile Progress - Simple dots */}
              <div className="flex items-center justify-center space-x-2 sm:hidden">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      step.number <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                    {step.number < steps.length && (
                      <div className={`w-6 h-0.5 mx-1 transition-all duration-200 ${
                        step.number < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Tablet & Desktop Progress - Full steps */}
              <div className="hidden sm:flex items-center justify-center">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className="text-center">
                      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base transition-all duration-200 ${
                        step.number <= currentStep 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.number <= currentStep ? <CheckCircle size={16} className="lg:w-5 lg:h-5" /> : step.number}
                      </div>
                      <div className="mt-2 lg:mt-3">
                        <p className="text-xs lg:text-sm font-semibold text-gray-900">{step.title}</p>
                        <p className="text-xs text-gray-500 hidden lg:block">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 lg:w-16 h-0.5 mx-3 lg:mx-4 transition-all duration-200 ${
                        step.number < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-4 xs:space-y-6">
              <div>
                <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  value={chatbotForm.name}
                  onChange={(e) => setChatbotForm({...chatbotForm, name: e.target.value})}
                  placeholder="e.g., Customer Support Bot"
                  className="w-full border border-gray-200 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-xs xs:text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={chatbotForm.description}
                  onChange={(e) => setChatbotForm({...chatbotForm, description: e.target.value})}
                  placeholder="Describe what this chatbot will help with..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 text-sm xs:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col xs:flex-row xs:justify-between items-center gap-3 xs:gap-0 mt-6 xs:mt-8">
              <button className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 text-sm xs:text-base order-2 xs:order-1">
                Cancel
              </button>
              <button 
                onClick={() => setCurrentStep(2)}
                className="w-full xs:w-auto bg-blue-600 text-white px-6 xs:px-8 py-2.5 xs:py-3 rounded-lg xs:rounded-xl hover:bg-blue-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm xs:text-base order-1 xs:order-2"
              >
                <span>Continue</span>
                <ArrowRight size={16} className="xs:w-5 xs:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Step 2: Upload Training Data */}
      {currentStep === 2 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg xs:rounded-xl lg:rounded-2xl shadow-sm p-4 xs:p-6 lg:p-8 border border-gray-100">
            {/* Step Header */}
            <div className="mb-6 xs:mb-8 text-center">
              <div className="w-12 h-12 xs:w-16 xs:h-16 bg-green-100 rounded-lg xs:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
                <Upload className="h-6 w-6 xs:h-8 xs:w-8 text-green-600" />
              </div>
              <h2 className="text-lg xs:text-xl lg:text-2xl font-bold text-gray-900 mb-1 xs:mb-2">
                Upload Training Data
              </h2>
              <p className="text-sm xs:text-base text-gray-600">
                Upload multiple files to train your chatbot. Supported formats: PDF, CSV, Excel, TXT
              </p>
            </div>
            
            {/* Progress Steps - keeping existing code */}
            <div className="mb-8 xs:mb-12">
              {/* Mobile Progress */}
              <div className="flex items-center justify-center space-x-2 sm:hidden">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      step.number <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                    {step.number < steps.length && (
                      <div className={`w-6 h-0.5 mx-1 transition-all duration-200 ${
                        step.number < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Progress */}
              <div className="hidden sm:flex items-center justify-center">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className="text-center">
                      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base transition-all duration-200 ${
                        step.number <= currentStep 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.number <= currentStep ? <CheckCircle size={16} className="lg:w-5 lg:h-5" /> : step.number}
                      </div>
                      <div className="mt-2 lg:mt-3">
                        <p className="text-xs lg:text-sm font-semibold text-gray-900">{step.title}</p>
                        <p className="text-xs text-gray-500 hidden lg:block">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 lg:w-16 h-0.5 mx-3 lg:mx-4 transition-all duration-200 ${
                        step.number < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Enhanced File Upload Area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg xs:rounded-xl lg:rounded-2xl p-6 xs:p-8 lg:p-12 text-center hover:border-blue-400 transition-colors duration-200 bg-gray-50 relative"
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                const droppedFiles = Array.from(e.dataTransfer.files);
                const validFiles = droppedFiles.filter(file => {
                  const validTypes = ['.pdf', '.csv', '.xlsx', '.xls', '.txt'];
                  const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
                  return validTypes.includes(fileExtension) && file.size <= 10 * 1024 * 1024; // 10MB limit
                });
                setChatbotForm({...chatbotForm, files: [...chatbotForm.files, ...validFiles]});
              }}
            >
              <Upload size={32} className="xs:w-12 xs:h-12 lg:w-16 lg:h-16 mx-auto text-gray-400 mb-3 xs:mb-4 lg:mb-6" />
              <h3 className="text-base xs:text-lg lg:text-xl font-semibold text-gray-900 mb-1 xs:mb-2">
                Drop multiple files here or click to upload
              </h3>
              <p className="text-xs xs:text-sm lg:text-base text-gray-600 mb-2">
                Support for PDF, CSV, Excel, and text files up to 10MB each
              </p>
              <p className="text-xs text-gray-500 mb-4 xs:mb-6">
                You can select multiple files at once or drag and drop them here
              </p>
              <input
                type="file"
                multiple
                accept=".pdf,.csv,.xlsx,.xls,.txt"
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  const selectedFiles = Array.from(e.target.files || []);
                  // Filter valid files and combine with existing files
                  const validFiles = selectedFiles.filter(file => {
                    const validTypes = ['.pdf', '.csv', '.xlsx', '.xls', '.txt'];
                    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
                    return validTypes.includes(fileExtension) && file.size <= 10 * 1024 * 1024;
                  });
                  setChatbotForm({...chatbotForm, files: [...chatbotForm.files, ...validFiles]});
                  // Reset the input so the same files can be selected again if needed
                  e.target.value = '';
                }}
              />
              <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 items-center justify-center">
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 text-white px-4 xs:px-6 lg:px-8 py-2.5 xs:py-3 rounded-lg xs:rounded-xl hover:bg-blue-700 cursor-pointer font-medium transition-all duration-200 shadow-lg hover:shadow-xl inline-block text-sm xs:text-base"
                >
                  Choose Multiple Files
                </label>
                <span className="text-xs xs:text-sm text-gray-500">or drag & drop</span>
              </div>
              
              {/* File limits info */}
              <div className="mt-4 text-xs text-gray-500">
                <p>Maximum file size: 10MB per file</p>
                <p>No limit on number of files</p>
              </div>
            </div>
            
            {/* Enhanced Selected Files Display */}
            {chatbotForm.files.length > 0 && (
              <div className="mt-6 xs:mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900 text-sm xs:text-base">
                    Selected Files ({chatbotForm.files.length}):
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setChatbotForm({...chatbotForm, files: []})}
                      className="text-red-600 hover:text-red-800 text-xs xs:text-sm font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      Clear All
                    </button>
                    <label
                      htmlFor="file-upload"
                      className="text-blue-600 hover:text-blue-800 text-xs xs:text-sm font-medium px-3 py-1.5 hover:bg-blue-50 rounded-lg transition-colors duration-200 cursor-pointer"
                    >
                      Add More
                    </label>
                  </div>
                </div>
                
                {/* File Statistics */}
                {/* <div className="grid grid-cols-2 xs:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{chatbotForm.files.length}</p>
                    <p className="text-xs text-gray-500">Total Files</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {(chatbotForm.files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-gray-500">Total Size</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {new Set(chatbotForm.files.map(f => f.name.split('.').pop()?.toLowerCase())).size}
                    </p>
                    <p className="text-xs text-gray-500">File Types</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">
                      {Math.max(...chatbotForm.files.map(f => f.size / 1024 / 1024)).toFixed(2)} MB
                    </p>
                    <p className="text-xs text-gray-500">Largest File</p>
                  </div>
                </div> */}
                
                {/* Files List */}
                <div className="space-y-2 xs:space-y-3 max-h-64 xs:max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-2">
                  {chatbotForm.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 xs:p-4 bg-white hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors duration-200">
                      <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
                        <div className="shrink-0">
                          <FileText size={16} className="xs:w-5 xs:h-5 text-gray-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-medium text-gray-900 text-sm xs:text-base truncate block" title={file.name}>
                            {file.name}
                          </span>
                          <div className="flex items-center gap-3 text-xs xs:text-sm text-gray-500 mt-1">
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span className="capitalize">{file.name.split('.').pop()?.toLowerCase()} file</span>
                            <span>{new Date(file.lastModified).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const newFiles = chatbotForm.files.filter((_, i) => i !== index);
                          setChatbotForm({...chatbotForm, files: newFiles});
                        }}
                        className="text-red-600 hover:text-red-800 p-1.5 xs:p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 shrink-0"
                        title="Remove file"
                      >
                        <X size={14} className="xs:w-4 xs:h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* File type breakdown */}
                {/* <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">File types breakdown:</p>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(new Set(chatbotForm.files.map(f => f.name.split('.').pop()?.toLowerCase()))).map(type => {
                      const count = chatbotForm.files.filter(f => f.name.split('.').pop()?.toLowerCase() === type).length;
                      return (
                        <span key={type} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                          {type?.toUpperCase()}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div> */}
              </div>
            )}
            
            {/* File Upload Tips */}
            {/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="font-semibold text-blue-900 text-sm mb-2">💡 File Upload Tips:</h5>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• You can select multiple files at once using Ctrl/Cmd + Click</li>
                <li>• Drag and drop multiple files directly onto the upload area</li>
                <li>• Use "Add More" button to add files to your existing selection</li>
                <li>• Organize your files by type: PDFs for documents, CSV/Excel for data, TXT for plain text</li>
                <li>• Larger datasets will provide better training results</li>
              </ul>
            </div> */}
            
            {/* Navigation Buttons */}
            <div className="flex flex-col xs:flex-row xs:justify-between items-center gap-3 xs:gap-0 mt-6 xs:mt-8">
              <button 
                onClick={() => setCurrentStep(1)}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 flex items-center gap-2 text-sm xs:text-base order-2 xs:order-1"
              >
                <ArrowLeft size={16} className="xs:w-5 xs:h-5" />
                <span>Previous</span>
              </button>
              <button 
                onClick={() => setCurrentStep(3)}
                disabled={chatbotForm.files.length === 0}
                className="w-full xs:w-auto bg-blue-600 text-white px-6 xs:px-8 py-2.5 xs:py-3 rounded-lg xs:rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-sm xs:text-base order-1 xs:order-2"
              >
                <span>Continue</span>
                <ArrowRight size={16} className="xs:w-5 xs:h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Step 3: Review & Create */}
      {currentStep === 3 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg xs:rounded-xl lg:rounded-2xl shadow-sm p-4 xs:p-6 lg:p-8 border border-gray-100">
            {/* Step Header */}
            <div className="mb-6 xs:mb-8 text-center">
              <div className="w-12 h-12 xs:w-16 xs:h-16 bg-purple-100 rounded-lg xs:rounded-xl lg:rounded-2xl flex items-center justify-center mx-auto mb-3 xs:mb-4">
                <CheckCircle className="h-6 w-6 xs:h-8 xs:w-8 text-purple-600" />
              </div>
              <h2 className="text-lg xs:text-xl lg:text-2xl font-bold text-gray-900 mb-1 xs:mb-2">
                Review & Create
              </h2>
              <p className="text-sm xs:text-base text-gray-600">
                Review your chatbot configuration before creating
              </p>
            </div>
            
            {/* Progress Steps */}
            <div className="mb-8 xs:mb-12">
              {/* Mobile Progress */}
              <div className="flex items-center justify-center space-x-2 sm:hidden">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      step.number <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                    {step.number < steps.length && (
                      <div className={`w-6 h-0.5 mx-1 transition-all duration-200 ${
                        step.number < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Desktop Progress */}
              <div className="hidden sm:flex items-center justify-center">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div className="text-center">
                      <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center font-semibold text-sm lg:text-base transition-all duration-200 ${
                        step.number <= currentStep 
                          ? 'bg-blue-600 text-white shadow-lg' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step.number <= currentStep ? <CheckCircle size={16} className="lg:w-5 lg:h-5" /> : step.number}
                      </div>
                      <div className="mt-2 lg:mt-3">
                        <p className="text-xs lg:text-sm font-semibold text-gray-900">{step.title}</p>
                        <p className="text-xs text-gray-500 hidden lg:block">{step.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-12 lg:w-16 h-0.5 mx-3 lg:mx-4 transition-all duration-200 ${
                        step.number < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Review Information */}
            <div className="space-y-4 xs:space-y-6">
              {/* Chatbot Name */}
              <div className="p-4 xs:p-6 bg-blue-50 rounded-lg xs:rounded-xl border border-blue-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2 text-sm xs:text-base">
                  <Bot size={16} className="xs:w-5 xs:h-5 text-blue-600" />
                  Chatbot Name
                </h3>
                <p className="text-gray-700 font-medium text-sm xs:text-base break-words">
                  {chatbotForm.name || 'Not specified'}
                </p>
              </div>
              
              {/* Description */}
              <div className="p-4 xs:p-6 bg-green-50 rounded-lg xs:rounded-xl border border-green-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2 text-sm xs:text-base">
                  <FileText size={16} className="xs:w-5 xs:h-5 text-green-600" />
                  Description
                </h3>
                <p className="text-gray-700 text-sm xs:text-base break-words">
                  {chatbotForm.description || 'Not specified'}
                </p>
              </div>
              
              {/* Training Files */}
              <div className="p-4 xs:p-6 bg-purple-50 rounded-lg xs:rounded-xl border border-purple-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2 text-sm xs:text-base">
                  <Upload size={16} className="xs:w-5 xs:h-5 text-purple-600" />
                  Training Files
                </h3>
                <p className="text-gray-700 font-medium text-sm xs:text-base mb-2 xs:mb-3">
                  {chatbotForm.files.length} files selected
                </p>
                {chatbotForm.files.length > 0 && (
                  <div className="space-y-1 xs:space-y-2 max-h-32 xs:max-h-40 overflow-y-auto">
                    {chatbotForm.files.slice(0, 5).map((file, index) => (
                      <p key={index} className="text-xs xs:text-sm text-gray-600 break-all">
                        • {file.name}
                      </p>
                    ))}
                    {chatbotForm.files.length > 5 && (
                      <p className="text-xs xs:text-sm text-gray-500">
                        ... and {chatbotForm.files.length - 5} more files
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700">
                {success}
              </div>
            )}
            
            {/* Navigation Buttons */}
            <div className="flex flex-col xs:flex-row xs:justify-between items-center gap-3 xs:gap-0 mt-6 xs:mt-8">
              <button 
                onClick={() => setCurrentStep(2)}
                className="text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 flex items-center gap-2 text-sm xs:text-base order-2 xs:order-1"
              >
                <ArrowLeft size={16} className="xs:w-5 xs:h-5" />
                <span>Previous</span>
              </button>
              <button 
                onClick={handleCreateChatbot}
                disabled={loading}
                className="w-full xs:w-auto bg-green-600 text-white px-6 xs:px-8 py-2.5 xs:py-3 rounded-lg xs:rounded-xl hover:bg-green-700 font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 xs:gap-3 text-sm xs:text-base order-1 xs:order-2"
              >
                <CheckCircle size={16} className="xs:w-5 xs:h-5" />
                <span>{loading ? 'Creating...' : 'Create Chatbot'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;
