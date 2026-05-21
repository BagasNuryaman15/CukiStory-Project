export type SubtitleChunk = {
  text: string;
  words: string[];
};

const MIN_CHUNK_WORDS = 3;
const PREFERRED_CHUNK_WORDS = 4;
const MAX_CHUNK_WORDS = 4;
const PUNCTUATION_END = /(?:[,.!?]|\.\.\.|…)$/u;

export function splitSubtitleIntoChunks(text: string): SubtitleChunk[] {
  const words = getSubtitleWords(text);
  if (words.length === 0) return [];
  if (words.length <= 7) return [createChunk(words)];

  const chunks: string[][] = [];
  let current: string[] = [];

  words.forEach((word) => {
    current.push(word);
    const canSplitAtPunctuation = current.length >= MIN_CHUNK_WORDS && PUNCTUATION_END.test(word);
    const shouldSplitByLength = current.length >= MAX_CHUNK_WORDS;

    if (canSplitAtPunctuation || shouldSplitByLength) {
      chunks.push(current);
      current = [];
    }
  });

  if (current.length > 0) chunks.push(current);

  return rebalanceChunks(chunks).map(createChunk);
}

export function getSubtitleWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function getTimedIndex(itemCount: number, frame: number, durationInFrames: number) {
  if (itemCount <= 1) return 0;
  const progress = Math.min(1, Math.max(0, frame / Math.max(1, durationInFrames)));
  return Math.min(itemCount - 1, Math.floor(progress * itemCount));
}

function createChunk(words: string[]): SubtitleChunk {
  return {
    text: words.join(" "),
    words,
  };
}

function rebalanceChunks(chunks: string[][]) {
  const balanced: string[][] = [];

  chunks.forEach((chunk) => {
    if (chunk.length <= MAX_CHUNK_WORDS) {
      balanced.push(chunk);
      return;
    }

    for (let index = 0; index < chunk.length; index += PREFERRED_CHUNK_WORDS) {
      balanced.push(chunk.slice(index, index + PREFERRED_CHUNK_WORDS));
    }
  });

  const last = balanced[balanced.length - 1];
  const previous = balanced[balanced.length - 2];
  if (last && previous && last.length === 1 && previous.length > MIN_CHUNK_WORDS) {
    last.unshift(previous.pop() as string);
  }

  return balanced;
}
