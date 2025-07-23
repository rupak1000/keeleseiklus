"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, RotateCcw } from "lucide-react"

interface VocabularyItem {
  word?: string
  estonian?: string
  translation?: string
  english?: string
  translation_ru?: string
  russian?: string
  example?: string
  example_ru?: string
  audioUrl?: string
  pronunciation?: string
  partOfSpeech?: string
  difficulty?: "easy" | "medium" | "hard"
}

interface VocabularyCardProps {
  item: VocabularyItem
  language?: string
}

export default function VocabularyCard({ item, language = "en" }: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const estonianWord = item.word || item.estonian || ""
  const englishTranslation = item.translation || item.english || ""
  const russianTranslation = item.translation_ru || item.russian || ""
  const example = item.example || ""
  const exampleRu = item.example_ru || ""
  const audioUrl = item.audioUrl || ""
  const pronunciation = item.pronunciation || ""

  const displayTranslation = language === "ru" && russianTranslation ? russianTranslation : englishTranslation
  const displayExample = language === "ru" && exampleRu ? exampleRu : example

  const playAudio = async () => {
    if (isPlaying) return

    setIsPlaying(true)

    try {
      if (audioUrl) {
        const audio = new Audio(audioUrl)
        audio.onended = () => setIsPlaying(false)
        audio.onerror = () => {
          setIsPlaying(false)
          // Fallback to speech synthesis
          speakWord()
        }
        await audio.play()
      } else {
        // Use speech synthesis as fallback
        speakWord()
      }
    } catch (error) {
      console.error("Audio playback failed:", error)
      speakWord()
    }
  }

  const speakWord = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(estonianWord)
      utterance.lang = "et-EE"
      utterance.rate = 0.8
      utterance.onend = () => setIsPlaying(false)
      speechSynthesis.speak(utterance)
    } else {
      setIsPlaying(false)
    }
  }

  return (
    <div className="vocabulary-card-container">
      <div className={`vocabulary-card ${isFlipped ? "flipped" : ""}`} onClick={() => setIsFlipped(!isFlipped)}>
        {/* Front of card */}
        <Card className="vocabulary-card-face vocabulary-card-front">
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">{estonianWord}</h3>
              {pronunciation && <p className="text-sm text-gray-500 mb-2">/{pronunciation}/</p>}
              <p className="text-lg text-gray-700">{displayTranslation}</p>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio()
                }}
                disabled={isPlaying}
                className="bg-transparent"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  setIsFlipped(true)
                }}
                className="bg-transparent"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card className="vocabulary-card-face vocabulary-card-back">
          <CardContent className="p-4 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-3">{estonianWord}</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Translation:</span>
                  <p className="text-gray-800">{displayTranslation}</p>
                </div>

                {displayExample && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Example:</span>
                    <p className="text-gray-800 italic">"{displayExample}"</p>
                  </div>
                )}

                {item.partOfSpeech && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Part of speech:</span>
                    <p className="text-gray-800">{item.partOfSpeech}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio()
                }}
                disabled={isPlaying}
                className="bg-transparent"
              >
                <Volume2 className={`w-4 h-4 ${isPlaying ? "animate-pulse" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Named export for compatibility
export { VocabularyCard }
