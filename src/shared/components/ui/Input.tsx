import type { ComponentPropsWithRef } from 'react';

import { inputClassName } from './input-styles';

export type InputProps = ComponentPropsWithRef<'input'>;

/** A styled native input. The caller renders the `<label>` and wires it with `htmlFor`/`id`. */
export function Input({ type = 'text', className, ...props }: InputProps) {
  return <input type={type} className={inputClassName(className)} {...props} />;
}
