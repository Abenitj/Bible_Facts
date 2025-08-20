import React from 'react';
import { View, StyleSheet } from 'react-native';
import AmharicText from '../src/components/AmharicText';
import ClickableBibleVerse from './ClickableBibleVerse';

const TextWithBibleVerses = ({ text, style, verseData = [] }) => {
  // Function to detect Bible verse patterns in text
  const detectVerses = (text) => {
    // Common Bible verse patterns - simplified to avoid regex issues
    const versePatterns = [
      /([1-3]?\s*(?:ማቴዎስ|ማርቆስ|ሉቃስ|ዮሐንስ|የሐዋርያት|ሮሜ|ቆሮንቶስ|ገላትያ|ኤፌሶን|ፊልጵስዩስ|ቆላስስዩስ|ተሰሎንቄ|ጢሞቴዎስ|ቲቶ|ፊለሞን|ዕብራውያን|ያዕቆብ|ጴጥሮስ|ይሁዳ|ራዕይ)\s*\d+:\d+)/gi,
      /([1-3]?\s*(?:John|Matthew|Mark|Luke|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\s*\d+:\d+)/gi,
    ];

    const parts = [];
    let lastIndex = 0;

    // Check each pattern
    for (const pattern of versePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const verse = match[0];
        const matchIndex = match.index;

        // Add text before the verse
        if (matchIndex > lastIndex) {
          parts.push({
            type: 'text',
            content: text.substring(lastIndex, matchIndex),
          });
        }

        // Add the verse
        parts.push({
          type: 'verse',
          content: verse,
        });

        lastIndex = matchIndex + verse.length;
      }
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex),
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content: text }];
  };

  const renderParts = () => {
    const parts = detectVerses(text);
    
    return parts.map((part, index) => {
      if (part.type === 'verse') {
        // Find matching verse data
        const verseInfo = verseData.find(v => 
          v.verse.toLowerCase().includes(part.content.toLowerCase()) ||
          part.content.toLowerCase().includes(v.verse.toLowerCase())
        );

        return (
          <ClickableBibleVerse
            key={index}
            verse={part.content}
            text={verseInfo?.text || 'ይህ ጥቅስ በአሁኑ ጊዜ አይገኝም።'}
            explanation={verseInfo?.explanation}
            style={styles.inlineVerse}
          />
        );
      } else {
        return (
          <AmharicText key={index} style={[styles.text, style]}>
            {part.content}
          </AmharicText>
        );
      }
    });
  };

  return (
    <View style={styles.container}>
      {renderParts()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 16,
    color: '#A0522D',
    lineHeight: 24,
  },
  inlineVerse: {
    fontSize: 16,
    color: '#654321',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default TextWithBibleVerses;
