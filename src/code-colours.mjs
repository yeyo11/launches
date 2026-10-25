// Shiki's GitHub themes were drawn for GitHub's own grounds; on this site's code background
// (`--raised`) a few of their colours fall below WCAG AA, comments above all. Each one is swapped for
// the nearest GitHub colour that passes. The span backgrounds a few tokens carry (diff, ignored) are
// dropped by global.css, so their foregrounds are swapped for the theme's plain text too.
// scripts/contrast.mjs checks every colour of both themes after these swaps.

/** @type {{ dark: Record<string, string>, light: Record<string, string> }} */
export const CODE_COLOURS = {
  dark: {
    '#6A737D': '#959DA5', // comments, 3.9 → 6.8
    '#24292E': '#E1E4E8',
    '#2F363D': '#E1E4E8',
  },
  light: {
    '#6A737D': '#586069', // comments, 4.3 → 5.6
    '#22863A': '#176F2C',
    '#D73A49': '#CF222E',
    '#E36209': '#A04100',
    '#FAFBFC': '#24292E',
    '#F6F8FA': '#24292E',
  },
};

/**
 * A Shiki transformer that applies CODE_COLOURS to the CSS variables Shiki writes with
 * `defaultColor: false` (`--shiki-dark:#…;--shiki-light:#…`).
 * @returns {{ name: string, span: (node: { properties: Record<string, unknown> }) => void }}
 */
export function codeColours() {
  const swap = (style) =>
    style.replace(/--shiki-(dark|light):(#[0-9A-Fa-f]{6})/g, (whole, theme, hex) => {
      const to = CODE_COLOURS[theme][hex.toUpperCase()];
      return to ? `--shiki-${theme}:${to}` : whole;
    });
  return {
    name: 'code-colours',
    span(node) {
      if (typeof node.properties.style === 'string') node.properties.style = swap(node.properties.style);
    },
  };
}
