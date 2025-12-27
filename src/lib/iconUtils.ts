// lib/iconUtils.ts
// Centralized icon mapping for consistency across the app

export const AVAILABLE_ICONS = [
  { name: 'Chat', value: 'chat-dots', unicode: '💬' },
  { name: 'Robot', value: 'robot', unicode: '🤖' },
  { name: 'Person', value: 'person-circle', unicode: '👤' },
  { name: 'Headset', value: 'headset', unicode: '🎧' },
  { name: 'Question', value: 'question-circle', unicode: '❓' },
  { name: 'Info', value: 'info-circle', unicode: 'ℹ️' },
  { name: 'Lightbulb', value: 'lightbulb', unicode: '💡' },
  { name: 'Heart', value: 'heart', unicode: '❤️' },
  { name: 'Star', value: 'star', unicode: '⭐' },
  { name: 'Bell', value: 'bell', unicode: '🔔' },
  { name: 'Envelope', value: 'envelope', unicode: '✉️' },
  { name: 'Gift', value: 'gift', unicode: '🎁' },
  { name: 'Rocket', value: 'rocket', unicode: '🚀' },
  { name: 'Shield', value: 'shield-check', unicode: '🛡️' },
  { name: 'Telephone', value: 'telephone', unicode: '📞' },
  { name: 'Cart', value: 'cart', unicode: '🛒' },
  { name: 'Book', value: 'book', unicode: '📚' },
  { name: 'Clipboard', value: 'clipboard', unicode: '📋' },
  { name: 'Music', value: 'music-note', unicode: '🎵' },
  { name: 'Camera', value: 'camera', unicode: '📷' },
  { name: 'Trophy', value: 'trophy', unicode: '🏆' },
  { name: 'Briefcase', value: 'briefcase', unicode: '💼' },
  { name: 'Gear', value: 'gear', unicode: '⚙️' },
  { name: 'Globe', value: 'globe', unicode: '🌍' },
]

// Create a map for quick lookup
export const ICON_MAP: Record<string, string> = AVAILABLE_ICONS.reduce((acc, icon) => {
  acc[icon.value] = icon.unicode
  return acc
}, {} as Record<string, string>)

/**
 * Get icon emoji by identifier
 * @param iconId - Icon identifier (e.g., 'chat-dots')
 * @param fallback - Fallback icon if not found (default: 'chat-dots')
 * @returns Icon emoji string
 */
export function getIconEmoji(iconId: string, fallback: string = 'chat-dots'): string {
  return ICON_MAP[iconId] || ICON_MAP[fallback] || '💬'
}

/**
 * Get icon data by identifier
 * @param iconId - Icon identifier
 * @returns Icon object or undefined
 */
export function getIconData(iconId: string) {
  return AVAILABLE_ICONS.find(icon => icon.value === iconId)
}