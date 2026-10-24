import React from 'react';
import styles from './buttons.module.css';

export interface ISocialButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon: React.ReactNode;
}

export const SocialIcon = (props: React.SVGProps<SVGSVGElement>) => <svg className={styles.socialIcon} {...props} />;

// Casca comum dos botões de login social — só o ícone e o rótulo mudam.
export const SocialButton: React.FC<ISocialButtonProps> = ({ label, icon, ...props }) => (
  <button type="button" className={styles.socialButton} {...props}>
    {icon}
    {label}
  </button>
);
