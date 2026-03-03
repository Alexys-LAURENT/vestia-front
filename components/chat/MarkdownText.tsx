import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import React, { useMemo } from 'react'
import { StyleSheet, Text, TextStyle, View } from 'react-native'

interface MarkdownTextProps {
  children: string
}

// ─── Inline parser ─────────────────────────────────────────
// Parses bold, italic, bold+italic, inline code, and strikethrough
// Returns an array of elements to nest inside a <Text>.

type InlineSegment = {
  text: string
  bold?: boolean
  italic?: boolean
  code?: boolean
  strikethrough?: boolean
}

function parseInline(raw: string): InlineSegment[] {
  const segments: InlineSegment[] = []
  // Regex order matters: bold+italic first, then bold, italic, code, strikethrough
  const inlineRegex =
    /(\*\*\*(.+?)\*\*\*|___(.+?)___|\*\*(.+?)\*\*|__(.+?)__|_(.+?)_|\*(.+?)\*|`(.+?)`|~~(.+?)~~)/g

  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = inlineRegex.exec(raw)) !== null) {
    // Push leading plain text
    if (match.index > lastIndex) {
      segments.push({ text: raw.slice(lastIndex, match.index) })
    }

    if (match[2] || match[3]) {
      // ***bold italic*** or ___bold italic___
      segments.push({ text: match[2] || match[3], bold: true, italic: true })
    } else if (match[4] || match[5]) {
      // **bold** or __bold__
      segments.push({ text: match[4] || match[5], bold: true })
    } else if (match[6] || match[7]) {
      // _italic_ or *italic*
      segments.push({ text: match[6] || match[7], italic: true })
    } else if (match[8]) {
      // `code`
      segments.push({ text: match[8], code: true })
    } else if (match[9]) {
      // ~~strikethrough~~
      segments.push({ text: match[9], strikethrough: true })
    }

    lastIndex = match.index + match[0].length
  }

  // Trailing plain text
  if (lastIndex < raw.length) {
    segments.push({ text: raw.slice(lastIndex) })
  }

  return segments.length > 0 ? segments : [{ text: raw }]
}

// ─── Block parser ──────────────────────────────────────────
type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; number: string; text: string }
  | { type: 'code'; language?: string; text: string }

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Code block (fenced)
    if (line.trimStart().startsWith('```')) {
      const language = line.trimStart().slice(3).trim() || undefined
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push({ type: 'code', language, text: codeLines.join('\n') })
      i++ // skip closing ```
      continue
    }

    // Empty line → skip
    if (line.trim() === '') {
      i++
      continue
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2],
      })
      i++
      continue
    }

    // Bullet list
    const bulletMatch = line.match(/^[\s]*[-*•]\s+(.+)$/)
    if (bulletMatch) {
      blocks.push({ type: 'bullet', text: bulletMatch[1] })
      i++
      continue
    }

    // Numbered list
    const numberedMatch = line.match(/^[\s]*(\d+)[.)]\s+(.+)$/)
    if (numberedMatch) {
      blocks.push({ type: 'numbered', number: numberedMatch[1], text: numberedMatch[2] })
      i++
      continue
    }

    // Default: paragraph — collect consecutive non-special lines
    const paragraphLines: string[] = [line]
    i++
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].trimStart().startsWith('```') &&
      !lines[i].match(/^#{1,3}\s/) &&
      !lines[i].match(/^[\s]*[-*•]\s+/) &&
      !lines[i].match(/^[\s]*\d+[.)]\s+/)
    ) {
      paragraphLines.push(lines[i])
      i++
    }
    blocks.push({ type: 'paragraph', text: paragraphLines.join('\n') })
  }

  return blocks
}

// ─── Renderers ─────────────────────────────────────────────

function InlineText({
  text,
  baseStyle,
  codeStyle,
}: {
  text: string
  baseStyle: TextStyle
  codeStyle: TextStyle
}) {
  const segments = parseInline(text)

  return (
    <Text style={baseStyle}>
      {segments.map((seg, i) => {
        const style: TextStyle = {}
        if (seg.bold) style.fontWeight = '700'
        if (seg.italic) style.fontStyle = 'italic'
        if (seg.strikethrough) style.textDecorationLine = 'line-through'

        if (seg.code) {
          return (
            <Text key={i} style={codeStyle}>
              {seg.text}
            </Text>
          )
        }

        if (Object.keys(style).length > 0) {
          return (
            <Text key={i} style={style}>
              {seg.text}
            </Text>
          )
        }

        return <React.Fragment key={i}>{seg.text}</React.Fragment>
      })}
    </Text>
  )
}

