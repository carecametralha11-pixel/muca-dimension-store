export interface ParsedOption {
  name: string;
  price: number;
  originalLine: string;
}

/**
 * Parses a description text to extract consultável options
 * Each line in format: "💳5K A 5K9 = 330" or "5K A 5K9 = 330"
 * Returns array of options with name and price
 */
export function parseConsultaveisDescription(description: string | null): ParsedOption[] {
  if (!description) return [];
  
  const lines = description.split('\n').filter(line => line.trim());
  const options: ParsedOption[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Try to match patterns like "💳5K A 5K9 = 330" or "5K A 5K9 = 330" or "Nome = 100"
    // The = sign separates name from price
    const match = trimmedLine.match(/^(.+?)\s*=\s*(\d+(?:[.,]\d+)?)\s*$/);
    
    if (match) {
      const name = match[1].trim();
      const priceStr = match[2].replace(',', '.');
      const price = parseFloat(priceStr);
      
      if (!isNaN(price) && name) {
        options.push({
          name,
          price,
          originalLine: trimmedLine
        });
      }
    }
  }
  
  return options;
}

/**
 * Counts how many options are in a description
 */
export function countOptions(description: string | null): number {
  return parseConsultaveisDescription(description).length;
}
