import { useEffect, useId, useState } from 'react';

import { Input, inputClassName } from '@/shared/components/ui';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

import { type UserGender, userGenderSchema } from '../model/user.schema';

export type UsersToolbarProps = {
  /** The search term currently in the URL. */
  query: string;
  gender: UserGender | undefined;
  onQueryChange: (query: string) => void;
  onGenderChange: (gender: UserGender | undefined) => void;
};

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Global search and the gender column filter. Typing is kept local and pushed to the URL once it
 * settles, so a word becomes one history entry rather than one per keystroke; a change coming from
 * the URL (Back, Forward, a pasted link) resets the draft to match.
 */
export function UsersToolbar({ query, gender, onQueryChange, onGenderChange }: UsersToolbarProps) {
  const searchId = useId();
  const genderId = useId();

  const [draft, setDraft] = useState(query);
  const [syncedQuery, setSyncedQuery] = useState(query);
  if (query !== syncedQuery) {
    setSyncedQuery(query);
    setDraft(query);
  }

  const debounced = useDebouncedValue(draft, SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    // Only a settled draft is pushed; a stale debounced value after a URL change is ignored.
    if (debounced === draft && debounced !== query) onQueryChange(debounced);
  }, [debounced, draft, query, onQueryChange]);

  return (
    <div className="flex flex-wrap items-end gap-4">
      <div className="min-w-64 flex-1 space-y-1.5">
        <label htmlFor={searchId} className="block text-sm font-medium">
          Search users
        </label>
        <Input
          id={searchId}
          type="search"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
          }}
          placeholder="Name, email, city or company"
          autoComplete="off"
          className="max-w-xl"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor={genderId} className="block text-sm font-medium">
          Gender
        </label>
        <select
          id={genderId}
          value={gender ?? ''}
          onChange={(event) => {
            const parsed = userGenderSchema.safeParse(event.target.value);
            onGenderChange(parsed.success ? parsed.data : undefined);
          }}
          className={inputClassName('w-auto pr-8')}
        >
          <option value="">All</option>
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>
      </div>
    </div>
  );
}
