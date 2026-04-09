export function resolveCssColorToken(svgElement: SVGSVGElement, colorToken: string) {
  const token = colorToken.trim();

  if (!token.startsWith('var(')) {
    return token;
  }

  const variableName = token.slice(4, -1).trim();
  if (!variableName) {
    return token;
  }

  const computedColor = getComputedStyle(svgElement).getPropertyValue(variableName).trim();
  if (computedColor) {
    return computedColor;
  }

  const rootColor = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
  return rootColor || token;
}
