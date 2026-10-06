// Heuristics engine for RepoSense repo analysis

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Text similarity fallback when embeddings are not generated
 */
export function textJaccardSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const set1 = new Set(str1.toLowerCase().split(/\W+/).filter(Boolean));
  const set2 = new Set(str2.toLowerCase().split(/\W+/).filter(Boolean));
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  if (union.size === 0) return 0;
  return (intersection.size / union.size) * 100;
}

/**
 * Calculates repo Health Score based on customizable weights
 * Weights: readmeDocs, activity, community, codeQuality (must sum to 100)
 */
export function calculateHealthScore(repoData, customWeights = {}) {
  const weights = {
    readmeDocs: customWeights.readmeDocs ?? 30,
    activity: customWeights.activity ?? 30,
    community: customWeights.community ?? 20,
    codeQuality: customWeights.codeQuality ?? 20
  };

  // Normalize weights to sum to 100 if user input differs
  const totalWeight = weights.readmeDocs + weights.activity + weights.community + weights.codeQuality;
  const normWeight = (val) => (val / (totalWeight || 100));

  // 1. README / Docs score (0 - 100)
  const readmeDocsScore = repoData.hasReadme ? (repoData.readmeQualityScore || 85) : 25;

  // 2. Activity score (0 - 100)
  const activityScore = repoData.lastCommitDaysAgo !== undefined
    ? Math.max(0, Math.min(100, 100 - (repoData.lastCommitDaysAgo * 2)))
    : 80;

  // 3. Community score (0 - 100)
  const openIssues = repoData.openIssuesCount || 0;
  const communityScore = Math.max(20, Math.min(100, 100 - (openIssues * 3)));

  // 4. Code quality score (0 - 100)
  const codeQualityScore = repoData.codeQualityScore || 82;

  const finalScore = Math.round(
    (readmeDocsScore * normWeight(weights.readmeDocs)) +
    (activityScore * normWeight(weights.activity)) +
    (communityScore * normWeight(weights.community)) +
    (codeQualityScore * normWeight(weights.codeQuality))
  );

  return {
    score: Math.min(100, Math.max(0, finalScore)),
    breakdown: {
      readmeDocs: Math.round(readmeDocsScore),
      activity: Math.round(activityScore),
      community: Math.round(communityScore),
      codeQuality: Math.round(codeQualityScore)
    }
  };
}

/**
 * Quality check heuristic for README content
 */
export function evaluateReadmeQuality(content) {
  if (!content || content.trim().length === 0) {
    return { status: 'MISSING', score: 0 };
  }
  const len = content.length;
  const lower = content.toLowerCase();

  let score = 30;
  if (len > 300) score += 20;
  if (len > 1000) score += 20;
  if (lower.includes('## installation') || lower.includes('## getting started')) score += 10;
  if (lower.includes('## usage')) score += 10;
  if (lower.includes('license')) score += 10;

  let status = 'INCOMPLETE';
  if (score >= 80) status = 'EXCELLENT';
  else if (score >= 50) status = 'GOOD';

  return { status, score: Math.min(100, score) };
}
