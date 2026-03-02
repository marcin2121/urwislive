-- Tabela Osiągnięć dla Wirtualnego Urwiska
ALTER TABLE public.urwis_pet 
ADD COLUMN IF NOT EXISTS achievements jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS achievement_points integer DEFAULT 0;
