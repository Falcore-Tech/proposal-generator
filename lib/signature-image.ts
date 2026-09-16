const PNG_DATA_URL_PREFIX = "data:image/png;base64,";

export function toSignatureDataUrl(pngBase64: string): string {
  const raw = pngBase64.startsWith(PNG_DATA_URL_PREFIX) ? pngBase64.slice(PNG_DATA_URL_PREFIX.length) : pngBase64;
  return `${PNG_DATA_URL_PREFIX}${raw}`;
}
