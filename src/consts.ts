import type { IconMap, SocialLink, Site } from '@/types'

export const SITE: Site = {
  title: 'enscribe.dev',
  description:
    'Design engineer and cybersecurity enthusiast based in Los Angeles.',
  href: 'https://enscribe.dev',
  author: 'enscribe',
  locale: 'en-US',
  featuredPostCount: 2,
  postsPerPage: 4,
}

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
]

export const SOCIAL_LINKS: SocialLink[] = [
  { href: 'https://x.com/arcofgrisaille', label: 'Twitter' },
  { href: '/blog', label: 'Newspaper' },
  { href: 'https://t.me/usernamekamu', label: 'Telegram' },
  { href: 'https://pump.fun', label: 'Pumpfun' },
]

export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Newspaper: 'lucide:newspaper',
  Telegram: 'mdi:telegram',
  Pumpfun: 'local:pumpfun', // ⬅️ mengambil ikon dari src/icons/pumpfun.svg
}
