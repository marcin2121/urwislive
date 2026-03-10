import React, { useState, useEffect } from 'react';

export default function NextSpinTimer({ onReady }: { onReady: () => void }) {
  const [timeToNextSpin, setTimeToNextSpin] = useState<string>("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();

      if (diff <= 0) {
        onReady();
        return;
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeToNextSpin(
        `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [onReady]);

  return <span className="text-2xl md:text-3xl font-black text-amber-500 font-mono tracking-tighter">{timeToNextSpin}</span>;
}
