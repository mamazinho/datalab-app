import styles from './phone-input.module.css';
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

interface IPhoneFieldProps {
  id?: string;
  name?: string;
  value: string;
  onValueChange: (value: string) => void;
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

// The library ships English names; Intl translates them without a locale package
const regionNames = new Intl.DisplayNames(['pt-BR'], { type: 'region' });

const translatedCountries = defaultCountries
  .map((country) => {
    const parsed = parseCountry(country);
    let name = parsed.name;

    try {
      name = regionNames.of(parsed.iso2.toUpperCase()) ?? parsed.name;
    } catch {
      // Non-standard iso2 codes ("xk") keep the library name
    }

    return buildCountryData({ ...parsed, name });
  })
  .sort((a, b) => parseCountry(a).name.localeCompare(parseCountry(b).name, 'pt-BR'));

// The library mask uses "." per digit ("(..) .....-...."), so it becomes "(99) 99999-9999"
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
    <div className={styles.wrapper}>
      {/* The visible input shows the national format; the form sends E.164 */}
      {name && <input type="hidden" name={name} value={value} readOnly />}

      <PhoneInput
        value={value}
        defaultCountry={defaultCountry}
        countries={translatedCountries}
        preferredCountries={[defaultCountry]}
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
    </div>
  );
};
