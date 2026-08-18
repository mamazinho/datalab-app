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
  StyledOption,
} from './edit-profile-form.style';
import { ProfileAvatarUploader } from './profile-avatar-uploader';
import { useAvatarUpload } from './use-avatar-upload';
import type { IUserConfig, IUserResponse } from '../../../services/datalab-api/usersResource';
import { PasswordInput } from '../../../components/UI/Inputs/Password/password-input';
import { PhoneField } from '../../../components/UI/Inputs/Phone';

interface IEditProfileFormProps {
  user: IUserResponse;
  action: (formData: FormData) => void;
  isPending: boolean;
  error?: string;
}

const THEME_OPTIONS: { value: IUserConfig['theme']; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'system', label: 'Sistema' },
];

export const EditProfileForm = ({ user, action, isPending, error }: IEditProfileFormProps) => {
  const { avatarUrl, isUploading: isUploadingAvatar, uploadError, handleFileSelected } = useAvatarUpload(user.avatar_url || '');
  const [phoneNumber, setPhoneNumber] = useState(user.phone_number || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [theme, setTheme] = useState<IUserConfig['theme']>(user?.config?.theme || 'system');
  const firstName = user.name.trim().split(' ')[0] || 'Usuário';

  // O submit segue pelo action do React 19; aqui só limpamos as senhas
  // (controladas por causa do matchValue) — o FormData já foi capturado com elas.
  const handleSubmit = () => {
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <Form action={action} onSubmit={handleSubmit}>
      <AvatarRow>
        <ProfileAvatarUploader
          avatarUrl={avatarUrl}
          firstName={firstName}
          isUploading={isUploadingAvatar}
          isDisabled={isPending}
          onFileSelected={handleFileSelected}
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
            autoComplete="tel"
            disabled={isPending || isUploadingAvatar}
          />
        </StyledField>

        <SectionTitle>Configurações</SectionTitle>

        <StyledField>
          <StyledLabel htmlFor="inputTheme">Tema</StyledLabel>
          <StyledSelect
            id="inputTheme"
            name="theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value as IUserConfig['theme'])}
          >
            {THEME_OPTIONS.map((option) => (
              <StyledOption key={option.value} value={option.value}>
                {option.label}
              </StyledOption>
            ))}
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
            showRequirements
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
