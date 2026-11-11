import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.16em] transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-gold text-ink',
        soft: 'bg-sand text-ink',
        petrol: 'bg-petrol text-white',
        outline: 'border border-ink/20 text-ink',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
