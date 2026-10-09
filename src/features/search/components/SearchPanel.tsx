import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

import { productSearchQuery } from '../api/search.queries';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';

/** Live search: debounced input feeding a per-term query, with every state rendered explicitly. */
export function SearchPanel() {
  const [value, setValue] = useState('');
  const debounced = useDebouncedValue(value, 300);
  const term = debounced.trim();
  const result = useQuery(productSearchQuery(term));

  return (
    <div className="space-y-6">
      <SearchInput value={value} onChange={setValue} />
      <SearchResults query={term} result={result} />
    </div>
  );
}
