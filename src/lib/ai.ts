import type {
  Concept,
  Flashcard,
  QuizQuestion,
  StudyPlan,
  Summary,
} from './types';

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
  'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who',
  'when', 'where', 'why', 'how', 'all', 'each', 'every', 'some', 'any', 'few',
  'more', 'most', 'other', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'between', 'under', 'over', 'again', 'further',
  'then', 'once', 'here', 'there', 'as', 'if', 'because', 'while', 'also',
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, ' ')
    .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
    ?.map((s) => s.trim())
    .filter(Boolean) ?? [];
}

function rankSentences(text: string, topN: number): string[] {
  const sentences = splitSentences(text);
  if (sentences.length <= topN) return sentences;

  const freq = new Map<string, number>();
  for (const w of tokenize(text)) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }

  const scored = sentences.map((s, i) => {
    const words = tokenize(s);
    if (!words.length) return { s, score: 0, i };
    let score = words.reduce((sum, w) => sum + (freq.get(w) ?? 0), 0) / Math.sqrt(words.length);
    if (i === 0) score *= 1.25;
    if (/\b(important|key|main|therefore|thus|however|because|define|means|conclusion)\b/i.test(s)) score *= 1.15;
    return { s, score, i };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .sort((a, b) => a.i - b.i)
    .map((x) => x.s);
}

function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function generateSummary(text: string): Summary {
  const top = rankSentences(text, 4);
  const overview =
    top.length > 0
      ? top.join(' ')
      : 'No content available to summarize.';

  const keySentences = rankSentences(text, 6);
  const keyPoints = keySentences.map((s) =>
    s.length > 140 ? s.slice(0, 137) + '...' : s
  );

  const formulas = extractFormulas(text);

  const wordCount = tokenize(text).length;
  const difficulty: Summary['difficulty'] =
    wordCount < 200 ? 'Beginner' : wordCount < 600 ? 'Intermediate' : 'Advanced';
  const estimatedTime = `${Math.max(3, Math.round(wordCount / 200))} min read`;

  return { overview, keyPoints, formulas, difficulty, estimatedTime };
}

function extractFormulas(text: string): string[] {
  const patterns = [
    /[A-Za-z]+\s*=\s*[^.\n]{2,80}/g,
    /[A-Za-z]+\s*∝\s*[^.\n]{2,60}/g,
    /\bF\s*=\s*ma\b/gi,
    /\bE\s*=\s*mc\^?2\b/gi,
  /\b[A-Z][a-zA-Z]*\s*=\s*[^.\n]{2,80}/g,
  /\b[A-Za-z][a-zA-Z]*\([^)]*\)\s*=\s*[^.\n]{2,80}/g,
  /[A-Za-z]+\s*=\s*[^.\n]{2,80}/g,
  /[^.\n]*[=≈≤≥≠][^.\n]{2,80}/g,
  /[A-Za-z][a-zA-Z]*\s*=\s*[^.\n]{2,80}/g,
  /[A-Z][a-zA-Z]*\s*=\s*[^.\n]{2,80}/g,
    /[A-Za-z]+\s*=\s*[^.\n]{2,80}/g,
  ];
  const found = new Set<string>();
  for (const p of patterns) {
    const matches = text.match(p) ?? [];
    for (const m of matches) {
      const clean = m.trim().replace(/\s+/g, ' ');
      if (clean.length >= 5 && clean.length <= 90 && found.size < 6) {
        found.add(clean);
      }
    }
  }
  return Array.from(found);
}

export function generateFlashcards(text: string, count = 8): Flashcard[] {
  const sentences = splitSentences(text);
  const cards: Flashcard[] = [];

  for (const s of sentences) {
    if (cards.length >= count) break;
    const def = s.match(/(.{5,60}?)\s+(?:is|are|refers to|means|is defined as|is called)\s+(.{10,140})/i);
    if (def) {
      cards.push({
        id: uid('fc'),
        front: `What ${def[1].trim()}?`,
        back: def[2].trim().replace(/[.;]+$/, '') + '.',
      });
      continue;
    }
    const colon = s.match(/(.{5,60}):\s+(.{10,140})/);
    if (colon) {
      cards.push({
        id: uid('fc'),
        front: colon[1].trim(),
        back: colon[2].trim(),
      });
    }
  }

  const topWords = topKeywords(text, count * 2);
  let wi = 0;
  while (cards.length < count && wi < topWords.length) {
    const w = topWords[wi++];
    const ctx = sentences.find((s) => s.toLowerCase().includes(w));
    cards.push({
      id: uid('fc'),
      front: `Define: ${w}`,
      back: ctx ? ctx.slice(0, 160) : `A key term related to ${w} found in the material.`,
    });
  }

  return cards.slice(0, count);
}

function topKeywords(text: string, n: number): string[] {
  const freq = new Map<string, number>();
  for (const w of tokenize(text)) {
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([w]) => w);
}

