'use client'
import { motion } from 'framer-motion';

interface Props {
  mission: any;
  onClose: () => void;
  onClaim: () => void;
}

export default function MissionNotification({ mission, onClose, onClaim }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      className="bg-white rounded-2xl shadow-2xl p-4 max-w-sm border-4 border-yellow-400"
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{mission.icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-black text-gray-900">Misja ukończona!</h4>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-2">{mission.title}</p>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClaim}
              className="px-4 py-2 bg-linear-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-bold text-sm shadow-lg"
            >
              🎁 Odbierz
            </motion.button>
            <span className="text-xs text-gray-500">
              +{mission.reward.points} pkt
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
