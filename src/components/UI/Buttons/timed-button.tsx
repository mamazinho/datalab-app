import React, { useEffect, useState } from "react";
import styles from "./buttons.module.css";

export interface ITimedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    cooldown: number;
    textWhenNoClicked: string;
    textWhenClicked: string;
    appearance?: 'primary' | 'secondary';
}

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
        let interval: ReturnType<typeof setInterval>;
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
        <button
            className={styles.timedButton}
            data-appearance={appearance}
            type={type}
            disabled={timer > 0 || disabled}
            onClick={handleClick}
            {...rest}
        >
            {timer > 0 ? `Reenviar em ${defaultFormatTime(timer)}` : (clicked ? textWhenClicked : textWhenNoClicked)}
        </button>
    )
}