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
  {
    href: '/',
    label: 'Home',
  },
  {
    href: '/blog',
    label: 'Blog',
  },
  {
    href: '/about',
    label: 'About',
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://twitter.com/enscry',
    label: 'Twitter',
  },
  {
    href: '/blog',
    label: 'Newspaper',
  },
  {
    href: 'https://t.me/usernamekamu',
    label: 'Telegram', // penting: harus sama dengan ICON_MAP key
  },
]

// ICON_MAP final
export const ICON_MAP: IconMap = {
  Website: 'lucide:globe',
  LinkedIn: 'lucide:linkedin',
  Twitter: 'lucide:twitter',
  Newspaper: 'lucide:newspaper',
  Telegram: 'mdi:telegram', // ← FIX: dijamin muncul
}
