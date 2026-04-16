import { Star } from 'lucide-react';

export default function StarInput({ value, onChange }) {
  return (
    <span className="star-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={24}
          className={n <= value ? 'star-filled' : 'star-empty'}
          onClick={() => onChange(n)}
          style={{ cursor: 'pointer' }}
        />
      ))}
    </span>
  );
}
