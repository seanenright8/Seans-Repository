import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'IEEPA Tariff Claim Resources — Learn How to Recover Your Duties',
  description:
    'Educational resources for U.S. importers on IEEPA tariff claims: what they are, how to sell them, the legal basis for challenges, and why importers are monetizing in 2025.',
}

const articles = [
  {
    slug: 'what-are-ieepa-tariff-claims',
    title: 'What Are IEEPA Tariff Claims and Are Yours Worth Money?',
    description:
      'A plain-English explanation of IEEPA tariff claims — what they are, how they arise, and why importers who paid duties in 2025 may be sitting on recoverable value.',
    readTime: '6 min',
    keywords: ['IEEPA tariff claims', 'IEEPA duty recovery', 'can I get IEEPA tariffs refunded'],
  },
  {
    slug: 'how-to-sell-your-ieepa-trade-claim',
    title: 'How to Sell Your IEEPA Trade Claim: A Step-by-Step Guide',
    description:
      'The complete process for selling an IEEPA tariff claim to an institutional buyer — from initial inquiry to closing, including what documentation you need.',
    readTime: '7 min',
    keywords: ['sell tariff claim', 'sell IEEPA claim', 'tariff claim buyer'],
  },
  {
    slug: 'ieepa-vs-section-301-vs-section-232',
    title: 'IEEPA vs. Section 301 vs. Section 232: Understanding Your Tariff Exposure',
    description:
      'Not all tariffs are created equal. This guide explains the key differences between IEEPA, Section 301 (China tariffs), and Section 232 (steel/aluminum) — and what each means for your recovery prospects.',
    readTime: '8 min',
    keywords: ['IEEPA vs Section 301', 'Section 232 tariffs', 'trade tariff comparison'],
  },
  {
    slug: 'why-importers-are-selling-tariff-claims-2025',
    title: 'Why Importers Are Selling Tariff Refund Claims in 2025',
    description:
      'The secondary market for IEEPA tariff claims is growing. Here is why importers — from small businesses to Fortune 500 companies — are choosing to sell rather than litigate.',
    readTime: '5 min',
    keywords: ['IEEPA 2025', 'tariff refund claims', 'importer tariff recovery 2025'],
  },
  {
    slug: 'legal-basis-for-ieepa-tariff-challenges',
    title: 'The Legal Basis for IEEPA Tariff Challenges: What Importers Need to Know',
    description:
      'An overview of the constitutional and statutory arguments being used to challenge IEEPA tariffs in federal court — and what those legal developments mean for the value of your claim.',
    readTime: '9 min',
    keywords: ['IEEPA legal challenge', 'Court of International Trade IEEPA', 'IEEPA unconstitutional'],
  },
]

export default function LearnPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-navy-500 text-white py-16">
        <div className="container max-w-3xl text-center">
          <p className="text-gold-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Resource Center
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Everything you need to know about IEEPA tariff claims
          </h1>
          <p className="text-white/60 text-lg">
            Plain-language guides for importers, intermediaries, and trade professionals.
          </p>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 bg-white">
        <div className="container max-w-4xl">
          <div className="space-y-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/learn/${article.slug}`}
                className="block group rounded-2xl border border-border bg-white hover:border-gold-400/50 hover:shadow-md transition-all p-6 md:p-8"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{article.readTime} read</span>
                    </div>
                    <h2 className="text-xl font-bold text-navy-500 mb-2 group-hover:text-gold-500 transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {article.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {article.keywords.slice(0, 2).map((kw) => (
                        <span
                          key={kw}
                          className="text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-gold-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-navy-500 mb-3">
            Ready to find out what your claim is worth?
          </h2>
          <p className="text-muted-foreground mb-6">
            Submit your IEEPA tariff claim details for a no-obligation 24-hour assessment.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link href="/submit">Submit a Claim →</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
