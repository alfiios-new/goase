import React from 'react'

const ICONS: Record<string, string> = {
  openai: '/static/bento/openai.svg',
  claude: '/static/bento/claude.svg',
  gemini: '/static/bento/gemini.svg',
  grok: '/static/bento/grok.svg',
  deepseek: '/static/bento/deepseek.svg',
}

export function getLanguageIcon(
  name: string,
  size = 18,
): React.ReactNode | null {
  const src = ICONS[name.toLowerCase()]
  if (!src) return null

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={name}
      className="object-contain invert brightness-200"
      draggable={false}
    />
  )
}
