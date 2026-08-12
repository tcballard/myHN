import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { palette } from '@/constants/palette';
import { hostname, relativeTime } from '@/lib/format';
import type { HNItem } from '@/types/hn';

type StoryCardProps = {
  rank: number;
  story: HNItem;
};

export function StoryCard({ rank, story }: StoryCardProps) {
  const colors = palette[useColorScheme() ?? 'light'];

  const openDiscussion = () => {
    if (Platform.OS === 'ios') void Haptics.selectionAsync();
    router.push({ pathname: '/story/[id]', params: { id: String(story.id) } });
  };

  return (
    <Pressable
      accessibilityHint="Opens the story and its discussion"
      accessibilityLabel={`${story.title}. ${story.score ?? 0} points. ${story.descendants ?? 0} comments.`}
      accessibilityRole="button"
      onPress={openDiscussion}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? colors.surfacePressed : colors.surface },
      ]}>
      <Text style={[styles.rank, { color: colors.accent }]}>{rank}</Text>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{story.title || 'Untitled'}</Text>
        <Text numberOfLines={1} style={[styles.domain, { color: colors.muted }]}>
          {hostname(story.url)}
        </Text>
        <View style={styles.metadata}>
          <Text style={[styles.metaText, { color: colors.muted }]}>
            {story.score ?? 0} points
          </Text>
          <View style={[styles.dot, { backgroundColor: colors.subtle }]} />
          <Text style={[styles.metaText, { color: colors.muted }]}>by {story.by ?? 'unknown'}</Text>
          <View style={[styles.dot, { backgroundColor: colors.subtle }]} />
          <Text style={[styles.metaText, { color: colors.muted }]}>{relativeTime(story.time)}</Text>
          <View style={styles.spacer} />
          <Text style={[styles.commentCount, { color: colors.accent }]}>
            {story.descendants ?? 0} comments
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    flexDirection: 'row',
    minHeight: 124,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  rank: {
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    paddingTop: 3,
    width: 28,
  },
  content: { flex: 1, gap: 5 },
  title: {
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  domain: { fontSize: 12, lineHeight: 16 },
  metadata: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', marginTop: 5 },
  metaText: { fontSize: 12, lineHeight: 18 },
  dot: { borderRadius: 2, height: 3, marginHorizontal: 6, width: 3 },
  spacer: { flex: 1, minWidth: 8 },
  commentCount: { fontSize: 12, fontWeight: '700', lineHeight: 18 },
});
