import styles from './edit-profile-form.module.css';
import { Avatar } from '../../../components/UI/Avatar';
import { useRef, type ChangeEvent } from 'react';

interface IProfileAvatarUploaderProps {
  avatarUrl: string;
  firstName: string;
  isUploading: boolean;
  isDisabled: boolean;
  onFileSelected: (file: File) => Promise<void>;
}

export const ProfileAvatarUploader = ({
  avatarUrl,
  firstName,
  isUploading,
  isDisabled,
  onFileSelected,
}: IProfileAvatarUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenFilePicker = () => {
    if (isDisabled || isUploading) return;
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
      <button className={styles.avatarButton} type="button" onClick={handleOpenFilePicker} disabled={isDisabled || isUploading}>
        <Avatar className={styles.avatarImage} src={avatarUrl} name={firstName} alt={`Foto de perfil de ${firstName}`} />
        <span className={styles.avatarEditIndicator} title="Editar foto">✎</span>
      </button>
      <input className={styles.hiddenFileInput}
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isDisabled || isUploading}
      />
      <p className={styles.avatarHelpText}>
        {isUploading && <span className={styles.uploadingBadge}> Fazendo upload da imagem...</span>}
      </p>
    </>
  );
};
