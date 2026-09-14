import type { ComponentPropsWithoutRef } from 'react';
import { truncateText } from '../../../utils/text';
import { StyledTruncatedText } from './truncated-text.style';

interface ITruncatedTextProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  text?: string | null;
  lines?: number;
  maxChars?: number;
  fallback?: string;
}

export const TruncatedText = ({ text, lines, maxChars, fallback = '—', ...props }: ITruncatedTextProps) => {
  if (!text) {
    return <StyledTruncatedText {...props}>{fallback}</StyledTruncatedText>;
  }

  return (
    <StyledTruncatedText $lines={lines} title={text} {...props}>
      {maxChars ? truncateText(text, maxChars) : text}
    </StyledTruncatedText>
  );
};
