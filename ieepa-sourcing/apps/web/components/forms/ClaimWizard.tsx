'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, ArrowLeft, Upload, CheckCircle, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ── Zod schemas per step ──────────────────────────────────────

const step1Schema = z.object({
  company_name: z.string().min(2, 'Company name is required'),
  contact_name: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  role: z.string().optional(),
})

const step2Schema = z.object({
  total_tariff_amount: z.coerce
    .number({ invalid_type_error: 'Please enter a valid dollar amount' })
    .positive('Amount must be positive')
    .optional()
    .or(z.literal('')),
  payment_date_start: z.string().optional(),
  payment_date_end: z.string().optional(),
  hts_codes_raw: z.string().optional(),       // comma-separated input → split on submit
  ports_of_entry_raw: z.string().optional(),
  entries_count: z.coerce.number().int().positive().optional().or(z.literal('')),
  country_of_origin: z.string().optional(),
  nda_agreed: z.boolean().refine((v) => v === true, {
    message: 'You must agree to our NDA terms to proceed',
  }),
})

const step3Schema = z.object({
  files: z
    .array(z.instanceof(typeof window !== 'undefined' ? File : Object as unknown as typeof File))
    .optional(),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'image/png',
  'image/jpeg',
]
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB

// ── Stepper header ────────────────────────────────────────────

function Stepper({ current, total }: { current: number; total: number }) {
  const steps = ['Company Info', 'Claim Details', 'Documents', 'Confirmation']
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 right-0 top-4 h-px bg-border" />
        {steps.map((label, i) => {
          const step = i + 1
          const isActive = step === current
          const isComplete = step < current
          return (
            <div key={step} className="relative flex flex-col items-center gap-2 z-10">
              <div
                className={cn(
                  'h-8 w-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all',
                  isComplete && 'bg-green-500 border-green-500 text-white',
                  isActive && 'bg-navy-500 border-navy-500 text-white',
                  !isActive && !isComplete && 'bg-white border-border text-muted-foreground'
                )}
              >
                {isComplete ? <CheckCircle className="h-4 w-4" /> : step}
              </div>
              <span
                className={cn(
                  'hidden md:block text-xs font-medium',
                  isActive ? 'text-navy-500' : 'text-muted-foreground'
                )}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
      <p className="md:hidden text-center mt-4 text-sm text-muted-foreground">
        Step {current} of {total}: <strong>{steps[current - 1]}</strong>
      </p>
    </div>
  )
}

// ── Main wizard component ─────────────────────────────────────

interface WizardState {
  step1: Partial<Step1Data>
  step2: Partial<Step2Data>
  files: File[]
  claimId?: string
}

export function ClaimWizard({ utmSource }: { utmSource?: string }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardState>({ step1: {}, step2: {}, files: [] })
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: data.step1,
  })

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      ...data.step2,
      nda_agreed: false,
    },
  })

  // Step 1 → Step 2
  const onStep1Submit = (values: Step1Data) => {
    setData((prev) => ({ ...prev, step1: values }))
    setStep(2)
  }

  // Step 2 → Step 3
  const onStep2Submit = (values: Step2Data) => {
    setData((prev) => ({ ...prev, step2: values }))
    setStep(3)
  }

  // File handling
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) return false
      if (f.size > MAX_FILE_SIZE) return false
      return true
    })
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name))
      return [...prev, ...arr.filter((f) => !existing.has(f.name))]
    })
  }, [])

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name))
  }

  // Final submission (step 3 → step 4)
  const onFinalSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()

      // Append claim data
      const payload = {
        ...data.step1,
        ...data.step2,
        utm_source: utmSource,
      }
      formData.append('data', JSON.stringify(payload))

      // Append files
      files.forEach((file) => {
        formData.append('files', file)
      })

      const res = await fetch('/api/claims', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error ?? 'Submission failed. Please try again.')
      }

      setData((prev) => ({ ...prev, claimId: json.id }))
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {step < 4 && <Stepper current={step} total={4} />}

      {/* ── Step 1: Company Info ──────────────────────────── */}
      {step === 1 && (
        <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-navy-500 mb-1">Company Information</h2>
            <p className="text-muted-foreground text-sm">Tell us about your company and who we should contact.</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input id="company_name" placeholder="Acme Imports Inc." {...form1.register('company_name')} className="mt-1" />
              {form1.formState.errors.company_name && (
                <p className="text-destructive text-sm mt-1">{form1.formState.errors.company_name.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_name">Contact Name *</Label>
                <Input id="contact_name" placeholder="Jane Smith" {...form1.register('contact_name')} className="mt-1" />
                {form1.formState.errors.contact_name && (
                  <p className="text-destructive text-sm mt-1">{form1.formState.errors.contact_name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="role">Title / Role</Label>
                <Input id="role" placeholder="CFO" {...form1.register('role')} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" placeholder="jane@company.com" {...form1.register('email')} className="mt-1" />
                {form1.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">{form1.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" {...form1.register('phone')} className="mt-1" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="default" size="lg">
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* ── Step 2: Claim Details ─────────────────────────── */}
      {step === 2 && (
        <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-navy-500 mb-1">Claim Details</h2>
            <p className="text-muted-foreground text-sm">Share what you know about your IEEPA tariff exposure. Estimates are fine — exact figures aren't required at this stage.</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="total_tariff_amount">Approximate Total Tariff Amount Paid (USD)</Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                <Input
                  id="total_tariff_amount"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="500,000"
                  className="pl-7"
                  {...form2.register('total_tariff_amount')}
                />
              </div>
              {form2.formState.errors.total_tariff_amount && (
                <p className="text-destructive text-sm mt-1">{form2.formState.errors.total_tariff_amount.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="payment_date_start">Payment Date — Start</Label>
                <Input id="payment_date_start" type="date" {...form2.register('payment_date_start')} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="payment_date_end">Payment Date — End</Label>
                <Input id="payment_date_end" type="date" {...form2.register('payment_date_end')} className="mt-1" />
              </div>
            </div>

            <div>
              <Label htmlFor="country_of_origin">Country of Origin of Goods</Label>
              <Input
                id="country_of_origin"
                placeholder="China, Vietnam, Germany…"
                {...form2.register('country_of_origin')}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hts_codes_raw">HTS Codes (optional)</Label>
                <Input
                  id="hts_codes_raw"
                  placeholder="8471.30, 9013.80, …"
                  {...form2.register('hts_codes_raw')}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
              </div>
              <div>
                <Label htmlFor="entries_count">Number of Entries (optional)</Label>
                <Input
                  id="entries_count"
                  type="number"
                  min="1"
                  placeholder="47"
                  {...form2.register('entries_count')}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ports_of_entry_raw">Ports of Entry (optional)</Label>
              <Input
                id="ports_of_entry_raw"
                placeholder="Los Angeles, Newark, Chicago…"
                {...form2.register('ports_of_entry_raw')}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated</p>
            </div>

            {/* NDA checkbox */}
            <div className="rounded-lg border border-gold-400/30 bg-gold-400/5 p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...form2.register('nda_agreed')}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-navy-500"
                />
                <span className="text-sm text-foreground leading-relaxed">
                  I agree that IEEPA Claims Fund will treat all information I submit as{' '}
                  <strong>strictly confidential</strong> under mutual NDA terms. I understand
                  that submitting this form does not constitute a binding agreement and that
                  any transaction is subject to separate written documentation. I acknowledge
                  that IEEPA Claims Fund is not a law firm and does not provide legal advice.
                </span>
              </label>
              {form2.formState.errors.nda_agreed && (
                <p className="text-destructive text-sm mt-2">{form2.formState.errors.nda_agreed.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button type="submit" variant="default" size="lg">
              Continue <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </form>
      )}

      {/* ── Step 3: Documentation ─────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-navy-500 mb-1">Supporting Documentation</h2>
            <p className="text-muted-foreground text-sm">
              Upload any relevant documents. This is optional at this stage — you can provide more
              after initial contact. Accepted: PDF, XLSX, CSV, PNG, JPG. Max 50 MB per file.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              addFiles(e.dataTransfer.files)
            }}
            className={cn(
              'border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer',
              dragOver ? 'border-gold-400 bg-gold-400/5' : 'border-border hover:border-gold-400/50 hover:bg-muted/30'
            )}
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <Upload className={cn('h-10 w-10 mx-auto mb-3', dragOver ? 'text-gold-400' : 'text-muted-foreground')} />
            <p className="font-medium text-foreground mb-1">
              Drop files here or <span className="text-gold-500 underline cursor-pointer">browse</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Entry summaries, CF-28/CF-29 notices, customs broker statements, protest filings
            </p>
            <input
              id="file-input"
              type="file"
              multiple
              accept=".pdf,.xlsx,.csv,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </div>

          {/* File list */}
          {files.length > 0 && (
            <ul className="space-y-2">
              {files.map((file) => (
                <li key={file.name} className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
                  <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button onClick={() => removeFile(file.name)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button type="button" variant="outline" size="lg" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              variant="default"
              size="lg"
              onClick={onFinalSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Claim'}
              {!submitting && <ArrowRight className="ml-1 h-4 w-4" />}
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            You can skip this step — our team will follow up to request documents.
          </p>
        </div>
      )}

      {/* ── Step 4: Confirmation ──────────────────────────── */}
      {step === 4 && (
        <div className="text-center py-8">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-navy-500 mb-3">Submission Received</h2>
          <p className="text-muted-foreground mb-2">
            Thank you, <strong>{data.step1.contact_name}</strong>. Your IEEPA claim from{' '}
            <strong>{data.step1.company_name}</strong> has been submitted successfully.
          </p>
          {data.claimId && (
            <p className="text-sm text-muted-foreground mb-6">
              Reference:{' '}
              <code className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{data.claimId}</code>
            </p>
          )}
          <div className="rounded-xl border border-border bg-muted/20 p-6 text-left max-w-md mx-auto mb-8">
            <p className="text-sm font-semibold text-navy-500 mb-3">What happens next</p>
            <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-4">
              <li>We'll review your submission and documents within <strong className="text-foreground">24 hours</strong></li>
              <li>A team member will contact you at <strong className="text-foreground">{data.step1.email}</strong></li>
              <li>If there's a fit, you'll receive a term sheet within 2–3 business days</li>
              <li>Upon agreement, we wire funds within 5 business days</li>
            </ol>
          </div>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            A confirmation email has been sent to {data.step1.email}. All information is held
            under strict confidentiality. This submission does not create any legal obligation.
          </p>
        </div>
      )}
    </div>
  )
}
