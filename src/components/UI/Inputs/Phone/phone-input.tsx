import { useMemo } from 'react';
import PhoneInput, { getCountries } from 'react-phone-number-input';
import ptBR from 'react-phone-number-input/locale/pt';
import { Wrapper } from './phone-input.style';

interface IPhoneFieldProps {
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  defaultCountry?: (ReturnType<typeof getCountries>[number]);
}

const normalizePhoneValue = (value?: string) => {
  if (!value) return '';

  const digitsOnly = value.replace(/\D/g, '');

  if (!digitsOnly) return '';

  return `+${digitsOnly}`;
};

export const PhoneField = ({
  id,
  name,
  value,
  onValueChange,
  placeholder = 'Digite seu telefone',
  autoComplete = 'tel',
  required = false,
  disabled = false,
  defaultCountry = 'BR',
}: IPhoneFieldProps) => {
  const phoneCountries = useMemo(() => getCountries(), []);

  return (
    <Wrapper>
      {name && <input type="hidden" name={name} value={value} readOnly />}

      <PhoneInput
        id={id}
        countries={phoneCountries}
        labels={ptBR}
        international
        countryCallingCodeEditable={false}
        defaultCountry={defaultCountry}
        value={value || undefined}
        onChange={(nextValue) => onValueChange(normalizePhoneValue(nextValue))}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
      />
    </Wrapper>
  );
};
