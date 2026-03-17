/**
 * Convert LaTeX math notation to plain text.
 * Adapted from Emergent AI's formatMathContent utility.
 *
 * Examples:
 *   \frac{1}{2}     → 1/2
 *   2\frac{3}{4}    → 2 3/4
 *   \sqrt{x}        → √(x)
 *   \times           → ×
 *   \div             → ÷
 *   $...$            → (strip delimiters)
 */
export function formatMathContent(text: string): string {
  if (!text) return text

  let formatted = text

  // Replace mixed numbers like 2\frac{3}{4} → 2 3/4
  formatted = formatted.replace(/(\d+)\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 $2/$3')

  // Replace \frac{a}{b} → a/b
  formatted = formatted.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')

  // Strip $...$ LaTeX math delimiters, but PRESERVE currency like $272, $15.50
  // Only strip when the content between $ signs contains LaTeX (backslashes, braces, etc.)
  formatted = formatted.replace(/\$([^$]+)\$/g, (_match, inner) => {
    // If the inner content has LaTeX commands, strip the $ delimiters
    if (/[\\{}^_]/.test(inner)) {
      return inner
    }
    // Otherwise it's likely currency — keep the $ sign
    return '$' + inner
  })

  // Replace common LaTeX symbols
  formatted = formatted.replace(/\\div/g, '÷')
  formatted = formatted.replace(/\\times/g, '×')
  formatted = formatted.replace(/\\cdot/g, '·')
  formatted = formatted.replace(/\\pm/g, '±')
  formatted = formatted.replace(/\\leq/g, '≤')
  formatted = formatted.replace(/\\geq/g, '≥')
  formatted = formatted.replace(/\\neq/g, '≠')
  formatted = formatted.replace(/\\pi/g, 'π')

  // Replace \sqrt{x} → √(x)
  formatted = formatted.replace(/\\sqrt\{([^}]+)\}/g, '√($1)')

  // Clean up remaining backslash-prefixed commands
  formatted = formatted.replace(/\\([a-zA-Z]+)/g, '$1')

  return formatted
}
