import { useState } from 'react'
import { Header } from './components/organisms/Header'
import { Footer } from './components/organisms/Footer'
import { DsgvoNotice } from './components/organisms/DsgvoNotice'
import { TranscriptInput } from './components/organisms/TranscriptInput'
import { FormatSelector } from './components/organisms/FormatSelector'
import { OutputDisplay } from './components/organisms/OutputDisplay'
import { SettingsPanel } from './components/organisms/SettingsPanel'
import { Button } from './components/atoms/Button'
import { useHealth } from './hooks/useHealth'
import { useModels } from './hooks/useModels'
import { useOllamaStream } from './hooks/useOllamaStream'
import { startGeneration } from './lib/api'
import type { FormatKey } from './lib/types'
import { Sparkles, Trash2, StopCircle } from 'lucide-react'

function App() {
  const { ollamaConnected } = useHealth()
  const { models, recommended } = useModels()
  const { output, isStreaming, error, tokenCount, startStream, stopStream, clearOutput } = useOllamaStream()

  const [transcript, setTranscript] = useState('')
  const [selectedFormat, setSelectedFormat] = useState<FormatKey | null>(null)
  const [selectedModel, setSelectedModel] = useState('')
  const [temperature, setTemperature] = useState(0.3)
  const [generating, setGenerating] = useState(false)

  // Set default model when models load
  if (!selectedModel && recommended) {
    setSelectedModel(recommended)
  } else if (!selectedModel && models.length > 0) {
    setSelectedModel(models[0].name)
  }

  const canGenerate = transcript.trim() && selectedFormat && ollamaConnected && !isStreaming

  const handleGenerate = async () => {
    if (!canGenerate || !selectedFormat) return

    setGenerating(true)
    clearOutput()

    try {
      const response = await startGeneration({
        transcript,
        format: selectedFormat,
        model: selectedModel || undefined,
        temperature,
      })
      startStream(response.task_id)
    } catch (e) {
      console.error('Generation failed:', e)
    } finally {
      setGenerating(false)
    }
  }

  const handleClearAll = () => {
    setTranscript('')
    setSelectedFormat(null)
    clearOutput()
  }

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <Header ollamaConnected={ollamaConnected} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        <DsgvoNotice />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <TranscriptInput
              value={transcript}
              onChange={setTranscript}
              disabled={isStreaming}
            />
          </div>

          <div className="lg:col-span-2">
            <FormatSelector
              selected={selectedFormat}
              onSelect={setSelectedFormat}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isStreaming ? (
            <Button variant="danger" size="lg" onClick={stopStream} className="flex-1 sm:flex-none">
              <StopCircle size={18} className="mr-2" />
              Generierung stoppen
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerate}
              disabled={!canGenerate}
              loading={generating}
              className="flex-1 sm:flex-none"
            >
              <Sparkles size={18} className="mr-2" />
              Dokument generieren
            </Button>
          )}
          {(transcript || output) && !isStreaming && (
            <Button variant="ghost" size="lg" onClick={handleClearAll}>
              <Trash2 size={18} className="mr-2" />
              Alle Daten loeschen
            </Button>
          )}
        </div>

        <OutputDisplay
          output={output}
          isStreaming={isStreaming}
          error={error}
          tokenCount={tokenCount}
          documentType={selectedFormat || ''}
        />

        <SettingsPanel
          models={models}
          recommended={recommended}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          temperature={temperature}
          onTemperatureChange={setTemperature}
        />
      </main>

      <Footer />
    </div>
  )
}

export default App
