type PrismaJson = any;

export interface LeadSubmitCreateDTO {
  apiKey: string;
  dataFormId: string;
  userAgent?: PrismaJson;
  dataValues: Record<string, string>;
}

export interface LabelFormCreateDTO {
  name: string;
  label: string;
  type: string;
  description: string;
}
