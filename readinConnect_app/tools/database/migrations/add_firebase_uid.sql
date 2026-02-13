ALTER TABLE public.profiles
ADD COLUMN firebase_uid TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_firebase_uid ON public.profiles(firebase_uid);

ALTER TABLE public.profiles
ADD CONSTRAINT unique_firebase_uid UNIQUE (firebase_uid);
