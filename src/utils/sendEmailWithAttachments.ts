import nodemailer from 'nodemailer';

const userEmail = "nao-responda-formulario@clientes.qualitysmi.com.br"; 
const senhaEmail = "i7{!,i)2kPhK";

type Attachment =
  | { filename: string; url: string }
  | { filename: string; content: Buffer; contentType?: string };

type EmailParams = {
  to: string;
  subject: string;
  body: string;
  attachments?: Attachment[];
};

export const sendEmailWithAttachments = async ({
  to,
  subject,
  body,
  attachments = [],
}: EmailParams) => {
  const transporter = nodemailer.createTransport({
    host: "mail.clientes.qualitysmi.com.br",
    port: 465,
    secure: true,
    auth: {
      user: userEmail,
      pass: senhaEmail,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
  });

  const processedAttachments = attachments.map((file) =>
    'url' in file
      ? { filename: file.filename, path: file.url }
      : {
          filename: file.filename,
          content: file.content,
          contentType: file.contentType,
        }
  );

  const mailOptions = {
    from: `"Formulário Quality" <${userEmail}>`,
    to,
    subject,
    html: body, // body como HTML
    attachments: processedAttachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    throw error;
  }
};
