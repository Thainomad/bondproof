function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function renderLetterHtml({
  letterText,
  generatedAt,
}: {
  letterText: string
  generatedAt: Date
}): string {
  const paragraphs = letterText
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim()).replace(/\n/g, '<br/>')}</p>`)
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<style>
  body {
    font-family: Georgia, 'Times New Roman', serif;
    color: #111827;
    padding: 64px 56px;
    line-height: 1.6;
    font-size: 14px;
  }
  .date { text-align: right; color: #6b7280; margin-bottom: 32px; }
  p { margin: 0 0 16px; }
</style>
</head>
<body>
  <div class="date">${generatedAt.toLocaleDateString('en-AU', { timeZone: 'Australia/Sydney', dateStyle: 'long' })}</div>
  ${paragraphs}
</body>
</html>`
}
