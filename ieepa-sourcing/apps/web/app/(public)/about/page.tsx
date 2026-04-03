import type { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Scale, Clock, Users, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Us — IEEPA Claims',
  description:
    'We are an institutional fund that purchases IEEPA tariff claims from U.S. importers. Learn about our team, our process, and why importers trust us.',
}

const values = [
  {
    icon: Shield,
    title: 'Confidentiality first',
    description:
      'Every engagement is covered by a mutual NDA. Your trade data and claim details are never shared with competitors or third parties.',
  },
  {
    icon: Scale,
    title: 'Fair, transparent pricing',
    description:
      'Our offers are backed by rigorous legal analysis and market data. We explain exactly how we arrive at our valuation — no hidden fees or surprise deductions.',
  },
  {
    icon: Clock,
    title: '24-hour response',
    description:
      'We review every submission within one business day and issue binding offers within 48 hours of review. Speed matters when cash flow is on the line.',
  },
  {
    icon: Users,
    title: 'Importer-aligned',
    description:
      'We only succeed when importers recover value. Our model is built on fair pricing and long-term relationships, not one-off transactions.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-500 text-white py-16">
        <div className="container max-w-3xl text-center">
          <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
            About Us
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Turning tariff exposure into immediate capital
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            We are an institutional fund that purchases IEEPA tariff refund claims from U.S.
            importers. Our team combines trade-law expertise, litigation-finance experience, and
            technology to give importers the fastest path to recovery.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-navy-500 mb-4">Our mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            The 2025 IEEPA tariffs created billions of dollars in unexpected costs for American
            importers. Many businesses — from small distributors to large manufacturers — paid
            duties they may never have owed. Legal challenges are underway, but litigation is slow
            and uncertain.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We exist to bridge that gap. By purchasing IEEPA tariff claims, we give importers
            <strong className="text-foreground"> guaranteed cash today</strong> while we take on the
            risk and complexity of recovery. Importers get immediate capital; we invest in a
            diversified portfolio of trade claims backed by strong legal fundamentals.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our goal is simple: make it as easy as possible for importers to convert uncertain legal
            claims into certain economic value — quickly, transparently, and on fair terms.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-navy-500 mb-8 text-center">What we stand for</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border bg-white p-6"
              >
                <v.icon className="h-6 w-6 text-gold-500 mb-3" />
                <h3 className="font-semibold text-navy-500 mb-1">{v.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we work */}
      <section className="py-16 bg-white">
        <div className="container max-w-3xl">
          <h2 className="text-2xl font-bold text-navy-500 mb-8 text-center">How we work</h2>
          <ol className="space-y-6">
            {[
              {
                step: '01',
                title: 'You submit your claim details',
                body: 'Use our secure online form to share basic information about your IEEPA tariff exposure. Everything is covered by NDA from the moment you submit.',
              },
              {
                step: '02',
                title: 'We assess and make an offer',
                body: 'Our team reviews your submission within 24 hours and issues a binding purchase offer within 48 hours. No obligation, no fees.',
              },
              {
                step: '03',
                title: 'Close and get paid',
                body: 'If you accept, we handle the paperwork and wire funds within days. Post-closing, you have zero further obligations — we manage all recovery efforts.',
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-4">
                <span className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-gold-400/10 text-gold-600 font-bold text-sm">
                  {item.step}
                </span>
                <div>
                  <h3 className="font-semibold text-navy-500">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-lg text-center">
          <Mail className="h-8 w-8 text-gold-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-navy-500 mb-2">Get in touch</h2>
          <p className="text-muted-foreground mb-6">
            Have a question about your tariff exposure or want to learn more about our purchasing
            process? Reach out and we'll respond within one business day.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="gold" size="lg" asChild>
              <Link href="/submit">Submit a Claim</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="mailto:claims@ieepaclaims.com">Email Us</a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
