import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import FormData from 'form-data';

// Tipos esperados
export interface MeetingDetails {
  startDate: Date;
  endDate: Date;
  meetingType: 'ONLINE' | 'HYBRID' | 'PRESENTIAL';
  location?: string;
  addressPostalCode?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressCity?: string;
  addressNeighborhood?: string;
  addressCountry?: string;
  addressState?: string;
  link?: string;
}

export interface Participant {
  userId?: string;
  externalEmail?: string;
  role?: string;
  name?: string;
  email?: string;
}

export interface LeadActivityEmailPayload {
  id: string;
  title: string;
  description?: string;
  leadName?: string;
  enterpriseName?: string;
  meetingDetails?: MeetingDetails | null;
  participants: Participant[];
  responsibleEmail?: string;
}

export type EmailMode = 'invite' | 'reminder';

/**
 * Gera o HTML base do e-mail de reunião.
 */
function buildMeetingEmailHTML(
  activity: LeadActivityEmailPayload,
  mode: EmailMode
): string {
  const meeting = activity.meetingDetails;

  const dataFormatada = meeting?.startDate
    ? format(meeting.startDate, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })
    : 'Data não definida';

  const tipo =
    meeting?.meetingType === 'ONLINE'
      ? 'online'
      : meeting?.meetingType === 'HYBRID'
      ? 'híbrida'
      : 'presencial';

  const localOuLink =
    meeting?.meetingType === 'ONLINE'
      ? `<p><strong>Link da reunião:</strong> <a href="${meeting?.link || '#'}" target="_blank">${meeting?.link || 'Link indisponível'}</a></p>`
      : `<p><strong>Local:</strong> ${[
          meeting?.addressStreet,
          meeting?.addressNumber,
          meeting?.addressCity,
          meeting?.addressState,
        ]
          .filter(Boolean)
          .join(', ')}</p>`;

  return `
    <div style="font-family: Arial, sans-serif; background: #f8f9fb; padding: 40px;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 14px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">📅 ${
          mode === 'invite' ? 'Convite para reunião' : 'Lembrete de reunião'
        }</h2>
        <p>Olá, tudo bem?</p>
        <p>Você está sendo ${
          mode === 'invite' ? 'convidado' : 'lembrado'
        } sobre uma reunião <strong>${tipo}</strong> ${
    activity.enterpriseName ? `com a equipe da <strong>${activity.enterpriseName}</strong>` : ''
  }.</p>
        <p><strong>Título:</strong> ${activity.title}</p>
        <p><strong>Descrição:</strong> ${activity.description || 'Sem descrição'}</p>
        <p><strong>Data e horário:</strong> ${dataFormatada}</p>
        ${localOuLink}
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;">
        <p style="font-size: 14px; color: #777;">Este é um e-mail automático. Por favor, não responda diretamente.</p>
      </div>
    </div>
  `;
}

/**
 * Faz a autenticação na API de e-mail e retorna o token
 */
async function getEmailApiToken(): Promise<string> {
  const res = await fetch(
    'https://newapi.qualitysmi.com.br/auth.php?api_key=57eae222-65fd-4a61-9279-898cd42b3412'
  );
  const json = await res.json();
  if (!json.token) throw new Error(json.erro || 'Falha na autenticação da API de e-mail');
  return json.token;
}

/**
 * Dispara o e-mail usando a API da Quality
 */
async function sendEmailThroughApi(to: string, cc: string[], html: string) {
  const token = await getEmailApiToken();

  const formData = new FormData();
  formData.append('customHtml', html);
  formData.append('cc', cc.join(', '));
  formData.append('emailContato', to);

  const res = await fetch('https://newapi.qualitysmi.com.br/dispara-email.php', {
    method: 'POST',
    headers: {
      api_key: '57eae222-65fd-4a61-9279-898cd42b3412',
      token,
    },
    //body: formData,
  });

  const result = await res.json();
  console.log('📧 Resposta da API de e-mail:', result);
  return result;
}

/**
 * Service principal — envia convite ou lembrete de reunião
 */
export async function sendLeadActivityEmail(
  activity: LeadActivityEmailPayload,
  mode: EmailMode = 'invite'
): Promise<void> {
  const html = buildMeetingEmailHTML(activity, mode);

  // Monta destinatário principal e cópia
  const participantEmails: string[] = [];
  if (activity.responsibleEmail) participantEmails.push(activity.responsibleEmail);

  for (const p of activity.participants) {
    if (p.email) participantEmails.push(p.email);
    if (p.externalEmail) participantEmails.push(p.externalEmail);
  }

  const uniqueEmails = [...new Set(participantEmails)];
  const destinatario = uniqueEmails.shift(); // primeiro é o "to"

  if (!destinatario) {
    console.warn(`⚠️ Nenhum destinatário encontrado para atividade ${activity.id}`);
    return;
  }

  await sendEmailThroughApi(destinatario, uniqueEmails, html);
  console.log(
    `[EmailService] ${mode === 'invite' ? 'Convite' : 'Lembrete'} enviado para ${destinatario}`
  );
}
