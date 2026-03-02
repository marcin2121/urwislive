-- Tabela Zadań (Quest Progress) dla Wirtualnego Urwiska
ALTER TABLE public.urwis_pet 
ADD COLUMN IF NOT EXISTS quest_progress jsonb DEFAULT '{}'::jsonb;
