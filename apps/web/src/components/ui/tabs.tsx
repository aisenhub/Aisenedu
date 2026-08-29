import * as TabsPrimitive from '@radix-ui/react-tabs'
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react'
import { cn } from './utils'

export const Tabs = TabsPrimitive.Root

export const TabsList = forwardRef<
  ElementRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(function TabsList({ className, ...props }, ref) {
  return <TabsPrimitive.List className={cn('inline-flex min-h-11 items-center gap-1 rounded-lg bg-surface-muted p-1', className)} ref={ref} {...props} />
})

export const TabsTrigger = forwardRef<
  ElementRef<typeof TabsPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return <TabsPrimitive.Trigger className={cn('inline-flex min-h-9 cursor-pointer items-center justify-center rounded-md px-3 text-sm font-medium text-text-muted outline-none transition-colors focus:ring-4 focus:ring-focus/25 data-[state=active]:bg-surface-raised data-[state=active]:text-text data-[state=active]:shadow-sm', className)} ref={ref} {...props} />
})

export const TabsContent = forwardRef<
  ElementRef<typeof TabsPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return <TabsPrimitive.Content className={cn('mt-4 outline-none focus-visible:ring-4 focus-visible:ring-focus/25', className)} ref={ref} {...props} />
})
