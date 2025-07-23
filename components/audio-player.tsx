"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, RotateCcw } from "lucide-react"

interface AudioPlayerProps {
  src: string
  title?: string
  onComplete?: () => void
  className?: string
}

export default function AudioPlayer({ src, title, onComplete, className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (onComplete) onComplete()
    }

    const handleError = () => {
      setError("Failed to load audio")
      setIsLoading(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)
    audio.addEventListener("canplay", handleCanPlay)

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
      audio.removeEventListener("canplay", handleCanPlay)
    }
  }, [onComplete])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    try {
      if (isPlaying) {
        audio.pause()
        setIsPlaying(false)
      } else {
        await audio.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error("Audio playback failed:", err)
      setError("Playback failed")
    }
  }

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = value[0]
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const newVolume = value[0]
    audio.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }

  const restart = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = 0
    setCurrentTime(0)
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <p className="text-red-600 text-sm">Audio Error: {error}</p>
        {title && <p className="text-gray-600 text-xs mt-1">{title}</p>}
      </div>
    )
  }

  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {title && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-800 text-sm">{title}</h4>
        </div>
      )}

      <div className="space-y-3">
        {/* Progress bar */}
        <div className="space-y-1">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
            disabled={isLoading || !duration}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={togglePlay} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button size="sm" variant="outline" onClick={restart} disabled={isLoading}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          {/* Volume controls */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={toggleMute}>
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Named export for compatibility
export { AudioPlayer }
