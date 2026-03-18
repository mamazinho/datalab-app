import { useState } from 'react';
import {
  AvatarRow,
  Footer,
  Form,
  FormError,
  PhoneNumberWrapper,
  SaveButton,
  StyledField,
  StyledFieldset,
  StyledInput,
  StyledLabel,
  StyledSelect,
} from './edit-profile-form.style';
import { ProfileAvatarUploader } from './profile-avatar-uploader';
import type { IUserResponse } from '../../../services/datalab-api/usersResource';
import PhoneInput, { getCountries } from 'react-phone-number-input';
import ptBR from 'react-phone-number-input/locale/pt';

const AVAILABLE_COUNTRIES = getCountries();

interface IEditProfileFormProps {
  user: IUserResponse;
  action: (formData: FormData) => void;
  isPending: boolean;
  error?: string;
}

const toE164Phone = (value: string | null | undefined): string | undefined => {
  const raw = (value || '').trim();
  if (!raw) return undefined;

  const digits = raw.replace(/\D/g, '');
  if (!digits) return undefined;

  return `+${digits}`;
};

const toAvatarFallbackUrl = (name: string) => {
  const firstName = name.trim().split(' ')[0] || 'U';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=FFBE00&color=00001F&bold=true&format=png&size=256`;
};

const uploadImageToTemporaryHost = async (file: File): Promise<string> => {
  const uploadFormData = new FormData();
  uploadFormData.append('file', file);

  const response = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: uploadFormData,
  });

  if (!response.ok) {
    throw new Error('Falha no upload da imagem.');
  }

  const data = (await response.json()) as {
    data?: {
      url?: string;
    };
  };

  const fileUrl = data?.data?.url;
  if (!fileUrl) {
    throw new Error('URL da imagem não retornada pelo serviço de upload.');
  }

  return fileUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
};

export const EditProfileForm = ({ user, action, isPending, error }: IEditProfileFormProps) => {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);
  const [phoneNumber, setPhoneNumber] = useState<string | undefined>(toE164Phone(user.phone_number));

  const firstName = user.name.trim().split(' ')[0] || 'Usuário';
  const displayAvatarUrl = avatarUrl || toAvatarFallbackUrl(user.name);

  const handleAvatarSelected = async (file: File) => {
    setUploadError(undefined);
    setIsUploadingAvatar(true);

    try {
      const uploadedImageUrl = await uploadImageToTemporaryHost(file);
      setAvatarUrl(uploadedImageUrl);
    } catch (uploadErr: unknown) {
      const message = uploadErr instanceof Error ? uploadErr.message : String(uploadErr);
      setUploadError(`Erro no upload da foto: ${message}`);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <Form action={action}>
      <AvatarRow>
        <ProfileAvatarUploader
          avatarUrl={displayAvatarUrl}
          firstName={firstName}
          isUploading={isUploadingAvatar}
          isDisabled={isPending}
          onFileSelected={handleAvatarSelected}
        />
      </AvatarRow>

      <input type="hidden" name="avatar_url" value={avatarUrl} readOnly />
      <input type="hidden" name="phone_number" value={phoneNumber || ''} readOnly />

      <StyledFieldset disabled={isPending || isUploadingAvatar}>

        <StyledField>
          <StyledLabel htmlFor="inputName">Nome</StyledLabel>
          <StyledInput
            id="inputName"
            name="name"
            defaultValue={user.name}
            autoComplete="name"
          />
        </StyledField>

        <StyledField>
          <StyledLabel htmlFor="inputPhoneNumber">Telefone</StyledLabel>
          <PhoneNumberWrapper>
            <PhoneInput
              id="inputPhoneNumber"
              countries={AVAILABLE_COUNTRIES}
              labels={ptBR}
              international
              countryCallingCodeEditable={false}
              defaultCountry="BR"
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(toE164Phone(value))}
              placeholder="Digite seu telefone"
              autoComplete="tel"
            />
          </PhoneNumberWrapper>
        </StyledField>

        <StyledField>
          <StyledLabel htmlFor="inputTheme">Tema</StyledLabel>
          <StyledSelect id="inputTheme" name="theme" defaultValue={user.config?.theme || 'light'}>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="system">Sistema</option>
          </StyledSelect>
        </StyledField>

        {(error || uploadError) && <FormError>{error || uploadError}</FormError>}

        <Footer>
          <SaveButton type="submit" disabled={isPending || isUploadingAvatar}>
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </SaveButton>
        </Footer>
      </StyledFieldset>
    </Form>
  );
};
