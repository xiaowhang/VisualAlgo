const normalizedColorCache = new Map<string, string>();

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function linearToSrgb(value: number) {
  const channel = clamp01(value);
  if (channel <= 0.0031308) {
    return channel * 12.92;
  }
  return 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

function parseUnitInterval(input: string) {
  const value = input.trim();
  if (value.endsWith('%')) {
    return Number.parseFloat(value.slice(0, -1)) / 100;
  }
  return Number.parseFloat(value);
}

function parseAlpha(input: string | undefined) {
  if (!input) {
    return 1;
  }
  const value = input.trim();
  if (!value) {
    return 1;
  }
  if (value.endsWith('%')) {
    return clamp01(Number.parseFloat(value.slice(0, -1)) / 100);
  }
  return clamp01(Number.parseFloat(value));
}

function convertOklchToRgb(colorValue: string) {
  const matched = colorValue
    .trim()
    .match(/^oklch\(\s*([^\s]+)\s+([^\s]+)\s+([^\s/)]+)(?:\s*\/\s*([^)]+))?\s*\)$/i);
  if (!matched) {
    return null;
  }

  const l = parseUnitInterval(matched[1]);
  const c = Number.parseFloat(matched[2]);
  const h = Number.parseFloat(matched[3]);
  const alpha = parseAlpha(matched[4]);

  if (
    !Number.isFinite(l) ||
    !Number.isFinite(c) ||
    !Number.isFinite(h) ||
    !Number.isFinite(alpha)
  ) {
    return null;
  }

  const hueRadians = (h * Math.PI) / 180;
  const a = c * Math.cos(hueRadians);
  const b = c * Math.sin(hueRadians);

  const lPrime = l + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = l - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = l - 0.0894841775 * a - 1.291485548 * b;

  const lLinear = lPrime ** 3;
  const mLinear = mPrime ** 3;
  const sLinear = sPrime ** 3;

  const rLinear = 4.0767416621 * lLinear - 3.3077115913 * mLinear + 0.2309699292 * sLinear;
  const gLinear = -1.2684380046 * lLinear + 2.6097574011 * mLinear - 0.3413193965 * sLinear;
  const bLinear = -0.0041960863 * lLinear - 0.7034186147 * mLinear + 1.707614701 * sLinear;

  const r = Math.round(linearToSrgb(rLinear) * 255);
  const g = Math.round(linearToSrgb(gLinear) * 255);
  const blue = Math.round(linearToSrgb(bLinear) * 255);

  if (alpha >= 1) {
    return `rgb(${r}, ${g}, ${blue})`;
  }

  const alphaNormalized = Number(alpha.toFixed(3));
  return `rgba(${r}, ${g}, ${blue}, ${alphaNormalized})`;
}

function normalizeColorToRgb(colorValue: string) {
  const raw = colorValue.trim();
  if (!raw) {
    return raw;
  }

  if (raw.startsWith('rgb(') || raw.startsWith('rgba(')) {
    return raw;
  }

  if (raw.toLowerCase().startsWith('oklch(')) {
    const converted = convertOklchToRgb(raw);
    if (converted) {
      normalizedColorCache.set(raw, converted);
      return converted;
    }
  }

  const cached = normalizedColorCache.get(raw);
  if (cached) {
    return cached;
  }

  if (typeof document === 'undefined') {
    return raw;
  }

  const probe = document.createElement('span');
  probe.style.color = raw;
  probe.style.display = 'none';
  document.body.appendChild(probe);
  const normalized = getComputedStyle(probe).color.trim() || raw;
  document.body.removeChild(probe);

  normalizedColorCache.set(raw, normalized);
  return normalized;
}

export function resolveCssColorToken(svgElement: SVGSVGElement, colorToken: string) {
  const token = colorToken.trim();

  if (!token.startsWith('var(')) {
    return normalizeColorToRgb(token);
  }

  const variableName = token.slice(4, -1).trim();
  if (!variableName) {
    return normalizeColorToRgb(token);
  }

  const computedColor = getComputedStyle(svgElement).getPropertyValue(variableName).trim();
  if (computedColor) {
    return normalizeColorToRgb(computedColor);
  }

  const rootColor = getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
  return normalizeColorToRgb(rootColor || token);
}
