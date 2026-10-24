import designSystemStyles from '../../../styles/design-system.module.css';
import styles from './edit-profile-form.module.css';
import { useState } from 'react';
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
    <form className={styles.form} action={action} onSubmit={handleSubmit}>
      <div className={styles.avatarRow}>
        <ProfileAvatarUploader
          avatarUrl={avatarUrl}
          firstName={firstName}
          isUploading={isUploadingAvatar}
          isDisabled={isPending}
          onFileSelected={handleFileSelected}
        />
      </div>

      <input type="hidden" name="avatar_url" value={avatarUrl} readOnly />

      <fieldset className={styles.styledFieldset} disabled={isPending || isUploadingAvatar}>

        <h3 className={styles.sectionTitle}>Perfil</h3>

        <div className={designSystemStyles.field}>
          <label className={designSystemStyles.label} htmlFor="inputName">Nome</label>
          <input className={designSystemStyles.input}
            id="inputName"
            name="name"
            defaultValue={user.name}
            autoComplete="name"
          />
        </div>

        <div className={designSystemStyles.field}>
          <label className={designSystemStyles.label} htmlFor="inputPhoneNumber">Telefone</label>
          <PhoneField
            id="inputPhoneNumber"
            name="phone_number"
            value={phoneNumber}
            onValueChange={setPhoneNumber}
            autoComplete="tel"
            disabled={isPending || isUploadingAvatar}
          />
        </div>

        <h3 className={styles.sectionTitle}>Configurações</h3>

        <div className={designSystemStyles.field}>
          <label className={designSystemStyles.label} htmlFor="inputTheme">Tema</label>
          <select className={styles.styledSelect}
            id="inputTheme"
            name="theme"
            value={theme}
            onChange={(event) => setTheme(event.target.value as IUserConfig['theme'])}
          >
            {THEME_OPTIONS.map((option) => (
              <option className={styles.styledOption} key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <h3 className={styles.sectionTitle}>Senhas</h3>

        <div className={designSystemStyles.field}>
          <label className={designSystemStyles.label} htmlFor="inputPassword">Nova senha</label>
          <PasswordInput
            id="inputPassword"
            name="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite a nova senha"
            autoComplete="new-password"
            showRequirements
          />
        </div>

        <div className={designSystemStyles.field}>
          <label className={designSystemStyles.label} htmlFor="inputConfirmPassword">Confirmar nova senha</label>
          <PasswordInput
            id="inputConfirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            matchValue={password}
            placeholder="Confirme a nova senha"
            autoComplete="new-password"
          />
        </div>

        {(error || uploadError) && <p className={styles.formError}>{error || uploadError}</p>}

        <div className={styles.footer}>
          <button className={styles.saveButton} type="submit" disabled={isPending || isUploadingAvatar}>
            {isPending ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </fieldset>
    </form>
  );
};
