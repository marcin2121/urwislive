import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export const DAYS_OF_WEEK = [
  { id: 1, label: 'Pn' }, { id: 2, label: 'Wt' }, { id: 3, label: 'Śr' },
  { id: 4, label: 'Cz' }, { id: 5, label: 'Pt' }, { id: 6, label: 'Sb' }, { id: 0, label: 'Nd' }
];

export const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export async function uploadAdminFile(file: File, folder: 'broadcasts' | 'promos' | 'kupony') {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  
  const { error } = await supabase.storage.from('push-images').upload(path, file);
  if (error) { 
    toast.error('Błąd wgrywania pliku'); 
    return null; 
  }
  const { data } = supabase.storage.from('push-images').getPublicUrl(path);
  return data.publicUrl;
}

export const trackAdminEvent = (name: string, params: object = {}) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', `admin_${name}`, params);
  }
};
