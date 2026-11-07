import styles from './edit-profile-form.module.css';
import { Avatar } from '../../../components/UI/Avatar';
import { useRef, type ChangeEvent } from 'react';
import { useFormStatus } from 'react-dom';

interface IProfileAvatarUploaderProps {
  avatarUrl: string;
  firstName: string;
  isUploading: boolean;
  onFileSelected: (file: File) => Promise<void>;
}

export const ProfileAvatarUploader = ({
  avatarUrl,
  firstName,
  isUploading,
  onFileSelected,
}: IProfileAvatarUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { pending } = useFormStatus();
  const isDisabled = pending || isUploading;

  const handleOpenFilePicker = () => {
    if (isDisabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await onFileSelected(file);
    event.target.value = '';
  };

  return (
    <>
      <button className={styles.avatarButton} type="button" onClick={handleOpenFilePicker} disabled={isDisabled}>
        <Avatar className={styles.avatarImage} src={avatarUrl} name={firstName} alt={`Foto de perfil de ${firstName}`} />
        <span className={styles.avatarEditIndicator} title="Editar foto">✎</span>
      </button>
      <input className={styles.hiddenFileInput}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isDisabled}
      />
      <p className={styles.avatarHelpText}>
        {isUploading && <span className={styles.uploadingBadge}> Fazendo upload da imagem...</span>}
      </p>
    </>
  );
};
