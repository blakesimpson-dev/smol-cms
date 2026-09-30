export function Paragraphs({text}: {text: string}) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <>
      {paragraphs.map(p => (
        <p>
          {p.split('\n').map((line, i) => (
            <>
              {i > 0 && <br />}
              {line}
            </>
          ))}
        </p>
      ))}
    </>
  );
}
