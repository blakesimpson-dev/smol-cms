export function Help({text, error}: {text?: string; error?: string}) {
  if (error) {
    return <small class="error">{error}</small>;
  }

  return text ? <small>{text}</small> : null;
}
