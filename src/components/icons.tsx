// Stroked with currentColor, so they take the text colour of their button
function Icon({path, size = 28}: {path: string; size?: number}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

export function MenuIcon() {
  return <Icon path="M4 6h16M4 12h16M4 18h16" />;
}

export function CloseIcon() {
  return <Icon path="M6 6l12 12M18 6L6 18" />;
}

export function TrashIcon() {
  return (
    <Icon size={20} path="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
  );
}
