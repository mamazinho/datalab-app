import styled, { css } from 'styled-components';

export const StyledTruncatedText = styled.span<{ $lines?: number }>`
  display: block;
  white-space: normal;
  overflow-wrap: anywhere;

  ${({ $lines }) =>
    $lines
      ? css`
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: ${$lines};
          line-clamp: ${$lines};
          overflow: hidden;
        `
      : ''}
`;
