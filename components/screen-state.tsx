import { ActivityIndicator, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { palette } from '@/constants/palette';

type ScreenStateProps = {
  kind: 'loading' | 'empty' | 'error';
  message?: string;
  onRetry?: () => void;
};

export function ScreenState({ kind, message, onRetry }: ScreenStateProps) {
  const colors = palette[useColorScheme() ?? 'light'];

  return (
    <View style={styles.container}>
      {kind === 'loading' ? <ActivityIndicator color={colors.accent} size="large" /> : null}
      <Text style={[styles.title, { color: colors.text }]}>
        {kind === 'loading' ? 'Loading stories…' : kind === 'empty' ? 'Nothing here yet' : 'Couldn’t load Hacker News'}
      </Text>
      {message ? <Text style={[styles.message, { color: colors.muted }]}>{message}</Text> : null}
      {kind === 'error' && onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: pressed ? colors.surfacePressed : colors.accent },
          ]}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: 32 },
  title: { fontSize: 17, fontWeight: '800', marginTop: 14, textAlign: 'center' },
  message: { fontSize: 14, lineHeight: 20, marginTop: 6, textAlign: 'center' },
  button: { borderRadius: 999, marginTop: 18, paddingHorizontal: 20, paddingVertical: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});
