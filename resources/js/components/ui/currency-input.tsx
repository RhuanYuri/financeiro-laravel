import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number
  onChange: (value: number) => void
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const formatCurrency = (val: number) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(val)
    }

    // Local display state to handle masking
    const [displayValue, setDisplayValue] = React.useState(formatCurrency(0))

    // Sync external value to display value, but only if it matches the numeric representation 
    // to avoid fighting with user input if possible. 
    // Actually for this "shift characters in" strategy, strictly controlled is best.
    React.useEffect(() => {
      setDisplayValue(formatCurrency(value))
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Remove all non-digits
      const rawValue = e.target.value.replace(/\D/g, "")
      // Convert to number (cents / 100)
      const numericValue = Number(rawValue) / 100

      onChange(numericValue)
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        inputMode="numeric"
        className={cn("", className)}
        value={displayValue}
        onChange={handleChange}
      />
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"
