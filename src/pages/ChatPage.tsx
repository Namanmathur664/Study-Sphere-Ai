import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, Trash2, RefreshCw, Brain, User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocs } from '@/lib/store';
import { uid } from '@/lib/helpers';
import type { ChatMessage } from '@/lib/types';
import { MarkdownContent, CopyButton } from '@/components/Markdown';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';

const suggestedPrompts = [
  'Summarize this document in 5 bullet points',
  'What are the key concepts I should focus on?',
  'Generate 5 quiz questions from this material',
  'Explain the most difficult concept simply',
  'Create a study plan for this material',
];

const generalKnowledge = (question: string): string => {
  const q = question.toLowerCase();
  if (/hello|hi|hey/.test(q)) {
    return "Hello! I'm your StudySphere AI assistant. Upload a document from the dashboard and select it here, or ask me a general study question!";
  }
  if (/study tip|how to study|study advice/.test(q)) {
    return "Here are some proven study tips:\n\n- **Active recall**: Test yourself instead of re-reading\n- **Spaced repetition**: Review material at increasing intervals\n- **Pomodoro technique**: Study 25 min, break 5 min\n- **Teach others**: Explaining concepts reinforces learning\n- **Sleep well**: Memory consolidates during sleep";
  }
  if (/flashcard|flash card/.test(q)) {
    return "Flashcards work best when:\n- Each card covers **one concept**\n- The front asks a clear question\n- The back gives a concise answer\n- You review them **regularly** with spaced repetition";
  }
  return "I can help you with that! For document-specific answers, upload a file from the **Dashboard** and select it from the dropdown above. I'll then analyze the content and give you precise answers grounded in your material.";
};

export function ChatPage() {
  const { docs } = useDocs();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string>(docs[0]?.id ?? '');
  const [streamContent, setStreamContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const streamTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!selectedDocId && docs[0]) setSelectedDocId(docs[0].id);
  }, [docs, selectedDocId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, streamContent]);

  const selectedDoc = docs.find((d) => d.id === selectedDocId);

  const send = (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = {
      id: uid('msg'), role: 'user', content: text, createdAt: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setStreaming(true);
    setStreamContent('');

    const answer = selectedDoc
      ? buildDocAnswer(selectedDoc.content, text)
      : generalKnowledge(text);

    const tokens = answer.match(/\S+\s*/g) ?? [answer];
    let i = 0;
    streamTimer.current = setInterval(() => {
      if (i >= tokens.length) {
        if (streamTimer.current) clearInterval(streamTimer.current);
        setMessages((m) => [
          ...m,
          { id: uid('msg'), role: 'assistant', content: answer, createdAt: Date.now() },
        ]);
        setStreamContent('');
        setStreaming(false);
        return;
      }
      setStreamContent((c) => c + tokens[i]);
      i++;
    }, 24);
  };

  const regenerate = () => {
    if (streaming || !messages.length) return;
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    setMessages((m) => m.slice(0, m.length - 1));
    send(lastUser.content);
  };

  const clearChat = () => {
    if (streaming) return;
    setMessages([]);
    setStreamContent('');
  };

  return (
    <div className="pt-24 pb-8 h-screen flex flex-col">
      <div className="mx-auto max-w-4xl w-full px-4 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between gap-3 mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent glow-primary">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">AI Chat</h1>
              <p className="text-xs text-muted-foreground">
                {selectedDoc ? `Chatting with: ${selectedDoc.title}` : 'General study assistant'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {docs.length > 0 && (
              <Select value={selectedDocId} onValueChange={setSelectedDocId}>
                <SelectTrigger className="w-[180px] glass border-white/15 h-9">
                  <SelectValue placeholder="Select document" />
                </SelectTrigger>
                <SelectContent>
                  {docs.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button variant="outline" size="icon" className="glass border-white/15" onClick={clearChat} disabled={streaming}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto rounded-2xl glass border border-white/10 p-4 space-y-4">
          {messages.length === 0 && !streaming && (
            <div className="h-full grid place-items-center text-center py-10">
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-4 glow-primary">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">How can I help you study?</h2>
                <p className="text-muted-foreground text-sm mb-6 max-w-md">
                  {selectedDoc
                    ? `Ask me anything about "${selectedDoc.title}" — I'll answer based on its content.`
                    : 'Ask a general question, or upload a document from the dashboard for document-specific answers.'}
                </p>
                <div className="grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                  {suggestedPrompts.map((p) => (
                    <button
                      key={p}
                      onClick={() => send(p)}
                      className="text-left text-sm rounded-xl glass p-3 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                )}
                <div
                  className={`group relative max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-secondary text-white'
                      : 'glass border border-white/10'
                  }`}
                >
                  {m.role === 'assistant' ? <MarkdownContent content={m.content} /> : <p className="text-sm">{m.content}</p>}
                  {m.role === 'assistant' && (
                    <div className="absolute -bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="glass rounded-md flex">
                        <CopyButton text={m.content} />
                        <button onClick={regenerate} className="grid place-items-center h-7 w-7 hover:bg-white/10 text-muted-foreground" aria-label="Regenerate">
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="grid place-items-center h-8 w-8 rounded-lg bg-white/10 shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {streaming && (
            <div className="flex gap-3">
              <div className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent shrink-0">
                <Sparkles className="h-4 w-4 text-white animate-pulse" />
              </div>
              <div className="glass rounded-2xl px-4 py-3 border border-white/10">
                {streamContent ? (
                  <MarkdownContent content={streamContent} />
                ) : (
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-4">
          <div className="flex items-end gap-2 rounded-2xl glass border border-white/10 p-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); } }}
              placeholder="Ask anything about your study material..."
              rows={1}
              className="flex-1 bg-transparent resize-none px-3 py-2 text-sm focus:outline-none max-h-32"
            />
            <Button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="btn-glow bg-gradient-to-r from-primary to-secondary text-white h-10 w-10 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            StudySphere AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  );
}

function buildDocAnswer(content: string, question: string): string {
  const q = question.toLowerCase();
  if (/summar/.test(q)) {
    return "Here's a summary of the key points from your material:\n\n" +
      extractKeyPoints(content, 5).map((p, i) => `${i + 1}. ${p}`).join('\n');
  }
  if (/quiz|question/.test(q)) {
    return "Here are 5 quiz questions based on your material:\n\n" +
      extractKeyPoints(content, 5).map((p, i) => `**Q${i + 1}:** ${p.replace(/[.]+$/, '')}?`).join('\n\n');
  }
  if (/study plan|roadmap/.test(q)) {
    return "I've created a study plan:\n\n**Day 1:** Read and highlight key sections\n**Day 2:** Review flashcards and notes\n**Day 3:** Take practice quizzes\n**Day 4:** Focus on weak areas\n**Day 5:** Final review and self-test";
  }
  // Default: find most relevant sentences
  return findRelevant(content, question);
}

function extractKeyPoints(text: string, n: number): string[] {
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 20);
  return sentences.slice(0, n);
}

function findRelevant(text: string, question: string): string {
  const qWords = question.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.length > 15);
  const scored = sentences.map((s) => {
    const sl = s.toLowerCase();
    const score = qWords.reduce((sum, w) => sum + (sl.includes(w) ? 1 : 0), 0);
    return { s, score };
  });
  const top = scored.sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.s);
  if (top.length === 0) return "I couldn't find a specific answer in your material. Try rephrasing or uploading more content.";
  return `Based on your material:\n\n${top.join('\n\n')}`;
}
