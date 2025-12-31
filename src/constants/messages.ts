// src/constants/messages.ts

export const BusinessMessages  = {
  article: {
    create: {
      success: 'Artigo cadastrado com sucesso!',
      genericError: 'Erro interno ao criar o artigo',
      slugAlreadyRegistered: 'Slug já cadastrado para esta empresa',
      partialSuccess: 'Artigo criado com sucesso, mas houve um problema ao processar categorias, tags ou coleções',
    },
    update: {
      success: 'Artigo atualizado com sucesso!',
      genericError: 'Erro interno ao atualizar o artigo',
    },
    delete: {
      success: 'Artigo deletado com sucesso!',
      genericError: 'Erro interno ao deletar o artigo',
    },
    get: {
      notFound: 'Nenhum artigo encontrado',
      ManySuccess: 'Artigos encontrados com sucesso!',
      genericError: 'Erro interno ao consultar artigo',
    },
  },

  author: {
    create: {
      success: 'Autor cadastrado com sucesso!',
      genericError: 'Erro interno ao criar o autor',
      nameAlreadyRegistered: 'Autor já cadastrado para esta empresa',
    },
    update: {
      success: 'Autor atualizado com sucesso!',
      genericError: 'Erro interno ao atualizar o autor',
    },
    delete: {
      success: 'Autor deletado com sucesso!',
      genericError: 'Erro interno ao deletar o autor',
    },
    get: {
      OneSuccess: 'Autor encontrado!',
      ManySuccess: 'Autores encontrados!',
      notFound: 'Nenhum autor encontrado',
      genericError: 'Erro interno ao consultar autor',
    },
  },

  taxonomy: {
    create: {
      success: 'Taxonomia cadastrada com sucesso!',
      genericError: 'Erro interno ao criar a taxonomia',
      nameAlreadyRegistered: 'Taxonomia já cadastrada para esta empresa',
    },
    update: {
      success: 'Taxonomia atualizada com sucesso!',
      genericError: 'Erro interno ao atualizar a taxonomia',
    },
    delete: {
      success: 'Taxonomia deletada com sucesso!',
      genericError: 'Erro interno ao deletar a taxonomia',
    },
    get: {
      OneSuccess: 'Taxonomia encontrada!',
      ManySuccess: 'Taxonomias encontradas!',
      notFound: 'Nenhuma taxonomia encontrada',
      genericError: 'Erro interno ao consultar taxonomia',
    },
  },

  lead: {
    create: {
      success: 'Lead criado com sucesso!',
      genericError: 'Erro interno ao criar lead',
    },
    update: {
      success: 'Atividade do lead atualizada com sucesso!',
      genericError: 'Erro interno ao atualizar a atividade do lead',
    },
    delete: {
      success: 'Atividade do lead deletada com sucesso!',
      genericError: 'Erro interno ao deletar a atividade do lead',
    },
    get: {
      OneSuccess: 'Lead encontrado!',
      ManySuccess: 'Leads encontradas!',
      notFound: 'Nenhum lead encontrado',
      genericError: 'Erro interno ao consultar lead',
    },
  },

  contract: {
    create: {
      success: 'Contrato cadastrado com sucesso!',
      genericError: 'Erro interno ao criar o contrato',
      codeAlreadyRegistered: 'Contrato com este código já cadastrado para esta empresa',
    },
    update: {
      success: 'Contrato atualizado com sucesso!',
      genericError: 'Erro interno ao atualizar o contrato',
    },
    delete: {
      success: 'Contrato deletado com sucesso!',
      genericError: 'Erro interno ao deletar o contrato',
    },
    get: {
      OneSuccess: 'Contrato encontrado!',
      ManySuccess: 'Contratos encontrados!',
      notFound: 'Nenhum contrato encontrado',
      genericError: 'Erro interno ao consultar contrato',
    },
  },

  service: {
    create: {
      success: 'Serviço cadastrado com sucesso!',
      genericError: 'Erro interno ao criar o serviço',
      codeAlreadyRegistered: 'Serviço com este código já cadastrado para esta empresa',
    },
    update: {
      success: 'Serviço atualizado com sucesso!',
      genericError: 'Erro interno ao atualizar o serviço',
    },
    delete: {
      success: 'Serviço deletado com sucesso!',
      genericError: 'Erro interno ao deletar o serviço',
    },
    get: {
      OneSuccess: 'Serviço encontrado!',
      ManySuccess: 'Serviços encontrados!',
      notFound: 'Nenhum serviço encontrado',
      genericError: 'Erro interno ao consultar serviço',
    },
  },

  leadActivity: {
    create: {
      success: 'Atividade do lead registrada com sucesso!',
      genericError: 'Erro interno ao criar a atividade do lead',
    },
    update: {
      success: 'Atividade do lead atualizada com sucesso!',
      genericError: 'Erro interno ao atualizar a atividade do lead',
    },
    delete: {
      success: 'Atividade do lead deletada com sucesso!',
      genericError: 'Erro interno ao deletar a atividade do lead',
    },
    get: {
      OneSuccess: 'Atividade do lead encontrada!',
      ManySuccess: 'Atividades do lead encontradas!',
      notFound: 'Nenhuma atividade do lead encontrada',
      genericError: 'Erro interno ao consultar atividades do lead',
    },
  },

  utmSubmission: {
    create: {
      success: 'URL com UTMs registrada com sucesso!',
      genericError: 'Erro interno ao registrar URL com UTMs',
    },
    get: {
      OneSuccess: 'URL com UTMs encontrada!',
      ManySuccess: 'URLs com UTMs encontradas!',
      notFound: 'Nenhuma URL com UTMs encontrada',
      genericError: 'Erro interno ao consultar URLs com UTMs',
    },
  },

};

export const ValidationMessages = {
  title: {
    required: 'Título é obrigatório',
  },
  name: {
    required: 'Nome é obrigatório',
  },
  slug: {
    required: 'Slug é obrigatório',
    invalid: 'Slug deve conter apenas letras minúsculas, números e hifens',
  },
  description: {
    required: 'Descrição é obrigatória',
  },
  content: {
    required: 'Conteúdo é obrigatório',
  },
  authorId: {
    required: 'ID do autor é obrigatório',
  },
  categoryId: {
    required: 'ID da categoria é obrigatório',
  },
  datePublished: {
    invalid: 'Data de publicação inválida',
  },
  image: {
    invalid: 'Precisa ser uma URL válida',
  },

  url: {
    invalid: 'Precisa ser uma URL válida',
  },
  useId: {
    required: 'ID em UUID é obrigatório',
  },
  json: {
    invalid: 'Formato inválido, é necessário ser um JSON',
  },
  date: {
    invalid: 'Data em formato inválido, precisa ser em ISO 8601',
  },
};
