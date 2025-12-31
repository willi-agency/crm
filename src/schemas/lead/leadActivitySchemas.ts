import { z } from "zod";
import { IdField } from "../common/fields";

export const LeadActivityTypeEnum = z.enum([
  "COMMENT",
  "CALL",
  "MEETING",
  "TASK",
  "NOTE",
]);

export const MeetingParticipantRoleEnum = z.enum([
  "HOST",
  "CO_HOST",
  "PRESENTER",
  "PARTICIPANT",
  "OBSERVER",
]);

export const MeetingTypeEnum = z.enum([
  "ONLINE",
  "HYBRID",
  "PRESENTIAL",
]);

const participantSchema = z.object({
  userId: z.string().uuid().optional(),
  externalEmail: z.string().email().optional(),
  role: MeetingParticipantRoleEnum.default("PARTICIPANT"),
}).refine((data) => data.userId || data.externalEmail, {
  message: "Cada participante precisa ter userId OU externalEmail",
});

const meetingDetailsSchema = z.object({
  startDate: z.coerce.date({ required_error: "startDate é obrigatório" }),
  endDate: z.coerce.date({ required_error: "endDate é obrigatório" }),
  meetingType: MeetingTypeEnum.default("ONLINE"),
  location: z.string().optional(),

  addressPostalCode: z.string().optional(),
  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressComplement: z.string().optional(),
  addressCity: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCountry: z.string().optional(),
  addressState: z.string().optional(),

  link: z.string().url().optional(),
});

export const createLeadActivitySchema = z.object({
  leadId: z.string().uuid(),
  type: LeadActivityTypeEnum,
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),

  participants: z.array(participantSchema).optional(),
  meetingDetails: meetingDetailsSchema.optional(),
}).refine(
  (data) => {
    if (data.type === "MEETING") {
      return data.meetingDetails !== undefined;
    }
    return true;
  },
  { message: "Detalhes da reunião são obrigatórios quando type é MEETING", path: ["meetingDetails"] }
);

export const updateLeadActivitySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  type: LeadActivityTypeEnum.optional(),
  dueDate: z.coerce.date().optional(),
  doneAt: z.coerce.date().optional(),
});

export const getAllLeadActivitiesSchema = z.object({
  enterpriseId: IdField.optional(),
  leadId: IdField.optional(),
  userId: IdField.optional(),
  type: LeadActivityTypeEnum.optional(),
});

export const getLeadActivityByIdSchema = z.object({
  id: z.string().uuid(),
});

export const getLeadActivitiesByLeadIdSchema = z.object({
  leadId: z.string().uuid(),
});

export const getLeadPendingActivitiesByEnterpriseIdSchema = z.object({
  enterpriseId: z.string().uuid(),
});

export type LeadActivityType = z.infer<typeof LeadActivityTypeEnum>;
export type LeadActivityCreateDTO = z.infer<typeof createLeadActivitySchema>;
export type LeadActivityUpdateDTO = z.infer<typeof updateLeadActivitySchema>;
export type LeadActivityFilterType = z.infer<typeof getAllLeadActivitiesSchema>;
