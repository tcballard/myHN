import { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { StoryCard } from '@/components/story-card';
import { palette } from '@/constants/palette';
import { getFeed } from '@/lib/hn-api';
import type { FeedName, HNItem } from '@/types/hn';

const feeds: { label: string; value: FeedName }[] = [
  { label: 'Top', value: 'top' },
  { label: 'New', value: 'new' },
  { label: 'Best', value: 'best' },
  { label: 'Ask', value: 'ask' },
];

export default function FeedScreen() {
  const colors = palette[useColorScheme() ?? 'light'];
  const [feed, setFeed] = useState<FeedName>('top');
  const [stories, setStories] = useState<HNItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setStories([]);

    getFeed(feed, controller.signal)
      .then(setStories)
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== 'AbortError') setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [feed, reloadToken]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      setStories(await getFeed(feed));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'An unexpected error occurred');
    } finally {
      setRefreshing(false);
    }
  }, [feed]);

  const header = (
    <View style={styles.header}>
      <View style={styles.brandRow}>
        <View style={[styles.mark, { backgroundColor: colors.accent }]}>
          <Text style={styles.markText}>Y</Text>
        </View>
        <View>
          <Text style={[styles.eyebrow, { color: colors.accent }]}>UNOFFICIAL READER</Text>
          <Text style={[styles.heading, { color: colors.text }]}>Hacker News</Text>
        </View>
      </View>
      <Text style={[styles.subtitle, { color: colors.muted }]}>The signal, without the friction.</Text>
      <View accessibilityRole="tablist" style={styles.feedPicker}>
        {feeds.map((item) => {
          const selected = item.value === feed;
          return (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              key={item.value}
              onPress={() => setFeed(item.value)}
              style={({ pressed }) => [
                styles.feedButton,
                {
                  backgroundColor: selected ? colors.text : pressed ? colors.surfacePressed : colors.surface,
                  borderColor: selected ? colors.text : colors.subtle,
                },
              ]}>
              <Text style={[styles.feedLabel, { color: selected ? colors.background : colors.text }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  if (loading && stories.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {header}
        <ScreenState kind="loading" />
      </SafeAreaView>
    );
  }

  if (error && stories.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        {header}
        <ScreenState kind="error" message={error} onRetry={() => setReloadToken((value) => value + 1)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={stories}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={<ScreenState kind="empty" />}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor={colors.accent} />}
        renderItem={({ item, index }) => <StoryCard rank={index + 1} story={item} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  listContent: { paddingBottom: 30, paddingHorizontal: 14 },
  separator: { height: 8 },
  header: { paddingBottom: 20, paddingHorizontal: 2, paddingTop: 12 },
  brandRow: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  mark: { alignItems: 'center', borderRadius: 10, height: 44, justifyContent: 'center', width: 44 },
  markText: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  heading: {
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.8,
  },
  subtitle: { fontSize: 14, marginTop: 12 },
  feedPicker: { flexDirection: 'row', gap: 8, marginTop: 18 },
  feedButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    minHeight: 42,
    justifyContent: 'center',
  },
  feedLabel: { fontSize: 13, fontWeight: '800' },
});
