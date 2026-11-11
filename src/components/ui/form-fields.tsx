import * as React from 'react'
import { cn } from '@/lib/utils'

const field =
  'w-full rounded-md border border-input bg-white px-4 py-3 font-sans text-[0.95rem] text-ink placeholder:text-text/70 transition-[border-color,box-shadow] duration-200 outline-none focus-visible:border-gold focus-visible:ring-[3px] focus-visible:ring-gold/30 aria-invalid:border-destructive'

function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return <input data-slot="input" className={cn(field, 'h-12', className)} {...props} />
}

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return <textarea data-slot="textarea" className={cn(field, 'min-h-36 resize-y', className)} {...props} />
}

function Select({ className, ...props }: React.ComponentProps<'select'>) {
  return <select data-slot="select" className={cn(field, 'h-12 appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10', className)} style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23162521' stroke-width='1.6'/%3E%3C/svg%3E\")" }} {...props} />
}

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return <label data-slot="label" className={cn('mb-2 block text-xs font-extrabold uppercase tracking-[0.18em] text-ink', className)} {...props} />
}

export { Input, Textarea, Select, Label }
