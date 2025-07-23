"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from "lucide-react"

interface VideoPlayerProps {
  src: string
  title?: string
  onComplete?: () => void
  className?: string
}

export default function VideoPlayer({ src, title, onComplete, className = "" }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      if (onComplete) onComplete()
    }

    const handleError = () => {
      setError("Failed to load video")
      setIsLoading(false)
    }

    const handleCanPlay = () => {
      setIsLoading(false)
    }

    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("error", handleError)
    video.addEventListener("canplay", handleCanPlay)

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata)
      video.removeEventListener("timeupdate", handleTimeUpdate)
      video.removeEventListener("ended", handleEnded)
      video.removeEventListener("error", handleError)
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [onComplete])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return

    try {
      if (isPlaying) {
        video.pause()
        setIsPlaying(false)
      } else {
        await video.play()
        setIsPlaying(true)
      }
    } catch (err) {
      console.error("Video playback failed:", err)
      setError("Playback failed")
    }
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newTime = value[0]
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const newVolume = value[0]
    video.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    if (isMuted) {
      video.volume = volume
      setIsMuted(false)
    } else {
      video.volume = 0
      setIsMuted(true)
    }
  }

  const restart = () => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    setCurrentTime(0)
  }

  const toggleFullscreen = async () => {
    const container = containerRef.current
    if (!container) return

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch (err) {
      console.error("Fullscreen failed:", err)
    }
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
        <p className="text-red-600 text-sm">Video Error: {error}</p>
        {title && <p className="text-gray-600 text-xs mt-1">{title}</p>}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video ref={videoRef} src={src} className="w-full h-auto" onClick={togglePlay} preload="metadata" />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Play button overlay */}
      {!isPlaying && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <Button
            size="lg"
            onClick={togglePlay}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm"
          >
            <Play className="w-8 h-8 text-white" />
          </Button>
        </div>
      )}

      {/* Controls overlay */}
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          {title && (
            <div className="mb-3">
              <h4 className="font-medium text-white text-sm">{title}</h4>
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
              <div className="flex justify-between text-xs text-white text-opacity-80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={togglePlay}
                  disabled={isLoading}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 text-white" />
                  ) : (
                    <Play className="w-4 h-4 text-white" />
                  )}
                </Button>

                <Button
                  size="sm"
                  onClick={restart}
                  disabled={isLoading}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm"
                >
                  <RotateCcw className="w-4 h-4 text-white" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Volume controls */}
                <Button
                  size="sm"
                  onClick={toggleMute}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-white" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-white" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  max={1}
                  step={0.1}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />

                {/* Fullscreen button */}
                <Button
                  size="sm"
                  onClick={toggleFullscreen}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm"
                >
                  <Maximize className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Named export for compatibility
export { VideoPlayer }
