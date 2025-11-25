# AmharicText Component - Complete Guide

## Overview

The enhanced `AmharicText` component is a comprehensive text component optimized for Amharic language support with multiple variants, dark mode support, and flexible styling options.

## Features

✅ **10 Text Variants** - From display to small text  
✅ **Dark Mode Support** - Automatic theme-aware colors  
✅ **Text Size Scaling** - Respects user text size preferences  
✅ **Platform Optimization** - iOS and Android font support  
✅ **Flexible Styling** - Alignment, truncation, bold, italic, and more  
✅ **Letter Spacing** - Customizable spacing for better readability  

## Variants

### Available Variants

1. **`display`** - Largest text (36px) - For hero sections
2. **`largeTitle`** - Large title (32px) - For main page titles
3. **`title`** - Title (28px) - For section titles
4. **`heading`** - Heading (24px) - For major headings
5. **`subheading`** - Subheading (20px) - For subsections
6. **`body`** - Body text (16px) - Default for regular text
7. **`caption`** - Caption (14px) - For secondary information
8. **`small`** - Small text (12px) - For fine print
9. **`button`** - Button text (16px) - Optimized for buttons
10. **`label`** - Label (14px) - For form labels (uppercase)

## Usage Examples

### Basic Usage

```jsx
import AmharicText from '../src/components/AmharicText';

// Default body text
<AmharicText>ይህ መሰረታዊ ጽሑፍ ነው</AmharicText>

// With variant
<AmharicText variant="heading">ዋና ርዕስ</AmharicText>
```

### Text Alignment

```jsx
// Left aligned (default)
<AmharicText align="left">የግራ አሰላለፍ</AmharicText>

// Center aligned
<AmharicText align="center">የመሃል አሰላለፍ</AmharicText>

// Right aligned
<AmharicText align="right">የቀኝ አሰላለፍ</AmharicText>

// Justified
<AmharicText align="justify">የተመጣጠነ አሰላለፍ</AmharicText>
```

### Text Truncation

```jsx
// Limit to 2 lines with ellipsis
<AmharicText numberOfLines={2} ellipsizeMode="tail">
  ረጅም ጽሑፍ ይህ ነው...
</AmharicText>

// Truncate from middle
<AmharicText numberOfLines={1} ellipsizeMode="middle">
  ረጅም ጽሑፍ
</AmharicText>
```

### Styling Options

```jsx
// Bold text
<AmharicText bold>ድምቀት ያለው ጽሑፍ</AmharicText>

// Italic text
<AmharicText italic>የግራ ዘንበል ያለው ጽሑፍ</AmharicText>

// Custom color
<AmharicText color="#3B82F6">ሰማያዊ ጽሑፍ</AmharicText>

// Custom letter spacing
<AmharicText letterSpacing={2}>የተሰፋ የፊደል ክፍተት</AmharicText>
```

### Combined Examples

```jsx
// Hero section
<AmharicText 
  variant="display" 
  align="center" 
  bold
  color="#1F2937"
>
  ዋና ርዕስ
</AmharicText>

// Section heading
<AmharicText 
  variant="heading" 
  bold
  style={{ marginBottom: 16 }}
>
  ክፍል ርዕስ
</AmharicText>

// Body text with truncation
<AmharicText 
  variant="body"
  numberOfLines={3}
  ellipsizeMode="tail"
>
  ረጅም የምድብ ጽሑፍ...
</AmharicText>

// Button text
<AmharicText variant="button" color="#FFFFFF">
  ይጫኑ
</AmharicText>

// Label text
<AmharicText variant="label" color="#6B7280">
  ስም
</AmharicText>
```

### Dark Mode Integration

The component automatically adapts to dark mode:

```jsx
// Automatically uses theme colors
<AmharicText variant="heading">
  ይህ በጨለማ ሞድ ውስጥ በተለየ ሁኔታ ይታያል
</AmharicText>

// Override with custom color
<AmharicText variant="body" color="#FFFFFF">
  ሁልጊዜ ነጭ ጽሑፍ
</AmharicText>
```

### Text Size Scaling

The component respects user text size preferences:

```jsx
// Automatically scales based on user settings
<AmharicText variant="body">
  ይህ በተጠቃሚው የጽሑፍ መጠን ቅንብር ይለወጣል
</AmharicText>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'body'` | Text variant: 'display', 'largeTitle', 'title', 'heading', 'subheading', 'body', 'caption', 'small', 'button', 'label' |
| `align` | `string` | `'left'` | Text alignment: 'left', 'center', 'right', 'justify' |
| `numberOfLines` | `number` | `undefined` | Maximum number of lines |
| `ellipsizeMode` | `string` | `undefined` | How to truncate: 'head', 'middle', 'tail', 'clip' |
| `bold` | `boolean` | `false` | Make text bold |
| `italic` | `boolean` | `false` | Make text italic |
| `color` | `string` | `undefined` | Custom text color (overrides theme) |
| `letterSpacing` | `number` | `undefined` | Letter spacing value |
| `style` | `object` | `undefined` | Additional custom styles |
| `children` | `ReactNode` | Required | Text content |

## Variant Sizes

| Variant | Font Size | Line Height | Font Weight |
|---------|-----------|-------------|-------------|
| `display` | 36px | 44px | 700 |
| `largeTitle` | 32px | 40px | 700 |
| `title` | 28px | 36px | 700 |
| `heading` | 24px | 32px | 700 |
| `subheading` | 20px | 28px | 600 |
| `body` | 16px | 24px | 400 |
| `caption` | 14px | 20px | 400 |
| `small` | 12px | 16px | 400 |
| `button` | 16px | 20px | 600 |
| `label` | 14px | 18px | 500 |

*Note: All sizes are scaled based on user text size preferences*

## Best Practices

1. **Use appropriate variants** - Match the variant to the content hierarchy
2. **Respect dark mode** - Let the component handle colors automatically
3. **Use truncation wisely** - Only truncate when necessary
4. **Maintain consistency** - Use the same variant for similar content types
5. **Test text scaling** - Ensure your layouts work with different text sizes

## Migration from Old Component

The enhanced component is backward compatible. Old usage will continue to work:

```jsx
// Old usage (still works)
<AmharicText variant="heading">ርዕስ</AmharicText>

// New enhanced usage
<AmharicText 
  variant="heading" 
  align="center" 
  bold
  numberOfLines={2}
>
  ርዕስ
</AmharicText>
```

## Platform Support

- ✅ iOS - Uses System font
- ✅ Android - Uses sans-serif font
- ✅ Web - Uses System font
- ✅ All platforms support Amharic characters

## Examples in Codebase

You can see the component in use throughout the app:

- `screens/HomeScreen.js` - Home screen text
- `screens/TopicsScreen.js` - Topic listings
- `components/ReligionCard.js` - Religion cards
- `components/TopicCard.js` - Topic cards
- `screens/SettingsScreen.js` - Settings screen

---

**Note**: This component is optimized for Amharic language support and works seamlessly with the app's dark mode and text size settings.






