'use client';

import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = 'Buscar...' }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <Search
        size={14}
        style={{
          position: 'absolute',
          left: 10,
          color: '#a39e98',
          pointerEvents: 'none',
        }}
      />
      <input
        className="notion-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: 32, width: 240 }}
      />
    </div>
  );
}
