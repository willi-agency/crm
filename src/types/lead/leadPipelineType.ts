export interface LeadPipelineCreateDTO {
  name: string;
  description: string;
  enterpriseId: string;
}

export interface LeadPipelineUpdateDTO {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface LeadPipelineFilterType {
  name?: string;
  description?: string;
  enterpriseId?: string;
  isActive?: boolean;
  search?: string;
}
