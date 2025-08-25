"use client";
import { ChatInterface } from "@/components/chatbot/chat-interface";
import { Badge } from "@/components/ui/badge";
import { useChatBot } from "@/hooks/api/useChatBots";
import { Activity, Bot, Zap } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";

const Page = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useChatBot(id as string);
  const chatbot = data?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="max-w-3xl w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-slate-200 rounded-md w-48"></div>
            <div className="h-12 bg-slate-200 rounded-md w-full"></div>
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-slate-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !chatbot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
            <Bot className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">
            Failed to load chatbot
          </h2>
          <p className="text-slate-600 max-w-sm mx-auto">
            Please refresh the page or contact support if the issue persists.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b pb-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Bot className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">
                  {chatbot.name}
                </h1>
                <Badge
                  variant={
                    chatbot.isKnowledgeInitialized ? "default" : "secondary"
                  }
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    chatbot.isKnowledgeInitialized
                      ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                      : "bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  {chatbot.isKnowledgeInitialized ? (
                    <>
                      <Zap className="w-3 h-3 mr-1.5" />
                      Active
                    </>
                  ) : (
                    <>
                      <Activity className="w-3 h-3 mr-1.5" />
                      Inactive
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                {chatbot.description}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="rounded-2xl border bg-white shadow-md overflow-hidden">
          <ChatInterface chatbotId={id as string} />
        </div>
      </div>
    </div>
  );
};

export default Page;
