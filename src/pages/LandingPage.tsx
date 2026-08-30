import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles, FileText, Presentation, FileType, StickyNote, Brain,
  ListChecks, Layers, HelpCircle, MessageSquare, Map, Download,
  ArrowRight, Zap, Target, TrendingUp, Quote, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui/accordion';

const features = [
  { icon: FileText, title: 'Upload PDF', desc: 'Drop in any PDF and let AI extract the key insights instantly.' },
  { icon: Presentation, title: 'Upload PPT', desc: 'Turn dense slide decks into concise study notes.' },
  { icon: FileType, title: 'Upload DOCX', desc: 'Import Word documents and transform them into study material.' },
  { icon: StickyNote, title: 'Paste Notes', desc: 'Paste raw notes and get structured summaries in seconds.' },
  { icon: Brain, title: 'AI Summary', desc: 'Generate intelligent summaries that capture the essence.' },
  { icon: Sparkles, title: 'Explain Concepts', desc: 'Break down difficult concepts into simple explanations.' },
  { icon: ListChecks, title: 'Generate Quiz', desc: 'Auto-create quizzes to test your understanding.' },
  { icon: Layers, title: 'Flashcards', desc: 'Spaced-repetition ready flashcards from any material.' },
  { icon: HelpCircle, title: 'Important Questions', desc: 'Surface the questions most likely to appear on exams.' },
  { icon: MessageSquare, title: 'Interview Questions', desc: 'Prepare for interviews with AI-generated questions.' },
  { icon: Map, title: 'Study Plan', desc: 'Get a personalized day-by-day study roadmap.' },
  { icon: Download, title: 'Export Notes', desc: 'Download your AI-generated notes as Markdown.' },
];

const stats = [
  { value: '50K+', label: 'Students Learning', icon: TrendingUp },
  { value: '1M+', label: 'Documents Analyzed', icon: FileText },
  { value: '98%', label: 'Accuracy Rate', icon: Target },
  { value: '4.9/5', label: 'User Rating', icon: Sparkles },
];

const testimonials = [
  {
    name: 'Aisha Patel', role: 'CS Student, MIT', text: 'StudySphere AI completely changed how I revise. The flashcards and quizzes it generates are scary accurate. I aced my algorithms exam thanks to it.',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=120',
  },
  {
    name: 'Marcus Chen', role: 'Med Student, Johns Hopkins', text: 'The study plan feature is a lifesaver. It broke down my massive anatomy textbook into a manageable 5-day roadmap. Absolute game changer.',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=120',
  },
  {
    name: 'Sofia Rodriguez', role: 'Law Student, Oxford', text: 'I paste my case notes and get instant summaries and important questions. It feels like having a personal tutor available 24/7.',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=120',
  },
];

const faqs = [
  { q: 'What file types does StudySphere AI support?', a: 'You can upload PDF, PPT, and DOCX files, or simply paste your notes as plain text. The AI engine processes any text-based content instantly.' },
  { q: 'How does the AI generate quizzes and flashcards?', a: 'Our AI analyzes your document, extracts key concepts and definitions, then generates quiz questions with multiple-choice answers and flashcards with front/back pairs — all automatically.' },
  { q: 'Is my data private and secure?', a: 'Yes. All your documents are stored locally in your browser. Nothing is sent to external servers. Your study material remains completely private to you.' },
  { q: 'Can I chat with my uploaded documents?', a: 'Absolutely. The AI Chat feature lets you ask questions about your uploaded material and get answers grounded in the content, with a ChatGPT-like streaming experience.' },
  { q: 'Does it work on mobile?', a: 'Yes! StudySphere AI is fully responsive and works beautifully on desktop, tablet, and mobile devices.' },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function LandingPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
          </span>
          Powered by Advanced AI
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]"
        >
          Study Smarter
          <br />
          <span className="text-gradient">with AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Upload your notes, PDFs, and slides. Get instant AI summaries,
          quizzes, flashcards, and a personalized study plan — all in one
          beautiful workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/dashboard">
            <Button size="lg" className="btn-glow bg-gradient-to-r from-primary to-secondary text-white text-base h-12 px-8">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Learning Free
            </Button>
          </Link>
          <Link to="/chat">
            <Button size="lg" variant="outline" className="text-base h-12 px-8 glass border-white/15">
              <MessageSquare className="h-5 w-5 mr-2" />
              Try AI Chat
            </Button>
          </Link>
        </motion.div>

        {/* Floating AI illustration */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative mt-16 mx-auto max-w-4xl"
        >
          <div className="relative glass-card rounded-3xl p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
            <div className="relative grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Brain, label: 'Analyzing', color: 'from-primary to-secondary' },
                { icon: ListChecks, label: 'Quiz Ready', color: 'from-accent to-primary' },
                { icon: Layers, label: '12 Flashcards', color: 'from-highlight to-accent' },
                { icon: Map, label: 'Study Plan', color: 'from-success to-accent' },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                  className="glass rounded-2xl p-4 flex flex-col items-center gap-2"
                >
                  <div className={`grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                </motion.div>
              ))}
            </div>
            <div className="relative mt-6 glass rounded-2xl p-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="grid place-items-center h-7 w-7 rounded-lg bg-gradient-to-br from-primary to-accent">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2, delay: 0.8 }}
                className="overflow-hidden whitespace-nowrap text-sm text-muted-foreground"
              >
                "I've summarized your document and generated 8 flashcards and a 5-question quiz. Ready to study?"
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={item} className="glass-card rounded-2xl p-6 text-center">
              <s.icon className="h-6 w-6 mx-auto mb-3 text-accent" />
              <div className="font-display text-3xl font-bold text-gradient">{s.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Everything you need to <span className="text-gradient">ace your exams</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Twelve powerful AI features, one unified workspace. Built for students who want to learn smarter, not harder.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-card rounded-2xl p-6 group cursor-default"
            >
              <div className="grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 mb-4 group-hover:from-primary group-hover:to-accent transition-all duration-300">
                <f.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-semibold text-lg mb-1.5">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold">
            Loved by <span className="text-gradient">students worldwide</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card rounded-2xl p-6"
            >
              <Quote className="h-8 w-8 text-primary/40 mb-3" />
              <p className="text-sm leading-relaxed text-foreground/90">{t.text}</p>
              <div className="mt-5 flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="font-medium text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="font-display text-4xl font-bold">Frequently Asked Questions</h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl px-5"
            >
              <AccordionItem value={`item-${i}`} className="border-b-0">
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative glass-card rounded-3xl p-12 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20" />
          <div className="relative">
            <Zap className="h-12 w-12 mx-auto text-accent mb-4" />
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Ready to study smarter?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Join thousands of students using StudySphere AI to learn faster and retain more.
            </p>
            <Link to="/dashboard" className="inline-block mt-8">
              <Button size="lg" className="btn-glow bg-gradient-to-r from-primary to-secondary text-white text-base h-12 px-8">
                Get Started Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
