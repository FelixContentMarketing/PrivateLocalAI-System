import type { FormatOption } from './types'

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    key: 'zusammenfassung',
    label: 'Zusammenfassung',
    description: 'Strukturierte Zusammenfassung mit Sachverhalt, Rechtsfragen und naechsten Schritten',
    icon: 'FileText',
  },
  {
    key: 'besprechungsprotokoll',
    label: 'Besprechungsprotokoll',
    description: 'Formelles Protokoll mit Tagesordnungspunkten, Massnahmen und Fristen',
    icon: 'ClipboardList',
  },
  {
    key: 'schriftsatz_entwurf',
    label: 'Schriftsatz-Entwurf',
    description: 'Juristischer Schriftsatz mit Antraegen, Sachverhalt und rechtlicher Wuerdigung',
    icon: 'Scale',
  },
  {
    key: 'mandantenanschreiben',
    label: 'Mandantenanschreiben',
    description: 'Verstaendlicher Brief an den Mandanten mit Sachstand und Empfehlungen',
    icon: 'Mail',
  },
]

export const API_BASE = '/api'
