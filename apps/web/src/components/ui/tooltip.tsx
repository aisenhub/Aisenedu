import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import { cn } from './utils'

export const TooltipProvider = TooltipPrimitive.Provider
export const Tooltip = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger

export const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent({ className, sideOffset = 6, ...props }, ref) {
  return <TooltipPrimitive.Portal><TooltipPrimitive.Content className={cn('z-50 max-w-xs rounded-md bg-slate-900 px-3 py-2 text-xs leading-5 text-white shadow-lg', className)} ref={ref} sideOffset={sideOffset} {...props} /></TooltipPrimitive.Portal>
})