export function generateQuiz(text: string, count = 5): QuizQuestion[] {
  const sentences = splitSentences(text);
  const questions: QuizQuestion[] = [];
  const usedSentences = new Set<number>();

  const makeFromDefinition = (s: string, idx: number): QuizQuestion | null => {
    const def = s.match(/(.{5,60}?)\s+(?:is|are|refers to|means|is defined as|is called)\s+(.{10,140})/i);
    if (!def) return null;
    usedSentences.add(idx);
    const term = def[1].trim();
    const definition = def[2].trim().replace(/[.;]+$/, '');
    const distractors = sentences
      .filter((_, i) => i !== idx && !usedSentences.has(i))
      .map((x) => x.split(/\s+/).slice(0, 8).join(' ').replace(/[.;]+$/, ''))
      .filter((x) => x.length > 10 && x !== definition)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    if (distractors.length < 3) return null;
    const options = [definition, ...distractors].sort(() => Math.random() - 0.5);
    return {
      id: uid('q'),
      question: `Which best describes "${term}"?`,
      options,
      answerIndex: options.indexOf(definition),
      explanation: `Based on the material: ${definition}.`,
    };
  };

  const makeFromFill = (s: string, idx: number): QuizQuestion | null => {
    const keywords = tokenize(s).filter((w) => w.length > 4);
    if (keywords.length < 2) return null;
    const answer = keywords.sort((a, b) => b.length - a.length)[0];
    if (!answer) return null;
    usedSentences.add(idx);
    const blanked = s.replace(new RegExp(`\\b${answer}\\b`, 'i'), '_____');
    const distractors = topKeywords(text, 10)
      .filter((w) => w !== answer && w.length > 4)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    if (distractors.length < 3) return null;
    const options = [answer, ...distractors].sort(() => Math.random() - 0.5);
    return {
      id: uid('q'),
      question: `Fill in the blank: ${blanked}`,
      options,
      answerIndex: options.indexOf(answer),
      explanation: `The correct term is "${answer}".`,
    };
  };

  for (let i = 0; i < sentences.length && questions.length < count; i++) {
    const s = sentences[i];
    if (s.length < 20 || s.length > 200) continue;
    const q = makeFromDefinition(s, i) ?? makeFromFill(s, i);
    if (q) questions.push(q);
  }

  let i = 0;
  while (questions.length < count && i < sentences.length) {
    const s = sentences[i++];
    if (s.length < 20 || usedSentences.has(i)) continue;
    const q = makeFromFill(s, i);
    if (q) questions.push(q);
  }

  return questions.slice(0, count);
}

export function generateImportantQuestions(text: string, count = 6): string[] {
  const sentences = rankSentences(text, count * 2);
  const questions: string[] = [];
  for (const s of sentences) {
    if (questions.length >= count) break;
    const def = s.match(/(.{5,60}?)\s+(?:is|are|refers to|means)\s/i);
    if (def) {
      questions.push(`Explain the concept of ${def[1].trim()}.`);
      continue;
    }
    const stripped = s.replace(/[.;]+$/, '');
    questions.push(`What is meant by: "${stripped.slice(0, 100)}"?`);
  }
  while (questions.length < count) {
    questions.push(`Summarize the key idea discussed in section ${questions.length + 1}.`);
  }
  return questions.slice(0, count);
}

export function generateInterviewQuestions(text: string, count = 6): string[] {
  const keywords = topKeywords(text, count * 2);
  const questions: string[] = [];
  const templates = [
    (k: string) => `Can you explain ${k} and its practical applications?`,
    (k: string) => `What are the advantages and limitations of ${k}?`,
    (k: string) => `How would you implement ${k} in a real-world scenario?`,
    (k: string) => `Describe a problem where ${k} plays a critical role.`,
    (k: string) => `What are common misconceptions about ${k}?`,
    (k: string) => `Compare and contrast ${k} with a related concept.`,
  ];
  for (let i = 0; i < keywords.length && questions.length < count; i++) {
    questions.push(templates[i % templates.length](keywords[i]));
  }
  while (questions.length < count) {
    questions.push(`Discuss a key topic from the material and why it matters.`);
  }
  return questions.slice(0, count);
}

export function generateStudyPlan(text: string, days = 5): StudyPlan {
  const summary = generateSummary(text);
  const keywords = topKeywords(text, days * 3);
  const dayTitles = [
    'Foundations & Overview',
    'Deep Dive: Core Concepts',
    'Application & Practice',
    'Review & Self-Testing',
    'Final Revision & Mastery',
  ];

  const daysArr = Array.from({ length: days }, (_, i) => {
    const tasks: string[] = [];
    if (i === 0) tasks.push(`Read the full material (${summary.estimatedTime}).`);
    if (summary.keyPoints[i]) tasks.push(`Focus on: ${summary.keyPoints[i].slice(0, 80)}.`);
    const k1 = keywords[i * 2];
    const k2 = keywords[i * 2 + 1];
    if (k1) tasks.push(`Study the term "${k1}" and write a short note.`);
    if (k2) tasks.push(`Create a flashcard for "${k2}".`);
    tasks.push(`Take a 5-question quiz on today's topics.`);
    if (i === days - 1) tasks.push('Review all flashcards and summarize what you learned.');
    return { day: i + 1, title: dayTitles[i] ?? `Day ${i + 1}`, tasks };
  });

  return { goal: `Master the material: ${summary.overview.slice(0, 80)}...`, days: daysArr };
}

