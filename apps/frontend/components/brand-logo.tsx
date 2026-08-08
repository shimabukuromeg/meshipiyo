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
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <Icons.logo className={cn('size-10 shrink-0', markClassName)} />
      <span
        className={cn(
          'whitespace-nowrap text-[1.625rem] font-bold leading-none tracking-[0.025em] text-[#302b26]',
          textClassName,
        )}
      >
        飯ぴよ
      </span>
    </span>
  )
}
