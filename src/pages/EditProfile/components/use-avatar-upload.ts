import { useState } from 'react';
import { ApiError } from '../../../utils/api-error';

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

export const useAvatarUpload = (initialUrl: string) => {
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | undefined>(undefined);

  const handleFileSelected = async (file: File) => {
    setUploadError(undefined);
    setIsUploading(true);

    try {
      const uploadedImageUrl = await uploadImageToTemporaryHost(file);
      setAvatarUrl(uploadedImageUrl);
    } catch (uploadErr: unknown) {
      setUploadError(ApiError.from(uploadErr).friendly_message);
    } finally {
      setIsUploading(false);
    }
  };

  return { avatarUrl, isUploading, uploadError, handleFileSelected };
};
