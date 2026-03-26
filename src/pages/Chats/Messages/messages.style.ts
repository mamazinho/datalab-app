import styled, { css } from 'styled-components';

export const MessagesContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: min(100%, 66rem);
  margin: 0.5rem auto;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 10px 18px ${({ theme }) => theme.colors.shadow};
  padding: 1rem;

  @media (min-width: 768px) {
    padding: 1.25rem;
  }
`;

export const MessagesHeader = styled.header`
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 1rem;
  padding-bottom: 0.85rem;
`;

export const MessagesTitle = styled.h2`
  margin: 0 0 0.35rem;
  font-size: clamp(1.45rem, 2.5vw, 2rem);
  color: ${({ theme }) => theme.colors.text};
`;

export const MessagesTitleHighlight = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

export const MessagesSubtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.92rem;
`;

export const MessagesBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const ErrorBanner = styled.div`
  margin: 0.8rem 0;
  border-radius: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.error};
  background: color-mix(in srgb, ${({ theme }) => theme.colors.error} 12%, ${({ theme }) => theme.colors.surface});
  color: ${({ theme }) => theme.colors.error};
  padding: 0.8rem;
  font-size: 0.9rem;
`;

export const ErrorLabel = styled.span`
  font-weight: 700;
`;

export const Conversation = styled.div`
  flex: 1;
  margin-bottom: 0.8rem;
  border-radius: 0.85rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  box-shadow: inset 0 2px 7px ${({ theme }) => theme.colors.shadow};
  overflow-y: auto;
  padding: 1rem;
`;

export const EmptyState = styled.div`
  min-height: 13rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  animation: floatIn 0.25s ease;
`;

export const EmptyEmoji = styled.p`
  margin: 0 0 0.75rem;
  font-size: 2rem;
`;

export const EmptyTitle = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const EmptyText = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
`;

export const MessageRow = styled.div<{ $isUser: boolean }>`
  display: flex;
  width: 100%;
  margin-bottom: 0.85rem;
  justify-content: ${({ $isUser }) => ($isUser ? 'flex-end' : 'flex-start')};
`;

export const Bubble = styled.div<{ $isUser: boolean }>`
  max-width: 85%;
  border-radius: 1rem;
  padding: 0.75rem 0.95rem;
  box-shadow: 0 6px 12px ${({ theme }) => theme.colors.shadow};

  ${({ theme, $isUser }) =>
    $isUser
      ? css`
          background: #17172f;
          color: #fffff7;
          border-bottom-right-radius: 0.35rem;
          border: 1px solid #29295a;
        `
      : css`
          background: linear-gradient(150deg, ${theme.colors.primary}, #ffd955);
          color: ${theme.colors.primaryText};
          border-bottom-left-radius: 0.35rem;
          border: 1px solid ${theme.colors.primary};
        `}
`;

export const InternalDetails = styled.details`
  margin-bottom: 0.7rem;
  border-radius: 0.6rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.72);
`;

export const InternalSummary = styled.summary`
  cursor: pointer;
  padding: 0.5rem 0.65rem;
  font-size: 0.74rem;
  font-weight: 700;
`;

export const InternalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  padding: 0 0.65rem 0.65rem;
`;

export const InternalItem = styled.div`
  border-radius: 0.5rem;
  border: 1px solid rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.9);
  padding: 0.45rem;
`;

export const InternalMeta = styled.div`
  margin-bottom: 0.3rem;
  font-size: 0.62rem;
  font-weight: 700;
  opacity: 0.75;
`;

const markdownStyles = css`
  p,
  ul,
  ol {
    margin: 0;
  }

  ul,
  ol {
    padding-left: 1rem;
  }

  li {
    margin: 0;
  }
`;

export const InternalContent = styled.div`
  font-size: 0.78rem;
  line-height: 1.35;
  white-space: pre-wrap;
  ${markdownStyles}
`;

export const MainContent = styled.div`
  font-size: 0.88rem;
  line-height: 1.45;
  white-space: pre-wrap;
  ${markdownStyles}
`;

export const MessageTime = styled.div<{ $isUser: boolean }>`
  margin-top: 0.45rem;
  font-size: 0.62rem;
  font-weight: 700;
  opacity: 0.75;
  text-align: ${({ $isUser }) => ($isUser ? 'right' : 'left')};
`;

export const MessageInputForm = styled.form`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0.85rem;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 8px 14px ${({ theme }) => theme.colors.shadow};
  padding: 0.55rem;
`;

export const MessageInputRow = styled.div`
  display: flex;
  gap: 0.55rem;
`;

export const MessageInputField = styled.input`
  flex: 1;
  border-radius: 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.7rem 0.85rem;
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 190, 0, 0.2);
  }
`;

export const ModelSelectWrapper = styled.div`
  position: relative;
  min-width: 15rem;
`;

export const ModelSelectButton = styled.button`
  width: 100%;
  text-align: left;
  border-radius: 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 0.7rem 2rem 0.7rem 0.85rem;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23999%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
  background-repeat: no-repeat;
  background-position: right 0.85rem top 50%;
  background-size: 0.65rem auto;

  &:focus, &[aria-expanded="true"] {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(255, 190, 0, 0.2);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const ModelSelectList = styled.div`
  position: absolute;
  bottom: calc(100% + 0.5rem);
  left: 0;
  width: 100%;
  min-width: 15rem;
  max-height: 22rem;
  overflow-y: auto;
  border-radius: 0.7rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 -4px 14px ${({ theme }) => theme.colors.shadow};
  z-index: 100;
  padding: 0.5rem 0;
`;

export const ModelProviderGroup = styled.div`
  margin-bottom: 0.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ModelProviderLabel = styled.div`
  padding: 0.5rem 0.85rem;
  font-size: 0.95rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.inputBackground};
  border-bottom: 2px solid ${({ theme }) => theme.colors.primary};
  margin-bottom: 0.25rem;
`;

export const ModelOptionItem = styled.div<{ $isSelected?: boolean }>`
  padding: 0.55rem 0.85rem 0.55rem 1.25rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: background 0.1s ease;
  background: ${({ $isSelected }) => $isSelected ? 'rgba(255, 190, 0, 0.15)' : 'transparent'};
  font-weight: ${({ $isSelected }) => $isSelected ? '700' : '400'};

  &:hover {
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const ModelOptionExpand = styled.div`
  padding: 0.5rem 0.85rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.35rem;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.inputBackground};
  }
`;

export const MessageSubmit = styled.button`
  min-width: 6.5rem;
  border: 0;
  border-radius: 0.7rem;
  padding: 0.7rem 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primaryText};
  background: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  transition: filter 0.16s ease, transform 0.16s ease;

  &:hover:enabled {
    filter: brightness(0.95);
  }

  &:active:enabled {
    transform: scale(0.985);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

export const SubmitSpinner = styled.span`
  display: inline-block;
  width: 0.95rem;
  height: 0.95rem;
  margin-right: 0.45rem;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-top-color: transparent;
  animation: spin 0.75s linear infinite;
`;

export const SubmitArrow = styled.span`
  margin-right: 0.45rem;
`;
