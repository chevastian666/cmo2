import React, { useState } from 'react'
import { motion, AnimatePresence} from 'framer-motion'
import {Play, Pause, RefreshCw, Layers, Zap, Move, Maximize2, Grid, List, AlertCircle, CheckCircle, Info, Settings} from 'lucide-react'
import { 
  AnimatedCard, AnimatedButton, AnimatedList, AnimatedListItem, AnimatedModal, AnimatedBadge, AnimatedSpinner, AnimatedSkeleton, AnimatedProgress, FadeDiv, ScaleDiv, SlideUpDiv, SlideDownDiv} from './AnimatedComponents'
import {
  PageTransition, AnimatedSection, AnimatedHeader, AnimatedTabPanel, AnimatedGrid} from './PageTransitions'
import {
  rotateScaleVariants, pulseVariants, shakeVariants, glowVariants, hoverScaleVariants, hoverLiftVariants, alertCriticalVariants, transitMovingVariants, precintoActiveVariants} from './AnimationPresets'
export const AnimationsDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basics')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [showGrid, setShowGrid] = useState(false)
  // Simulador de progreso
  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 10))
    }, 1000)
    return () => clearInterval(interval)
  }, [])
  const tabs = [
    { id: 'basics', label: 'Básicas', icon: Layers },
    { id: 'advanced', label: 'Avanzadas', icon: Zap },
    { id: 'gestures', label: 'Gestos', icon: Move },
    { id: 'layouts', label: 'Layouts', icon: Maximize2 },
    { id: 'domain', label: 'Dominio', icon: Settings }
  ]
  return (<PageTransition variant="fade">
      <div className="min-h-screen bg-gray-900 p-8">
        <AnimatedHeader 
          title="Demo de Animaciones con Framer Motion"
          subtitle="Componentes animados fluidos para CMO"
        />

        {/* Controles */}
        <AnimatedSection delay={0.1} className="mb-8">
          <AnimatedCard className="p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Controles de Animación</h3>
              <div className="flex gap-2">
                <AnimatedButton
                  variant="secondary"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-4 py-2"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </AnimatedButton>
                <AnimatedButton
                  variant="secondary"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </AnimatedButton>
              </div>
            </div>
          </AnimatedCard>
        </AnimatedSection>

        {/* Tabs */}
        <AnimatedSection delay={0.2}>
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {tabs.map((tab, index) => (<motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </motion.button>
            ))}
          </div>
        </AnimatedSection>

        {/* Content */}
        <AnimatedSection delay={0.3}>
          {/* Animaciones Básicas */}
          <AnimatedTabPanel isActive={activeTab === 'basics'}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Fade */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Fade Animation</h4>
                <AnimatePresence mode="wait">
                  {isPlaying && (
                    <FadeDiv key="fade">
                      <div className="bg-blue-500 h-32 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">Fade In/Out</span>
                      </div>
                    </FadeDiv>
                  )}
                </AnimatePresence>
              </AnimatedCard>

              {/* Scale */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Scale Animation</h4>
                <AnimatePresence mode="wait">
                  {isPlaying && (
                    <ScaleDiv key="scale">
                      <div className="bg-green-500 h-32 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">Scale</span>
                      </div>
                    </ScaleDiv>
                  )}
                </AnimatePresence>
              </AnimatedCard>

              {/* Slide Up */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Slide Up</h4>
                <AnimatePresence mode="wait">
                  {isPlaying && (
                    <SlideUpDiv key="slideup">
                      <div className="bg-purple-500 h-32 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">Slide Up</span>
                      </div>
                    </SlideUpDiv>
                  )}
                </AnimatePresence>
              </AnimatedCard>

              {/* Slide Down */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Slide Down</h4>
                <AnimatePresence mode="wait">
                  {isPlaying && (
                    <SlideDownDiv key="slidedown">
                      <div className="bg-orange-500 h-32 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">Slide Down</span>
                      </div>
                    </SlideDownDiv>
                  )}
                </AnimatePresence>
              </AnimatedCard>

              {/* Rotate + Scale */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Rotate + Scale</h4>
                <AnimatePresence mode="wait">
                  {isPlaying && (
                    <motion.div
                      variants={rotateScaleVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="bg-red-500 h-32 rounded-lg flex items-center justify-center">
                        <span className="text-white font-medium">Rotate + Scale</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </AnimatedCard>

              {/* Stagger List */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Stagger List</h4>
                <AnimatedList className="space-y-2">
                  {['Item 1', 'Item 2', 'Item 3', 'Item 4'].map((item, index) => (
                    <AnimatedListItem key={index}>
                      <div className="bg-gray-700 p-2 rounded">
                        <span className="text-gray-300">{item}</span>
                      </div>
                    </AnimatedListItem>
                  ))}
                </AnimatedList>
              </AnimatedCard>
            </div>
          </AnimatedTabPanel>

          {/* Animaciones Avanzadas */}
          <AnimatedTabPanel isActive={activeTab === 'advanced'}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Pulse */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Pulse Animation</h4>
                <motion.div
                  variants={pulseVariants}
                  initial="initial"
                  animate="animate"
                  className="bg-blue-500 h-32 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white font-medium">Pulsing</span>
                </motion.div>
              </AnimatedCard>

              {/* Shake */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Shake Animation</h4>
                <motion.div
                  variants={shakeVariants}
                  initial="initial"
                  animate={isPlaying ? "shake" : "initial"}
                  className="bg-red-500 h-32 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white font-medium">Error Shake</span>
                </motion.div>
              </AnimatedCard>

              {/* Glow */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Glow Effect</h4>
                <motion.div
                  variants={glowVariants}
                  initial="initial"
                  animate="glow"
                  className="bg-gray-700 h-32 rounded-lg flex items-center justify-center"
                >
                  <span className="text-white font-medium">Glowing</span>
                </motion.div>
              </AnimatedCard>

              {/* Progress Bar */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Progress Bar</h4>
                <div className="space-y-4">
                  <AnimatedProgress value={progress} />
                  <div className="text-center text-gray-400">{progress}%</div>
                </div>
              </AnimatedCard>

              {/* Spinner */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Loading Spinner</h4>
                <div className="flex justify-center items-center h-32 gap-4">
                  <AnimatedSpinner size="sm" />
                  <AnimatedSpinner size="md" />
                  <AnimatedSpinner size="lg" />
                </div>
              </AnimatedCard>

              {/* Skeleton */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Skeleton Loader</h4>
                <div className="space-y-3">
                  <AnimatedSkeleton variant="text" />
                  <AnimatedSkeleton variant="text" className="w-3/4" />
                  <AnimatedSkeleton variant="text" className="w-1/2" />
                  <div className="flex gap-3">
                    <AnimatedSkeleton variant="circular" />
                    <div className="flex-1 space-y-2">
                      <AnimatedSkeleton variant="text" />
                      <AnimatedSkeleton variant="text" className="w-2/3" />
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </div>
          </AnimatedTabPanel>

          {/* Gestos */}
          <AnimatedTabPanel isActive={activeTab === 'gestures'}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Hover Scale */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Hover Scale</h4>
                <motion.div
                  className="bg-blue-500 h-32 rounded-lg flex items-center justify-center cursor-pointer"
                  variants={hoverScaleVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <span className="text-white font-medium">Hover me!</span>
                </motion.div>
              </AnimatedCard>

              {/* Hover Lift */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Hover Lift</h4>
                <motion.div
                  className="bg-green-500 h-32 rounded-lg flex items-center justify-center cursor-pointer"
                  variants={hoverLiftVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                >
                  <span className="text-white font-medium">Hover to lift!</span>
                </motion.div>
              </AnimatedCard>

              {/* Drag */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Draggable</h4>
                <motion.div
                  drag
                  dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
                  className="bg-purple-500 h-32 rounded-lg flex items-center justify-center cursor-move"
                  whileDrag={{ scale: 1.1 }}
                >
                  <span className="text-white font-medium">Drag me!</span>
                </motion.div>
              </AnimatedCard>

              {/* Buttons */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Animated Buttons</h4>
                <div className="space-y-3">
                  <AnimatedButton variant="primary" className="w-full px-4 py-2">
                    Primary Button
                  </AnimatedButton>
                  <AnimatedButton variant="secondary" className="w-full px-4 py-2">
                    Secondary Button
                  </AnimatedButton>
                  <AnimatedButton variant="danger" className="w-full px-4 py-2">
                    Danger Button
                  </AnimatedButton>
                </div>
              </AnimatedCard>

              {/* Badges */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Animated Badges</h4>
                <div className="flex flex-wrap gap-3">
                  <AnimatedBadge variant="primary">Primary</AnimatedBadge>
                  <AnimatedBadge variant="success">Success</AnimatedBadge>
                  <AnimatedBadge variant="warning" pulse>Warning</AnimatedBadge>
                  <AnimatedBadge variant="danger" pulse>Critical</AnimatedBadge>
                  <AnimatedBadge variant="gray">Default</AnimatedBadge>
                </div>
              </AnimatedCard>

              {/* Modal Trigger */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Modal Animation</h4>
                <AnimatedButton
                  variant="primary"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full px-4 py-2"
                >
                  Open Modal
                </AnimatedButton>
              </AnimatedCard>
            </div>
          </AnimatedTabPanel>

          {/* Layouts */}
          <AnimatedTabPanel isActive={activeTab === 'layouts'}>
            <div className="space-y-6">
              {/* Grid Animation */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Animated Grid</h4>
                <AnimatedButton
                  variant="secondary"
                  onClick={() => setShowGrid(!showGrid)}
                  className="mb-4 px-4 py-2"
                >
                  {showGrid ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                  <span className="ml-2">Toggle Grid</span>
                </AnimatedButton>
                
                <AnimatePresence mode="wait">
                  {showGrid && (<AnimatedGrid className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                          key={item}
                          className="bg-gray-700 p-4 rounded-lg text-center"
                        >
                          <span className="text-gray-300">Item {item}</span>
                        </div>
                      ))}
                    </AnimatedGrid>
                  )}
                </AnimatePresence>
              </AnimatedCard>

              {/* Page Sections */}
              <AnimatedSection delay={0.1}>
                <AnimatedCard>
                  <h4 className="text-lg font-semibold text-white mb-4">Section 1</h4>
                  <p className="text-gray-300">
                    Esta sección aparece con un delay de 0.1s
                  </p>
                </AnimatedCard>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <AnimatedCard>
                  <h4 className="text-lg font-semibold text-white mb-4">Section 2</h4>
                  <p className="text-gray-300">
                    Esta sección aparece con un delay de 0.2s
                  </p>
                </AnimatedCard>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <AnimatedCard>
                  <h4 className="text-lg font-semibold text-white mb-4">Section 3</h4>
                  <p className="text-gray-300">
                    Esta sección aparece con un delay de 0.3s
                  </p>
                </AnimatedCard>
              </AnimatedSection>
            </div>
          </AnimatedTabPanel>

          {/* Animaciones del Dominio */}
          <AnimatedTabPanel isActive={activeTab === 'domain'}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Alerta Crítica */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Alerta Crítica</h4>
                <motion.div
                  variants={alertCriticalVariants}
                  initial="initial"
                  animate="animate"
                  className="bg-red-900/20 border-2 border-red-500 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                    <div>
                      <p className="text-red-400 font-semibold">TEMPERATURA CRÍTICA</p>
                      <p className="text-gray-300 text-sm">Precinto BT20240001</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedCard>

              {/* Tránsito en Movimiento */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Tránsito Activo</h4>
                <motion.div
                  variants={transitMovingVariants}
                  initial="initial"
                  animate="animate"
                  className="bg-blue-900/20 border border-blue-500 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Settings className="h-6 w-6 text-blue-400" />
                    </motion.div>
                    <div>
                      <p className="text-blue-400 font-semibold">EN RUTA</p>
                      <p className="text-gray-300 text-sm">Montevideo → Rivera</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedCard>

              {/* Precinto Activo */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Precinto Activo</h4>
                <motion.div
                  variants={precintoActiveVariants}
                  initial="initial"
                  animate="animate"
                  className="bg-green-900/20 border border-green-500 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <div>
                      <p className="text-green-400 font-semibold">OPERATIVO</p>
                      <p className="text-gray-300 text-sm">Batería: 85% | Señal: Excelente</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedCard>

              {/* Notificación */}
              <AnimatedCard>
                <h4 className="text-lg font-semibold text-white mb-4">Notificación</h4>
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div
                      initial={{ opacity: 0, y: 50, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="bg-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-white font-medium">Nueva actualización</p>
                          <p className="text-gray-400 text-sm">El tránsito ha llegado a destino</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </AnimatedCard>
            </div>
          </AnimatedTabPanel>
        </AnimatedSection>

        {/* Modal */}
        <AnimatedModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          className="max-w-md w-full"
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Modal Animado</h3>
            <p className="text-gray-300 mb-6">
              Este modal usa animaciones suaves de entrada y salida con Framer Motion.
            </p>
            <div className="flex gap-3 justify-end">
              <AnimatedButton
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2"
              >
                Cancelar
              </AnimatedButton>
              <AnimatedButton
                variant="primary"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2"
              >
                Aceptar
              </AnimatedButton>
            </div>
          </div>
        </AnimatedModal>
      </div>
    </PageTransition>
  )
}