/**
 * Generates contextual insight messages based on
 * the user's current score, streak, and active issues.
 */
export function getInsight(score, streak, issues = []) {
  if (score >= 90 && streak >= 10) return "Outstanding form — keep it up! 🔥";
  if (score >= 80 && issues.length === 0) return "Great alignment detected.";

  if (issues.length > 0) {
    const issueNames = issues.map((i) => i.label).join(", ");
    if (score >= 60) return `Minor issue: ${issueNames}. Adjust now.`;
    return `Issues detected: ${issueNames}. Correct your posture.`;
  }

  if (score >= 60) return "Minor adjustments needed.";
  if (score >= 40) return "Chin up, shoulders back!";
  return "Significant posture issues — correct now.";
}
