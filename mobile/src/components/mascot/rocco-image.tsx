import { Image } from 'expo-image';
import type { ImageStyle, StyleProp } from 'react-native';
import { roccoAssets, roccoDescriptions, type RoccoVariant } from './rocco-assets';

type RoccoImageProps = {
  variant: RoccoVariant;
  width: number;
  height: number;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
  decorative?: boolean;
};

export function RoccoImage({ variant, width, height, style, accessibilityLabel, decorative = false }: RoccoImageProps) {
  return (
    <Image
      source={roccoAssets[variant]}
      contentFit="contain"
      cachePolicy="memory-disk"
      transition={0}
      accessibilityLabel={decorative ? undefined : accessibilityLabel ?? roccoDescriptions[variant]}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
      style={[{ width, height }, style]}
    />
  );
}
