// src/services/leadActivityService.ts
import * as activityErrors from '../../utils/errors/leadActivityApiError';
import * as LeadActivityModel from '../../models/lead/leadActivityModel';
import { ScopeType } from '../../types/scopeType';
import {
  LeadActivityCreateDTO,
  LeadActivityUpdateDTO,
  LeadActivityFilterType,
} from '../../schemas/lead/leadActivitySchemas';
import { findLeadById } from '../../models/lead/leadModel';
import { LeadSubmitNotFoundError } from '../../utils/leadSubmitApiError';
import { PaginationSchema } from '../../schemas/paginationSchema.ts';
import { applyEnterpriseFilter, validateEnterpriseFullScope, validateEnterpriseScope, validateStandardAccess } from '../authorizationService';
import { BusinessMessages } from '../../constants/messages';
import { getLeadById } from '../leadService';
import { getUserById } from '../userService';

/**
 * CREATE
 */
export const createLeadActivity = async (
  data: LeadActivityCreateDTO,
  scope: ScopeType
) => {
  const { leadId, type, title, description, dueDate, meetingDetails, participants = [] } = data;

  validateEnterpriseScope(scope);

  const existLead = await findLeadById(leadId);
  if (!existLead) throw new LeadSubmitNotFoundError();

  validateStandardAccess(scope, existLead.enterpriseId);

  const dataToCreate: any = {
    leadId,
    userId: scope.id,
    type,
    title,
    description,
    dueDate,
  };

  if (type === "MEETING" && meetingDetails) dataToCreate.meetingDetails = meetingDetails;
  if (participants.length > 0) dataToCreate.participants = participants;

  const activity = await LeadActivityModel.createLeadActivity(dataToCreate);

  if (type === "MEETING" && meetingDetails) {
    const lead = await getLeadById(leadId, scope);
    let destinatario = lead?.info?.["E-mail"] || null;
    console.log("🔍 E-mail do lead:", destinatario);

    try {
      // --- Buscar token de autenticação ---
      const authRes = await fetch(
        "https://newapi.qualitysmi.com.br/auth.php?api_key=57eae222-65fd-4a61-9279-898cd42b3412"
      );
      const { token, erro } = await authRes.json();
      if (!token) throw new Error(erro || "Falha na autenticação da API de e-mail");

      // --- Buscar e-mails de participantes ---
      const participantEmails: string[] = [];

      for (const p of participants) {
        try {
          if (p.userId) {
            const user = await getUserById(p.userId, scope);
            console.log("🔍 E-mail do participante:", user.email);
            if (user?.email) participantEmails.push(user.email);
          } else if (p.externalEmail) {
            participantEmails.push(p.externalEmail);
            console.log("🔍 E-mail externo do participante:", p.externalEmail);
          }
        } catch (err) {
          console.warn(`⚠️ Falha ao buscar userId ${p.userId}:`, err);
        }
      }

      // --- Caso o lead não tenha e-mail, usar o primeiro participante como destinatário ---
      if (!destinatario && participantEmails.length > 0) {
        destinatario = participantEmails.shift(); // remove o primeiro e usa como "to"
        console.warn("⚠️ Lead sem e-mail — usando participante como destinatário:", destinatario);
      }

      if (!destinatario) {
        console.error("❌ Nenhum destinatário disponível para envio de e-mail.");
        return;
      }

      // --- Criar HTML mock de e-mail ---
      const dataInicio = new Date(meetingDetails.startDate).toLocaleString("pt-BR", {
        dateStyle: "full",
        timeStyle: "short",
      });
      const dataFim = meetingDetails.endDate
        ? new Date(meetingDetails.endDate).toLocaleString("pt-BR", {
            timeStyle: "short",
          })
        : null;

      // --- Montar endereço ou link ---
      let localOuLink = "";
      const tipoReuniao = meetingDetails.meetingType;

      if (tipoReuniao === "ONLINE") {
        localOuLink = `
          <p><strong>Tipo:</strong> Reunião online</p>
          <p><strong>Link de acesso:</strong> 
            <a href="${meetingDetails.link || "#"}" target="_blank">
              ${meetingDetails.link || "Receberá o link antes da reunião"}
            </a>
          </p>`;
      } else if (tipoReuniao === "PRESENTIAL") {
        localOuLink = `
          <p><strong>Tipo:</strong> Reunião presencial</p>
          <p><strong>Endereço:</strong> 
            ${[
              meetingDetails.addressStreet,
              meetingDetails.addressNumber,
              meetingDetails.addressComplement,
              meetingDetails.addressNeighborhood,
              meetingDetails.addressCity,
              meetingDetails.addressState,
              meetingDetails.addressPostalCode,
              meetingDetails.addressCountry,
            ]
              .filter(Boolean)
              .join(", ") || "Endereço não informado"}
          </p>`;
      } else if (tipoReuniao === "HYBRID") {
        localOuLink = `
          <p><strong>Tipo:</strong> Reunião híbrida</p>
          <p><strong>Local:</strong> ${meetingDetails.location || "Local não informado"}</p>
          <p><strong>Endereço:</strong> 
            ${[
              meetingDetails.addressStreet,
              meetingDetails.addressNumber,
              meetingDetails.addressComplement,
              meetingDetails.addressNeighborhood,
              meetingDetails.addressCity,
              meetingDetails.addressState,
              meetingDetails.addressPostalCode,
              meetingDetails.addressCountry,
            ]
              .filter(Boolean)
              .join(", ") || "Endereço não informado"}
          </p>
          <p><strong>Link de acesso:</strong> 
            <a href="${meetingDetails.link || "#"}" target="_blank">
              ${meetingDetails.link || "Link não informado"}
            </a>
          </p>`;
      }

      // --- Montar HTML mock do e-mail ---
      const htmlMock = `<div style="font-family: Arial, sans-serif; background: #f8f9fb; padding: 40px;">
          <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 14px rgba(0,0,0,0.1);">
            <h2 style="color: #333;">📅 Convite para reunião</h2>
            <p>Olá, tudo bem?</p>
            <p>Você está sendo convidado para uma reunião <strong>${tipoReuniao.toLowerCase()}</strong> com a equipe da <strong>Quality SMI</strong>.</p>
            <p><strong>Título:</strong> ${title}</p>
            <p><strong>Descrição:</strong> ${description || "Sem descrição"}</p>
            <p><strong>Data e horário:</strong> ${dataInicio}${dataFim ? ` até ${dataFim}` : ""}</p>
            ${localOuLink}
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
            <p style="font-size: 14px; color: #777;">Este é um e-mail automático. Por favor, não responda diretamente.</p>
          </div>
        </div>
      `;

      // --- Montar corpo do e-mail ---
      const formData = new FormData();
      formData.append("customHtml", htmlMock);
      /* formData.append("cc", "maiconwillisystem@gmail.com, maiconnwilli@gmail.com");
      formData.append("emailContato", "maicon.willi@qualitysmi.com.br"); */
      formData.append("cc", participantEmails.join(", "));
      console.log("🔍 E-mails em CC:", participantEmails.join(", "));
      formData.append("emailContato", destinatario);
     
      // --- Enviar e-mail ---
      console.log("📧 Enviando e-mail com dados:", formData);
      const emailRes = await fetch("https://newapi.qualitysmi.com.br/dispara-email.php", {
        method: "POST",
        headers: {
          api_key: "57eae222-65fd-4a61-9279-898cd42b3412",
          token,
        },
        body: formData,
      });

      const emailResponse = await emailRes.json();
      console.log("📧 Resposta da API de e-mail:", emailResponse);
    } catch (err) {
      console.error("❌ Erro ao enviar e-mail automático:", err);
    }
  }

  return {
    data: activity,
    message: BusinessMessages.leadActivity.create.success,
  };
};

