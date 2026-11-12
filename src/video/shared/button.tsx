import type { ComponentProps } from 'react';

import { cn } from '@/lib/resolve-class-name';

export type ButtonProps = ComponentProps<'button'>;

/** Square, flat transport button. Look and focus ring live in `styles/signal.css`. */
export function Button({ className, ...props }: ButtonProps) {
  return <button className={cn('signal-btn', className)} {...props} />;
}
