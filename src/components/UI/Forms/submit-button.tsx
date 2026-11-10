import type { ButtonHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';

interface ISubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pendingLabel: string;
}

export const SubmitButton = ({ pendingLabel, children, disabled, ...props }: ISubmitButtonProps) => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" {...props} disabled={pending || disabled}>
      {pending ? pendingLabel : children}
    </button>
  );
};
