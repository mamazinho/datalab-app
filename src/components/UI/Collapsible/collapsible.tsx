import { useId, useState, type ReactNode } from 'react';
import {
  CollapsibleChevron,
  CollapsibleContent,
  CollapsibleTrigger,
  CollapsibleWrapper,
} from './collapsible.style';

interface ICollapsibleProps {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export const Collapsible = ({ label, defaultOpen = false, children }: ICollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <CollapsibleWrapper>
      <CollapsibleTrigger
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {label}
        <CollapsibleChevron
          $isOpen={isOpen}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </CollapsibleChevron>
      </CollapsibleTrigger>

      <CollapsibleContent id={contentId} hidden={!isOpen} onInvalidCapture={() => setIsOpen(true)}>
        {children}
      </CollapsibleContent>
    </CollapsibleWrapper>
  );
};
