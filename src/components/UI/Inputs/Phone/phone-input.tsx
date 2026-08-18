import { useMemo, useState } from 'react';
import {
  PhoneInput,
  buildCountryData,
  defaultCountries,
  getCountry,
  parseCountry,
  type CountryIso2,
  type ParsedCountry,
} from 'react-international-phone';
import { Wrapper } from './phone-input.style';

interface IPhoneFieldProps {
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
  /** Sobrescreve o placeholder derivado do formato do país */
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
  defaultCountry?: CountryIso2;
}

const normalizePhoneValue = (value?: string) => {
  if (!value) return '';

  const digitsOnly = value.replace(/\D/g, '');

  if (!digitsOnly) return '';

  return `+${digitsOnly}`;
};

// Nomes traduzidos pelo próprio browser (Intl), em vez de carregar um pacote de
// locale: a lista da lib vem em inglês.
const regionNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

const translatedCountries = defaultCountries
  .map((country) => {
    const parsed = parseCountry(country);
    let name = parsed.name;

    try {
      name = regionNames.of(parsed.iso2.toUpperCase()) ?? parsed.name;
    } catch {
      // iso2 fora do padrão (ex.: "xk") — mantém o nome original da lib
    }

    return buildCountryData({ ...parsed, name });
  })
  .sort((a, b) => parseCountry(a).name.localeCompare(parseCountry(b).name, 'pt-BR'));

/**
 * Placeholder com o formato real do país: a máscara da lib usa "." por dígito
 * ("(..) .....-...." no BR), então trocamos por 9 → "(99) 99999-9999".
 */
const placeholderFromCountry = (country?: ParsedCountry) => {
  const format = country?.format;
  const mask = typeof format === 'string' ? format : format?.default;

  return mask ? mask.replace(/\./g, '9') : undefined;
};

export const PhoneField = ({
  id,
  name,
  value,
  onValueChange,
  placeholder,
  autoComplete = 'tel',
  required = false,
  disabled = false,
  defaultCountry = 'br',
}: IPhoneFieldProps) => {
  const [countryIso2, setCountryIso2] = useState<CountryIso2>(defaultCountry);

  const currentCountry = useMemo(
    () => getCountry({ field: 'iso2', value: countryIso2, countries: translatedCountries }),
    [countryIso2],
  );

  return (
    <Wrapper>
      {/* O input visível mostra o número no formato nacional; o form envia o E.164 */}
      {name && <input type="hidden" name={name} value={value} readOnly />}

      <PhoneInput
        value={value}
        defaultCountry={defaultCountry}
        countries={translatedCountries}
        preferredCountries={[defaultCountry]}
        // Tira o "+55" de dentro do campo e o coloca colado na bandeira
        disableDialCodeAndPrefix
        showDisabledDialCodeAndPrefix
        placeholder={placeholder ?? placeholderFromCountry(currentCountry)}
        disabled={disabled}
        onChange={(phone, { country }) => {
          setCountryIso2(country.iso2);
          onValueChange(normalizePhoneValue(phone));
        }}
        inputProps={{ id, autoComplete, required }}
      />
    </Wrapper>
  );
};
