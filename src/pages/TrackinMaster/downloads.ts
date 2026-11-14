import type { IBuildResult, IContainerFile } from '../../services/datalab-api/trackingResource';
import { saveBase64, saveBlob } from '../../utils/download';

export const downloadText = (filename: string, content: string, type: string) =>
  saveBlob(new Blob([content], { type }), filename);

export const downloadContainer = (container: IContainerFile) =>
  downloadText(container.file, container.content, 'application/json');

export const downloadDocument = (result: IBuildResult) =>
  saveBase64(result.document.content_base64, result.document.file, 'application/pdf');