/**
 * GET ALL
 */
export const getAllLeadActivities = async (
  scope: ScopeType,
  filter: Partial<LeadActivityFilterType> = {},
  pagination?: PaginationSchema
) => {
  validateEnterpriseScope(scope);
  const effectiveFilter = applyEnterpriseFilter(scope, filter);

  const activities = await LeadActivityModel.findAllLeadActivities(effectiveFilter, pagination) || [];

  return {
    data: activities.data || [],
    pagination: activities.pagination,
    message: activities.data.length
      ? BusinessMessages.leadActivity.get.ManySuccess
      : BusinessMessages.leadActivity.get.notFound,
  };
};

/**
 * GET BY ID
 */
export const getLeadActivityById = async (id: string, scope: ScopeType) => {
  validateEnterpriseScope(scope);

  const activity = await LeadActivityModel.findLeadActivityById(id);
  if (!activity) throw new activityErrors.LeadActivityNotFoundError();

  validateStandardAccess(scope, activity.lead.enterpriseId);

  return {
    data: activity,
    message: BusinessMessages.leadActivity.get.OneSuccess,
  };
};

/**
 * GET BY LEAD ID
 */
export const getLeadActivitiesByLeadId = async (leadId: string, scope: ScopeType) => {
  validateEnterpriseScope(scope);

  const activities = await LeadActivityModel.findLeadActivitiesByLeadId(leadId) || [];
  if (activities.length > 0) validateStandardAccess(scope, activities[0].lead.enterpriseId);

  return {
    data: activities,
    message: activities.length
      ? BusinessMessages.leadActivity.get.ManySuccess
      : BusinessMessages.leadActivity.get.notFound,
  };
};

