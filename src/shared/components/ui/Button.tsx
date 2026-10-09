import type { ComponentPropsWithRef } from 'react';

import { buttonClassName, type ButtonSize, type ButtonVariant } from './button-styles';
import { Spinner } from './Spinner';

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and disables the button while an async action is in flight. */
  isLoading?: boolean;
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  type = 'button',
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading || undefined}
      className={buttonClassName({ variant, size, className })}
      {...props}
    >
      {isLoading ? <Spinner size="sm" label="Loading" /> : null}
      {children}
    </button>
  );
}
