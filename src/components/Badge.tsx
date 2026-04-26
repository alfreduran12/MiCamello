'use client';

interface BadgeProps {
  label: string;
  bg: string;
  text: string;
  size?: 'sm' | 'md';
}

export default function Badge({ label, bg, text, size = 'md' }: BadgeProps) {
  const padding = size === 'sm' ? '1px 6px' : '2px 8px';
  const fontSize = size === 'sm' ? '11px' : '12px';
  return (
    <span
      className="badge"
      style={{ background: bg, color: text, padding, fontSize }}
    >
      {label}
    </span>
  );
}