/**
 * GET PENDING BY ENTERPRISE
 */
export const getLeadPendingActivitiesByEnterpriseId = async (enterpriseId: string, scope: ScopeType) => {
  validateEnterpriseFullScope(scope);

  const activities = await LeadActivityModel.findLeadPendingActivitiesByEnterpriseId(enterpriseId, scope.id) || [];
  if (activities.length > 0) validateStandardAccess(scope, activities[0].lead.enterpriseId);

  // Transformação do retorno bruto
  const formatted = activities.map((activity) => {
    // Monta participantes
    const participants = activity.LeadActivityParticipant?.map((p) => ({
      id: p.id,
      type: p.userId ? 'internal' : 'external',
      userId: p.userId || null,
      externalEmail: p.externalEmail || null,
      role: p.role,
      name: p.user?.name || null,
      email: p.user?.email || null,
    })) || [];

    // Monta meetingDetails (pega o primeiro, já que é 1:1)
    const meetingDetails = activity.LeadMeetingDetails?.[0] ? {
      startDate: activity.LeadMeetingDetails[0].startDate,
      endDate: activity.LeadMeetingDetails[0].endDate,
      meetingType: activity.LeadMeetingDetails[0].meetingType,
      location: activity.LeadMeetingDetails[0].location,
      addressPostalCode: activity.LeadMeetingDetails[0].addressPostalCode,
      addressStreet: activity.LeadMeetingDetails[0].addressStreet,
      addressNumber: activity.LeadMeetingDetails[0].addressNumber,
      addressComplement: activity.LeadMeetingDetails[0].addressComplement,
      addressNeighborhood: activity.LeadMeetingDetails[0].addressNeighborhood,
      addressCity: activity.LeadMeetingDetails[0].addressCity,
      addressState: activity.LeadMeetingDetails[0].addressState,
      addressCountry: activity.LeadMeetingDetails[0].addressCountry,
      link: activity.LeadMeetingDetails[0].link,
    } : null;

    // Monta info do lead
    const info: Record<string, any> = {};
    activity.lead.LeadData?.forEach(ld => {
      if (ld.label && ld.value) info[ld.label.name] = ld.value;
    });

    return {
      id: activity.id,
      type: activity.type,
      dueDate: activity.dueDate,
      doneAt: activity.doneAt,
      title: activity.title,
      description: activity.description,
      user: activity.user,
      participants,
      meetingDetails,
      lead: {
        id: activity.lead.id,
        enterpriseId: activity.lead.enterpriseId,
        submittedAt: activity.lead.submittedAt,
        info,
      },
    };
  });

  return {
    data: formatted,
    message: formatted.length
      ? BusinessMessages.leadActivity.get.ManySuccess
      : BusinessMessages.leadActivity.get.notFound,
  };
};


/**
 * UPDATE
 */
export const updateLeadActivity = async (
  id: string,
  data: LeadActivityUpdateDTO,
  scope: ScopeType
) => {
  validateEnterpriseScope(scope);

  const existingActivity = await LeadActivityModel.findLeadActivityById(id);
  if (!existingActivity) throw new activityErrors.LeadActivityNotFoundError();

  const existLead = await findLeadById(existingActivity.leadId);
  if (!existLead) throw new LeadSubmitNotFoundError();

  validateStandardAccess(scope, existLead.enterpriseId);

  const updatedActivity = await LeadActivityModel.updateLeadActivity(id, data);

  return {
    data: updatedActivity,
    message: BusinessMessages.leadActivity.update.success,
  };
};
