# Microinteracciones Delightful para CMO

Sistema de microinteracciones sutiles y profesionales para mejorar la experiencia del usuario en el panel de monitoreo aduanero.

## Componentes Disponibles

### 1. BreathingPrecinto
Animación de "respiración" para precintos activos.

```tsx
import { BreathingPrecinto } from '@/features/microinteractions';

<BreathingPrecinto status="normal">
  <PrecintoCard data={precinto} />
</BreathingPrecinto>
```

Estados disponibles:
- `normal`: Respiración verde suave (3s)
- `alert`: Respiración amarilla media (2s)
- `critical`: Respiración roja intensa (1.5s)

### 2. ParticleTrail
Estelas de partículas para vehículos en movimiento.

```tsx
import { ParticleTrail } from '@/features/microinteractions';

<ParticleTrail
  x={vehiclePosition.x}
  y={vehiclePosition.y}
  isMoving={vehicle.speed > 0}
  speed={vehicle.speed}
  status={vehicle.alertLevel}
/>
```

### 3. BloomingAlert
Animación de florecimiento para nuevas alertas.

```tsx
import { BloomingAlert } from '@/features/microinteractions';

<BloomingAlert
  status="critical"
  show={isNewAlert}
  onBloomComplete={() => handleAlertShown()}
>
  <AlertContent />
</BloomingAlert>
```

### 4. Sonidos ASMR
Sistema de audio sutil para acciones.

```tsx
import { useASMRSound } from '@/features/microinteractions';

const { playSuccess, playHover, playNotification } = useASMRSound();

// En componentes
<button 
  onMouseEnter={() => playHover()}
  onClick={() => playSuccess()}
>
  Guardar
</button>
```

Sonidos disponibles:
- `playSuccess()`: Acción exitosa
- `playNotification()`: Nueva notificación
- `playComplete()`: Tarea completada
- `playError()`: Error suave
- `playHover()`: Hover en botones
- `playRefresh()`: Actualización
- `playOpen()`: Abrir modal/panel
- `playClose()`: Cerrar modal/panel

## Configuración

Los usuarios pueden personalizar las microinteracciones usando el botón flotante con ícono de ✨ (Sparkles) en la esquina inferior derecha.

Opciones disponibles:
- Activar/desactivar animaciones
- Intensidad de animaciones (baja, media, alta)
- Activar/desactivar partículas
- Activar/desactivar sonidos
- Control de volumen

## Integración en Componentes Existentes

### Ejemplo: Tarjeta de Precinto

```tsx
import { BreathingPrecinto, useASMRSound } from '@/features/microinteractions';

export const PrecintoCard = ({ precinto }) => {
  const { playHover, playSuccess } = useASMRSound();
  
  const getStatus = () => {
    if (precinto.alert === 'high') return 'critical';
    if (precinto.alert === 'medium') return 'alert';
    return 'normal';
  };

  return (
    <BreathingPrecinto status={getStatus()}>
      <div 
        className="precinto-card"
        onMouseEnter={() => playHover()}
        onClick={() => playSuccess()}
      >
        {/* Contenido de la tarjeta */}
      </div>
    </BreathingPrecinto>
  );
};
```

### Ejemplo: Nueva Alerta

```tsx
import { BloomingAlert, useASMRSound } from '@/features/microinteractions';

export const AlertNotification = ({ alert, isNew }) => {
  const { playNotification } = useASMRSound();
  const [showBloom, setShowBloom] = useState(isNew);

  return (
    <BloomingAlert
      status={alert.severity}
      show={showBloom}
      onBloomComplete={() => {
        setShowBloom(false);
        playNotification();
      }}
    >
      <AlertCard alert={alert} />
    </BloomingAlert>
  );
};
```

## Consideraciones de Performance

1. Las animaciones usan `will-change` y GPU acceleration
2. Las partículas se limitan a 50 simultáneas
3. Los sonidos se cargan de forma lazy
4. Respeta `prefers-reduced-motion`
5. Se desactivan automáticamente en dispositivos de baja potencia

## Accesibilidad

- Todas las animaciones respetan la preferencia del sistema `prefers-reduced-motion`
- Los sonidos son opcionales y configurables
- Las animaciones no interfieren con la legibilidad
- Compatible con lectores de pantalla

## Archivos de Sonido

Los archivos de sonido deben colocarse en `/public/sounds/`:
- Formato: MP3 128kbps
- Tamaño: < 50KB cada uno
- Volumen normalizado: -20dB

Ver `/public/sounds/README.md` para detalles completos.