// ─── Main component ────────────────────────────────────────

export default function MarkdownText({ children }: MarkdownTextProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const colors = isDark ? Colors.dark : Colors.light

  const styles = useMemo(
    () =>
      StyleSheet.create({
        baseText: {
          fontSize: 14,
          lineHeight: 21,
          color: colors.text,
        },
        bold: {
          fontWeight: '700',
        },
        h1: {
          fontSize: 20,
          fontWeight: '700',
          lineHeight: 28,
          color: colors.text,
          marginBottom: 6,
        },
        h2: {
          fontSize: 17,
          fontWeight: '700',
          lineHeight: 24,
          color: colors.text,
          marginBottom: 4,
        },
        h3: {
          fontSize: 15,
          fontWeight: '600',
          lineHeight: 22,
          color: colors.text,
          marginBottom: 2,
        },
        inlineCode: {
          fontFamily: 'monospace',
          fontSize: 13,
          backgroundColor: isDark
            ? Colors.dark.backgroundTertiary
            : Colors.light.backgroundTertiary,
          color: isDark ? Colors.dark.text : Colors.light.text,
          borderRadius: 4,
          paddingHorizontal: 4,
        },
        codeBlock: {
          backgroundColor: isDark
            ? Colors.dark.backgroundSecondary
            : Colors.light.backgroundTertiary,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: colors.border,
        },
        codeBlockText: {
          fontFamily: 'monospace',
          fontSize: 12.5,
          lineHeight: 18,
          color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
        },
        bulletRow: {
          flexDirection: 'row' as const,
          alignItems: 'flex-start' as const,
          paddingLeft: 4,
        },
        bulletDot: {
          fontSize: 14,
          lineHeight: 21,
          color: colors.textTertiary,
          marginRight: 8,
          fontWeight: '700' as const,
        },
        numberedLabel: {
          fontSize: 14,
          lineHeight: 21,
          color: colors.textTertiary,
          marginRight: 8,
          fontWeight: '600' as const,
          minWidth: 18,
        },
        blockGap: {
          height: 8,
        },
        listGap: {
          height: 3,
        },
      }),
    [colors, isDark]
  )

  const blocks = useMemo(() => parseBlocks(children), [children])

  return (
    <View>
      {blocks.map((block, i) => {
        const prevBlock = i > 0 ? blocks[i - 1] : null
        // Tighter gaps between consecutive list items
        const isListAfterList =
          (block.type === 'bullet' || block.type === 'numbered') &&
          (prevBlock?.type === 'bullet' || prevBlock?.type === 'numbered')
        const spacer =
          i > 0 ? (
            <View key={`spacer-${i}`} style={isListAfterList ? styles.listGap : styles.blockGap} />
          ) : null

        switch (block.type) {
          case 'heading': {
            const headingStyle =
              block.level === 1 ? styles.h1 : block.level === 2 ? styles.h2 : styles.h3
            return (
              <React.Fragment key={i}>
                {spacer}
                <InlineText
                  text={block.text}
                  baseStyle={headingStyle}
                  codeStyle={styles.inlineCode}
                />
              </React.Fragment>
            )
          }

          case 'bullet':
            return (
              <React.Fragment key={i}>
                {spacer}
                <View style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <View style={{ flex: 1 }}>
                    <InlineText
                      text={block.text}
                      baseStyle={styles.baseText}
                      codeStyle={styles.inlineCode}
                    />
                  </View>
                </View>
              </React.Fragment>
            )

          case 'numbered':
            return (
              <React.Fragment key={i}>
                {spacer}
                <View style={styles.bulletRow}>
                  <Text style={styles.numberedLabel}>{block.number}.</Text>
                  <View style={{ flex: 1 }}>
                    <InlineText
                      text={block.text}
                      baseStyle={styles.baseText}
                      codeStyle={styles.inlineCode}
                    />
                  </View>
                </View>
              </React.Fragment>
            )

          case 'code':
            return (
              <React.Fragment key={i}>
                {spacer}
                <View style={styles.codeBlock}>
                  <Text style={styles.codeBlockText}>{block.text}</Text>
                </View>
              </React.Fragment>
            )

          case 'paragraph':
          default:
            return (
              <React.Fragment key={i}>
                {spacer}
                <InlineText
                  text={block.text}
                  baseStyle={styles.baseText}
                  codeStyle={styles.inlineCode}
                />
              </React.Fragment>
            )
        }
      })}
    </View>
  )
}
