import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
import { cx } from '../../../utils/class-names';
import { truncateText } from '../../../utils/text';
import styles from './truncated-text.module.css';

interface ITruncatedTextProps extends Omit<ComponentPropsWithoutRef<'span'>, 'children'> {
  text?: string | null;
  lines?: number;
  maxChars?: number;
  fallback?: string;
}

export const TruncatedText = ({ text, lines, maxChars, fallback = '—', className, style, ...props }: ITruncatedTextProps) => {
  if (!text) {
    return <span className={cx(styles.truncatedText, className)} style={style} {...props}>{fallback}</span>;
  }

  return (
    <span
      className={cx(styles.truncatedText, !!lines && styles.clamped, className)}
      style={lines ? ({ ...style, '--lines': lines } as CSSProperties) : style}
      title={text}
      {...props}
    >
      {maxChars ? truncateText(text, maxChars) : text}
    </span>
  );
};
