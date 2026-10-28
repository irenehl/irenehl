import { mkdirSync, writeFileSync } from "node:fs";

const C = {
  paper: "#fff4e0", white: "#fffdf8", ink: "#1d1633", muted: "#6b6480",
  tomato: "#ff5a36", sun: "#ffc928", mint: "#2fd6a1", sky: "#58a8ff", pink: "#ff7cc8", lav: "#b9a6ff",
};

const FONTS = {
  display: { family: "Bricolage Grotesque", query: "Bricolage+Grotesque:wght@500;700;800" },
  mono: { family: "JetBrains Mono", query: "JetBrains+Mono:wght@500;700" },
  pixel: { family: "Press Start 2P", query: "Press+Start+2P" },
};

const chars = Object.fromEntries(Object.keys(FONTS).map((k) => [k, new Set()]));
let used = new Set();

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const T = (font, x, y, str, { size = 20, weight = 400, fill = C.ink, ls = 0, anchor = "start", extra = "" } = {}) => {
  for (const ch of str) chars[font].add(ch);
  used.add(font);
  return `<text x="${x}" y="${y}" font-family="'${FONTS[font].family}'" font-size="${size}" font-weight="${weight}" fill="${fill}" letter-spacing="${ls}" text-anchor="${anchor}" ${extra}>${esc(str)}</text>`;
};

const box = (x, y, w, h, { fill = C.white, r = 24, sw = 4, shadow = 8 } = {}) =>
  `<rect x="${x + shadow}" y="${y + shadow}" width="${w}" height="${h}" rx="${r}" fill="${C.ink}"/>` +
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${C.ink}" stroke-width="${sw}"/>`;

const KEYFRAMES = `
  .wiggle { transform-box: fill-box; transform-origin: center; animation: wiggle 3s ease-in-out infinite; }
  .blink { animation: blink 1.2s steps(2) infinite; }
  .hop { transform-box: fill-box; transform-origin: center; animation: hop 1s cubic-bezier(.34,1.56,.64,1) infinite alternate; }
  .draw { stroke-dasharray: 1400; stroke-dashoffset: 1400; animation: draw 2.4s cubic-bezier(.22,1,.36,1) .3s forwards; }
  .pop { transform-box: fill-box; transform-origin: center; transform: scale(0); animation: pop .5s cubic-bezier(.34,1.56,.64,1) forwards; }
  @keyframes wiggle { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(3deg); } }
  @keyframes blink { 50% { opacity: 0; } }
  @keyframes hop { to { transform: translateY(-10px); } }
  @keyframes draw { to { stroke-dashoffset: 0; } }
  @keyframes pop { to { transform: scale(1); } }`;

