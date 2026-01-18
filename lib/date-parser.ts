import { parse, isValid } from "date-fns"

interface ParsedDate {
  year: string
  timestamp: number
}

export function parseDate(text: string): ParsedDate | null {
  // Pattern 1: Explicit 4-digit year (2020, 2024, etc.)
  const yearMatch = text.match(/\b(19|20)\d{2}\b/)
  if (yearMatch) {
    const year = yearMatch[0]
    return {
      year,
      timestamp: new Date(parseInt(year), 0, 1).getTime(),
    }
  }

  // Pattern 2: Month + Year (January 2024, Jan 2024)
  const monthYearMatch = text.match(
    /\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(19|20)\d{2}\b/i
  )
  if (monthYearMatch) {
    const parsed = parse(monthYearMatch[0], "MMMM yyyy", new Date())
    if (isValid(parsed)) {
      return {
        year: parsed.getFullYear().toString(),
        timestamp: parsed.getTime(),
      }
    }
    const parsedShort = parse(monthYearMatch[0], "MMM yyyy", new Date())
    if (isValid(parsedShort)) {
      return {
        year: parsedShort.getFullYear().toString(),
        timestamp: parsedShort.getTime(),
      }
    }
  }

  // Pattern 3: Full date formats (01/15/2024, 2024-01-15)
  const dateFormats = ["MM/dd/yyyy", "dd/MM/yyyy", "yyyy-MM-dd"]
  const dateMatch = text.match(/\b\d{1,4}[-/]\d{1,2}[-/]\d{2,4}\b/)
  if (dateMatch) {
    for (const format of dateFormats) {
      const parsed = parse(dateMatch[0], format, new Date())
      if (isValid(parsed) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
        return {
          year: parsed.getFullYear().toString(),
          timestamp: parsed.getTime(),
        }
      }
    }
  }

  return null
}
