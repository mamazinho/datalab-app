import type { ReactNode } from "react";

export interface IStepProps {
  children: ReactNode;
  className?: string;
  canGoBack?: boolean;
  canGoForward?: boolean;
}

export const Step = ({ children, className = '' }: IStepProps) => (
  <div className={className}>{children}</div>
);