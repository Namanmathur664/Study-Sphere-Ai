import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, FileText, Layers, ListChecks, StickyNote, MessageSquare,
  Download, Sparkles, ChevronLeft, RotateCw, Check, X, Send,
  Map, HelpCircle, Lightbulb, Target, Network,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDocs } from '@/lib/store';
import {
  generateSummary, generateFlashcards, generateQuiz,
  generateImportantQuestions, generateInterviewQuestions,
  generateStudyPlan, explainConcepts, generateMindMap, answerQuestion,
  exportNotes,
} from '@/lib/ai';
import { downloadFile, uid } from '@/lib/helpers';
import type { Flashcard, QuizQuestion } from '@/lib/types';

type Tab = 'summary' | 'flashcards' | 'quiz' | 'notes' | 'chat' | 'plan' | 'concepts' | 'mindmap' | 'questions';

const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Quiz', icon: ListChecks },
  { id: 'concepts', label: 'Concepts', icon: Lightbulb },
  { id: 'questions', label: 'Questions', icon: HelpCircle },
  { id: 'plan', label: 'Study Plan', icon: Map },
  { id: 'mindmap', label: 'Mind Map', icon: Network },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
];

export function StudyWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDoc } = useDocs();
  const doc = id ? getDoc(id) : undefined;

  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ id: string; role: 'user' | 'assistant'; content: string }[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!doc) return;
    setLoading(true);
    const t = setTimeout(() => {
      setFlashcards(generateFlashcards(doc.content, 8));
      setQuiz(generateQuiz(doc.content, 5));
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, [doc?.id]);

  const summary = useMemo(() => (doc ? generateSummary(doc.content) : null), [doc]);
  const concepts = useMemo(() => (doc ? explainConcepts(doc.content, 6) : []), [doc]);
  const importantQs = useMemo(() => (doc ? generateImportantQuestions(doc.content, 6) : []), [doc]);
  const interviewQs = useMemo(() => (doc ? generateInterviewQuestions(doc.content, 6) : []), [doc]);
  const plan = useMemo(() => (doc ? generateStudyPlan(doc.content, 5) : null), [doc]);
  const mindmap = useMemo(() => (doc ? generateMindMap(doc.content) : null), [doc]);

  if (!doc) {
    return (
      <div className="pt-32 text-center">
        <p className="text-muted-foreground">Document not found.</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const flipCard = (cardId: string) => {
    setFlipped((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) next.delete(cardId);
      else next.add(cardId);
      return next;
    });
  };

  const submitQuiz = () => setQuizSubmitted(true);
  const resetQuiz = () => { setQuizAnswers({}); setQuizSubmitted(false); };

  const quizScore = quiz.filter((q) => quizAnswers[q.id] === q.answerIndex).length;

  const sendChat = (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg = { id: uid('m'), role: 'user' as const, content: text };
    setChatMessages((m) => [...m, userMsg]);
    setChatInput('');
    setStreaming(true);
    setStreamText('');
    const answer = answerQuestion(doc.content, text);
    const tokens = answer.match(/\S+\s*/g) ?? [answer];
    let i = 0;
    const timer = setInterval(() => {
      if (i >= tokens.length) {
        clearInterval(timer);
        setChatMessages((m) => [...m, { id: uid('m'), role: 'assistant', content: answer }]);
        setStreamText('');
        setStreaming(false);
        return;
      }
      setStreamText((s) => s + tokens[i]);
      i++;
    }, 24);
  };

  const handleExport = () => {
    downloadFile(`${doc.title.replace(/\s+/g, '_')}_notes.md`, exportNotes(doc));
  };

  return (
    <div className="pt-24 pb-8 mx-auto max-w-7xl px-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3">
          <ChevronLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-11 w-11 rounded-xl bg-gradient-to-br from-primary to-accent">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold truncate max-w-xs sm:max-w-md">{doc.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="secondary" className="uppercase text-xs">{doc.kind}</Badge>
                {summary && (
                  <Badge variant="outline" className="border-white/15 text-xs">{summary.difficulty}</Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" className="glass border-white/15" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1.5" />
            Export Notes
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Document viewer */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 lg:sticky lg:top-24 lg:self-start"
        >
          <Card className="glass-card border-white/10 h-[70vh] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-primary" />
                Document Content
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="whitespace-pre-wrap text-sm text-foreground/80 leading-relaxed">
                {doc.content}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Panels */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3"
        >
          {/* Tab bar */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-3">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                  activeTab === t.id ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {activeTab === t.id && (
                  <motion.span
                    layoutId="tab-active"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-white/10"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <t.icon className="h-3.5 w-3.5" />
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          <Card className="glass-card border-white/10 min-h-[60vh]">
            <CardContent className="p-6">
              {loading && activeTab !== 'chat' && activeTab !== 'notes' ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="shimmer h-4 rounded bg-white/5" style={{ width: `${80 - i * 10}%` }} />
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {activeTab === 'summary' && summary && <SummaryPanel summary={summary} />}
                    {activeTab === 'flashcards' && (
                      <FlashcardsPanel cards={flashcards} flipped={flipped} onFlip={flipCard} />
                    )}
                    {activeTab === 'quiz' && (
                      <QuizPanel
                        quiz={quiz}
                        answers={quizAnswers}
                        setAnswers={setQuizAnswers}
                        submitted={quizSubmitted}
                        onSubmit={submitQuiz}
                        onReset={resetQuiz}
                        score={quizScore}
                      />
                    )}
                    {activeTab === 'concepts' && <ConceptsPanel concepts={concepts} />}
                    {activeTab === 'questions' && (
                      <QuestionsPanel important={importantQs} interview={interviewQs} />
                    )}
                    {activeTab === 'plan' && plan && <PlanPanel plan={plan} />}
                    {activeTab === 'mindmap' && mindmap && <MindMapPanel mindmap={mindmap} />}
                    {activeTab === 'notes' && (
                      <NotesPanel notes={notes} setNotes={setNotes} onExport={handleExport} />
                    )}
                    {activeTab === 'chat' && (
                      <ChatPanel
                        messages={chatMessages}
                        input={chatInput}
                        setInput={setChatInput}
                        onSend={sendChat}
                        streaming={streaming}
                        streamText={streamText}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ComponentType<{ className?: string }>; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h2 className="font-display text-lg font-bold">{title}</h2>
    </div>
  );
}

function SummaryPanel({ summary }: { summary: NonNullable<ReturnType<typeof generateSummary>> }) {
  return (
    <div>
      <SectionTitle icon={Sparkles} title="AI Summary" />
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="secondary">{summary.difficulty}</Badge>
        <Badge variant="outline" className="border-white/15">{summary.estimatedTime}</Badge>
      </div>
      <p className="text-sm leading-relaxed text-foreground/90 mb-5">{summary.overview}</p>

      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
        <Target className="h-4 w-4 text-accent" /> Key Points
      </h3>
      <ul className="space-y-2 mb-5">
        {summary.keyPoints.map((p, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-2 text-sm text-foreground/80"
          >
            <span className="text-primary font-bold">{i + 1}.</span>
            {p}
          </motion.li>
        ))}
      </ul>

      {summary.formulas.length > 0 && (
        <>
          <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-highlight" /> Important Formulas
          </h3>
          <div className="space-y-2">
            {summary.formulas.map((f, i) => (
              <div key={i} className="glass rounded-lg p-3 font-mono text-sm">{f}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FlashcardsPanel({ cards, flipped, onFlip }: {
  cards: Flashcard[]; flipped: Set<string>; onFlip: (id: string) => void;
}) {
  if (!cards.length) return <p className="text-muted-foreground text-sm">No flashcards could be generated. Try adding more content.</p>;
  return (
    <div>
      <SectionTitle icon={Layers} title="Flashcards" />
      <p className="text-xs text-muted-foreground mb-4">Click a card to flip it. {cards.length} cards generated.</p>
      <div className="grid sm:grid-cols-2 gap-3">
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            onClick={() => onFlip(card.id)}
            className="relative h-40 rounded-2xl glass border border-white/10 p-4 text-left overflow-hidden"
            style={{ perspective: 1000 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={flipped.has(card.id) ? 'back' : 'front'}
                initial={{ opacity: 0, rotateY: 90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: -90 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col justify-center"
              >
                <div className="text-xs text-muted-foreground mb-2 uppercase">
                  {flipped.has(card.id) ? 'Answer' : 'Question'}
                </div>
                <div className="text-sm font-medium leading-relaxed">
                  {flipped.has(card.id) ? card.back : card.front}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

function QuizPanel({ quiz, answers, setAnswers, submitted, onSubmit, onReset, score }: {
  quiz: QuizQuestion[];
  answers: Record<string, number>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  submitted: boolean;
  onSubmit: () => void;
  onReset: () => void;
  score: number;
}) {
  if (!quiz.length) return <p className="text-muted-foreground text-sm">No quiz questions could be generated.</p>;
  return (
    <div>
      <SectionTitle icon={ListChecks} title="Quiz" />
      {submitted && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-xl p-4 mb-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-accent" />
            <span className="font-semibold">Score: {score}/{quiz.length}</span>
          </div>
          <Button variant="outline" size="sm" className="glass border-white/15" onClick={onReset}>
            <RotateCw className="h-3.5 w-3.5 mr-1" /> Retry
          </Button>
        </motion.div>
      )}
      <div className="space-y-5">
        {quiz.map((q, qi) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qi * 0.05 }}
            className="glass rounded-xl p-4"
          >
            <p className="font-medium text-sm mb-3">{qi + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                const correct = q.answerIndex === oi;
                let cls = 'glass border-white/10 hover:bg-white/10';
                if (submitted) {
                  if (correct) cls = 'border-success/50 bg-success/10';
                  else if (selected && !correct) cls = 'border-destructive/50 bg-destructive/10';
                  else cls = 'border-white/5 opacity-60';
                } else if (selected) {
                  cls = 'border-primary bg-primary/10';
                }
                return (
                  <button
                    key={oi}
                    disabled={submitted}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                    className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-all flex items-center justify-between ${cls}`}
                  >
                    <span>{opt}</span>
                    {submitted && correct && <Check className="h-4 w-4 text-success" />}
                    {submitted && selected && !correct && <X className="h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="text-xs text-muted-foreground mt-2 italic">{q.explanation}</p>
            )}
          </motion.div>
        ))}
      </div>
      {!submitted && (
        <Button className="mt-5 btn-glow bg-gradient-to-r from-primary to-secondary text-white" onClick={onSubmit}>
          Submit Quiz
        </Button>
      )}
    </div>
  );
}

function ConceptsPanel({ concepts }: { concepts: { term: string; explanation: string }[] }) {
  return (
    <div>
      <SectionTitle icon={Lightbulb} title="Concept Explanations" />
      <div className="space-y-3">
        {concepts.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4"
          >
            <h3 className="font-semibold text-sm text-primary mb-1">{c.term}</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{c.explanation}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function QuestionsPanel({ important, interview }: { important: string[]; interview: string[] }) {
  return (
    <div>
      <SectionTitle icon={HelpCircle} title="Questions" />
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
        <Target className="h-4 w-4 text-accent" /> Important Questions
      </h3>
      <ol className="space-y-2 mb-6 list-decimal list-inside">
        {important.map((q, i) => (
          <li key={i} className="text-sm text-foreground/80">{q}</li>
        ))}
      </ol>
      <h3 className="font-semibold text-sm mb-2 flex items-center gap-1.5">
        <MessageSquare className="h-4 w-4 text-highlight" /> Interview Questions
      </h3>
      <ol className="space-y-2 list-decimal list-inside">
        {interview.map((q, i) => (
          <li key={i} className="text-sm text-foreground/80">{q}</li>
        ))}
      </ol>
    </div>
  );
}

function PlanPanel({ plan }: { plan: NonNullable<ReturnType<typeof generateStudyPlan>> }) {
  return (
    <div>
      <SectionTitle icon={Map} title="Study Plan" />
      <p className="text-sm text-muted-foreground mb-4 italic">{plan.goal}</p>
      <div className="space-y-3">
        {plan.days.map((d, i) => (
          <motion.div
            key={d.day}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="grid place-items-center h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-accent text-white text-xs font-bold">
                {d.day}
              </div>
              <h3 className="font-semibold text-sm">{d.title}</h3>
            </div>
            <ul className="space-y-1 ml-9">
              {d.tasks.map((t, ti) => (
                <li key={ti} className="text-xs text-foreground/70 flex gap-2">
                  <Check className="h-3 w-3 text-success shrink-0 mt-0.5" />
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function MindMapPanel({ mindmap }: { mindmap: { root: string; branches: { label: string; children: string[] }[] } }) {
  return (
    <div>
      <SectionTitle icon={Network} title="Mind Map" />
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="grid place-items-center h-16 px-6 rounded-2xl bg-gradient-to-br from-primary to-accent text-white font-bold glow-primary mb-8"
        >
          {mindmap.root}
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {mindmap.branches.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl p-4"
            >
              <h3 className="font-semibold text-sm text-accent mb-2 text-center">{b.label}</h3>
              <div className="space-y-1.5">
                {b.children.map((c, ci) => (
                  <div key={ci} className="text-xs text-muted-foreground glass rounded-md px-2 py-1 text-center">{c}</div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotesPanel({ notes, setNotes, onExport }: {
  notes: string; setNotes: (v: string) => void; onExport: () => void;
}) {
  return (
    <div>
      <SectionTitle icon={StickyNote} title="My Notes" />
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Write your own notes here..."
        rows={14}
        className="w-full rounded-xl glass border-white/15 p-4 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />
      <Button className="mt-3 btn-glow bg-gradient-to-r from-primary to-secondary text-white" onClick={onExport}>
        <Download className="h-4 w-4 mr-1.5" />
        Export All Notes
      </Button>
    </div>
  );
}

function ChatPanel({ messages, input, setInput, onSend, streaming, streamText }: {
  messages: { id: string; role: 'user' | 'assistant'; content: string }[];
  input: string;
  setInput: (v: string) => void;
  onSend: (text: string) => void;
  streaming: boolean;
  streamText: string;
}) {
  return (
    <div className="flex flex-col h-[55vh]">
      <SectionTitle icon={MessageSquare} title="Chat with Document" />
      <div className="flex-1 overflow-y-auto space-y-3 mb-3 glass rounded-xl p-3 border border-white/10">
        {messages.length === 0 && !streaming && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Ask any question about this document...
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.role === 'user' ? 'bg-gradient-to-br from-primary to-secondary text-white' : 'glass border border-white/10'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {streaming && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl px-3 py-2 text-sm border border-white/10">
              {streamText || (
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.span key={i} className="h-2 w-2 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSend(input); }}
          placeholder="Ask about this document..."
          className="flex-1 rounded-xl glass border-white/15 px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <Button
          onClick={() => onSend(input)}
          disabled={!input.trim() || streaming}
          className="btn-glow bg-gradient-to-r from-primary to-secondary text-white h-10 w-10 p-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