const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<style>/*FONTS:${[...used].join(",")}*/${KEYFRAMES}</style>
${body}
</svg>
`;

const build = (fn) => () => { used = new Set(); const body = fn(); return { w: body.w, h: body.h, out: svg(body.w, body.h, body.svg) }; };

const header = build(() => {
  const commits = [
    [90, 462, C.tomato, 0], [200, 462, C.sun, 1], [310, 462, C.mint, 2],
    [480, 420, C.pink, 3], [600, 420, C.lav, 4], [800, 462, C.sky, 5], [920, 462, C.sun, 6],
  ];
  return { w: 1200, h: 524, svg: `
  ${box(2, 2, 1180, 506, { fill: C.paper, r: 30, sw: 5, shadow: 12 })}
  <rect x="48" y="44" width="16" height="16" fill="${C.tomato}"/>
  ${T("pixel", 76, 60, "PLAYER 1", { size: 15, fill: C.tomato })}
  ${T("pixel", 1040, 60, "EL SALVADOR", { size: 13, anchor: "end" })}
  ${[0, 1, 2].map((i) => `<rect x="${1062 + i * 26}" y="44" width="18" height="18" fill="${C.tomato}" stroke="${C.ink}" stroke-width="3"/>`).join("")}
  ${T("display", 44, 200, "Daniela", { size: 132, weight: 800, ls: -7 })}
  ${T("display", 44, 318, "Huezo", { size: 132, weight: 800, ls: -7, fill: C.tomato })}
  ${T("display", 50, 374, "AI expert. I build products, and the community around them.", { size: 27, weight: 500, fill: C.muted })}
  <g class="wiggle">
    ${box(840, 120, 270, 132, { fill: C.sun, r: 0, sw: 4, shadow: 7 })}
    ${T("pixel", 870, 176, "PRESS", { size: 26 })}
    ${T("pixel", 870, 222, "START", { size: 26 })}
    <polygon class="blink" points="1018,198 1018,226 1042,212" fill="${C.ink}"/>
  </g>
  <path d="M60 462 H1120" stroke="${C.ink}" stroke-width="7" stroke-linecap="round" class="draw"/>
  <path d="M310 462 C 370 462, 370 420, 430 420 H 680 C 740 420, 740 462, 800 462" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round" class="draw"/>
  ${commits.map(([x, y, fill, i]) => `<circle cx="${x}" cy="${y}" r="15" fill="${fill}" stroke="${C.ink}" stroke-width="5" class="pop" style="animation-delay:${0.6 + i * 0.18}s"/>`).join("\n  ")}
  <g class="hop" style="animation-delay:2s"><rect x="1032" y="440" width="44" height="44" fill="${C.white}" stroke="${C.ink}" stroke-width="5"/>${T("pixel", 1055, 472, "?", { size: 20, anchor: "middle" })}</g>
  ` };
});

const title = (name, text, color) => [name, build(() => ({ w: 1200, h: 64, svg: `
  <rect x="2" y="22" width="22" height="22" fill="${color}"/>
  ${T("pixel", 42, 44, text, { size: 22, fill: color })}` }))];

const roles = [
  { n: "01", title: "Co-founder", org: "Ai Labs", note: "Building AI products and community in SV", color: C.tomato },
  { n: "02", title: "SpaceXAI Ambassador", org: "El Salvador", note: "Representing SpaceXAI in my country", color: C.sky },
  { n: "03", title: "ElevenLabs Ambassador", org: "Voice AI", note: "Talks, demos and workshops on voice AI", color: C.lav },
  { n: "04", title: "Notion Builder", org: "Notion Builders Program", note: "Building and teaching with Notion", color: C.mint },
];

const rolesCard = build(() => ({ w: 1200, h: 490, svg: roles.map((r, i) => {
  const x = 2 + (i % 2) * 600, y = 22 + Math.floor(i / 2) * 252;
  return `<g>
  ${box(x, y, 570, 196, { r: 26, sw: 4, shadow: 9 })}
  ${box(x + 30, y + 30, 76, 76, { fill: r.color, r: 0, sw: 4, shadow: 0 })}
  ${T("pixel", x + 68, y + 79, r.n, { size: 20, anchor: "middle" })}
  ${T("display", x + 130, y + 66, r.title, { size: r.title.length > 18 ? 34 : 38, weight: 800, ls: -1.2 })}
  ${T("display", x + 131, y + 102, r.org, { size: 23, weight: 700, fill: C.muted })}
  ${T("mono", x + 32, y + 158, r.note, { size: 17, weight: 500, fill: C.muted })}
  <g class="pop" style="animation-delay:${0.3 + i * 0.25}s">
    <rect x="${x + 404}" y="${y - 16}" width="148" height="36" rx="18" fill="${C.sun}" stroke="${C.ink}" stroke-width="3"/>
    ${T("pixel", x + 478, y + 7, "UNLOCKED", { size: 11, anchor: "middle" })}
  </g>
  </g>`;
}).join("\n") }));

const projects = [
  { slug: "cerebryx", name: "Cerebryx", tag: "STUDY", lines: ["Timed reading + AI quizzes", "that check what stuck."], color: C.sun },
  { slug: "wavelength", name: "Wavelength", tag: "VOICE", lines: ["Live interpretation: one", "speaker, every language."], color: C.sky },
  { slug: "ellas", name: "Ellas", tag: "STORIES", lines: ["Women's testimonies,", "written and read in ES/EN."], color: C.pink },
];

const projectCard = (p) => [p.slug, build(() => ({ w: 380, h: 250, svg: `
  ${box(2, 2, 366, 236, { r: 24, sw: 4, shadow: 9 })}
  <rect x="4" y="4" width="362" height="60" rx="21" fill="${p.color}"/>
  <rect x="4" y="40" width="362" height="24" fill="${p.color}"/>
  <path d="M2 64 H368" stroke="${C.ink}" stroke-width="4"/>
  <rect x="2" y="2" width="366" height="236" rx="24" fill="none" stroke="${C.ink}" stroke-width="4"/>
  ${T("pixel", 28, 42, p.tag, { size: 13 })}
  ${[0, 1, 2].map((i) => `<rect x="${300 + i * 18}" y="27" width="12" height="12" fill="${C.ink}" opacity="${i === 2 ? 1 : 0.25}"/>`).join("")}
  ${T("display", 26, 124, p.name, { size: 42, weight: 800, ls: -1.5 })}
  ${p.lines.map((l, i) => T("mono", 28, 168 + i * 26, l, { size: 16, weight: 500, fill: C.muted })).join("\n  ")}
` }))];

const links = [
  { slug: "web", label: "DHUEZO.DEV", color: C.sun },
  { slug: "linkedin", label: "LINKEDIN", color: C.sky },
  { slug: "x", label: "X", color: C.white },
  { slug: "instagram", label: "INSTAGRAM", color: C.pink },
  { slug: "luma", label: "LUMA", color: C.mint },
];

const button = (l) => [`btn-${l.slug}`, build(() => {
  const w = l.label.length * 14 + 48;
  return { w: w + 10, h: 64, svg: `${box(2, 2, w, 52, { fill: l.color, r: 0, sw: 4, shadow: 6 })}${T("pixel", 2 + w / 2, 36, l.label, { size: 14, anchor: "middle" })}` };
})];

const files = [
  ["header", header], ["roles", rolesCard],
  title("title-roles", "UNLOCKED ROLES", C.tomato),
  title("title-projects", "SAVED GAMES", C.sky),
  title("title-connect", "CONTINUE?", C.mint),
  ...projects.map(projectCard), ...links.map(button),
];

const rendered = files.map(([name, fn]) => [name, fn().out]);

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const fontCss = {};
for (const [key, f] of Object.entries(FONTS)) {
  const text = encodeURIComponent([...chars[key]].join(""));
  let css = await (await fetch(`https://fonts.googleapis.com/css2?family=${f.query}&text=${text}`, { headers: { "User-Agent": UA } })).text();
  for (const [, url] of css.matchAll(/url\((https:[^)]+)\)/g)) {
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
    css = css.replace(url, `data:font/woff2;base64,${buf.toString("base64")}`);
  }
  fontCss[key] = css.replace(/\/\*.*?\*\//g, "").replace(/\s+/g, " ");
}

mkdirSync("assets", { recursive: true });
for (const [name, out] of rendered) {
  writeFileSync(`assets/${name}.svg`, out.replace(/\/\*FONTS:([^*]*)\*\//, (_, list) => list.split(",").filter(Boolean).map((k) => fontCss[k]).join("")));
}
console.log(`wrote ${rendered.length} files`);
