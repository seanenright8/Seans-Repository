import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Sell Your China IEEPA Tariff Claim — Get Paid in Days',
  description:
    'Paid tariffs on Chinese imports in 2025? You may have a recoverable IEEPA claim worth hundreds of thousands of dollars. Get a no-obligation offer within 24 hours.',
  robots: { index: false, follow: false },
}

const painPoints = [
  'Paid 25%+ tariffs on Chinese imports since April 2025',
  'Cash tied up in duties that may be ruled illegal',
  'Don't want to wait years for a court refund',
  'Need capital now for inventory, payroll, or growth',
]

const benefits = [
  'Binding cash offer within 48 hours',
  'We handle all legal work — zero cost to you',
  'No clawbacks, no contingencies post-closing',
  'Typical closing in 2–4 weeks',
]

export default function ChinaTariffsLP() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-500 text-white py-20">
        <div className="container max-w-3xl text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full mb-4">
            China IEEPA Tariffs
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Turn your China tariff payments into{' '}
            <span className="text-gradient-gold">immediate cash</span>
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
            If you imported goods from China after April 2025, you likely overpaid duties under
            IEEPA tariffs that courts are now calling unconstitutional. We buy those claims — and pay
            you now.
          </p>
          <Button variant="gold" size="xl" asChild>
            <Link href="/submit?utm_source=lp&utm_campaign=china-tariffs">
              Get Your Free Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-white/40 text-xs mt-3">No commitment required. Confidential.</p>
        </div>
      </section>

      {/* Pain / Solution */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-bold text-navy-500 mb-4">Sound familiar?</h2>
              <ul className="space-y-3">
                {painPoints.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-0.5 h-4 w-4 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xs flex-shrink-0">!</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-500 mb-4">Here's what we offer</h2>
              <ul className="space-y-3">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-14 bg-muted/30">
        <div className="container max-w-3xl text-center">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-3xl font-bold text-navy-500">$120M+</p>
              <p className="text-xs text-muted-foreground mt-1">Claims purchased to date</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy-500">48 hrs</p>
              <p className="text-xs text-muted-foreground mt-1">Average offer turnaround</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy-500">200+</p>
              <p className="text-xs text-muted-foreground mt-1">Importers served</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-navy-500 text-white">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Don't let your tariff payments lose value
          </h2>
          <p className="text-white/60 mb-6">
            Claim values are highest while litigation is still active. Submit your details today
            and find out what your China tariff claim is worth.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link href="/submit?utm_source=lp&utm_campaign=china-tariffs">
              Submit Your Claim →
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
