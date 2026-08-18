import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

export const NotFoundContainer = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
`;

export const NotFoundCard = styled.section`
  width: min(100%, 26rem);
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 14px 24px ${({ theme }) => theme.colors.shadow};
  padding: 2rem 1.5rem 1.5rem;
  text-align: center;
`;

export const NotFoundCode = styled.strong`
  display: block;
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.primary};
`;

export const NotFoundTitle = styled.h1`
  margin: 0.75rem 0 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const NotFoundText = styled.p`
  margin: 0.5rem 0 0;
  font-size: 0.88rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const NotFoundPath = styled.code`
  display: inline-block;
  margin-top: 0.6rem;
  padding: 0.15rem 0.45rem;
  max-width: 100%;
  border-radius: 0.4rem;
  background: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-family: monospace;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow-wrap: anywhere;
`;

const drain = keyframes`
  from { width: 100%; }
  to { width: 0%; }
`;

export const CountdownTrack = styled.div`
  margin: 1.25rem 0 0.75rem;
  height: 0.25rem;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surfaceAlt};
  overflow: hidden;
`;

// A barra é só o espelho visual do timeout — a duração vem do mesmo valor em JS.
export const CountdownBar = styled.div<{ $durationMs: number }>`
  height: 100%;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.primary};
  animation: ${drain} ${({ $durationMs }) => $durationMs}ms linear forwards;
`;

export const NotFoundLink = styled(Link)`
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
