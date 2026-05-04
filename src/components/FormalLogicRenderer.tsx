// src/components/FormalLogicRenderer.tsx
import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface FormalLogicProps {
  expression: string;
  displayMode?: 'inline' | 'block';
}

/**
 * Component for rendering formal logic expressions
 * with consistent styling and symbol rendering
 *
 * Security: Uses DOMPurify to sanitize HTML output
 */
const FormalLogicRenderer: React.FC<FormalLogicProps> = ({
  expression,
  displayMode = 'block'
}) => {
  // Process and sanitize the expression
  const sanitizedExpression = useMemo(() => {
    // Process the expression to replace logical symbols with HTML entities
    const processedExpression = expression
      // Logical operators
      .replace(/\band\b/g, '<span class="logic-symbol logic-and"></span>')
      .replace(/\bor\b/g, '<span class="logic-symbol logic-or"></span>')
      .replace(/\bnot\b/g, '<span class="logic-symbol logic-not"></span>')
      .replace(/\bimplies\b/g, '<span class="logic-symbol logic-implies"></span>')
      .replace(/\biff\b/g, '<span class="logic-symbol logic-iff"></span>')
      .replace(/\bforall\b/g, '<span class="logic-symbol logic-forall"></span>')
      .replace(/\bexists\b/g, '<span class="logic-symbol logic-exists"></span>')

      // Ensure proper spacing around operators
      .replace(/([^\s])([∧∨¬→↔∀∃])/g, '$1 $2')
      .replace(/([∧∨¬→↔∀∃])([^\s])/g, '$1 $2')

      // Handle predicates (capitalized letters followed by parentheses)
      .replace(/\b([A-Z])(\(.*?\))/g, '<span class="predicate">$1</span>$2')

      // Handle variables (lowercase letters that stand alone)
      .replace(/\b([a-z])\b/g, '<span class="variable">$1</span>')

      // Handle constants (standalone numbers or specific constant keywords)
      .replace(/\b(\d+)\b/g, '<span class="constant">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="constant">$1</span>');

    // Sanitize the HTML to prevent XSS attacks
    // Only allow specific safe tags and attributes used by this component
    return DOMPurify.sanitize(processedExpression, {
      ALLOWED_TAGS: ['span'],
      ALLOWED_ATTR: ['class'],
      ALLOWED_CLASSES: {
        'span': [
          'logic-symbol', 'logic-and', 'logic-or', 'logic-not',
          'logic-implies', 'logic-iff', 'logic-forall', 'logic-exists',
          'predicate', 'variable', 'constant'
        ]
      }
    });
  }, [expression]);

  return (
    <div
      className={displayMode === 'inline' ? 'logic-expression inline' : 'logic-expression'}
      dangerouslySetInnerHTML={{ __html: sanitizedExpression }}
    />
  );
};

export default FormalLogicRenderer;
