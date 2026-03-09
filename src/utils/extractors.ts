export const extractFirstName = (fullName: string): string => {
  if (!fullName) return '';
  const nameParts = fullName.trim().split(' ');
  return nameParts[0] || '';
}