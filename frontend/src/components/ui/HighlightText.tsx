import React from 'react';

interface HighlightTextProps {
  text: string | number | null | undefined;
  highlight: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, highlight }) => {
  if (text === null || text === undefined) return null;
  const textStr = String(text);
  if (!highlight.trim()) return <>{textStr}</>;

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  const regex = new RegExp(`(${escapeRegExp(highlight)})`, 'gi');
  const parts = textStr.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-300 text-emerald-950 font-bold px-0.5 rounded-sm shadow-sm">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};
