'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Loader2, X } from 'lucide-react';
import { useCreateChatBot } from '@/hooks/api/useChatBots';

const NEXT_STEPS = [
  {
    title: 'Create the chatbot',
    text: 'It starts with a basic configuration you can change later.',
  },
  {
    title: 'Upload your documents',
    text: 'Add PDF, TXT or CSV files the assistant should learn from.',
  },
  {
    title: 'Build the knowledge base',
    text: 'We process your files so the assistant can search them.',
  },
  {
    title: 'Start chatting',
    text: 'Test it, then embed it on your website.',
  },
];

export default function CreateChatbotPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutateAsync, isPending } = useCreateChatBot();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      const res = await mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
      });
      if (res?.data?.id) {
        router.push(`/chatbots/${res.data.id}?tab=knowledge`);
      } else {
        // fallback: go to the list
        router.push('/chatbots');
      }
    } catch (error) {
      console.error('Failed to create chatbot:', error);
      setSubmitError(
        (error as { message?: string })?.message || 'Could not create the chatbot. Please try again.'
      );
    }
  };

  return (
    <div className="page-narrow">
      <Link href="/chatbots" className="btn btn-ghost btn-sm space-b-4">
        <ArrowLeft />
        Chatbots
      </Link>

      <header className="page-header">
        <div>
          <h1 className="page-title">Create a chatbot</h1>
          <p className="page-subtitle">
            Give it a name now. You&apos;ll add documents in the next step.
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="stack-lg">
        <div className="surface">
          <div className="surface-header">
            <h2 className="card-title">Basic information</h2>
          </div>

          <div className="stack pad-5">
            {submitError && (
              <div role="alert" className="callout callout-danger">
                <X className="space-t-0.5 ico t-danger" />
                <span className="t-danger">{submitError}</span>
              </div>
            )}

            <div className="field">
              <label htmlFor="name" className="label">Name</label>
              <input
                id="name"
                className="input"
                placeholder="e.g. Billing support"
                autoComplete="off"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                disabled={isPending}
              />
              <p className="field-hint">Your team sees this name. Customers don&apos;t.</p>
            </div>

            <div className="field">
              <label htmlFor="description" className="label">
                Description <span className="t-muted">(optional)</span>
              </label>
              <textarea
                id="description"
                className="textarea"
                placeholder="What should this assistant help with?"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="surface-footer">
            <Link href="/chatbots" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-brand" disabled={isPending || !formData.name.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="spin" />
                  Creating…
                </>
              ) : (
                <>
                  <Bot />
                  Create chatbot
                </>
              )}
            </button>
          </div>
        </div>

        {/* These really are sequential, so numbering is information here */}
        <section aria-labelledby="next-steps">
          <h2 id="next-steps" className="section-title space-b-3">What happens next</h2>
          <ol className="surface-muted stack pad-5">
            {NEXT_STEPS.map((step, i) => (
              <li key={step.title} className="row-start g-3">
                <span className="surface center ico-xl shape-round t-xs t-medium tabular">
                  {i + 1}
                </span>
                <div>
                  <p className="t-sm t-medium">{step.title}</p>
                  <p className="t-sm t-muted">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </form>
    </div>
  );
}