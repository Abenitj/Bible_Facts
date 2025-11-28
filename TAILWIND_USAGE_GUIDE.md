# Tailwind CSS (NativeWind) Usage Guide

## Overview

Your app now uses **NativeWind** (Tailwind CSS for React Native) for styling. This allows you to use Tailwind utility classes directly in your React Native components.

## Basic Usage

### Using className prop

```jsx
import { View, Text } from 'react-native';

export default function MyComponent() {
  return (
    <View className="flex-1 bg-gray-100 p-4">
      <Text className="text-2xl font-bold text-blue-600">
        Hello Tailwind!
      </Text>
    </View>
  );
}
```

### Common Tailwind Classes

#### Layout
- `flex-1` - flex: 1
- `flex-row` - flexDirection: 'row'
- `flex-col` - flexDirection: 'column'
- `items-center` - alignItems: 'center'
- `justify-center` - justifyContent: 'center'
- `justify-between` - justifyContent: 'space-between'

#### Spacing
- `p-4` - padding: 16px
- `px-4` - paddingHorizontal: 16px
- `py-4` - paddingVertical: 16px
- `m-4` - margin: 16px
- `mx-4` - marginHorizontal: 16px
- `my-4` - marginVertical: 16px
- `gap-4` - gap: 16px

#### Colors
- `bg-blue-500` - backgroundColor: '#3B82F6'
- `bg-white` - backgroundColor: '#FFFFFF'
- `bg-gray-100` - backgroundColor: '#F3F4F6'
- `text-blue-600` - color: '#2563EB'
- `text-gray-800` - color: '#1F2937'

#### Typography
- `text-2xl` - fontSize: 24px
- `text-lg` - fontSize: 18px
- `text-base` - fontSize: 16px
- `font-bold` - fontWeight: 'bold'
- `font-semibold` - fontWeight: '600'
- `text-center` - textAlign: 'center'

#### Borders & Rounded
- `rounded-lg` - borderRadius: 8px
- `rounded-full` - borderRadius: 9999px
- `border` - borderWidth: 1px
- `border-gray-300` - borderColor: '#D1D5DB'

#### Shadows
- `shadow-sm` - small shadow
- `shadow-md` - medium shadow
- `shadow-lg` - large shadow

## Dark Mode Support

NativeWind supports dark mode using the `dark:` prefix:

```jsx
<View className="bg-white dark:bg-gray-800">
  <Text className="text-gray-900 dark:text-white">
    This text adapts to dark mode
  </Text>
</View>
```

## Combining with StyleSheet

You can combine Tailwind classes with StyleSheet:

```jsx
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  customStyle: {
    // Your custom styles
  },
});

export default function MyComponent() {
  return (
    <View className="flex-1 p-4" style={styles.customStyle}>
      {/* Content */}
    </View>
  );
}
```

## Example Components

### Card Component

```jsx
import { View, Text } from 'react-native';

export default function Card({ title, children }) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4">
      <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2">
        {title}
      </Text>
      {children}
    </View>
  );
}
```

### Button Component

```jsx
import { TouchableOpacity, Text } from 'react-native';

export default function Button({ title, onPress, variant = 'primary' }) {
  const variantClasses = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-600 active:bg-gray-700',
    danger: 'bg-red-600 active:bg-red-700',
  };

  return (
    <TouchableOpacity
      className={`${variantClasses[variant]} px-6 py-3 rounded-lg items-center`}
      onPress={onPress}
    >
      <Text className="text-white font-semibold text-base">
        {title}
      </Text>
    </TouchableOpacity>
  );
}
```

### Input Component

```jsx
import { TextInput, View } from 'react-native';

export default function Input({ placeholder, value, onChangeText }) {
  return (
    <TextInput
      className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
    />
  );
}
```

## Migration Tips

### From StyleSheet to Tailwind

**Before:**
```jsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});

<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>
```

**After:**
```jsx
<View className="flex-1 p-4 bg-gray-50">
  <Text className="text-2xl font-bold text-gray-800">
    Title
  </Text>
</View>
```

## Custom Colors

Your `tailwind.config.js` includes custom colors that match your app theme:

```jsx
// Using custom colors
<View className="bg-primary">
  <Text className="text-primary-dark">
    Custom primary color
  </Text>
</View>
```

## Resources

- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Native Styling](https://reactnative.dev/docs/style)

## Notes

- Always use `className` prop (not `class`)
- Some web-specific Tailwind features may not work in React Native
- Use `active:` prefix for press states
- Combine with your existing theme colors for consistency

