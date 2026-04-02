import type { Metadata } from 'next'
import { ClaimWizard } from '@/components/forms/ClaimWizard'
import { Lock, Clock, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Submit Your IEEPA Tariff Claim — Get a Quote in 24 Hours',
  description:
    'Submit your IEEPA tariff claim for a no-obligation assessment. Institutional buyer. 24-hour quote. All submissions are confidential and protected under NDA.',
}

export default function SubmitPage({
  searchParams,
}: {
  searchParams: { utm_source?: string; ref?: string }
}) {
  const utmSource = searchParams.utm_source ?? searchParams.ref

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header bar */}
      <div className="bg-navy-500 text-white py-10">
        <div className="container max-w-2xl text-center">
          <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-2">
            No commitment · No legal fees · Results in 24 hours
          </p>
          <h1 className="text-3xl font-bold mb-2">Submit Your IEEPA Tariff Claim</h1>
          <p className="text-white/60 text-sm">
            Complete the form below. A member of our team will review your submission and
            respond within 24 hours with a preliminary assessment.
          </p>
        </div>
      </div>

      <div className="container max-w-2xl py-12">
        {/* Trust micro-bar */}
        <div className="flex items-center justify-center gap-6 mb-10 flex-wrap">
          {[
            { icon: Lock, text: 'NDA Protected' },
            { icon: Clock, text: '24-Hour Response' },
            { icon: Shield, text: 'Institutional Buyer' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-muted-foreground text-xs">
              <Icon className="h-3.5 w-3.5 text-gold-500" />
              {text}
            </div>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-8 md:p-10">
          <ClaimWizard utmSource={utmSource} />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6 max-w-md mx-auto">
          By submitting, you acknowledge that IEEPA Claims Fund is not a law firm and does not
          provide legal advice. All submissions are treated as confidential. No binding obligation
          is created until a written purchase agreement is executed.
        </p>
      </div>
    </div>
  )
}
