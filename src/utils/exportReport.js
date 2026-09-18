/**
 * Export Report — CSV generation
 */

export function exportSessionCSV(frames) {
  if (!frames || frames.length === 0) return;

  const headers = ["Timestamp", "Level", "Label", "Issues", "Score"];
  const rows = frames.map((f) => [
    new Date(f.timestamp).toLocaleTimeString(),
    f.level,
    f.label,
    f.issues.join("; "),
    f.score,
  ]);

  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `posture-session-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
