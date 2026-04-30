const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) return [];

  const step = Math.max(1, chunkSize - overlap);

  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\s+/g, ' ')
    .replace(/\n /g, '\n')
    .replace(/ \n/g, '\n')
    .trim();

  const paragraphs = cleanedText
    .split(/\n+/)
    .filter(p => p.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // 🔹 Large paragraph handling
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join('\n\n'),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      for (let i = 0; i < paragraphWords.length; i += step) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);

        chunks.push({
          content: chunkWords.join(' '),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });

        if (i + chunkSize >= paragraphWords.length) break;
      }
      continue;
    }

    // 🔹 Normal paragraph flow
    if (
      currentWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join('\n\n'),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });

      // overlap
      const prevWords = currentChunk.join(' ').split(/\s+/);
      const overlapWords = prevWords.slice(-overlap);

      currentChunk = [overlapWords.join(' '), paragraph.trim()];
      currentWordCount = overlapWords.length + paragraphWordCount;
    } else {
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join('\n\n'),
      chunkIndex: chunkIndex++,
      pageNumber: 0
    });
  }

  // fallback
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);

    for (let i = 0; i < allWords.length; i += step) {
      const chunkWords = allWords.slice(i, i + chunkSize);

      chunks.push({
        content: chunkWords.join(' '),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });

      if (i + chunkSize >= allWords.length) break;
    }
  }

  return chunks;
};

// =============================

export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  if (!chunks?.length || !query) return [];

  const stopWords = new Set([
    'the','is','at','which','on','a','an','and','or','but','in','with','to',
    'for','of','as','by','this','that','it'
  ]);

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) {
    return chunks.slice(0, maxChunks).map(chunk => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id
    }));
  }

  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;

    let score = 0;

    for (const word of queryWords) {
      const safeWord = escapeRegex(word);

      const exactMatches =
        (content.match(new RegExp(`\\b${safeWord}\\b`, 'g')) || []).length;

      const partialMatches =
        (content.match(new RegExp(safeWord, 'g')) || []).length;

      score += exactMatches * 3;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    const uniqueWordsFound = queryWords.filter(word =>
      content.includes(word)
    ).length;

    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2;
    }

    const normalizedScore = score / Math.sqrt(contentWords || 1);
    const positionBonus = 1 - (index / chunks.length) * 0.1;

    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positionBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound
    };
  });

  return scoredChunks
    .filter(c => c.score > 0)
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score
        : b.matchedWords !== a.matchedWords
        ? b.matchedWords - a.matchedWords
        : a.chunkIndex - b.chunkIndex
    )
    .slice(0, maxChunks);
};