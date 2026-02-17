'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { trackGamePlayed } from '@/utils/missionTracking'
import MemoryGame from './games/MemoryGame'
import SpinTheWheel from './games/SpinTheWheel'
import ClickerGame from './games/ClickerGame'
import PuzzleSlider from './games/PuzzleSlider'

// ✅ TYPE dla games array
interface Game {
  id: string
  title: string
  description: string
  icon: string
  color: string
  component: React.ComponentType<{ onComplete: () => void }>
  difficulty: string
}

export default function MiniGamesSection() {
  const { profile: user } = useSupabaseAuth()
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  // Tracking przy otwarciu gry
  const handleGameStart = useCallback((gameId: string) => {
    if (selectedGame && user) {
      const game = games.find(g => g.id === gameId)
      if (game) {
        console.log('🎮 Tracking game start:', game.title)
        trackGamePlayed(user.id, game.id)
      }
    }
  }, [selectedGame, user])

  useEffect(() => {
    handleGameStart(selectedGame!)
  }, [selectedGame, handleGameStart])

  const games: Game[] = [
    {
      id: 'memory',
      title: 'Memory - Zabawki',
      description: 'Znajdź pary zabawek!',
      icon: '🧠',
      color: 'from-purple-500 to-pink-500',
      component: MemoryGame,
      difficulty: 'Łatwe'
    },
    {
      id: 'wheel',
      title: 'Koło Fortuny',
      description: 'Zakręć i wygraj!',
      icon: '🎡',
      color: 'from-blue-500 to-cyan-500',
      component: SpinTheWheel,
      difficulty: 'Szczęście'
    },
    {
      id: 'clicker',
      title: 'Złap Prezenty',
      description: 'Klikaj spadające prezenty!',
      icon: '🎁',
      color: 'from-red-500 to-orange-500',
      component: ClickerGame,
      difficulty: 'Średnie'
    },
    {
      id: 'puzzle',
      title: 'Puzzle Układanka',
      description: 'Ułóż obrazek!',
      icon: '🧩',
      color: 'from-green-500 to-emerald-500',
      component: PuzzleSlider,
      difficulty: 'Trudne'
    }
  ]


  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-pink-500 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 mb-6 shadow-lg">
            <span className="text-3xl">🎮</span>
            <span className="font-black text-xl text-purple-700 tracking-wide">Strefa Rozrywki Urwis</span>
          </div>

          <motion.h2
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent leading-tight"
          >
            Zagraj i <br className="hidden md:block" />
            <span className="text-transparent bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text">Wygraj!</span>
          </motion.h2>

          <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Wybierz ulubioną grę, zbierz EXP i odbierz{' '}
            <span className="font-bold text-purple-600">ekskluzywne kupony rabatowe</span>{' '}
            w naszym sklepie w Białobrzegach!
          </p>
        </motion.div>

        {/* Games Grid */}
        {!selectedGame && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8 mb-16">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                whileHover={{ y: -12, scale: 1.03 }}
                className="group cursor-pointer relative"
                onClick={() => setSelectedGame(game.id)}
              >
                <div className={`relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 border-4 border-transparent hover:border-purple-300 overflow-hidden h-full min-h-[320px]`}>

                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-indigo-500/0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="relative z-20 flex flex-col h-full">
                    {/* Icon */}
                    <motion.div
                      className="text-6xl mb-6 mx-auto transform group-hover:scale-110 transition-transform duration-300"
                      initial={{ rotate: 0 }}
                      whileHover={{ rotate: 10 }}
                    >
                      <span>{game.icon}</span>
                    </motion.div>

                    {/* Title */}
                    <h3 className="text-2xl font-black mb-4 text-gray-800 text-center leading-tight group-hover:text-purple-700 transition-colors">
                      {game.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 text-center mb-6 flex-1 leading-relaxed px-2">
                      {game.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
                      <span className="text-xs font-bold px-4 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 shadow-sm">
                        {game.difficulty}
                      </span>

                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-6 py-3 rounded-full font-black text-sm shadow-xl bg-gradient-to-r ${game.color} text-white hover:shadow-2xl active:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-white`}
                      >
                        Graj Teraz!
                      </motion.button>
                    </div>
                  </div>

                  {/* Corner shine */}
                  <div className="absolute top-4 right-4 w-24 h-24 bg-gradient-to-bl from-white/30 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Game Modal */}
        <AnimatePresence mode="wait">
          {selectedGame && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1000] flex items-center justify-center p-6"
              onClick={() => setSelectedGame(null)}
            >
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 50 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 50 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white/95 backdrop-blur-2xl rounded-3xl p-8 max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-3xl border border-white/20"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
                  <div className="flex items-center gap-4">
                    {games.find(g => g.id === selectedGame)?.icon}
                    <h3 className="text-4xl font-black bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {games.find(g => g.id === selectedGame)?.title}
                    </h3>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedGame(null)}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 shadow-xl flex items-center justify-center text-2xl font-black text-gray-700 hover:text-gray-900 transition-all duration-200"
                  >
                    ×
                  </motion.button>
                </div>

                {/* Game Component */}
                {(() => {
                  const game = games.find(g => g.id === selectedGame)
                  if (!game) return null
                  const GameComponent = game.component
                  return <GameComponent onComplete={() => setSelectedGame(null)} />
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-center"
        >
          <div className="inline-flex items-center gap-8 p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                1,847
              </div>
              <div className="text-lg font-semibold text-gray-700 mt-1">Graczy dziś</div>
            </div>
            <div className="w-px h-20 bg-gray-300/50" />
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                2,341
              </div>
              <div className="text-lg font-semibold text-gray-700 mt-1">EXP rozdanych</div>
            </div>
            <div className="w-px h-20 bg-gray-300/50" />
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                92%
              </div>
              <div className="text-lg font-semibold text-gray-700 mt-1">Wygranych gier</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
