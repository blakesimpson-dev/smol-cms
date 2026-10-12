export function Help({
  text,
  error,
}: {
  text?: string | undefined;
  error?: string | undefined;
}) {
  if (error) {
    return <small class="error">{error}</small>;
  }

  return text ? <small>{text}</small> : null;
}
