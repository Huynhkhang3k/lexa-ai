export type SavedWord = {
  word: string;
  meaning: string;
  partOfSpeech: string;
  difficulty: string;
  savedAt: number;
};

const SAVED_KEY = "lexa-saved-vocabulary";
const RECENT_KEY = "lexa-recent-dictionary";

export function getSavedVocabulary(): SavedWord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    return raw ? (JSON.parse(raw) as SavedWord[]) : [];
  } catch {
    return [];
  }
}

export function saveVocabularyEntry(entry: Omit<SavedWord, "savedAt">) {
  const list = getSavedVocabulary().filter(
    (w) => w.word.toLowerCase() !== entry.word.toLowerCase(),
  );
  list.unshift({ ...entry, savedAt: Date.now() });
  localStorage.setItem(SAVED_KEY, JSON.stringify(list.slice(0, 80)));
}

export function removeSavedWord(word: string) {
  const list = getSavedVocabulary().filter(
    (w) => w.word.toLowerCase() !== word.toLowerCase(),
  );
  localStorage.setItem(SAVED_KEY, JSON.stringify(list));
}

export function isWordSaved(word: string) {
  return getSavedVocabulary().some((w) => w.word.toLowerCase() === word.toLowerCase());
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(word: string) {
  const w = word.trim();
  if (!w) return;
  const list = getRecentSearches().filter((x) => x.toLowerCase() !== w.toLowerCase());
  list.unshift(w);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 12)));
}
