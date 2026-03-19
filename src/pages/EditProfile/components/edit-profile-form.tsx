import { useState } from 'react';
import {
  AvatarRow,
  Footer,
  Form,
  FormError,
  SaveButton,
  SectionTitle,
  StyledField,
  StyledFieldset,
  StyledInput,
  StyledLabel,
  StyledSelect,
} from './edit-profile-form.style';
import { ProfileAvatarUploader } from './profile-avatar-uploader';
import type { IUserResponse } from '../../../services/datalab-api/usersResource';
import { PasswordInput } from '../../../components/UI/Inputs/Password/password-input';
import { PhoneField } from '../../../components/UI/Inputs/Phone';

interface IEditProfileFormProps {
  user: IUserResponse;
  action: (formData: FormData) => void;
  isPending: boolean;
  error?: string;
}

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
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const customAction = async (formData: FormData): Promise<void> => {
    setPassword('');
    setConfirmPassword('');
    action(formData);
  };

  return (
    <Form action={customAction}>
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

      <StyledFieldset disabled={isPending || isUploadingAvatar}>

        <SectionTitle>Perfil</SectionTitle>

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
          <PhoneField
            id="inputPhoneNumber"
            name="phone_number"
            value={phoneNumber}
            onValueChange={setPhoneNumber}
            placeholder="Digite seu telefone"
            autoComplete="tel"
            disabled={isPending || isUploadingAvatar}
          />
        </StyledField>

        <SectionTitle>Configurações</SectionTitle>

        <StyledField>
          <StyledLabel htmlFor="inputTheme">Tema</StyledLabel>
          <StyledSelect id="inputTheme" name="theme" defaultValue={user?.config?.theme || 'system'}>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
            <option value="system">Sistema</option>
          </StyledSelect>
        </StyledField>

        <SectionTitle>Senhas</SectionTitle>

        <StyledField>
          <StyledLabel htmlFor="inputPassword">Nova senha</StyledLabel>
          <PasswordInput
            id="inputPassword"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite a nova senha"
            autoComplete="new-password"
          />
        </StyledField>

        <StyledField>
          <StyledLabel htmlFor="inputConfirmPassword">Confirmar nova senha</StyledLabel>
          <PasswordInput
            id="inputConfirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            matchValue={password}
            placeholder="Confirme a nova senha"
            autoComplete="new-password"
          />
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
