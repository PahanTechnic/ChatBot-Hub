// components/GradientBuilder.tsx
'use client'

import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'

interface ColorStop {
  color: string
  position: number
}

interface GradientBuilderProps {
  gradient: string
  onChange: (gradient: string) => void
}

export default function GradientBuilder({ gradient, onChange }: GradientBuilderProps) {
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear')
  const [angle, setAngle] = useState(135)
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { color: '#1899CC', position: 0 },
    { color: '#57C785', position: 50 },
    { color: '#EDDD53', position: 100 },
  ])

  // Parse existing gradient
  useEffect(() => {
    parseGradient(gradient)
  }, [gradient])

  const parseGradient = (grad: string) => {
    try {
      if (grad.includes('radial-gradient')) {
        setGradientType('radial')
      } else {
        setGradientType('linear')
        const angleMatch = grad.match(/(\d+)deg/)
        if (angleMatch) setAngle(parseInt(angleMatch[1]))
      }

      // Parse color stops: #RRGGBB NN%
      const colorMatches = grad.match(/#[0-9A-Fa-f]{6}\s+\d+%/g)
      if (colorMatches && colorMatches.length >= 2) {
        const stops = colorMatches.map(match => {
          const parts = match.trim().split(/\s+/)
          return {
            color: parts[0],
            position: parseInt(parts[1])
          }
        })
        setColorStops(stops)
      }
    } catch (error) {
      console.error('Failed to parse gradient:', error)
    }
  }

  const updateGradient = (stops: ColorStop[], type: 'linear' | 'radial', deg: number) => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position)
    const stopsString = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')
    
    const newGradient = type === 'linear' 
      ? `linear-gradient(${deg}deg, ${stopsString})`
      : `radial-gradient(circle, ${stopsString})`
    
    onChange(newGradient)
  }

  const addColorStop = () => {
    const newStop: ColorStop = {
      color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'),
      position: 50
    }
    const newStops = [...colorStops, newStop]
    setColorStops(newStops)
    updateGradient(newStops, gradientType, angle)
  }

  const removeColorStop = (index: number) => {
    if (colorStops.length <= 2) return
    const newStops = colorStops.filter((_, i) => i !== index)
    setColorStops(newStops)
    updateGradient(newStops, gradientType, angle)
  }

  const updateColorStop = (index: number, field: 'color' | 'position', value: string | number) => {
    const newStops = [...colorStops]
    if (field === 'color') {
      newStops[index].color = value as string
    } else {
      newStops[index].position = Math.max(0, Math.min(100, value as number))
    }
    setColorStops(newStops)
    updateGradient(newStops, gradientType, angle)
  }

  const handleTypeChange = (type: 'linear' | 'radial') => {
    setGradientType(type)
    updateGradient(colorStops, type, angle)
  }

  const handleAngleChange = (newAngle: number) => {
    setAngle(newAngle)
    updateGradient(colorStops, gradientType, newAngle)
  }

  return (
    <div className="space-y-4">
      {/* Gradient Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange('linear')}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              gradientType === 'linear' 
                ? 'border-green-500 bg-green-50 text-gray-900' 
                : 'border-gray-300 hover:border-gray-400 text-gray-700'
            }`}
          >
            <div className="text-sm font-medium">Linear</div>
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('radial')}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              gradientType === 'radial' 
                ? 'border-green-500 bg-green-50 text-gray-900' 
                : 'border-gray-300 hover:border-gray-400 text-gray-700'
            }`}
          >
            <div className="text-sm font-medium">Radial</div>
          </button>
        </div>
      </div>

      {/* Angle Slider (Linear only) */}
      {gradientType === 'linear' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Angle: {angle}°
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="360"
              value={angle}
              onChange={(e) => handleAngleChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg cursor-pointer"
            />
            <input
              type="number"
              value={angle}
              onChange={(e) => handleAngleChange(parseInt(e.target.value) || 0)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500"
              min="0"
              max="360"
            />
          </div>
        </div>
      )}

      {/* Color Stops */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Color Stops</label>
          <button
            type="button"
            onClick={addColorStop}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>

        <div className="space-y-3">
          {colorStops.map((stop, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              {/* Color Picker */}
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer"
                title="Pick color"
              />
              
              {/* Hex Input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={stop.color}
                  onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                  placeholder="#000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              {/* Position Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={stop.position}
                  onChange={(e) => updateColorStop(index, 'position', parseInt(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500"
                  min="0"
                  max="100"
                />
                <span className="text-sm text-gray-500 font-medium">%</span>
              </div>
              
              {/* Remove Button */}
              {colorStops.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeColorStop(index)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                  title="Remove color stop"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Visual Preview Bar with Position Markers */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Preview</label>
        <div className="relative">
          <div 
            className="w-full h-20 rounded-lg shadow-md border-2 border-gray-200"
            style={{ background: gradient }}
          />
          {/* Position markers */}
          <div className="absolute inset-0 pointer-events-none">
            {colorStops.map((stop, index) => (
              <div
                key={index}
                className="absolute top-0 bottom-0 flex flex-col items-center justify-center"
                style={{ left: `${stop.position}%` }}
              >
                <div className="w-0.5 h-full bg-white shadow-lg" />
                <div className="absolute -bottom-6 bg-gray-800 text-white text-xs px-2 py-0.5 rounded whitespace-nowrap">
                  {stop.position}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Output (Read-only for reference) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">CSS Code</label>
        <div className="relative">
          <textarea
            value={gradient}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none font-mono text-sm bg-gray-50"
            placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(gradient)
              alert('Gradient CSS copied!')
            }}
            className="absolute top-2 right-2 px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-xs font-medium transition-colors"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          You can also manually edit the CSS gradient code
        </p>
      </div>
    </div>
  )
}