import { useRef, type ChangeEvent } from 'react';
import {
  AvatarButton,
  AvatarEditIndicator,
  AvatarHelpText,
  AvatarImage,
  HiddenFileInput,
  UploadingBadge,
} from './edit-profile-form.style';

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
      <AvatarButton type="button" onClick={handleOpenFilePicker} disabled={isDisabled || isUploading}>
        <AvatarImage src={avatarUrl} name={firstName} size={256} alt={`Foto de perfil de ${firstName}`} />
        <AvatarEditIndicator title="Editar foto">✎</AvatarEditIndicator>
      </AvatarButton>
      <HiddenFileInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isDisabled || isUploading}
      />
      <AvatarHelpText>
        {isUploading && <UploadingBadge> Fazendo upload da imagem...</UploadingBadge>}
      </AvatarHelpText>
    </>
  );
};
