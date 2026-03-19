import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { ErrorText, inputBaseStyles } from "../../../../styles/design-system.style";
import { PasswordRequirements } from "./password-requirements";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
`;

const InputWrapper = styled.div`
    position: relative;
`;

const StyledPasswordInput = styled.input`
    ${inputBaseStyles}
    padding-right: 2.85rem;
`;

const TogglePasswordButton = styled.button`
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.textSecondary};
    cursor: pointer;
    transition: color 0.2s ease;

    &:hover {
        color: ${({ theme }) => theme.colors.text};
    }
`;

const EyeIcon = styled.svg`
    width: 1.25rem;
    height: 1.25rem;
`;

const MatchErrorText = styled(ErrorText)`
    margin-top: 0.45rem;
`;

interface IPasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    matchValue?: string;
    mismatchMessage?: string;
    enableMatchValidation?: boolean;
}

export const PasswordInput: React.FC<IPasswordInputProps> = ({
    matchValue,
    mismatchMessage = 'As senhas não coincidem.',
    enableMatchValidation,
    ...props
}) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [typedPassword, setTypedPassword] = useState('');

    const shouldShowRequirements = useMemo(
        () => props.name === 'password' && props.autoComplete === 'new-password',
        [props.name, props.autoComplete],
    );

    const shouldValidateMatch = useMemo(
        () => typeof matchValue === 'string' && (enableMatchValidation ?? true),
        [matchValue, enableMatchValidation],
    );

    const isMismatch = shouldValidateMatch && typedPassword.length > 0 && typedPassword !== matchValue;

    useEffect(() => {
        if (typeof props.value === 'string') {
            setTypedPassword(props.value);
        }
    }, [props.value]);

    useEffect(() => {
        if (!inputRef.current) return;

        inputRef.current.setCustomValidity(isMismatch ? mismatchMessage : '');
    }, [isMismatch, mismatchMessage]);

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
        setTypedPassword(event.target.value);
        props.onChange?.(event);
    };

    const handleFocus: React.FocusEventHandler<HTMLInputElement> = (event) => {
        setIsFocused(true);
        props.onFocus?.(event);
    };

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (event) => {
        setIsFocused(false);
        props.onBlur?.(event);
    };

    return (
        <Wrapper>
            <InputWrapper>
                <StyledPasswordInput 
                    ref={inputRef}
                    type={showPassword ? "text" : "password"}
                    {...props}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                <TogglePasswordButton
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                    {showPassword ? (
                        <EyeIcon xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </EyeIcon>
                    ) : (
                        <EyeIcon xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </EyeIcon>
                    )}
                </TogglePasswordButton>
            </InputWrapper>
            {shouldShowRequirements && isFocused && <PasswordRequirements password={typedPassword} />}
            {isMismatch && <MatchErrorText>{mismatchMessage}</MatchErrorText>}
        </Wrapper>
    )
}