import { Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Aceita qualquer prop enviada pelas tabs sem conflito de tipo com o TypeScript
export function HapticTab(props: any) {
  const { onPressIn, ...restProps } = props;

  return (
    <Pressable
      {...restProps}
      onPressIn={(ev) => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    />
  );
}