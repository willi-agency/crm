// src/utils/uploadImageToMinio.ts
import { uploadFileToUploadService } from '../services/uploadFileToUploadService';

interface ProcessImagesParams {
  content: string;
  recEnterpriseId: string;
}

export const processImagesInContent = async ({
  content,
  recEnterpriseId,
}: ProcessImagesParams): Promise<string> => {
  const regex = /<img[^>]+src="(data:image\/([a-zA-Z]+);base64,([^"]+))"/g;
  let match;
  let updatedContent = content;

  while ((match = regex.exec(content)) !== null) {
    const fullBase64 = match[1]; // data:image/...;base64,...
    const extension = match[2]; // jpg, png, etc.

    // Cria um nome de arquivo simples baseado na extensão + timestamp
    const nameFile = `image-${Date.now()}.${extension}`;

    try {
      const imageUrl = await uploadFileToUploadService(
        fullBase64,
        recEnterpriseId,
        nameFile
      );

      updatedContent = updatedContent.replace(match[0], `<img src="${imageUrl}"`);
    } catch (error) {
      console.error(`❌ Erro ao enviar imagem para o serviço de upload: ${error}`);
    }
  }

  return updatedContent;
};
