export const randomInt = (maxExclusive: number): number => {
  if (maxExclusive <= 0) {
    return 0;
  }

  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % maxExclusive;
};

export const pickRandom = <T>(items: T[]): T => items[randomInt(items.length)];

export const shuffle = <T>(items: T[]): T[] => {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
};

export const sampleUnique = <T>(items: T[], count: number): T[] => {
  if (count <= 0) {
    return [];
  }
  return shuffle(items).slice(0, Math.min(count, items.length));
};