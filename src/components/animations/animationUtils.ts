/**
 * Animation utilities and hooks
 * By Cheva
 */

import { useState, useEffect} from 'react'
// Hook para detectar cambios en los datos
export const useDataChange = <T>(data: T) => {
  const [hasChanged, setHasChanged] = useState(false)
  const [prevData, setPrevData] = useState(data)
  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(prevData)) {
      setHasChanged(true)
      setPrevData(data)
      const timer = setTimeout(() => setHasChanged(false), 500)
      return () => clearTimeout(timer)
    }
  }, [data])
  return hasChanged
}
// Variantes de animación reutilizables
export const slideInVariants = {
  hidden: { x: -50, opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: 50, opacity: 0 }
}
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}
export const scaleVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 }
}
// Configuraciones de transición comunes
export const springTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30
}
export const smoothTransition = {
  duration: 0.3,
  ease: "easeInOut"
}