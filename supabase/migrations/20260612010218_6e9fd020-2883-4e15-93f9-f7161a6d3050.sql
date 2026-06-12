ALTER TABLE public.pdf_uploads ADD COLUMN IF NOT EXISTS original_filename TEXT;
UPDATE public.pdf_uploads SET original_filename = title WHERE original_filename IS NULL;