import { useId } from 'react';

export type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        Search products
      </label>
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        placeholder="Start typing, e.g. phone"
        autoComplete="off"
        className="h-10 w-full max-w-xl rounded-md border border-zinc-300 bg-white px-3 text-sm placeholder:text-zinc-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:bg-zinc-900"
      />
    </div>
  );
}
