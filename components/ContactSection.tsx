'use client'

import { motion } from 'framer-motion';
import { useForm } from '@formspree/react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  CreditCard, 
  Car, 
  Send,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import MagicBento from '@/components/ui/MagicBento';
import Particles from "@/components/Particles";

export default function ContactSection() {
  const [state, handleSubmit] = useForm("mdalgzln");

  const contactInfo = [
    {
      icon: <Phone className="text-blue-500" size={32} />,
      title: 'Zadzwoń do nas',
      value: '604 208 193',
      link: 'tel:+48604208183',
      glowColor: '59, 130, 246',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      icon: <MapPin className="text-red-500" size={32} />,
      title: 'Odwiedź sklep',
      value: 'ul. Reymonta 38A',
      value2: 'Białobrzegi 26-800',
      link: 'https://maps.app.goo.gl/xLsL43gW4PQ6dkUAA',
      glowColor: '239, 68, 68',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      icon: <Clock className="text-green-500" size={48} />,
      title: 'Godziny otwarcia',
      value: 'Pon-Pt: 8:00-18:00',
      value2: 'Sobota: 8:00-15:00',
      glowColor: '34, 197, 94',
      gridClass: 'md:col-span-2 md:row-span-1'
    },
    {
      icon: <Mail className="text-purple-500" size={48} />,
      title: 'Napisz e-mail',
      value: 'kontakt@sklep-urwis.pl',
      link: 'mailto:kontakt@sklep-urwis.pl',
      glowColor: '168, 85, 247',
      gridClass: 'md:col-span-2 md:row-span-1'
    },
    {
      icon: <Car className="text-orange-500" size={32} />,
      title: 'Parking',
      value: 'Darmowy parking',
      value2: 'bezpośrednio przy sklepie',
      glowColor: '251, 146, 60',
      gridClass: 'md:col-span-1 md:row-span-1'
    },
    {
      icon: <CreditCard className="text-pink-500" size={32} />,
      title: 'Płatności',
      value: 'Gotówka, Karta, BLIK',
      value2: 'i płatności zbliżeniowe',
      glowColor: '236, 72, 153',
      gridClass: 'md:col-span-1 md:row-span-1'
    }
  ];

  return (
    <main className="relative min-h-screen w-full bg-transparent overflow-x-hidden">
      
      {/* --- TŁO --- */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <Particles
          particleCount={60}
          particleColors={["#bf2024", "#0055ff"]}
          alphaParticles
          particleBaseSize={180}
          speed={0.08}
        />
      </div>

      <div className="relative z-0">
        {/* --- HEADER --- */}
        <section className="pt-32 pb-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm text-[#6498ff] rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-white"
            >
              <MessageSquare size={14} /> Jesteśmy dla Ciebie
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-black font-heading text-gray-900 tracking-tighter mb-8 leading-none">
              SKONTAKTUJ SIĘ <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#BF2024] to-[#0055ff]">Z URWISEM</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-body font-medium leading-relaxed">
              Masz pytanie o zabawkę? Chcesz zarezerwować termin w kulkach? Napisz, zadzwoń lub wpadnij do nas osobiście!
            </p>
          </div>
        </section>

        {/* --- BENTO GRID: INFO --- */}
        <section className="px-6 mb-24">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px]">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={info.gridClass}
              >
                {/* ✅ ZMIANA: Wyraźniejsza ramka i cień na stałe */}
                <MagicBento
                  glowColor={info.glowColor}
                  className="h-full rounded-[2.5rem] bg-white/70 backdrop-blur-xl border-2 border-white/80 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                >
                  <a 
                    href={info.link} 
                    className={`flex flex-col items-center justify-center p-6 h-full text-center ${!info.link && 'cursor-default'}`}
                  >
                    <div className="mb-4 group-hover:scale-110 transition-transform">
                      {info.icon}
                    </div>
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-1">
                      {info.title}
                    </h3>
                    <p className="text-gray-600 font-bold text-sm">
                      {info.value}
                    </p>
                    {info.value2 && (
                      <p className="text-gray-500 font-medium text-xs mt-1">
                        {info.value2}
                      </p>
                    )}
                  </a>
                </MagicBento>
              </motion.div>
            ))}
          </div>
        </section>

        {/* --- FORMULARZ I MAPA --- */}
        <section className="px-6 pb-24">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Formularz */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white/70 backdrop-blur-xl rounded-[3.5rem] p-8 md:p-12 border-2 border-white shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-[#BF2024] rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Send size={24} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 font-heading italic uppercase">Wyślij list do Urwisa</h2>
              </div>

              {state.succeeded ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">🎈</div>
                  <h3 className="text-2xl font-black text-green-600 mb-2">Wiadomość wysłana!</h3>
                  <p className="text-gray-600">Odpowiemy najszybciej jak to możliwe.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <InputField label="Imię i nazwisko" name="name" type="text" placeholder="Jan Kowalski" required />
                    <InputField label="Adres e-mail" name="email" type="email" placeholder="jan@urwis.pl" required />
                  </div>
                  <InputField label="Temat" name="subject" type="text" placeholder="W czym możemy pomóc?" required />
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-2">Wiadomość</label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      className="w-full px-6 py-4 bg-white/50 border-2 border-white focus:border-[#0055ff] rounded-3xl outline-none transition-all font-medium text-gray-700 resize-none"
                      placeholder="Twoja wiadomość..."
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={state.submitting}
                    className="w-full py-5 bg-linear-to-r from-[#BF2024] to-[#0055ff] text-white rounded-3xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {state.submitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Mapa */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="bg-white/40 backdrop-blur-md rounded-[3.5rem] border-2 border-white shadow-xl overflow-hidden min-h-[500px]"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d8413.861345556805!2d20.950292!3d51.645135!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4718fdfaefa939bb%3A0x70c667b47a29301c!2sSklep%20Urwis!5e1!3m2!1spl!2spl!4v1771091119479!5m2!1spl!2spl"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.2) contrast(1.1)' }}
                allowFullScreen
                loading="lazy"
                title="Lokalizacja Sklepu Urwis"
                className="w-full h-full"
              />
            </motion.div>

          </div>
        </section>
      </div>
    </main>
  );
}

function InputField({ label, name, type, placeholder, required }: any) {
  return (
    <div>
      <label className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2 ml-2">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full px-6 py-4 bg-white/50 border-2 border-white focus:border-[#0055ff] rounded-3xl outline-none transition-all font-medium text-gray-700"
      />
    </div>
  );
}