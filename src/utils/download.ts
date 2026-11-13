export const saveBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
};

const UNITS = ['B', 'KB', 'MB'];

export const formatFileSize = (bytes: number): string => {
  let size = bytes;
  let unit = 0;

  while (size >= 1024 && unit < UNITS.length - 1) {
    size /= 1024;
    unit += 1;
  }

  return `${unit === 0 ? size : size.toFixed(1)} ${UNITS[unit]}`;
};

export const saveBase64 = (base64: string, filename: string, type: string): void => {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  saveBlob(new Blob([bytes], { type }), filename);
};
