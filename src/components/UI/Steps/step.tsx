import type { ReactNode } from "react";

interface IStepProps {
  children: ReactNode;
  className?: string;
}

export const Step = ({ children, className = '' }: IStepProps) => (
  <div className={className}>{children}</div>
);