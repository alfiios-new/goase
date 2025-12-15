'use client'

import { useEffect, useState, useRef } from 'react'
import { FaSpotify } from 'react-icons/fa'
import { Skeleton } from '@/components/ui/skeleton'
import { MoveUpRight, AudioLines } from 'lucide-react'

interface Track {
  name: string
  artist: { '#text': string }
  album: { '#text': string }
  image: { '#text': string }[]
  url: string
}

interface CachedData {
  track: Track
  timestamp: number
}

const CACHE_KEY = 'spotify-presence-cache'
const CACHE_DURATION = 5 * 60 * 1000
const RETRY_DELAY = 2000
const MAX_RETRIES = 3

const SpotifyPresence = () => {
  const [displayData, setDisplayData] = useState<Track | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const retryCountRef = useRef(0)
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const getCachedData = (): Track | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null
      const parsed: CachedData = JSON.parse(cached)
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed.track
      }
    } catch {
      localStorage.removeItem(CACHE_KEY)
    }
    return null
  }

  const setCachedData = (track: Track) => {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ track, timestamp: Date.now() }),
    )
  }

  const fetchWithRetry = async (retry = 0) => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      const res = await fetch(
        'https://lastfm-last-played.biancarosa.com.br/enscribe/latest-song',
        { signal: controller.signal, cache: 'no-store' },
      )

      clearTimeout(timeout)

      if (!res.ok) throw new Error('Fetch failed')

      const json = await res.json()
      if (!json.track) throw new Error('No track')

      setDisplayData(json.track)
      setCachedData(json.track)
      setError(null)
      retryCountRef.current = 0
    } catch {
      if (retry < MAX_RETRIES) {
        fetchTimeoutRef.current = setTimeout(
          () => fetchWithRetry(retry + 1),
          RETRY_DELAY * (retry + 1),
        )
      } else {
        setError('Failed to load music data')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const cached = getCachedData()
    if (cached) {
      setDisplayData(cached)
      setIsLoading(false)
      fetchWithRetry()
    } else {
      fetchWithRetry()
    }

    return () => {
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current)
    }
  }, [])

  if (isLoading && !displayData) {
    return <Skeleton className="size-full" />
  }

  if (!displayData) {
    return (
      <div className="flex size-full items-center justify-center text-muted-foreground">
        No signal detected
      </div>
    )
  }

  const { name, artist, album, image, url } = displayData

  return (
    <>
      <div className="relative flex size-full flex-col justify-between p-6">
        <div
          className="aspect-square max-w-[60%] bg-cover bg-center grayscale"
          style={{ backgroundImage: `url(${image[3]['#text']})` }}
        />

        <div className="mt-4">
          <span className="mb-2 flex items-center gap-2 text-primary text-sm">
            <AudioLines size={14} />
            LLM listening…
          </span>

          <div className="text-md mb-1 font-medium line-clamp-2">
            {name}
          </div>

          <div className="text-xs text-muted-foreground line-clamp-1">
            source: {artist['#text']}
          </div>

          <div className="text-xs text-muted-foreground line-clamp-1">
            context: {album['#text']}
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 m-3 text-primary">
        <FaSpotify size={52} />
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-0 right-0 m-3 rounded-full bg-border/50 p-3 hover:ring-2"
        title="Audio source"
      >
        <MoveUpRight size={14} />
      </a>
    </>
  )
}

export default SpotifyPresence
