import React from 'react';

function iconProps(props) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    ...props,
  };
}

export function Building2(props) {
  return (
    <svg {...iconProps(props)}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M9 8h.01M15 8h.01M9 12h.01M15 12h.01M9 16h.01M15 16h.01" />
    </svg>
  );
}

export function Boxes(props) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 2l8 4-8 4-8-4 8-4z" />
      <path d="M4 10l8 4 8-4M4 14l8 4 8-4" />
    </svg>
  );
}

export function Link2(props) {
  return (
    <svg {...iconProps(props)}>
      <path d="M10 13a5 5 0 010-7l1-1a5 5 0 117 7l-1 1" />
      <path d="M14 11a5 5 0 010 7l-1 1a5 5 0 11-7-7l1-1" />
    </svg>
  );
}

export function Pencil(props) {
  return (
    <svg {...iconProps(props)}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

export function Trash2(props) {
  return (
    <svg {...iconProps(props)}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2M6 6l1 14h10l1-14" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function Unlink(props) {
  return (
    <svg {...iconProps(props)}>
      <path d="M9 15l-2 2a5 5 0 107 7l2-2" />
      <path d="M15 9l2-2a5 5 0 10-7-7L8 2" />
      <path d="M8 16l8-8" />
    </svg>
  );
}
