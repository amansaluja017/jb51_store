import React from 'react';
import { StyleSheet, Text, View, TextStyle } from 'react-native';

interface FormattedRichTextProps {
  text?: string | null;
  style?: TextStyle;
  baseFontSize?: number;
  textColor?: string;
}

/**
 * Parses formatted strings containing HTML tags (<b>, <i>, <u>, <h2>, <h3>, <p>, <li>, <br>)
 * or markdown-style bullets and numbered lists and renders them into native React Native styled Text components.
 */
export default function FormattedRichText({
  text,
  style,
  baseFontSize = 13,
  textColor = '#27272a',
}: FormattedRichTextProps) {
  if (!text) return null;

  // Clean raw HTML entities if any
  const decodedText = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  // If text does not contain any tags, numbers, or bullets, render as plain text
  if (!decodedText.includes('<') && !decodedText.includes('•') && !decodedText.includes('#')) {
    return (
      <Text style={[{ fontSize: baseFontSize, color: textColor, lineHeight: baseFontSize * 1.5 }, style]}>
        {decodedText}
      </Text>
    );
  }

  // Pre-normalize headings and block structures before line splitting
  const normalized = decodedText
    .replace(/<h[12][^>]*>(.*?)<\/h[12]>/gi, '\n## $1\n')
    .replace(/<h[3-6][^>]*>(.*?)<\/h[3-6]>/gi, '\n### $1\n')
    .replace(/<p><br><\/p>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<li[^>]*>/gi, '• ');

  const lines = normalized.split('\n');

  return (
    <View style={styles.container}>
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <View key={lineIdx} style={{ height: 4 }} />;
        }

        const isHeading2 = trimmed.startsWith('## ') || trimmed.startsWith('# ') || /<h[12][^>]*>/i.test(line);
        const isHeading3 = trimmed.startsWith('### ') || /<h[3-6][^>]*>/i.test(line);
        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const isNumbered = /^\d+\.\s*/.test(trimmed);

        // Clean outer block tags and markdown symbols
        let cleanLine = line
          .replace(/^#{1,3}\s+/, '')
          .replace(/<h[1-6][^>]*>/gi, '')
          .replace(/<\/h[1-6]>/gi, '')
          .replace(/<p[^>]*>/gi, '')
          .replace(/<\/p>/gi, '')
          .replace(/<blockquote[^>]*>/gi, '')
          .replace(/<\/blockquote>/gi, '');

        if (isBullet) {
          cleanLine = cleanLine.replace(/^[•\-\*]\s*/, '');
        }

        if (isHeading2 || isHeading3) {
          const headingSize = isHeading2 ? baseFontSize + 5 : baseFontSize + 3;
          const inlineTokens = parseInlineTags(cleanLine);
          return (
            <Text
              key={lineIdx}
              style={[
                styles.heading,
                {
                  fontSize: headingSize,
                  color: '#09090b',
                  lineHeight: headingSize * 1.35,
                  marginTop: lineIdx > 0 ? 8 : 2,
                  marginBottom: 3,
                },
              ]}
            >
              {inlineTokens.map((token, tIdx) => renderToken(token, tIdx, headingSize, '#09090b'))}
            </Text>
          );
        }

        if (isBullet) {
          const inlineTokens = parseInlineTags(cleanLine);
          return (
            <View key={lineIdx} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { marginTop: (baseFontSize * 1.5) / 2 - 3 }]} />
              <Text style={[styles.bulletText, { fontSize: baseFontSize, color: textColor, lineHeight: baseFontSize * 1.5 }]}>
                {inlineTokens.map((token, tIdx) => renderToken(token, tIdx, baseFontSize, textColor))}
              </Text>
            </View>
          );
        }

        if (isNumbered) {
          const numMatch = trimmed.match(/^(\d+\.)\s*/);
          const numPrefix = numMatch ? numMatch[1] : '1.';
          cleanLine = cleanLine.replace(/^\d+\.\s*/, '');
          const inlineTokens = parseInlineTags(cleanLine);
          return (
            <View key={lineIdx} style={styles.bulletRow}>
              <Text style={[styles.numberPrefix, { fontSize: baseFontSize, color: '#FF5E36', lineHeight: baseFontSize * 1.5 }]}>
                {numPrefix}
              </Text>
              <Text style={[styles.bulletText, { fontSize: baseFontSize, color: textColor, lineHeight: baseFontSize * 1.5 }]}>
                {inlineTokens.map((token, tIdx) => renderToken(token, tIdx, baseFontSize, textColor))}
              </Text>
            </View>
          );
        }

        const inlineTokens = parseInlineTags(cleanLine);
        return (
          <Text
            key={lineIdx}
            style={[
              styles.paragraph,
              { fontSize: baseFontSize, color: textColor, lineHeight: baseFontSize * 1.5 },
              style,
            ]}
          >
            {inlineTokens.map((token, tIdx) => renderToken(token, tIdx, baseFontSize, textColor))}
          </Text>
        );
      })}
    </View>
  );
}

interface InlineToken {
  text: string;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
}

function parseInlineTags(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  // Regex pattern matching <b>, <strong>, <i>, <em>, <u> tags and their content
  const regex = /<(b|strong|i|em|u)>(.*?)<\/\1>/gi;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = regex.lastIndex;
    const tag = match[1].toLowerCase();
    const content = match[2];

    // Push preceding plain text
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

  // Push remainder
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

function renderToken(token: InlineToken, index: number, fontSize: number, color: string) {
  const tokenStyles: TextStyle[] = [
    { fontSize, color },
    token.isBold && styles.bold,
    token.isItalic && styles.italic,
    token.isUnderline && styles.underline,
  ].filter(Boolean) as TextStyle[];

  return (
    <Text key={index} style={tokenStyles}>
      {token.text}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  paragraph: {
    marginBottom: 4,
  },
  heading: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF5E36',
    marginRight: 8,
  },
  numberPrefix: {
    fontWeight: '700',
    marginRight: 8,
    minWidth: 18,
  },
  bulletText: {
    flex: 1,
  },
  bold: {
    fontWeight: '700',
    color: '#09090b',
  },
  italic: {
    fontStyle: 'italic',
  },
  underline: {
    textDecorationLine: 'underline',
  },
});
