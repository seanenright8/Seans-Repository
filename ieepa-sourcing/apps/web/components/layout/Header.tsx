'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/learn', label: 'Learn' },
  { href: '/about', label: 'About' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-navy-500/95 backdrop-blur supports-[backdrop-filter]:bg-navy-500/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gold-400">
            <span className="text-navy-500 font-bold text-sm">IC</span>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight hidden sm:block">
            IEEPA Claims
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Button variant="gold" size="sm" asChild>
            <Link href="/submit">Get a Quote</Link>
          </Button>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/70 hover:text-white transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'md:hidden border-t border-white/10 bg-navy-500 transition-all duration-200',
          open ? 'block' : 'hidden'
        )}
      >
        <div className="container py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/70 hover:text-white transition-colors text-sm py-1"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Button variant="gold" size="sm" asChild className="w-fit">
            <Link href="/submit" onClick={() => setOpen(false)}>
              Get a Quote
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
