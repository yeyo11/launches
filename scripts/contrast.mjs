// Checks every text/background pair of the identity against WCAG 2.x AA: node scripts/contrast.mjs
const lum = (hex) => {
  const [r, g, b] = hex.match(/\w\w/g).map((c) => parseInt(c, 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };

const night = { ground: '#000000', raised: '#121211', text: '#F5F2EA', body: '#E6E2D8', muted: '#B8B4AA', line: '#6D6A62' };
const day = { ground: '#FFFFFF', raised: '#F2F1ED', text: '#0D0D0C', body: '#22211F', muted: '#5C5A54', line: '#85827A' };
const colours = { claudio: '#2FD7A0', shipcast: '#FFC400', pink: '#FF6FAE', orange: '#FF7A2F', blue: '#7C8CFF', red: '#FF5A4A' };

const pairs = [];
for (const [theme, t] of Object.entries({ night, day })) {
  for (const bg of ['ground', 'raised']) {
    for (const fg of ['text', 'body', 'muted']) pairs.push([theme, fg, t[fg], bg, t[bg], 4.5]);
    pairs.push([theme, 'line', t.line, bg, t[bg], 3]);
  }
}
for (const [name, c] of Object.entries(colours)) pairs.push(['both', 'black text', '#000000', name, c, 4.5]);
pairs.push(['both', 'white text', '#FFFFFF', 'band', '#3B4BF0', 4.5]);

let failed = 0;
console.log('| Theme | Foreground | Background | Ratio | Needs | Result |\n| --- | --- | --- | --- | --- | --- |');
for (const [theme, fgName, fg, bgName, bg, need] of pairs) {
  const r = ratio(fg, bg);
  if (r < need) failed += 1;
  console.log(`| ${theme} | ${fgName} \`${fg}\` | ${bgName} \`${bg}\` | ${r.toFixed(2)} | ${need} | ${r >= need ? 'pass' : 'FAIL'} |`);
}
process.exit(failed ? 1 : 0);
