-- Dodanie kolumny na ukończone misje
ALTER TABLE public.urwis_pet 
ADD COLUMN IF NOT EXISTS completed_quests jsonb DEFAULT '[]'::jsonb;
