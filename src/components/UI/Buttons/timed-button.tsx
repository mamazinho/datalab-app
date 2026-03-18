import React, { useEffect, useState } from "react";
import styled, { css } from "styled-components";

export interface ITimedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    cooldown: number;
    textWhenNoClicked: string;
    textWhenClicked: string;
    appearance?: 'primary' | 'secondary';
}

const timedButtonBase = css`
    width: 100%;
    border-radius: 0.85rem;
    border: 1px solid transparent;
    padding: 0.88rem 1rem;
    font-weight: 700;
    transition: transform 0.16s ease, filter 0.16s ease, box-shadow 0.16s ease;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        filter: none;
    }

    &:not(:disabled):active {
        transform: scale(0.985);
    }
`;

const TimedButtonElement = styled.button<{ $appearance: 'primary' | 'secondary' }>`
    ${timedButtonBase}

    ${({ $appearance, theme }) =>
        $appearance === 'secondary'
            ? css`
                  background: ${theme.colors.inputBackground};
                  border-color: ${theme.colors.border};
                  color: ${theme.colors.text};

                  &:not(:disabled):hover {
                      filter: brightness(0.98);
                  }
              `
            : css`
                  background: ${theme.colors.primary};
                  color: ${theme.colors.primaryText};
                  box-shadow: 0 10px 18px rgba(255, 190, 0, 0.3);

                  &:not(:disabled):hover {
                      filter: brightness(0.95);
                      box-shadow: 0 12px 22px rgba(255, 190, 0, 0.38);
                  }
              `}
`;

export const TimedButton = ({ 
    cooldown, 
    onClick,
    textWhenNoClicked,
    textWhenClicked,
    type = "button",
    disabled,
    appearance = 'primary',
    ...rest
}: ITimedButtonProps) => {
    const [timer, setTimer] = useState(0);
    const [clicked, setClicked] = useState(false);
    
    useEffect(() => {
        let interval: number;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const defaultFormatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }; 
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setClicked(true);
        if (onClick) onClick(e);
        
        // Delay timer set to allow form submission to trigger first if this is a submit button
        setTimeout(() => {
            setTimer(cooldown);
        }, 0);
    };

    return (
        <TimedButtonElement
            $appearance={appearance}
            type={type}
            disabled={timer > 0 || disabled}
            onClick={handleClick}
            {...rest}
        >
            {timer > 0 ? `Reenviar em ${defaultFormatTime(timer)}` : (clicked ? textWhenClicked : textWhenNoClicked)}
        </TimedButtonElement>
    )
}