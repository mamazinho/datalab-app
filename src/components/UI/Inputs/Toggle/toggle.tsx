import type { ComponentPropsWithoutRef } from 'react';
import { ToggleLabel, ToggleSwitch } from './toggle.style';

interface IToggleProps extends Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'role'> {
  label: string;
}

export const Toggle = ({ label, ...inputProps }: IToggleProps) => (
  <ToggleLabel>
    <ToggleSwitch role="switch" {...inputProps} />
    {label}
  </ToggleLabel>
);