export function explainConcepts(text: string, count = 5): Concept[] {
  const sentences = splitSentences(text);
  const concepts: Concept[] = [];
  const seen = new Set<string>();
  for (const s of sentences) {
    if (concepts.length >= count) break;
    const def = s.match(/(.{5,50}?)\s+(?:is|are|refers to|means|is defined as|is called)\s+(.{15,160})/i);
    if (def) {
      const term = def[1].trim();
      if (seen.has(term.toLowerCase())) continue;
      seen.add(term.toLowerCase());
      concepts.push({ term, explanation: def[2].trim().replace(/[.;]+$/, '') + '.' });
    }
  }
  const keywords = topKeywords(text, count);
  let ki = 0;
  while (concepts.length < count && ki < keywords.length) {
    const w = keywords[ki++];
    if (seen.has(w)) continue;
    seen.add(w);
    const ctx = sentences.find((s) => s.toLowerCase().includes(w));
    concepts.push({
      term: w,
      explanation: ctx ? ctx.slice(0, 160) : `A key term (${w}) referenced in the material.`,
    });
  }
  return concepts;
}

export function generateMindMap(text: string): { root: string; branches: { label: string; children: string[] }[] } {
  const keywords = topKeywords(text, 5);
  const sentences = splitSentences(text);
  const branches = keywords.slice(0, 5).map((k) => {
    const related = topKeywords(
      sentences.filter((s) => s.toLowerCase().includes(k)).join(' '),
      3
    ).filter((r) => r !== k);
    return { label: k, children: related.length ? related : ['definition', 'example', 'application'] };
  });
  return {
    root: keywords[0] ? capitalize(keywords[0]) : 'Main Topic',
    branches,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function answerQuestion(text: string, question: string): string {
  const qWords = new Set(tokenize(question));
  const sentences = splitSentences(text);
  if (!sentences.length) return 'I cannot answer because no document content is available.';

  const scored = sentences.map((s) => {
    const sWords = new Set(tokenize(s));
    let overlap = 0;
    sWords.forEach((w) => { if (qWords.has(w)) overlap++; });
    let score = overlap / Math.sqrt(Math.max(1, sWords.size));
    if (/\b(what|why|explain|describe|how)\b/i.test(question) && s.length > 40) score *= 1.1;
    return { s, score };
  });

  const top = scored.sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.s);
  if (top.every((t) => t === '')) {
    return "I couldn't find a direct answer in the uploaded material. Try rephrasing or uploading more content.";
  }
  return `Based on the material:\n\n${top.join('\n\n')}`;
}

export function chatStream(
  text: string,
  question: string,
  onChunk: (chunk: string) => void,
  onDone: () => void
): void {
  const answer = answerQuestion(text, question);
  const tokens = answer.match(/\S+\s*/g) ?? [answer];
  let i = 0;
  const interval = setInterval(() => {
    if (i >= tokens.length) {
      clearInterval(interval);
      onDone();
      return;
    }
    onChunk(tokens[i]);
    i++;
  }, 28);
}

export function exportNotes(doc: { title: string; content: string }): string {
  const summary = generateSummary(doc.content);
  const cards = generateFlashcards(doc.content, 6);
  const quiz = generateQuiz(doc.content, 4);
  const iq = generateImportantQuestions(doc.content, 5);

  let out = `# StudySphere AI — Exported Notes\n\n`;
  out += `## ${doc.title}\n\n`;
  out += `### Overview\n${summary.overview}\n\n`;
  out += `### Key Points\n${summary.keyPoints.map((k) => `- ${k}`).join('\n')}\n\n`;
  if (summary.formulas.length) {
    out += `### Important Formulas\n${summary.formulas.map((f) => `- ${f}`).join('\n')}\n\n`;
  }
  out += `### Flashcards\n${cards.map((c) => `- **Q:** ${c.front}\n  **A:** ${c.back}`).join('\n')}\n\n`;
  out += `### Quiz\n${quiz.map((q, i) => `${i + 1}. ${q.question}\n   - ${q.options.map((o, oi) => `${oi === q.answerIndex ? '✓' : '○'} ${o}`).join('\n   - ')}`).join('\n\n')}\n\n`;
  out += `### Important Questions\n${iq.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n`;
  return out;
}
