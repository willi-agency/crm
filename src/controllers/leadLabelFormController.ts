/* src/controllers/blogLabelFormController.ts */
import { Request, Response } from 'express';
import * as LabelFormService from '../services/leadLabelFormService';
import { ZodError } from 'zod';
import {
  getAllLabelFormByNameSchema,
  getLabelFormByIdSchema,
  LabelFormCreateDTO,
  createLabelFormSchema,
} from '../schemas/labelFormSchemas';
import { ScopeType } from '../types/scopeType';

export const createLabelForm = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const validatedData: LabelFormCreateDTO = createLabelFormSchema.parse(
      req.body
    );
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    // Chama o serviço para criar a label no banco de dados
    const result = await LabelFormService.createLabelForm(validatedData, scope);

    // Retorna a resposta de sucesso
    return res.status(201).json(result);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getLabelFormByName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Validação do slug
    const validatedData = getAllLabelFormByNameSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };

    // Chama o serviço para buscar a label
    const labelForm = await LabelFormService.getLabelFormByName(
      validatedData.name,
      scope
    );
    return res.status(200).json(labelForm);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const getAllLabels = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };
    const labelForms = await LabelFormService.getAllLabels(scope);
    return res.status(200).json(labelForms);
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};

export const deleteLabelForm = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = getLabelFormByIdSchema.parse(req.params);
    const user = (req as any).user as ScopeType;
    const scope = {
      enterpriseId: user?.enterpriseId,
      enterpriseType: user?.enterpriseType,
    };
    const softDeleteLabelForm = await LabelFormService.deleteLabelForm(
      id,
      scope
    );

    return res.status(200).json({
      message: 'Label deletada lógicamente com sucesso!',
      labelForm: softDeleteLabelForm,
    });
  } catch (err: any) {
    // Validação com zod
    if (err instanceof ZodError) {
      return res
        .status(400)
        .json({ message: 'Dados de entrada inválidos', details: err.errors });
    }

    // Erros customizados da sua service
    if (err?.statusCode && err?.message) {
      return res.status(err.statusCode).json({ message: err.message });
    }

    // Fallback genérico
    console.error('Erro inesperado:', err);
    return res
      .status(500)
      .json({ message: 'Erro interno do servidor', details: err.message });
  }
};
