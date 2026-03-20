'use client';

import Link from 'next/link';

function IconPencil({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconTrash({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

const baseBtn =
  'inline-flex items-center justify-center rounded-md p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1';

/** Light tables (white bg): gold edit, red delete */
export function TableEditIconButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseBtn} text-admin-primary hover:bg-admin-primary/10 focus:ring-admin-primary/40 ${className}`}
      title="Edit"
      aria-label="Edit"
    >
      <IconPencil />
    </button>
  );
}

export function TableDeleteIconButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseBtn} text-red-600 hover:bg-red-50 focus:ring-red-500 ${className}`}
      title="Delete"
      aria-label="Delete"
    >
      <IconTrash />
    </button>
  );
}

/** Row action: update status (e.g. orders) */
export function TableStatusIconButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseBtn} text-admin-primary hover:bg-admin-primary/10 focus:ring-admin-primary/40 ${className}`}
      title="Change status"
      aria-label="Change status"
    >
      <svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <line x1="4" y1="21" x2="4" y2="14" />
        <line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" />
        <line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    </button>
  );
}

/** Dark dashboard: amber edit, red delete */
export function DashboardEditIconButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseBtn} text-amber-500 hover:bg-zinc-800 focus:ring-amber-500 ${className}`}
      title="Edit"
      aria-label="Edit"
    >
      <IconPencil />
    </button>
  );
}

export function DashboardDeleteIconButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${baseBtn} text-red-400 hover:bg-zinc-800 focus:ring-red-500 ${className}`}
      title="Delete"
      aria-label="Delete"
    >
      <IconTrash />
    </button>
  );
}

export function DashboardEditIconLink({ href, className = '' }) {
  return (
    <Link
      href={href}
      className={`${baseBtn} text-amber-500 hover:bg-zinc-800 focus:ring-amber-500 ${className}`}
      title="Edit"
      aria-label="Edit"
    >
      <IconPencil />
    </Link>
  );
}
