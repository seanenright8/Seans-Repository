import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, ArrowRight, DollarSign, FileText, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'U.S. Importers: Your IEEPA Tariff Duties May Be Recoverable',
  description:
    'We buy IEEPA tariff claims from U.S. importers. Get a guaranteed cash offer within 48 hours — no legal fees, no risk, no waiting.',
  robots: { index: false, follow: false },
}

const steps = [
  {
    icon: FileText,
    title: 'Tell us about your imports',
    body: 'Share your company details, estimated duties paid, and countries of origin through our secure form.',
  },
  {
    icon: DollarSign,
    title: 'Get a binding cash offer',
    body: 'Within 48 hours, receive a firm purchase price for your IEEPA tariff claim. No obligation.',
  },
  {
    icon: ShieldCheck,
    title: 'Close and get paid',
    body: 'Accept the offer, upload your documents, and receive a wire transfer within days. We handle everything after that.',
  },
]

const faqs = [
  {
    q: 'How much is my claim worth?',
    a: 'It depends on the total IEEPA duties you've paid. Claims typically range from $50K to several million dollars. Submit your details for a free assessment.',
  },
  {
    q: 'Is this legitimate?',
    a: 'Yes. Litigation finance is a well-established industry. We purchase the legal right to pursue a tariff refund — similar to factoring an accounts receivable.',
  },
  {
    q: 'What if the courts rule against importers?',
    a: 'That's our risk, not yours. Once we purchase your claim and wire payment, you keep the money regardless of the litigation outcome.',
  },
  {
    q: 'Do I need a lawyer?',
    a: 'Not to sell your claim to us. We handle all legal aspects post-purchase. You're welcome to have your own counsel review the assignment agreement.',
  },
]

export default function ImporterLP() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-500 text-white py-20">
        <div className="container max-w-3xl text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-gold-400 bg-gold-400/10 px-3 py-1 rounded-full mb-4">
            For U.S. Importers
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Get paid for the IEEPA tariffs{' '}
            <span className="text-gradient-gold">you never should have owed</span>
          </h1>
          <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
            Courts are ruling that IEEPA tariffs are unconstitutional. We buy your refund claim now
            — cash in hand, no legal fees, no waiting for a court decision.
          </p>
          <Button variant="gold" size="xl" asChild>
            <Link href="/submit?utm_source=lp&utm_campaign=importer">
              Get Your Free Quote <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <p className="text-white/40 text-xs mt-3">Takes under 5 minutes. Fully confidential.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-navy-500 mb-8 text-center">
            Three steps to cash
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-400/10 mb-4">
                  <s.icon className="h-5 w-5 text-gold-500" />
                </div>
                <p className="text-xs text-muted-foreground mb-1">Step {i + 1}</p>
                <h3 className="font-semibold text-navy-500 mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why sell */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-navy-500 mb-6 text-center">
            Why importers sell their claims
          </h2>
          <div className="space-y-4">
            {[
              'Get cash now instead of waiting 2–4 years for litigation to resolve',
              'Eliminate 100% of legal risk — if the claim fails, you keep the money',
              'No legal fees, no court appearances, no ongoing obligations',
              'Simplify your balance sheet by converting contingent receivables to cash',
              'Claim values are highest while uncertainty is greatest — sell early for better pricing',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="container max-w-2xl">
          <h2 className="text-2xl font-bold text-navy-500 mb-8 text-center">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold text-navy-500 text-sm mb-1">{faq.q}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-navy-500 text-white">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Find out what your claim is worth
          </h2>
          <p className="text-white/60 mb-6">
            Submit your claim details for a free, no-obligation assessment. We respond within 24
            hours.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link href="/submit?utm_source=lp&utm_campaign=importer">Submit Your Claim →</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
