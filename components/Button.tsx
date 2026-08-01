import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-vyr-magenta text-white',
  secondary: 'bg-vyr-purple text-white',
}

export default function Button({
  variant = 'primary',
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const variantClasses = disabled
    ? 'bg-vyr-lavenderPl text-vyr-textMute2'
    : VARIANT_CLASSES[variant]

  return (
    <button
      type="button"
      disabled={disabled}
      className={`min-h-[44px] rounded-control px-4 text-body font-medium ${variantClasses} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
