import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload, FileText, Presentation, FileType, StickyNote, Trash2,
  Flame, Target, TrendingUp, Sparkles, ArrowRight, BookOpen,
  Clock, Layers, BarChart3, Plus, MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDocs } from '@/lib/store';
import { uid, formatBytes, timeAgo } from '@/lib/helpers';
import type { UploadedDoc } from '@/lib/types';
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from '@/components/ui/chart';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const kindIcon = {
  pdf: FileText, ppt: Presentation, docx: FileType, notes: StickyNote,
};

const studyData = [
  { day: 'Mon', hours: 2.5 },
  { day: 'Tue', hours: 3.2 },
  { day: 'Wed', hours: 1.8 },
  { day: 'Thu', hours: 4.1 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 5.2 },
  { day: 'Sun', hours: 2.9 },
];

const chartConfig = {
  hours: { label: 'Study Hours', color: 'hsl(244 100% 71%)' },
};

export function DashboardPage() {
  const { docs, addDoc, removeDoc } = useDocs();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const kind: UploadedDoc['kind'] =
      ext === 'pdf' ? 'pdf' : ext === 'ppt' || ext === 'pptx' ? 'ppt' : ext === 'docx' ? 'docx' : 'notes';
    let content = '';
    if (kind === 'pdf') {
      content = await extractPdfText(file);
    } else if (kind === 'docx') {
      content = await extractDocxText(file);
    } else if (kind === 'ppt') {
      content = await extractPptText(file);
    } else {
      content = await file.text();
    }
    const doc: UploadedDoc = {
      id: uid('doc'),
      title: file.name.replace(/\.[^.]+$/, ''),
      kind,
      content: content || `Uploaded file: ${file.name}`,
      uploadedAt: Date.now(),
      size: file.size,
    };
    addDoc(doc);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const submitPaste = () => {
    if (!pasteText.trim()) return;
    const doc: UploadedDoc = {
      id: uid('doc'),
      title: pasteTitle.trim() || `Notes ${new Date().toLocaleDateString()}`,
      kind: 'notes',
      content: pasteText,
      uploadedAt: Date.now(),
      size: pasteText.length,
    };
    addDoc(doc);
    setPasteText('');
    setPasteTitle('');
    setPasteOpen(false);
  };

  const totalWords = docs.reduce((sum, d) => sum + d.content.split(/\s+/).length, 0);
  const streak = 7;
  const goal = 4;
  const goalProgress = Math.min(100, (3.2 / goal) * 100);

  return (
    <div className="pt-24 pb-12 mx-auto max-w-7xl px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold">
          Welcome back, <span className="text-gradient">Student</span>
        </h1>
        <p className="text-muted-foreground mt-1">Here's your study overview for today.</p>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Flame, label: 'Study Streak', value: `${streak} days`, color: 'from-highlight to-accent' },
          { icon: Target, label: "Today's Goal", value: `${3.2}/${goal} hrs`, color: 'from-primary to-secondary' },
          { icon: BookOpen, label: 'Documents', value: `${docs.length}`, color: 'from-accent to-primary' },
          { icon: TrendingUp, label: 'Words Studied', value: totalWords.toLocaleString(), color: 'from-success to-accent' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="glass-card border-white/10">
              <CardContent className="p-5">
                <div className={`grid place-items-center h-10 w-10 rounded-xl bg-gradient-to-br ${s.color} mb-3`}>
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <div className="font-display text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Upload Study Material
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
                  dragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-white/15 hover:border-primary/50 hover:bg-white/5'
                }`}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="grid place-items-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-accent mx-auto mb-4 glow-primary"
                >
                  <Upload className="h-8 w-8 text-white" />
                </motion.div>
                <p className="font-medium">Drag & drop your file here</p>
                <p className="text-sm text-muted-foreground mt-1">Supports PDF, PPT, DOCX, or text files</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.ppt,.pptx,.docx,.txt"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" className="glass border-white/15" onClick={() => setPasteOpen(true)}>
                  <StickyNote className="h-4 w-4 mr-1.5" />
                  Paste Notes
                </Button>
                {docs.length > 0 && (
                  <Button variant="ghost" onClick={() => navigate(`/study/${docs[0].id}`)}>
                    Open Last Document
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's goal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-card border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                Today's Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center my-4">
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(240 15% 18%)" strokeWidth="8" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none" stroke="url(#goalGrad)" strokeWidth="8" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - goalProgress / 100) }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                    <defs>
                      <linearGradient id="goalGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="hsl(244 100% 71%)" />
                        <stop offset="100%" stopColor="hsl(189 100% 50%)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <div className="font-display text-2xl font-bold">{Math.round(goalProgress)}%</div>
                      <div className="text-xs text-muted-foreground">complete</div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Study {goal} hours today to hit your goal!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Chart + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="glass-card border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Weekly Study Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[240px] w-full">
                <AreaChart data={studyData}>
                  <defs>
                    <linearGradient id="fillHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(244 100% 71%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(244 100% 71%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 15% 18%)" />
                  <XAxis dataKey="day" stroke="hsl(240 8% 65%)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(240 8% 65%)" fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="hours" stroke="hsl(244 100% 71%)" strokeWidth={2} fill="url(#fillHours)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass-card border-white/10 h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { icon: Layers, label: 'Generate Flashcards', to: docs[0] ? `/study/${docs[0].id}` : '/dashboard' },
                { icon: FileText, label: 'Create Summary', to: docs[0] ? `/study/${docs[0].id}` : '/dashboard' },
                { icon: Target, label: 'Take a Quiz', to: docs[0] ? `/study/${docs[0].id}` : '/dashboard' },
                { icon: MessageSquare, label: 'Ask AI Chat', to: '/chat' },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.to)}
                  className="w-full flex items-center gap-3 rounded-xl glass p-3 hover:bg-white/10 transition-colors text-left"
                >
                  <div className="grid place-items-center h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                    <a.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium flex-1">{a.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent uploads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Uploads
          </h2>
        </div>

        {docs.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Plus className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No documents yet. Upload your first study material to get started!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {docs.map((doc, i) => {
              const Icon = kindIcon[doc.kind];
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="glass-card rounded-2xl p-5 group cursor-pointer"
                  onClick={() => navigate(`/study/${doc.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="grid place-items-center h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeDoc(doc.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center h-8 w-8 rounded-lg hover:bg-destructive/20"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                  <h3 className="font-semibold truncate">{doc.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="uppercase">{doc.kind}</span>
                    <span>·</span>
                    <span>{formatBytes(doc.size)}</span>
                    <span>·</span>
                    <span>{timeAgo(doc.uploadedAt)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Paste modal */}
      <AnimatePresence>
        {pasteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setPasteOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card rounded-2xl p-6 w-full max-w-lg"
            >
              <h3 className="font-display text-xl font-bold mb-4">Paste Your Notes</h3>
              <input
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                placeholder="Title (optional)"
                className="w-full rounded-lg glass border-white/15 px-3 py-2 text-sm mb-3 bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste your notes here..."
                rows={8}
                className="w-full rounded-lg glass border-white/15 px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setPasteOpen(false)}>Cancel</Button>
                <Button className="btn-glow bg-gradient-to-r from-primary to-secondary text-white" onClick={submitPaste}>
                  <Sparkles className="h-4 w-4 mr-1.5" />
                  Add Notes
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

async function extractPdfText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = await parsePdfSimple(new Uint8Array(arrayBuffer));
    return text || `PDF document: ${file.name}. Upload complete — paste or add text notes to enable AI features.`;
  } catch {
    return `PDF document: ${file.name}. (Binary PDF — text extraction limited in browser.)`;
  }
}

async function parsePdfSimple(bytes: Uint8Array): Promise<string> {
  let text = '';
  const decoder = new TextDecoder('latin1');
  const raw = decoder.decode(bytes);
  const regex = /stream\r?\n([\s\S]*?)endstream/g;
  let match: RegExpExecArray | null;
  let count = 0;
  while ((match = regex.exec(raw)) !== null && count < 500) {
    let chunk = match[1];
    const tjMatch = chunk.match(/\(([^()]+)\)/g);
    if (tjMatch) {
      text += tjMatch.map((t) => t.slice(1, -1)).join(' ') + ' ';
    }
    const tjArrMatch = chunk.match(/\[([^\]]*)\]\s*TJ/g);
    if (tjArrMatch) {
      for (const arr of tjArrMatch) {
        const strs = arr.match(/\(([^)]*)\)/g);
        if (strs) text += strs.map((s) => s.slice(1, -1)).join(' ') + ' ';
      }
    }
    count++;
  }
  return text.replace(/\\[nrt]/g, ' ').replace(/[^\x20-\x7E\n]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function extractDocxText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = await parseDocxSimple(arrayBuffer);
    return text || `DOCX document: ${file.name}.`;
  } catch {
    return `DOCX document: ${file.name}.`;
  }
}

async function parseDocxSimple(buf: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buf);
  let text = '';
  const decoder = new TextDecoder('utf-8');
  const raw = decoder.decode(bytes);
  const tagRegex = /<w:t[^>]*>([^<]+)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = tagRegex.exec(raw)) !== null) {
    text += m[1] + ' ';
  }
  return text.trim();
}

async function extractPptText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const text = await parsePptxSimple(arrayBuffer);
    return text || `Presentation: ${file.name}.`;
  } catch {
    return `Presentation: ${file.name}.`;
  }
}

async function parsePptxSimple(buf: ArrayBuffer): Promise<string> {
  const bytes = new Uint8Array(buf);
  const decoder = new TextDecoder('utf-8');
  const raw = decoder.decode(bytes);
  const tagRegex = /<a:t[^>]*>([^<]+)<\/a:t>/g;
  let m: RegExpExecArray | null;
  let text = '';
  while ((m = tagRegex.exec(raw)) !== null) {
    text += m[1] + ' ';
  }
  return text.trim();
}
