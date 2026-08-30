import { auth, db, handleFirestoreError, OperationType, collection, doc, getDoc, setDoc, updateDoc, arrayUnion } from '../firebase';

export interface CognitiveMemory {
  text: string;
  tags: string[];
  createdAt?: number;
}

export function parseStringMemory(m: string): CognitiveMemory {
  const tags: string[] = [];
  
  // Try to match [Category: XXX] or [XXX] prefix
  const categoryMatch = m.match(/^\[Category:\s*([^\]]+)\]/i) || m.match(/^\[([^\]:]+):\s*([^\]]+)\]/i);
  if (categoryMatch) {
    tags.push(categoryMatch[1].trim());
  } else {
    // Check keyword-based tags
    const lower = m.toLowerCase();
    if (lower.includes('project') || lower.includes('work') || lower.includes('code') || lower.includes('repo')) {
      tags.push('Project');
    }
    if (lower.includes('secure') || lower.includes('password') || lower.includes('key') || lower.includes('token') || lower.includes('encryption')) {
      tags.push('Secure');
    }
    if (tags.length === 0) {
      tags.push('Personal');
    }
  }

  return {
    text: m,
    tags: Array.from(new Set(tags)),
    createdAt: Date.now()
  };
}

export async function fetchCognitiveMemories(): Promise<CognitiveMemory[]> {
  if (!auth.currentUser) return [];
  const path = `users/${auth.currentUser.uid}/settings/cognitive_memory`;
  try {
    const docRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'cognitive_memory');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().memories) {
      const raw = snap.data().memories as any[];
      return raw.map(m => {
        if (typeof m === 'string') {
          return parseStringMemory(m);
        }
        return {
          text: m.text || '',
          tags: Array.isArray(m.tags) ? m.tags : [],
          createdAt: m.createdAt || Date.now()
        };
      });
    }
    return [];
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, path);
  }
}

export async function saveCognitiveMemory(memory: CognitiveMemory | string): Promise<void> {
  if (!auth.currentUser) return;
  const path = `users/${auth.currentUser.uid}/settings/cognitive_memory`;
  try {
    const docRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'cognitive_memory');
    const snap = await getDoc(docRef);
    
    const obj = typeof memory === 'string' ? parseStringMemory(memory) : memory;

    if (!snap.exists()) {
      await setDoc(docRef, { memories: [obj] });
    } else {
      await updateDoc(docRef, { memories: arrayUnion(obj) });
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function deleteCognitiveMemory(memory: CognitiveMemory | string): Promise<void> {
  if (!auth.currentUser) return;
  const path = `users/${auth.currentUser.uid}/settings/cognitive_memory`;
  try {
    const docRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'cognitive_memory');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().memories) {
      const current = snap.data().memories as any[];
      const textToMatch = typeof memory === 'string' ? memory : memory.text;
      
      const filtered = current.filter(m => {
        const mText = typeof m === 'string' ? m : m.text;
        return mText !== textToMatch;
      });
      await setDoc(docRef, { memories: filtered }, { merge: true });
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

export async function updateCognitiveMemoryTags(memoryText: string, newTags: string[]): Promise<void> {
  if (!auth.currentUser) return;
  const path = `users/${auth.currentUser.uid}/settings/cognitive_memory`;
  try {
    const docRef = doc(db, 'users', auth.currentUser.uid, 'settings', 'cognitive_memory');
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().memories) {
      const current = snap.data().memories as any[];
      const updated = current.map(m => {
        const mText = typeof m === 'string' ? m : m.text;
        if (mText === memoryText) {
          if (typeof m === 'string') {
            return { text: m, tags: newTags, createdAt: Date.now() };
          } else {
            return { ...m, tags: newTags };
          }
        }
        return m;
      });
      await setDoc(docRef, { memories: updated }, { merge: true });
    }
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
}

