import { mkdirSync, writeFileSync } from "node:fs";

const SERIF = "ui-serif, 'New York', Georgia, 'Times New Roman', serif";
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, Consolas, monospace";

const themes = {
  light: { bg: "#F8F4EF", card: "#FFFFFF", line: "#EAE3DA", ink: "#2A2523", muted: "#8C837C", blob: 0.75, headerBlob: 0.95 },
  dark: { bg: "#17161A", card: "#1E1D22", line: "#2C2A31", ink: "#F2EDE7", muted: "#9B949C", blob: 0.32, headerBlob: 0.55, dark: true },
};

const accents = { peach: "#F4C7B5", lilac: "#CFC5F2", sage: "#C8E0CE", butter: "#F3E2A9", sky: "#BFD9EE", rose: "#F1C1D0" };

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const wrap = (text, max) => {
  const lines = [];
  let cur = "";
  for (const w of text.split(" ")) {
    if ((cur + " " + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  return [...lines, cur];
};

const blob = (cx, cy, r, color, op, dx, dy, dur) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${op}">
    <animateTransform attributeName="transform" type="translate" values="0 0; ${dx} ${dy}; 0 0" dur="${dur}s" repeatCount="indefinite" calcMode="spline" keySplines=".45 0 .55 1; .45 0 .55 1"/>
  </circle>`;

const header = (t) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="380" viewBox="0 0 1200 380">
  <defs>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="55"/></filter>
    <clipPath id="clip"><rect width="1200" height="380" rx="32"/></clipPath>
  </defs>
  <g clip-path="url(#clip)">
    <rect width="1200" height="380" fill="${t.bg}"/>
    <g filter="url(#soft)">
      ${blob(920, 110, 180, t.dark ? "#8E6F9E" : accents.peach, t.headerBlob, -40, 30, 14)}
      ${blob(1090, 280, 160, t.dark ? "#5E63A8" : accents.lilac, t.headerBlob, -30, -40, 18)}
      ${blob(780, 330, 140, t.dark ? "#4F7F6B" : accents.sage, t.headerBlob, 50, -20, 16)}
    </g>
    <rect x="0.5" y="0.5" width="1199" height="379" rx="32" fill="none" stroke="${t.line}"/>
  </g>
  <text x="80" y="118" font-family="${MONO}" font-size="17" letter-spacing="2" fill="${t.muted}">HELLO, I'M</text>
  <text x="76" y="218" font-family="${SERIF}" font-size="104" font-style="italic" fill="${t.ink}">Daniela</text>
  <text x="80" y="276" font-family="${SANS}" font-size="24" fill="${t.ink}" opacity=".82">Developer &amp; community builder</text>
  <text x="80" y="312" font-family="${SANS}" font-size="20" fill="${t.muted}">Making things for the web from El Salvador</text>
</svg>
`;

const card = (t, p) => {
  const lines = wrap(p.desc, 50);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="590" height="230" viewBox="0 0 590 230">
  <defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="34"/></filter><clipPath id="c"><rect width="590" height="230" rx="24"/></clipPath></defs>
  <g clip-path="url(#c)">
    <rect width="590" height="230" fill="${t.card}"/>
    <circle cx="560" cy="20" r="90" fill="${accents[p.color]}" opacity="${t.blob}" filter="url(#b)"/>
    <rect x="0.5" y="0.5" width="589" height="229" rx="24" fill="none" stroke="${t.line}"/>
  </g>
  <circle cx="40" cy="46" r="6" fill="${accents[p.color]}"/>
  <text x="56" y="51" font-family="${MONO}" font-size="13" letter-spacing="1.5" fill="${t.muted}">${esc(p.tag.toUpperCase())}</text>
  <text x="34" y="102" font-family="${SERIF}" font-size="34" fill="${t.ink}">${esc(p.name)}</text>
  ${lines.map((l, i) => `<text x="34" y="${140 + i * 25}" font-family="${SANS}" font-size="17" fill="${t.muted}">${esc(l)}</text>`).join("\n  ")}
  <text x="34" y="${206}" font-family="${MONO}" font-size="13" fill="${t.ink}" opacity=".6">${esc(p.stack)}</text>
</svg>
`;
};

const projects = [
  { slug: "wavelength", name: "Wavelength", tag: "Realtime AI", color: "lilac", stack: "Next.js · OpenAI Realtime", desc: "Live interpretation for events. One person speaks, the whole room listens in their own language." },
  { slug: "cerebryx", name: "Cerebryx", tag: "Learning", color: "sage", stack: "Next.js · AI quizzes", desc: "A calm study companion: timed reading sessions followed by quizzes that check what stuck." },
  { slug: "ellas", name: "Ellas", tag: "Storytelling", color: "rose", stack: "Next.js · Convex · Clerk", desc: "A bilingual home for women's testimonies, written in Spanish or English and read in either." },
  { slug: "life-drawn", name: "Life, Drawn", tag: "Creative tool", color: "butter", stack: "TypeScript · FFmpeg", desc: "Turns photos and narration into a hand-drawn, stroke-by-stroke vertical story video." },
];

mkdirSync("assets", { recursive: true });
for (const [mode, t] of Object.entries(themes)) {
  writeFileSync(`assets/header-${mode}.svg`, header(t));
  for (const p of projects) writeFileSync(`assets/${p.slug}-${mode}.svg`, card(t, p));
}
