export type FieldErrorProps = {
  /** The id the control's `aria-describedby` points at. */
  id: string;
  message: string | undefined;
};

/** The validation message under a control; renders nothing when there is no message. */
export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) {
    return null;
  }
  return (
    <p id={id} className="text-sm text-red-600 dark:text-red-400">
      {message}
    </p>
  );
}
