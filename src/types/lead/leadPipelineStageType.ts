export interface LeadPipelineStageCreateDTO {
  name: string;
  order: number;
  pipelineId: string;
}

// Interface alinhada com o Zod
export interface LeadPipelineStageUpdateDTO {
  id: string;         // obrigatório
  name?: string;      // opcional
  order?: number;     // opcional
}

// Para múltiplos updates
export type LeadPipelineStagesUpdateDTO = LeadPipelineStageUpdateDTO[];


export interface LeadPipelineStageFilterType {
  name?: string;
  order?: number;
  pipelineId?: string;
  search?: string;
}
