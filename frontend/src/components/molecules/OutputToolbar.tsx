import { Copy, Download, FileDown } from 'lucide-react'
import { Button } from '../atoms/Button'
import { exportDocument } from '../../lib/api'

interface OutputToolbarProps {
  output: string
  documentType: string
  disabled?: boolean
}

export function OutputToolbar({ output, documentType, disabled }: OutputToolbarProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
  }

  const handleDownloadTxt = async () => {
    try {
      const blob = await exportDocument(output, 'txt', documentType)
      downloadBlob(blob, `PrivateLocalAI_${documentType}.txt`)
    } catch {
      const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
      downloadBlob(blob, `PrivateLocalAI_${documentType}.txt`)
    }
  }

  const handleDownloadDocx = async () => {
    try {
      const blob = await exportDocument(output, 'docx', documentType)
      downloadBlob(blob, `PrivateLocalAI_${documentType}.docx`)
    } catch (e) {
      console.error('DOCX export failed:', e)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="ghost" size="sm" onClick={handleCopy} disabled={disabled}>
        <Copy size={16} className="mr-1" />
        Kopieren
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDownloadTxt} disabled={disabled}>
        <Download size={16} className="mr-1" />
        TXT
      </Button>
      <Button variant="ghost" size="sm" onClick={handleDownloadDocx} disabled={disabled}>
        <FileDown size={16} className="mr-1" />
        DOCX
      </Button>
    </div>
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
