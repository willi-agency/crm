// src/services/uploadFileToUploadService.ts
import axios from 'axios';

/**
 * Envia imagem base64 (formato completo: data:image/...) para o serviço externo de upload.
 */
export const uploadFileToUploadService = async (
  base64String: string,
  enterpriseId: string,
  fileName?: string
): Promise<string> => {
  let endpoint: string;

  if (base64String.startsWith('data:image/')) {
    endpoint = '/api/upload';
  } else if (base64String.startsWith('data:application/pdf')) {
    endpoint = '/api/upload/pdf';
  } else {
    throw new Error('Formato de arquivo não suportado. Use imagem ou PDF em base64.');
  }

  try {      
    const response = await axios.post(
      `${process.env.UPLOAD_SERVICE_URL}${endpoint}`,
      {
        base64: base64String,
        enterpriseId,
        fileName,
      },
      {
        headers: {
          'x-access-key': process.env.ACCESS_KEY || '',
          'x-secret-key': process.env.SECRET_KEY || ''
        }
      }
    );

    console.log('Resposta do serviço de upload:', response.data);

    const uploadedPath = response?.data?.path;
    if (typeof uploadedPath !== 'string' || !uploadedPath.includes('/')) {
      throw new Error('Resposta inesperada do serviço de upload.');
    }

    return `${process.env.UPLOAD_SERVICE_URL}${response.data.path}`;
  } catch (error: any) {
      console.error('Erro durante o upload:', {
      message: error?.message,
      responseData: error?.response?.data,
      status: error?.response?.status,
      headers: error?.response?.headers,
      config: error?.config,
    });
    throw new Error('Falha ao fazer upload do arquivo.');
  }
};
