import React, { useEffect, useState } from "react";

export interface ITimedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    cooldown: number;
    textWhenNoClicked: string;
    textWhenClicked: string;
}

export const TimedButton = ({ 
    cooldown, 
    onClick,
    textWhenNoClicked,
    textWhenClicked,
    type = "button",
    disabled,
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

    const styleClasses = "w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-orange-600 disabled:shadow-none disabled:active:scale-100 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]";

    return (
        <button
            className={styleClasses}
            type={type}
            disabled={timer > 0 || disabled}
            onClick={handleClick}
            {...rest}
        >
            {timer > 0 ? `Reenviar em ${defaultFormatTime(timer)}` : (clicked ? textWhenClicked : textWhenNoClicked)}
        </button>
    )
}