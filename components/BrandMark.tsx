export function BrandMark() {
  return (
    <div className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2c-5 0-8 4-8 8 0 3 1.5 5.5 3.5 7L8 26c-2 3-3 6-3 10v10h30V36c0-4-1-7-3-10l-7.5-9c2-1.5 3.5-4 3.5-7 0-4-3-8-8-8z" />
      </svg>
    </div>
  );
}

export function MeepleIcon({ filled, justFilled }: { filled: boolean; justFilled?: boolean }) {
  const cls = ['meeple', filled ? '' : 'open', justFilled ? 'just-filled' : ''].filter(Boolean).join(' ');
  return (
    <svg className={cls} aria-hidden="true" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 2c-5 0-8 4-8 8 0 3 1.5 5.5 3.5 7L8 26c-2 3-3 6-3 10v10h30V36c0-4-1-7-3-10l-7.5-9c2-1.5 3.5-4 3.5-7 0-4-3-8-8-8z" />
    </svg>
  );
}
