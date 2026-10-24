import type { ComponentPropsWithoutRef } from 'react';
import styles from './toggle.module.css';

type ToggleSwitchProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

export const ToggleSwitch = (props: ToggleSwitchProps) => (
  <input type="checkbox" className={styles.toggleSwitch} {...props} />
);

interface IToggleProps extends Omit<ToggleSwitchProps, 'role'> {
  label: string;
}

export const Toggle = ({ label, ...inputProps }: IToggleProps) => (
  <label className={styles.toggleLabel}>
    <ToggleSwitch role="switch" {...inputProps} />
    {label}
  </label>
);
