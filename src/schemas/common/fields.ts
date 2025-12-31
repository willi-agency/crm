// src/schemas/common/fields.ts
import { z } from "zod";
import { ValidationMessages } from "../../constants/messages";

export const TitleField = z.string().min(1, ValidationMessages.title.required);

export const NameField = z.string().min(1, ValidationMessages.name.required);

export const SlugField = z
  .string()
  .min(1, ValidationMessages.slug.required)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, ValidationMessages.slug.invalid);

export const DescriptionField = z
  .string()
  .min(1, ValidationMessages.description.required);

export const ContentField = z
  .string()
  .min(1, ValidationMessages.content.required);

export const IdField = z.string().uuid(ValidationMessages.useId.required);

export const DatePublishedField = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: ValidationMessages.datePublished.invalid,
  });

export const UrlField = z.string().url(ValidationMessages.url.invalid);

export const ImageUrlOrBase64Field = z
  .string()
  .refine(
    (val) =>
      /^data:image\/[a-z]+;base64,/.test(val) || /^https?:\/\//.test(val),
    {
      message: ValidationMessages.image.invalid,
    }
  );

export const DecimalField = z
.union([
  z.string().regex(/^\d+(\.\d{1,2})?$/, 'Preço inválido'),
  z.number(),
])
.transform((val) => (typeof val === 'string' ? parseFloat(val) : val));

export const JsonField = z.record(z.any(), { invalid_type_error: ValidationMessages.json.invalid });

export const DateField = z
  .string()
  .refine(
  (val) =>
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(val),
  {
    message: ValidationMessages.date.invalid,
  });

