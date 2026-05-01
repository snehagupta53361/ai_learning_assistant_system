// Utility: Escape special regex characters in user input
// Example: "a+b" → "a\+b" (so + is treated as literal, not regex operator)
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');


// =============================
// TEXT CHUNKING FUNCTION
// =============================

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  // 🔹 Guard clause: handle empty/null input
  if (!text || text.trim().length === 0) return [];

  // 🔹 Step size for sliding window (ensures no infinite loop)
  // If overlap >= chunkSize → step becomes 0 → infinite loop (avoid that)
  const step = Math.max(1, chunkSize - overlap);

  // 🔹 Clean text while preserving paragraph structure
  const cleanedText = text
    .replace(/\r\n/g, '\n')     // normalize Windows line breaks
    .replace(/\s+/g, ' ')      // collapse multiple spaces into one
    .replace(/\n /g, '\n')     // remove space after newline
    .replace(/ \n/g, '\n')     // remove space before newline
    .trim();                   // remove leading/trailing whitespace

  // 🔹 Split into paragraphs using newline(s)
  const paragraphs = cleanedText
    .split(/\n+/)
    .filter(p => p.trim().length > 0); // remove empty paragraphs

  const chunks = [];            // final result
  let currentChunk = [];        // holds paragraphs for current chunk
  let currentWordCount = 0;     // total words in current chunk
  let chunkIndex = 0;           // incremental chunk id

  // 🔹 Iterate over each paragraph
  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // =============================
    // 🔹 CASE 1: Large paragraph (> chunk size)
    // =============================
    if (paragraphWordCount > chunkSize) {

      // Save any existing chunk before processing large paragraph
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join('\n\n'), // preserve paragraph spacing
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      // Split large paragraph into word-based chunks
      for (let i = 0; i < paragraphWords.length; i += step) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);

        chunks.push({
          content: chunkWords.join(' '), // no paragraph formatting here
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });

        // Stop if end reached
        if (i + chunkSize >= paragraphWords.length) break;
      }

      continue; // move to next paragraph
    }

    // =============================
    // 🔹 CASE 2: Normal paragraph flow
    // =============================

    // If adding this paragraph exceeds chunk size → flush current chunk
    if (
      currentWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join('\n\n'),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });

      // 🔹 Create overlap (context preservation)
      const prevWords = currentChunk.join(' ').split(/\s+/);

      // Take last N words as overlap
      const overlapWords = prevWords.slice(-overlap);

      // Start new chunk with overlap + new paragraph
      currentChunk = [overlapWords.join(' '), paragraph.trim()];

      // Update word count accordingly
      currentWordCount = overlapWords.length + paragraphWordCount;

    } else {
      // 🔹 Normal case: just add paragraph to current chunk
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  // 🔹 Push remaining chunk (if any)
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join('\n\n'),
      chunkIndex: chunkIndex++,
      pageNumber: 0
    });
  }

  // =============================
  // 🔹 FALLBACK: if no chunks created
  // =============================
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
// RELEVANCE SCORING FUNCTION
// =============================

export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  // 🔹 Guard clause
  if (!chunks?.length || !query) return [];

  // 🔹 Common stopwords (ignored in search)
  const stopWords = new Set([
    'the','is','at','which','on','a','an','and','or','but','in','with','to',
    'for','of','as','by','this','that','it', 'what', 'when',
  ]);

  // 🔹 Process query → clean + tokenize
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  // 🔹 If no useful query words → return top chunks directly
  if (queryWords.length === 0) {
    return chunks.slice(0, maxChunks).map(chunk => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id
    }));
  }

  // 🔹 Score each chunk
  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;

    let score = 0;

    // 🔹 Match query words
    for (const word of queryWords) {
      const safeWord = escapeRegex(word); // prevent regex issues

      // Exact word match (higher weight)
      const exactMatches =
        (content.match(new RegExp(`\\b${safeWord}\\b`, 'g')) || []).length;

      // Partial match (lower weight)
      const partialMatches =
        (content.match(new RegExp(safeWord, 'g')) || []).length;

      score += exactMatches * 3;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    // 🔹 Bonus for multiple query words present
    const uniqueWordsFound = queryWords.filter(word =>
      content.includes(word)
    ).length;

    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2;
    }

    // 🔹 Normalize score to avoid bias toward long chunks
    const normalizedScore = score / Math.sqrt(contentWords || 1);

    // 🔹 Slight preference to earlier chunks
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

  // 🔹 Filter + sort + return top results
  return scoredChunks
    .filter(c => c.score > 0) // remove irrelevant chunks
    .sort((a, b) =>
      b.score !== a.score
        ? b.score - a.score               // higher score first
        : b.matchedWords !== a.matchedWords
        ? b.matchedWords - a.matchedWords // more keywords matched
        : a.chunkIndex - b.chunkIndex     // earlier chunk wins
    )
    .slice(0, maxChunks);
};