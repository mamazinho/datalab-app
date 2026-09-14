export const truncateText = (text: string, maxChars: number) =>
  text.length <= maxChars ? text : `${text.slice(0, maxChars).trimEnd()}…`;
