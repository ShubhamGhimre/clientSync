'use client'

import { useState } from 'react'
import { useCreateChatBot } from '@/hooks/api/useChatBots'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Bot, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function CreateChatbotPage() {

  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  const { mutateAsync, isPending } = useCreateChatBot();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await mutateAsync({
        name: formData.name,
        description: formData.description,
      });
      if (res?.data?.id) {
        router.push(`/chatbots/${res.data.id}?tab=knowledge`);
      } else {
        // fallback: go to list
        router.push('/chatbots');
      }
    } catch (error) {
      // Optionally show error toast
      // eslint-disable-next-line no-console
      console.error('Failed to create chatbot:', error);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/chatbots">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Chatbots
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Create New Chatbot</h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide basic details about your new chatbot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Chatbot Name *</Label>
              <Input
                id="name"
                placeholder="Enter a descriptive name for your chatbot"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what your chatbot will do and what it specializes in..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              What happens next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Chatbot Creation</p>
                  <p className="text-muted-foreground">Your chatbot will be created with basic configuration</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Upload Training Data</p>
                  <p className="text-muted-foreground">Upload files (PDF, TXT, CSV) to train your chatbot</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Initialize Knowledge Base</p>
                  <p className="text-muted-foreground">Process uploaded files to create the knowledge base</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                  4
                </div>
                <div>
                  <p className="font-medium">Start Chatting</p>
                  <p className="text-muted-foreground">Your chatbot will be ready to answer questions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" asChild>
            <Link href="/chatbots">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            <Bot className="mr-2 h-4 w-4" />
            {isPending ? 'Creating...' : 'Create Chatbot'}
          </Button>
        </div>
      </form>
    </div>
  )
}