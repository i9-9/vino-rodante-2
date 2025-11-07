"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ValidationResult } from "@/lib/utils/validation"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  validation?: ValidationResult
  showValidation?: boolean
  required?: boolean
  helperText?: string
  onValidationChange?: (isValid: boolean) => void
}

export function FormInput({
  label,
  error,
  validation,
  showValidation = false,
  required = false,
  helperText,
  className,
  onValidationChange,
  ...props
}: FormInputProps) {
  const [touched, setTouched] = useState(false)
  const [localError, setLocalError] = useState<string | undefined>(error)
  
  const shouldShowError = touched && (showValidation || !!error)
  const displayError = error || (validation && !validation.isValid ? validation.message : undefined)
  const isValid = !displayError && (validation?.isValid ?? true)
  
  useEffect(() => {
    setLocalError(error)
  }, [error])
  
  useEffect(() => {
    if (validation && onValidationChange) {
      onValidationChange(validation.isValid)
    }
  }, [validation, onValidationChange])
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(true)
    props.onBlur?.(e)
  }
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTouched(true)
    props.onChange?.(e)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          {...props}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "transition-all duration-200",
            shouldShowError && !isValid && "border-red-500 focus:border-red-500 focus:ring-red-500",
            shouldShowError && isValid && "border-green-500 focus:border-green-500",
            className
          )}
          aria-invalid={shouldShowError && !isValid}
          aria-describedby={
            shouldShowError && !isValid
              ? `${props.id}-error`
              : helperText
              ? `${props.id}-helper`
              : undefined
          }
        />
        
        {/* Icono de validación */}
        {shouldShowError && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      
      {/* Mensaje de error */}
      {shouldShowError && !isValid && displayError && (
        <p 
          id={`${props.id}-error`}
          className="text-sm text-red-600 flex items-center gap-1"
          role="alert"
        >
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {displayError}
        </p>
      )}
      
      {/* Texto de ayuda */}
      {helperText && !shouldShowError && (
        <p 
          id={`${props.id}-helper`}
          className="text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  )
}

