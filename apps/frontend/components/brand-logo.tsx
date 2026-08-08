import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  markClassName?: string
  textClassName?: string
}

export function BrandLogo({
  className,
  markClassName,
  textClassName,
}: BrandLogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Icons.logo className={cn('size-12 shrink-0', markClassName)} />
      <span
        className={cn(
          'whitespace-nowrap text-2xl font-bold tracking-[0.04em] text-[#302b26]',
          textClassName,
        )}
      >
        飯ぴよ
      </span>
    </span>
  )
}
