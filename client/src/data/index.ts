import { ipcBnsSections, type LawSection } from "./ipc-bns";
import { constitutionArticles, type ConstitutionArticle } from "./constitution";
import { legalProcedures, type LegalProcedure } from "./procedures";
import { legalFaqs, type LegalFAQ } from "./legal-faq";

export type { LawSection, ConstitutionArticle, LegalProcedure, LegalFAQ };

interface SearchResult {
  type: "law" | "constitution" | "procedure" | "faq";
  score: number;
  content: string;
}

/**
 * Simple keyword-based search across all Indian law knowledge.
 * Tokenizes the query, matches against keywords in all data sources,
 * and returns the top-K most relevant results formatted as context text.
 */
export function searchLawKnowledge(query: string, topK: number = 15): string {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return "";

  const results: SearchResult[] = [];

  // Search IPC/BNS sections
  for (const section of ipcBnsSections) {
    const score = calculateScore(queryTokens, section.keywords, section.title, section.description);
    if (score > 0) {
      const ipcLabel = section.ipc && section.ipc !== "—" ? `IPC Section ${section.ipc}` : "";
      const bnsLabel = section.bns && section.bns !== "—" ? `BNS Section ${section.bns}` : "";
      const sectionLabel = [ipcLabel, bnsLabel].filter(Boolean).join(" / ");
      results.push({
        type: "law",
        score,
        content: `[CRIMINAL LAW] ${sectionLabel ? sectionLabel + " — " : ""}${section.title}\n${section.description}\nPunishment: ${section.punishment}`,
      });
    }
  }

  // Search Constitution articles
  for (const article of constitutionArticles) {
    const score = calculateScore(queryTokens, article.keywords, article.title, article.content);
    if (score > 0) {
      results.push({
        type: "constitution",
        score,
        content: `[CONSTITUTION] Article ${article.article} — ${article.title} (${article.part})\n${article.content}`,
      });
    }
  }

  // Search procedures
  for (const proc of legalProcedures) {
    const score = calculateScore(queryTokens, proc.keywords, proc.title, proc.description);
    if (score > 0) {
      results.push({
        type: "procedure",
        score: score + 0.5, // Slight boost for procedures — very actionable
        content: `[LEGAL PROCEDURE] ${proc.title}\n${proc.description}\nSteps:\n${proc.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\nRelevant Laws: ${proc.relevantLaws.join(", ")}`,
      });
    }
  }

  // Search FAQs
  for (const faq of legalFaqs) {
    const score = calculateScore(queryTokens, faq.keywords, faq.question, faq.answer);
    if (score > 0) {
      results.push({
        type: "faq",
        score: score + 0.3, // Slight boost for FAQs — directly answer questions
        content: `[LEGAL FAQ] Q: ${faq.question}\nA: ${faq.answer}\nRelated Laws: ${faq.relatedSections.join(", ")}`,
      });
    }
  }

  // Sort by score and take top K
  results.sort((a, b) => b.score - a.score);
  const topResults = results.slice(0, topK);

  if (topResults.length === 0) return "";

  return (
    "=== RELEVANT INDIAN LAW KNOWLEDGE BASE ===\n" +
    "Use the following verified legal information to ground your response. " +
    "Cite specific sections and articles when applicable.\n\n" +
    topResults.map((r) => r.content).join("\n\n---\n\n") +
    "\n\n=== END OF KNOWLEDGE BASE ==="
  );
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .filter((word) => !STOP_WORDS.has(word));
}

function calculateScore(
  queryTokens: string[],
  keywords: string[],
  title: string,
  description: string
): number {
  let score = 0;
  const allText = [...keywords, title.toLowerCase(), description.toLowerCase()].join(" ");
  const keywordsLower = keywords.map((k) => k.toLowerCase());

  for (const token of queryTokens) {
    // Exact keyword match (highest weight)
    for (const kw of keywordsLower) {
      if (kw === token) {
        score += 3;
      } else if (kw.includes(token) || token.includes(kw)) {
        score += 2;
      }
    }

    // Phrase match in keywords
    for (const kw of keywordsLower) {
      const kwWords = kw.split(/\s+/);
      if (kwWords.some((w) => w === token)) {
        score += 1.5;
      }
    }

    // General text match
    if (allText.includes(token)) {
      score += 0.5;
    }
  }

  // Bonus for multi-token matches (query relevance boost)
  const matchedTokens = queryTokens.filter((t) => allText.includes(t));
  if (matchedTokens.length > 1) {
    score += matchedTokens.length * 0.5;
  }

  return score;
}

const STOP_WORDS = new Set([
  "the", "is", "at", "which", "on", "a", "an", "and", "or", "but", "in",
  "with", "to", "for", "of", "not", "no", "can", "do", "does", "did",
  "will", "would", "should", "could", "may", "might", "shall", "has",
  "have", "had", "been", "was", "were", "are", "am", "this", "that",
  "these", "those", "what", "how", "who", "when", "where", "why",
  "about", "from", "into", "through", "during", "before", "after",
  "above", "below", "between", "because", "while", "than", "then",
  "also", "just", "only", "very", "too", "more", "most", "some", "any",
  "all", "each", "every", "both", "few", "many", "much", "own", "other",
  "such", "like", "even", "still", "already", "yet", "here", "there",
  "its", "his", "her", "my", "your", "our", "their", "them", "him",
  "she", "they", "you", "we", "me", "us", "if", "please", "want",
  "need", "tell", "know", "get", "give", "take", "make", "help",
]);

/** Get total count of law entries in the knowledge base */
export function getKnowledgeBaseStats() {
  return {
    ipcBnsSections: ipcBnsSections.length,
    constitutionArticles: constitutionArticles.length,
    procedures: legalProcedures.length,
    faqs: legalFaqs.length,
    total: ipcBnsSections.length + constitutionArticles.length + legalProcedures.length + legalFaqs.length,
  };
}
