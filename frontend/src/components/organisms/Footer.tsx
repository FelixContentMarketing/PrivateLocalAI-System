import { Shield } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-dark-border py-4 mt-auto">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-dark-muted">
          <Shield size={12} />
          <span>100% lokale Verarbeitung -- DSGVO-konform</span>
        </div>
        <div className="text-dark-muted/60">
          PrivateLocalAI &bull; Powered by ProMechCRM &bull; Felix Schmidt
        </div>
      </div>
    </footer>
  )
}
