import React from 'react';

interface FormattedRichTextProps {
  text?: string | null;
  className?: string;
  paragraphClassName?: string;
}

interface InlineToken {
  text: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

function parseInlineTags(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const regex = /<(b|strong|i|em|u)>(.*?)<\/\1>/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = regex.lastIndex;
    const tag = match[1].toLowerCase();
    const content = match[2];

    if (matchStart > lastIndex) {
      tokens.push({
        text: text.substring(lastIndex, matchStart),
        isBold: false,
        isItalic: false,
        isUnderline: false,
      });
    }

    tokens.push({
      text: content,
      isBold: tag === 'b' || tag === 'strong',
      isItalic: tag === 'i' || tag === 'em',
      isUnderline: tag === 'u',
    });

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    tokens.push({
      text: text.substring(lastIndex),
      isBold: false,
      isItalic: false,
      isUnderline: false,
    });
  }

  return tokens.length > 0
    ? tokens
    : [{ text, isBold: false, isItalic: false, isUnderline: false }];
}

export function FormattedRichText({
  text,
  className = '',
  paragraphClassName = 'mb-2 leading-relaxed text-zinc-650',
}: FormattedRichTextProps) {
  if (!text) return null;

  const decodedText = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  if (!decodedText.includes('<') && !decodedText.includes('•') && !decodedText.includes('\n')) {
    return <span className={className}>{decodedText}</span>;
  }

  const normalized = decodedText
    .replace(/<p><br><\/p>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ');

  const lines = normalized.split('\n');

  return (
    <div className={`space-y-1.5 ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        const isHeading2 = /<h2[^>]*>(.*?)<\/h2>/i.test(line) || line.startsWith('## ');
        const isHeading3 = /<h3[^>]*>(.*?)<\/h3>/i.test(line) || line.startsWith('### ');
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');

        let cleanLine = line
          .replace(/<h[1-6][^>]*>/gi, '')
          .replace(/<\/h[1-6]>/gi, '')
          .replace(/<p[^>]*>/gi, '')
          .replace(/<\/p>/gi, '')
          .replace(/<blockquote[^>]*>/gi, '')
          .replace(/<\/blockquote>/gi, '');

        if (isBullet) {
          cleanLine = cleanLine.replace(/^[•\-\*]\s*/, '');
        }

        const tokens = parseInlineTags(cleanLine);

        if (isHeading2 || isHeading3) {
          return (
            <h4
              key={idx}
              className={`font-serif font-bold text-zinc-900 mt-2 mb-1 ${
                isHeading2 ? 'text-sm md:text-base' : 'text-xs md:text-sm'
              }`}
            >
              {tokens.map((token, tIdx) => (
                <span
                  key={tIdx}
                  className={`${token.isBold ? 'font-bold' : ''} ${
                    token.isItalic ? 'italic' : ''
                  } ${token.isUnderline ? 'underline' : ''}`}
                >
                  {token.text}
                </span>
              ))}
            </h4>
          );
        }

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E36] mt-1.5 shrink-0" />
              <div className={paragraphClassName}>
                {tokens.map((token, tIdx) => (
                  <span
                    key={tIdx}
                    className={`${token.isBold ? 'font-bold text-zinc-900' : ''} ${
                      token.isItalic ? 'italic' : ''
                    } ${token.isUnderline ? 'underline' : ''}`}
                  >
                    {token.text}
                  </span>
                ))}
              </div>
            </div>
          );
        }

        return (
          <p key={idx} className={paragraphClassName}>
            {tokens.map((token, tIdx) => (
              <span
                key={tIdx}
                className={`${token.isBold ? 'font-bold text-zinc-900' : ''} ${
                  token.isItalic ? 'italic' : ''
                } ${token.isUnderline ? 'underline' : ''}`}
              >
                {token.text}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}
