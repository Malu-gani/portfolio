// Genera dos PDFs minimos validos y no vacios para public/cv/.
// Contenido de ejemplo, pendiente de reemplazo por el CV real.
const fs = require('fs');
const path = require('path');

// Mapeo mínimo de puntos de código Unicode a bytes WinAnsiEncoding (PDF estándar).
// Node "latin1" no sirve para el guion largo (U+2014): trunca al byte bajo en vez
// de mapear a 0x97, que es donde WinAnsi lo ubica.
const WINANSI_OVERRIDES = { 0x2014: 0x97, 0x2013: 0x96, 0x2018: 0x91, 0x2019: 0x92 };

function toWinAnsiBytes(text) {
  const bytes = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    bytes.push(WINANSI_OVERRIDES[cp] ?? (cp <= 0xff ? cp : 0x3f));
  }
  return Buffer.from(bytes);
}

function buildPdf(text) {
  // Codificar el texto a WinAnsiEncoding y representarlo como string hex
  // en el content stream (evita tener que escapar paréntesis).
  const encoded = toWinAnsiBytes(text);
  let hex = '';
  for (const byte of encoded) {
    hex += byte.toString(16).padStart(2, '0');
  }
  const streamText = `BT /F1 18 Tf 50 750 Td <${hex}> Tj ET`;
  const streamBytes = Buffer.from(streamText, 'latin1');

  const objects = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  objects.push(null); // placeholder para el stream, manejado aparte

  const header = '%PDF-1.4\n';
  let body = header;
  const offsets = [0];

  function appendObj(num, content) {
    offsets[num] = Buffer.byteLength(body, 'latin1');
    body += `${num} 0 obj\n${content}\nendobj\n`;
  }

  appendObj(1, objects[0]);
  appendObj(2, objects[1]);
  appendObj(3, objects[2]);
  appendObj(4, objects[3]);

  offsets[5] = Buffer.byteLength(body, 'latin1');
  const streamObj = `5 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${streamText}\nendstream\nendobj\n`;
  body += streamObj;

  const xrefStart = Buffer.byteLength(body, 'latin1');
  const totalObjs = 6;
  let xref = `xref\n0 ${totalObjs}\n0000000000 65535 f \n`;
  for (let i = 1; i < totalObjs; i++) {
    xref += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${totalObjs} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  body += xref + trailer;
  return Buffer.from(body, 'latin1');
}

const outDir = path.join(__dirname, '..', 'public', 'cv');
fs.mkdirSync(outDir, { recursive: true });

const textoEs = 'CV de ejemplo — reemplazar';
const textoEn = 'CV de ejemplo — reemplazar';

fs.writeFileSync(path.join(outDir, 'cv-es.pdf'), buildPdf(textoEs));
fs.writeFileSync(path.join(outDir, 'cv-en.pdf'), buildPdf(textoEn));

console.log('PDFs generados en', outDir);
