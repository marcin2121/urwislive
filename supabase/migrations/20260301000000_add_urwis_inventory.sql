-- Zmiana schematu dodająca tablice ekwipunku dla Urwiskó∑
ALTER TABLE public.urwis_pet 
  ADD COLUMN IF NOT EXISTS inventory jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS equipped_items jsonb DEFAULT '{}'::jsonb;

-- Komentarze opisujące zawartość nowych kolumn dla innych programistów
COMMENT ON COLUMN public.urwis_pet.inventory IS 'Lista ID posiadanych przez gracza wirtualnych przedmiotów ze sklepu.';
COMMENT ON COLUMN public.urwis_pet.equipped_items IS 'Obecnie założone na maskotce nakładki graficzne (ubrania, akcesoria, tło) trzymane pod postacią JSON.';
