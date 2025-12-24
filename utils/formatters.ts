/**
 * Formatters for API responses and data transformation
 */

/**
 * Format notes API response into readable markdown content
 * Now supports both new structured format (JSON) and legacy markdown format
 */
export const formatNotesContent = (apiNotes: any): string => {
  // Check if this is the new structured format with all required fields
  if (
    apiNotes.quickSummary &&
    apiNotes.sections &&
    Array.isArray(apiNotes.sections) &&
    apiNotes.formulas &&
    apiNotes.misconceptions &&
    apiNotes.examTips &&
    apiNotes.encouragement
  ) {
    // New format: Store as JSON string for proper parsing in NoteViewer
    return JSON.stringify(apiNotes);
  }

  // Legacy format: Convert to markdown for backward compatibility
  let content = `📚 ${apiNotes.title || "AI-Generated Notes"}\n\n`;

  if (apiNotes.sections && Array.isArray(apiNotes.sections)) {
    apiNotes.sections.forEach((section: any, idx: number) => {
      content += `## ${idx + 1}. ${section.heading}\n`;
      content += `${section.content}\n\n`;

      if (section.keyPoints && section.keyPoints.length > 0) {
        content += "**Key Points:**\n";
        section.keyPoints.forEach((point: string) => {
          content += `• ${point}\n`;
        });
        content += "\n";
      }

      if (section.examples && section.examples.length > 0) {
        content += "**Examples:**\n";
        section.examples.forEach((example: string) => {
          content += `• ${example}\n`;
        });
        content += "\n";
      }
    });
  }

  if (apiNotes.importantFormulas && apiNotes.importantFormulas.length > 0) {
    content += "## Important Formulas\n";
    apiNotes.importantFormulas.forEach((formula: any) => {
      content += `**${formula.name}:** ${formula.formula}\n${formula.explanation}\n\n`;
    });
  }

  if (
    apiNotes.commonMisconceptions &&
    apiNotes.commonMisconceptions.length > 0
  ) {
    content += "## Common Misconceptions\n";
    apiNotes.commonMisconceptions.forEach((item: any) => {
      content += `❌ ${item.misconception}\n✅ ${item.correction}\n\n`;
    });
  }

  if (apiNotes.examTips && apiNotes.examTips.length > 0) {
    content += "## Exam Tips\n";
    apiNotes.examTips.forEach((tip: string) => {
      content += `✓ ${tip}\n`;
    });
    content += "\n";
  }

  if (apiNotes.summary) {
    content += `## Summary\n${apiNotes.summary}`;
  }

  return content;
};

/**
 * Format Ask Doubt API response into readable markdown
 */
export const formatAskDoubtResponse = (aiData: any): string => {
  let formattedResponse = "";

  if (aiData.explanation && Array.isArray(aiData.explanation)) {
    aiData.explanation.forEach((step: string, idx: number) => {
      formattedResponse += `**Step ${idx + 1}:**\n${step}\n\n`;
    });
  }

  if (aiData.intuition) {
    formattedResponse += `**💡 Intuition:**\n${aiData.intuition}\n\n`;
  }

  if (aiData.revisionTip) {
    formattedResponse += `**📝 Revision Tip:**\n${aiData.revisionTip}`;
  }

  return formattedResponse;
};
