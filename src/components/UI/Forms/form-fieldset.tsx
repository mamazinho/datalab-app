import type { FieldsetHTMLAttributes } from 'react';
import { useFormStatus } from 'react-dom';

// Locks the fields while the action of the enclosing form runs
export const FormFieldset = ({ disabled, ...props }: FieldsetHTMLAttributes<HTMLFieldSetElement>) => {
  const { pending } = useFormStatus();
  return <fieldset {...props} disabled={pending || disabled} />;
};
