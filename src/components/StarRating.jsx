import { Star } from 'lucide-react';

export default function StarRating({ rating, size = 16 }) {
  return (
    <span className="star-rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= Math.round(rating) ? 'star-filled' : 'star-empty'}
        />
      ))}
    </span>
  );
}
