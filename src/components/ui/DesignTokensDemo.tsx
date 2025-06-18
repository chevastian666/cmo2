import React from 'react';
import { designTokens } from '../../styles/design-tokens';
import { tokenClasses, combineTokenClasses, getStateClasses } from '../../styles/useDesignTokens';

export const DesignTokensDemo: React.FC = () => {
  const transitStates = ['active', 'pending', 'completed', 'cancelled', 'delayed'];
  const alertLevels = ['critical', 'high', 'medium', 'low', 'info'];
  const precintoStates = ['active', 'inactive', 'broken', 'maintenance'];

  return (
    <div className="space-y-8 p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Design Tokens Demo</h1>

      {/* Colores */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Colores</h2>
        
        {/* Escala de grises */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Escala de Grises</h3>
          <div className="grid grid-cols-11 gap-2">
            {Object.entries(designTokens.colors.gray).map(([key, value]) => (
              <div key={key} className="text-center">
                <div 
                  className="w-full h-16 rounded-md border border-gray-600 mb-2"
                  style={{ backgroundColor: value }}
                />
                <p className="text-xs text-gray-400">gray-{key}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Colores semánticos */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Colores Semánticos</h3>
          <div className="grid grid-cols-5 gap-4">
            {['primary', 'success', 'warning', 'error', 'info'].map((color) => (
              <div key={color} className="text-center">
                <div 
                  className="w-full h-16 rounded-md mb-2"
                  style={{ backgroundColor: designTokens.colors[color as keyof typeof designTokens.colors][500] }}
                />
                <p className="text-sm text-gray-300 capitalize">{color}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Estados del dominio */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-300 mb-2">Estados de Tránsito</h4>
            <div className="space-y-2">
              {transitStates.map(state => (
                <div 
                  key={state}
                  className={combineTokenClasses(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    getStateClasses('transit', state)
                  )}
                >
                  {state}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-300 mb-2">Niveles de Alerta</h4>
            <div className="space-y-2">
              {alertLevels.map(level => (
                <div 
                  key={level}
                  className={combineTokenClasses(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    getStateClasses('alert', level)
                  )}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-300 mb-2">Estados de Precinto</h4>
            <div className="space-y-2">
              {precintoStates.map(state => (
                <div 
                  key={state}
                  className={combineTokenClasses(
                    "px-3 py-2 rounded-md text-sm font-medium",
                    getStateClasses('precinto', state)
                  )}
                >
                  {state}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Espaciado */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Espaciado</h2>
        <div className="space-y-3">
          {[0, 1, 2, 3, 4, 6, 8, 12, 16].map(space => (
            <div key={space} className="flex items-center gap-4">
              <span className="text-sm text-gray-400 w-20">p-{space}</span>
              <div className={`bg-blue-500 h-8 rounded`} style={{ width: designTokens.spacing[space as keyof typeof designTokens.spacing] }} />
              <span className="text-xs text-gray-500">{designTokens.spacing[space as keyof typeof designTokens.spacing]}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tipografía */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Tipografía</h2>
        <div className="space-y-4">
          {Object.entries(designTokens.typography.fontSize).map(([key, [size]]) => (
            <div key={key} className={`text-gray-300`} style={{ fontSize: size }}>
              <span className="font-semibold">{key}</span> - {size} - Lorem ipsum dolor sit amet
            </div>
          ))}
        </div>
      </section>

      {/* Componentes */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Componentes</h2>
        
        {/* Cards */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Cards</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className={tokenClasses.components.card}>
              <div className={tokenClasses.components.cardHeader}>
                <h4 className="font-medium text-white">Card Header</h4>
              </div>
              <div className={tokenClasses.components.cardBody}>
                <p className={tokenClasses.text.secondary}>Card content goes here</p>
              </div>
            </div>

            <div className={combineTokenClasses(tokenClasses.components.card, "shadow-dark-lg")}>
              <div className="p-6">
                <h4 className="font-medium text-white mb-2">Elevated Card</h4>
                <p className={tokenClasses.text.secondary}>With shadow-dark-lg</p>
              </div>
            </div>

            <div className={combineTokenClasses(tokenClasses.components.card, tokenClasses.backgrounds.interactive)}>
              <div className="p-6">
                <h4 className="font-medium text-white mb-2">Interactive Card</h4>
                <p className={tokenClasses.text.secondary}>Hover me!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <button className={combineTokenClasses(
              tokenClasses.components.button.base,
              tokenClasses.components.button.primary,
              "px-4 py-2"
            )}>
              Primary
            </button>
            <button className={combineTokenClasses(
              tokenClasses.components.button.base,
              tokenClasses.components.button.secondary,
              "px-4 py-2"
            )}>
              Secondary
            </button>
            <button className={combineTokenClasses(
              tokenClasses.components.button.base,
              tokenClasses.components.button.danger,
              "px-4 py-2"
            )}>
              Danger
            </button>
            <button className={combineTokenClasses(
              tokenClasses.components.button.ghost,
              "px-4 py-2 rounded-md"
            )}>
              Ghost
            </button>
            <button className={tokenClasses.components.button.link}>
              Link
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Badges</h3>
          <div className="flex flex-wrap gap-3">
            {Object.keys(tokenClasses.components.badge).filter(k => k !== 'base').map(variant => (
              <span 
                key={variant}
                className={combineTokenClasses(
                  tokenClasses.components.badge.base,
                  tokenClasses.components.badge[variant as keyof typeof tokenClasses.components.badge]
                )}
              >
                {variant}
              </span>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Alerts</h3>
          <div className="space-y-3">
            {['info', 'success', 'warning', 'error'].map(type => (
              <div 
                key={type}
                className={combineTokenClasses(
                  tokenClasses.components.alert.base,
                  tokenClasses.components.alert[type as keyof typeof tokenClasses.components.alert]
                )}
              >
                <p className="font-medium capitalize">{type} Alert</p>
                <p className="text-sm opacity-90">This is an {type} message</p>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-300 mb-3">Form Elements</h3>
          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Input Field
              </label>
              <input 
                type="text" 
                className={tokenClasses.components.input}
                placeholder="Enter text..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Field
              </label>
              <select className={tokenClasses.components.input}>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Textarea
              </label>
              <textarea 
                className={combineTokenClasses(tokenClasses.components.input, "min-h-[100px]")}
                placeholder="Enter description..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Sombras */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Sombras</h2>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(designTokens.shadows.dark).map(([key, value]) => (
            <div 
              key={key}
              className="bg-gray-800 p-6 rounded-lg text-center"
              style={{ boxShadow: value }}
            >
              <p className="text-sm text-gray-300">shadow-dark-{key}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Border Radius */}
      <section>
        <h2 className="text-xl font-semibold text-white mb-4">Border Radius</h2>
        <div className="grid grid-cols-8 gap-4">
          {Object.entries(designTokens.borders.borderRadius).map(([key, value]) => (
            <div key={key} className="text-center">
              <div 
                className="w-full h-16 bg-blue-500 mb-2"
                style={{ borderRadius: value }}
              />
              <p className="text-xs text-gray-400">rounded-{key}</p>
              <p className="text-xs text-gray-500">{value}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};