import { forwardRef, useState } from 'react';
import { Pressable, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './app-text';
import { useAppColors, radius, spacing } from '@/theme';

type AppTextFieldProps = Omit<TextInputProps, 'secureTextEntry'> & {
  label: string;
  error?: string;
  hint?: string;
  secure?: boolean;
};

export const AppTextField = forwardRef<TextInputInstance, AppTextFieldProps>(function AppTextField({ label, error, hint, secure = false, style, ...props }, ref) {
  const colors = useAppColors();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const disabled = props.editable === false;
  return (
    <View style={{ gap: spacing.xs }}>
      <AppText variant="secondary" style={{ fontWeight: '600' }}>{label}</AppText>
      <View style={{ minHeight: 52, flexDirection: 'row', alignItems: 'center', borderWidth: focused && !error ? 1.5 : 1, borderColor: error ? colors.error : focused ? colors.focus : colors.controlBorder, borderRadius: radius.md, borderCurve: 'continuous', backgroundColor: disabled ? colors.disabled : colors.surface }}>
        <TextInput
          ref={ref}
          {...props}
          onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); props.onBlur?.(event); }}
          accessibilityLabel={label}
          accessibilityHint={error ?? hint}
          secureTextEntry={secure && !visible}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accentStrong}
          style={[{ flex: 1, minHeight: 50, paddingHorizontal: spacing.md, color: disabled ? colors.disabledText : colors.text, fontSize: 16 }, style]}
        />
        {secure ? <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Hide password' : 'Show password'} accessibilityState={{ selected: visible }} hitSlop={8} onPress={() => setVisible((current) => !current)} style={({ pressed }) => ({ width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}><Ionicons name={visible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} /></Pressable> : null}
      </View>
      {error ? <AppText accessibilityRole="alert" variant="caption" tone="error">{error}</AppText> : hint ? <AppText variant="caption" tone="secondary">{hint}</AppText> : null}
    </View>
  );
});
