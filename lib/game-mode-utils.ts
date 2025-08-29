import { DateInfo, Item } from "../types/item";

/**
 * Parse and normalize date information from Wikidata
 */
export function parseDateInfo(item: Item): DateInfo {
  // For now, use the existing year field as primary source
  // This could be enhanced to parse more complex date formats from Wikidata
  return {
    precision: "year",
    start: item.year,
    display: item.year.toString(),
    originalDate: item.year.toString()
  };
}

/**
 * Check if a user's precise date guess is correct within tolerance
 */
export function checkPreciseAnswer(
  item: Item, 
  userAnswer: string | number,
  tolerance: number = 1
): { correct: boolean; exactMatch: boolean; yearDifference: number } {
  const targetYear = item.year;
  const userYear = typeof userAnswer === 'string' ? 
    parseInt(userAnswer, 10) : userAnswer;
    
  if (isNaN(userYear)) {
    return { correct: false, exactMatch: false, yearDifference: Infinity };
  }
  
  const yearDifference = Math.abs(targetYear - userYear);
  const exactMatch = yearDifference === 0;
  const correct = yearDifference <= tolerance;
  
  return { correct, exactMatch, yearDifference };
}

/**
 * Calculate score for precise mode based on accuracy
 */
export function calculatePreciseScore(
  exactMatch: boolean,
  yearDifference: number,
  baseScore: number = 100
): number {
  if (exactMatch) {
    return baseScore;
  }
  
  // Scale down score based on year difference
  const k = 5; // Score reduction factor per year
  return Math.max(0, baseScore - k * yearDifference);
}

/**
 * Generate multiple choice options for an item
 */
export function generateMultipleChoiceOptions(
  targetItem: Item,
  allItems: Item[],
  difficulty: "easy" | "normal" | "hard" = "normal"
): { options: number[]; correctIndex: number } {
  const targetYear = targetItem.year;
  const options: number[] = [targetYear];
  
  // Generate distractors based on difficulty
  const yearRange = difficulty === "easy" ? 50 : difficulty === "normal" ? 25 : 10;
  const minYear = Math.max(targetYear - yearRange, -3000); // Reasonable historical minimum
  const maxYear = Math.min(targetYear + yearRange, new Date().getFullYear() + 10);
  
  // Generate 3 distractor years
  while (options.length < 4) {
    const distractor = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
    if (!options.includes(distractor)) {
      options.push(distractor);
    }
  }
  
  // Shuffle options and find correct index
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
  const correctIndex = shuffledOptions.indexOf(targetYear);
  
  return { options: shuffledOptions, correctIndex };
}

/**
 * Validate date input format
 */
export function validateDateInput(input: string): {
  valid: boolean;
  year?: number;
  format?: "YYYY" | "YYYY-MM-DD";
} {
  // Check for YYYY format
  const yearMatch = input.match(/^(\d{1,4})$/);
  if (yearMatch) {
    const year = parseInt(yearMatch[1], 10);
    if (year >= -3000 && year <= new Date().getFullYear() + 100) {
      return { valid: true, year, format: "YYYY" };
    }
  }
  
  // Check for YYYY-MM-DD format
  const dateMatch = input.match(/^(\d{1,4})-(\d{1,2})-(\d{1,2})$/);
  if (dateMatch) {
    const year = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const day = parseInt(dateMatch[3], 10);
    
    if (year >= -3000 && year <= new Date().getFullYear() + 100 &&
        month >= 1 && month <= 12 &&
        day >= 1 && day <= 31) {
      return { valid: true, year, format: "YYYY-MM-DD" };
    }
  }
  
  return { valid: false };
}