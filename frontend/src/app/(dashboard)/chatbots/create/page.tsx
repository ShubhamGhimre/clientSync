'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Bot, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  PageContainer,
  PageHeader,
  SecondaryActionButton,
} from '@/components/page-kits';
import { TableShell, TableToolbar } from '@/components/tables/table-kits';
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

const fieldInputClass =
  'h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/80 hover:border-foreground/20 focus:border-primary focus:ring-[3px] focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50';

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
        router.push('/chatbots');
      }
    } catch (error) {
      console.error('Failed to create chatbot:', error);
      setSubmitError(
        (error as { message?: string })?.message ||
          'Could not create the chatbot. Please try again.'
      );
    }
  };

  return (
    <PageContainer className="mx-auto max-w-3xl">
      <PageHeader
        title="Create a chatbot"
        description="Give it a name now. You'll add documents in the next step."
        actions={
          <SecondaryActionButton href="/chatbots" icon={ArrowLeft}>
            Chatbots
          </SecondaryActionButton>
        }
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <TableShell>
          <TableToolbar>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Basic information
            </h2>
          </TableToolbar>

          <div className="flex flex-col gap-5 p-5 sm:p-6">
            {submitError && (
              <Alert
                variant="destructive"
                className="rounded-2xl border-destructive/25 bg-destructive/10"
              >
                <AlertCircle className="size-4 shrink-0" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-[13px] font-semibold text-foreground"
              >
                Name
              </label>
              <input
                id="name"
                className={fieldInputClass}
                placeholder="e.g. Billing support"
                autoComplete="off"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                disabled={isPending}
              />
              <p className="text-xs text-muted-foreground">
                Your team sees this name. Customers don&apos;t.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="description"
                className="text-[13px] font-semibold text-foreground"
              >
                Description{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <textarea
                id="description"
                className="w-full rounded-xl border border-input bg-background p-3.5 text-sm text-foreground shadow-xs outline-none transition-all placeholder:text-muted-foreground/80 hover:border-foreground/20 focus:border-primary focus:ring-[3px] focus:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="What should this assistant help with?"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border/50 px-5 py-3">
            <SecondaryActionButton href="/chatbots">Cancel</SecondaryActionButton>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending || !formData.name.trim()}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating…</span>
                </>
              ) : (
                <>
                  <Bot className="size-4" />
                  <span>Create chatbot</span>
                </>
              )}
            </button>
          </div>
        </TableShell>

        <section aria-labelledby="next-steps" className="flex flex-col gap-3">
          <h2
            id="next-steps"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            What happens next
          </h2>
          <TableShell className="p-5">
            <ol className="flex flex-col gap-3.5">
              {NEXT_STEPS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-3.5">
                  <span className="tabular mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/10 text-xs font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {step.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </TableShell>
        </section>
      </form>
    </PageContainer>
  );
}
