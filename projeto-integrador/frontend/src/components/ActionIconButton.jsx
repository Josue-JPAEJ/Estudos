import React from 'react';

export default function ActionIconButton({ label, variant = 'neutral', onClick, icon: Icon }) {
  return (
    <button
      type="button"
      className={`icon-action ${variant}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <Icon />
      <span>{label}</span>
    </button>
  );
}
