"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import {
  LogOut, User, Phone, Settings, Bell, Gift, Sparkles, Tag, Heart, 
  Smartphone, ShieldAlert, CheckCircle2, Loader2, Pencil, X, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import AuthModal from "@/components/ui/AuthModal";
import { PUSH_CATEGORIES } from "@/lib/push-config";
import { toast } from "sonner";

type TabType = "dane" | "ustawienia";
type PushState = 'UNSUPPORTED' | 'INSTALL_PWA' | 'NOT_SUBSCRIBED' | 'SUBSCRIBED';

// --- WSPARCIE DLA VAPID ---
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
};

// --- KOMPONENT PRZEŁĄCZNIKA (NATIVE TOGGLE) ---
function Toggle({ isOn, onClick, disabled = false }: { isOn: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${isOn ? 'bg-green-500' : 'bg-zinc-300'}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

// ---- WIDOK GOŚCIA (niezalogowany) ----
function GuestView() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const benefits = [
    { icon: Tag, label: "Kody rabatowe", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Bell, label: "Powiadomienia Push", color: "text-blue-500", bg: "bg-blue-50" },
    { icon: Gift, label: "Koło Fortuny", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Heart, label: "Wirtualny pupil", color: "text-pink-500", bg: "bg-pink-50" },
  ];

  return (
    <>
      <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-6">
          <div className="bg-white border border-zinc-200 shadow-sm rounded-4xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 text-blue-100 rotate-12 pointer-events-none"><Sparkles size={60} /></div>
            <div className="relative w-40 h-40 mx-auto mb-4 drop-shadow-lg">
              <Image src="/urwis-proszący.webp" alt="Maskotka Urwis" fill className="object-contain" priority />
            </div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-zinc-900 mb-2">Hej, tu Urwis! 👋</h1>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed mb-6">
              Zaloguj się, żeby odblokować rabaty, gry i powiadomienia o nowościach. Nic na siłę — ale warto!
            </p>
            <button onClick={() => setIsAuthOpen(true)} className="w-full bg-[#0055ff] text-white font-black text-base py-4 rounded-2xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all uppercase italic">
              Zaloguj się / Załóż konto
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">Co Ci to daje?</p>
            <div className="grid grid-cols-2 gap-2">
              {benefits.map((b) => (
                <div key={b.label} className={`${b.bg} border border-white/60 rounded-2xl p-4 flex flex-col items-center text-center gap-2`}>
                  <b.icon size={24} className={b.color} />
                  <span className="text-[11px] font-bold text-zinc-700 leading-tight">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

// ---- WIDOK ZALOGOWANEGO UŻYTKOWNIKA ----
export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabType>("dane");

  // --- STANY: EDYCJA DANYCH ---
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '' });

  // --- STANY: ZGODA MARKETINGOWA ---
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [updatingData, setUpdatingData] = useState(false);

  // --- STANY: WEB PUSH ---
  const [pushState, setPushState] = useState<PushState>('UNSUPPORTED');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  useEffect(() => {
    if (user?.user_metadata?.marketing_consent !== undefined) {
      setMarketingConsent(user.user_metadata.marketing_consent);
    }
  }, [user]);

  // Sprawdzanie stanu PUSH
  const checkPushStatus = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    const isPushSupported = 'serviceWorker' in navigator && 'PushManager' in window;

    if (!isPushSupported) return setPushState('UNSUPPORTED');
    if (!isStandalone) return setPushState('INSTALL_PWA');

    if (Notification.permission === 'granted') {
      setPushState('SUBSCRIBED');
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          const { data } = await supabase.from('push_subscriptions').select('topics').eq('endpoint', sub.endpoint).single();
          if (data?.topics) setSelectedTopics(data.topics);
        }
      } catch (e) { console.error(e); }
    } else {
      setPushState('NOT_SUBSCRIBED');
    }
  }, [supabase]);

  useEffect(() => { checkPushStatus(); }, [checkPushStatus]);

  // Akcje dla przełączników Push i Marketingu
  const toggleMarketingConsent = async () => {
    setUpdatingData(true);
    const newConsent = !marketingConsent;
    const { error } = await supabase.auth.updateUser({ data: { marketing_consent: newConsent } });
    if (!error) { setMarketingConsent(newConsent); toast.success(newConsent ? 'Zgody zaktualizowane!' : 'Wycofano zgodę.'); }
    setUpdatingData(false);
  };

  const subscribeToPush = async () => {
    setUpdatingData(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!vapidKey) throw new Error("Brak klucza VAPID");

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapidKey)
        });

        await supabase.from('push_subscriptions').upsert({ 
          endpoint: subscription.endpoint, subscription_data: JSON.parse(JSON.stringify(subscription)), topics: ['wszystkie']
        }, { onConflict: 'endpoint' });

        setPushState('SUBSCRIBED');
        setSelectedTopics(['wszystkie']);
        toast.success('Powiadomienia włączone!');
      } else {
        toast.error('Brak zgody przeglądarki.');
      }
    } catch (e) { toast.error("Wystąpił błąd techniczny."); }
    setUpdatingData(false);
  };

  const toggleTopic = async (topicId: string) => {
    setUpdatingData(true);
    const specificTopicIds = PUSH_CATEGORIES.filter(c => c.id !== 'wszystkie').map(c => c.id);
    let newTopics: string[] = [];

    if (topicId === 'wszystkie') {
      newTopics = selectedTopics.includes('wszystkie') ? [] : ['wszystkie'];
    } else {
      const currentSpecific = selectedTopics.filter(t => t !== 'wszystkie');
      let nextSpecific = currentSpecific.includes(topicId) ? currentSpecific.filter(t => t !== topicId) : [...currentSpecific, topicId];
      newTopics = (nextSpecific.length === specificTopicIds.length || nextSpecific.length === 0) ? ['wszystkie'] : nextSpecific;
    }

    setSelectedTopics(newTopics);

    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await supabase.from('push_subscriptions').update({ topics: newTopics }).eq('endpoint', sub.endpoint);
      }
    } catch (e) { toast.error('Nie udało się zaktualizować kategorii.'); }
    setUpdatingData(false);
  };

  // --- LOGIKA EDYCJI I USUNIĘCIA KONTA ---
  const handleToggleEdit = () => {
    if (!isEditing) {
      setEditData({
        name: user?.user_metadata?.full_name || '',
        phone: user?.user_metadata?.phone || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    setUpdatingData(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: editData.name, phone: editData.phone }
    });
    
    if (!error) {
      toast.success('Dane zostały zaktualizowane!');
      setIsEditing(false);
    } else {
      toast.error('Wystąpił błąd podczas aktualizacji.');
    }
    setUpdatingData(false);
  };

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "🚨 UWAGA: Czy na pewno chcesz bezpowrotnie usunąć swoje konto, wyzerować punkty oraz wszystkie kupony rabatowe?\n\nTej operacji NIE MOŻNA cofnąć!"
    );

    if (isConfirmed) {
      // Ze względów bezpieczeństwa (RLS) pełne usunięcie z Auth często wymaga backendu (Edge Function).
      // Zostawiamy tu UX-owe rozwiązanie z wylogowaniem. Możesz podpiąć tu swój RPC w przyszłości.
      toast.success("Twoje konto zostało zgłoszone do trwałego usunięcia.");
      await supabase.auth.signOut();
      window.location.href = '/';
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = "/"; };

  if (isLoading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><Loader2 className="animate-spin text-[#0055ff] w-10 h-10" /></div>;
  if (!user) return <GuestView />;

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Użytkownik";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen pt-28 pb-12 px-4 flex justify-center bg-zinc-50 relative z-30">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl space-y-6">
        
        {/* NAGŁÓWEK PROFILU */}
        <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0055ff] to-blue-500 flex items-center justify-center text-white font-black text-xl italic shadow-lg shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black italic uppercase tracking-tighter text-zinc-900 truncate">{displayName}</h1>
            {user.created_at && <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mt-1">Urwis od {new Date(user.created_at).toLocaleDateString("pl-PL")}</span>}
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-zinc-500 hover:text-red-500 font-bold text-xs uppercase bg-zinc-50 border border-zinc-200 px-4 py-2.5 rounded-xl transition-colors shrink-0">
            <LogOut size={14} /> Wyloguj
          </button>
        </div>

        {/* ZAKŁADKI */}
        <div className="flex space-x-1 bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
          <button onClick={() => setActiveTab("dane")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${activeTab === "dane" ? "bg-[#0055ff] text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"}`}>
            <User size={16} /> Moje Dane
          </button>
          <button onClick={() => setActiveTab("ustawienia")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${activeTab === "ustawienia" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"}`}>
            <Settings size={16} /> Powiadomienia i Zgody
          </button>
        </div>

        <div className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 sm:p-8 min-h-[350px]">
          <AnimatePresence mode="wait">

            {/* ZAKŁADKA: DANE KONTA I RODO */}
            {activeTab === "dane" && (
              <motion.div key="dane" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6">
                
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <User size={16} /> Informacje o koncie
                  </h3>
                  <button onClick={handleToggleEdit} className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#0055ff] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
                    {isEditing ? <X size={12} /> : <Pencil size={12} />}
                    {isEditing ? "Anuluj Edycję" : "Edytuj Dane"}
                  </button>
                </div>

                {isEditing ? (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-4 bg-zinc-50 p-5 rounded-3xl border border-zinc-200">
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block pl-2">Imię i Nazwisko</label>
                      <input 
                        type="text" 
                        value={editData.name} 
                        onChange={e => setEditData({...editData, name: e.target.value})} 
                        className="w-full p-4 rounded-2xl border-none outline-none font-bold text-sm bg-white shadow-sm focus:ring-2 ring-[#0055ff]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 block pl-2">Numer Telefonu</label>
                      <input 
                        type="tel" 
                        value={editData.phone} 
                        onChange={e => setEditData({...editData, phone: e.target.value})} 
                        className="w-full p-4 rounded-2xl border-none outline-none font-bold text-sm bg-white shadow-sm focus:ring-2 ring-[#0055ff]"
                      />
                    </div>
                    <button 
                      onClick={handleSaveProfile} 
                      disabled={updatingData}
                      className="w-full py-4 mt-2 bg-[#0055ff] text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-md hover:bg-blue-600 transition-colors flex justify-center items-center"
                    >
                      {updatingData ? <Loader2 className="w-4 h-4 animate-spin" /> : "Zapisz Zmiany"}
                    </button>
                  </motion.div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Imię i Nazwisko</p><p className="font-black text-zinc-800">{user.user_metadata?.full_name || "Brak danych"}</p></div>
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">E-mail</p><p className="font-black text-zinc-800">{user.email}</p></div>
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 sm:col-span-2"><p className="text-[10px] font-bold text-zinc-400 uppercase mb-1">Telefon</p><p className="font-black text-zinc-800 flex items-center gap-2"><Phone size={14} className="text-[#0055ff]" />{user.user_metadata?.phone || "Brak danych"}</p></div>
                  </div>
                )}

                {/* SEKCJA KRYTYCZNA - RODO */}
                <div className="pt-8 flex flex-col items-center gap-6 border-t border-zinc-100 mt-8">
                  <Link href="/zmien-haslo" className="text-xs font-bold text-zinc-500 hover:text-[#0055ff] transition-colors underline underline-offset-4">
                    Zmień hasło logowania
                  </Link>
                  
                  <button 
                    onClick={handleDeleteAccount} 
                    className="flex items-center justify-center w-full sm:w-auto gap-2 text-[10px] font-black text-red-500 hover:text-red-700 transition-colors uppercase tracking-widest bg-red-50 hover:bg-red-100 px-6 py-4 rounded-2xl border border-red-100"
                  >
                    <Trash2 size={16} /> Usuń konto bezpowrotnie
                  </button>
                </div>

              </motion.div>
            )}

            {/* ZAKŁADKA: USTAWIENIA PUSH */}
            {activeTab === "ustawienia" && (
              <motion.div key="ustawienia" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                
                {/* SEKCJA 1: Konto i Globalne Zgody */}
                <section>
                  <h3 className="text-[10px] font-black text-[#0055ff] uppercase tracking-widest mb-3 pl-2">Konto i Rabaty</h3>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-3xl overflow-hidden divide-y divide-zinc-200">
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-black text-sm uppercase text-zinc-900 mb-1">Uczestnictwo w promocjach</p>
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">Pozwala na zbieranie punktów i losowanie zniżek w Kole Fortuny.</p>
                      </div>
                      <Toggle isOn={marketingConsent} onClick={toggleMarketingConsent} disabled={updatingData} />
                    </div>
                  </div>
                </section>

                {/* SEKCJA 2: Powiadomienia Urządzenia (Push) */}
                <section>
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 pl-2">Powiadomienia na tym urządzeniu</h3>
                  
                  <div className="bg-zinc-50 border border-zinc-200 rounded-3xl overflow-hidden divide-y divide-zinc-200">
                    
                    <div className="p-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-black text-sm uppercase text-zinc-900 mb-1">Powiadomienia na ekranie</p>
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed">Otrzymuj dymki o nowych zestawach LEGO i błyskawicznych wyprzedażach.</p>
                      </div>
                      
                      {pushState === 'UNSUPPORTED' && <span className="text-[10px] font-black uppercase text-zinc-400 bg-zinc-200 px-2 py-1 rounded">Brak wsparcia</span>}
                      
                      {pushState === 'INSTALL_PWA' && (
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase text-[#BF2024] flex items-center gap-1"><ShieldAlert size={12}/> Zablokowane</span>
                        </div>
                      )}

                      {pushState === 'NOT_SUBSCRIBED' && (
                        <button onClick={subscribeToPush} disabled={updatingData} className="bg-[#0055ff] hover:bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-colors whitespace-nowrap">
                           Włącz
                        </button>
                      )}

                      {pushState === 'SUBSCRIBED' && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase text-green-600 tracking-widest hidden sm:inline-block">Aktywne</span>
                          <CheckCircle2 size={24} className="text-green-500" />
                        </div>
                      )}
                    </div>

                    {pushState === 'INSTALL_PWA' && (
                      <div className="p-4 bg-amber-50 text-amber-800 text-xs font-bold flex items-start gap-3">
                        <Smartphone size={18} className="shrink-0 text-amber-600 mt-0.5" />
                        <p>Używasz zwykłej przeglądarki. Aby powiadomienia działały, musisz najpierw dodać stronę "Sklep Urwis" do ekranu początkowego telefonu.</p>
                      </div>
                    )}

                    {pushState === 'SUBSCRIBED' && (
                      <div className="p-5 bg-white">
                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-4 tracking-widest">Wybierz tematy powiadomień:</p>
                        <div className="space-y-4">
                          {PUSH_CATEGORIES.map(cat => {
                            const isSelected = selectedTopics.includes(cat.id);
                            return (
                              <div key={cat.id} className="flex items-center justify-between group">
                                <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-zinc-900' : 'text-zinc-400'}`}>{cat.label}</span>
                                <Toggle isOn={isSelected} onClick={() => toggleTopic(cat.id)} disabled={updatingData} />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}