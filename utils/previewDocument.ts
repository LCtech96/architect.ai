// Wraps a generated HTML snippet in a standalone document. Used for the sandboxed
// preview iframes (so Tailwind breakpoints follow the simulated device width)
// and for exporting a page as a single .html file.
export const buildPreviewDocument = (code: string, title = 'Architect.ai Preview') => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${title.replace(/</g, '&lt;')}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet" />
<script>
  tailwind.config = {
    theme: { extend: { fontFamily: { sans: ['Inter', 'sans-serif'], serif: ['Playfair Display', 'serif'] } } }
  };
</script>
<style>
  html, body { height: 100%; }
  body { margin: 0; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; }
</style>
</head>
<body>
${code}
</body>
</html>`;

export const downloadHtml = (code: string, name: string) => {
  const blob = new Blob([buildPreviewDocument(code, name)], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'page'}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
