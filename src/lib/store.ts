import { useEffect, useState, useCallback } from 'react';
import type { UploadedDoc } from './types';

const KEY = 'studysphere_docs';

function load(): UploadedDoc[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UploadedDoc[];
  } catch {
    return [];
  }
}

function save(docs: UploadedDoc[]) {
  localStorage.setItem(KEY, JSON.stringify(docs));
}

export function useDocs() {
  const [docs, setDocs] = useState<UploadedDoc[]>(() => load());

  useEffect(() => {
    save(docs);
  }, [docs]);

  const addDoc = useCallback((doc: UploadedDoc) => {
    setDocs((prev) => [doc, ...prev]);
  }, []);

  const removeDoc = useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const getDoc = useCallback(
    (id: string) => docs.find((d) => d.id === id),
    [docs]
  );

  return { docs, addDoc, removeDoc, getDoc };
}
