import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const dateFmt = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })
export const formatDate = (iso: string) => dateFmt.format(new Date(`${iso}T12:00:00`))

export const telHref = (phone: string) => `tel:${phone.replace(/\s+/g, '')}`

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))
