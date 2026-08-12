import { useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CommentThread } from '@/components/comment-thread';
import { ScreenState } from '@/components/screen-state';
import { palette } from '@/constants/palette';
import { hostname, plainText, relativeTime } from '@/lib/format';
import { getCommentTree, getItem } from '@/lib/hn-api';
import type { CommentNode, HNItem } from '@/types/hn';

export default function StoryScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = Number(params.id);
  const colors = palette[useColorScheme() ?? 'light'];
  const [story, setStory] = useState<HNItem | null>(null);
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    getItem(id, controller.signal)
      .then(async (item) => {
        setStory(item);
        setLoading(false);
        if (item.kids?.length) {
          setCommentsLoading(true);
          setComments(await getCommentTree(item.kids, controller.signal));
        }
      })
      .catch((reason: unknown) => {
        if (reason instanceof Error && reason.name !== 'AbortError') setError(reason.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setCommentsLoading(false);
        }
      });

    return () => controller.abort();
  }, [id, reloadToken]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const item = await getItem(id);
      setStory(item);
      setComments(item.kids?.length ? await getCommentTree(item.kids) : []);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'An unexpected error occurred');
    } finally {
      setRefreshing(false);
    }
  }, [id]);

  if (!Number.isFinite(id)) {
    return <ScreenState kind="error" message="This story link is invalid." />;
  }

  if (loading && !story) return <ScreenState kind="loading" message="Loading discussion…" />;
  if (error && !story) {
    return <ScreenState kind="error" message={error} onRetry={() => setReloadToken((value) => value + 1)} />;
  }
  if (!story) return <ScreenState kind="empty" />;

  const storyText = plainText(story.text);
  const articleUrl = story.url;

  return (
    <SafeAreaView edges={['bottom']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl onRefresh={refresh} refreshing={refreshing} tintColor={colors.accent} />}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.storyHeader, { backgroundColor: colors.surface }]}>
          <Text style={[styles.domain, { color: colors.accent }]}>{hostname(articleUrl)}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{story.title || 'Untitled'}</Text>
          <Text style={[styles.metadata, { color: colors.muted }]}>
            {story.score ?? 0} points · {story.by ?? 'unknown'} · {relativeTime(story.time)}
          </Text>
          {storyText ? <Text style={[styles.storyText, { color: colors.text }]}>{storyText}</Text> : null}
          <View style={styles.actions}>
            {articleUrl ? (
              <Pressable
                accessibilityHint="Opens in an in-app browser"
                accessibilityRole="link"
                onPress={() => void WebBrowser.openBrowserAsync(articleUrl)}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: pressed ? colors.surfacePressed : colors.accent },
                ]}>
                <Text style={styles.primaryButtonText}>Read article</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="link"
              onPress={() => void WebBrowser.openBrowserAsync(`https://news.ycombinator.com/item?id=${story.id}`)}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: pressed ? colors.surfacePressed : colors.background, borderColor: colors.subtle },
              ]}>
              <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Open on HN</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.discussionHeader}>
          <Text style={[styles.discussionTitle, { color: colors.text }]}>Discussion</Text>
          <Text style={[styles.discussionCount, { color: colors.muted }]}>{story.descendants ?? 0} comments</Text>
        </View>

        {comments.map((comment) => (
          <CommentThread comment={comment} key={comment.id} />
        ))}
        {commentsLoading ? (
          <View style={styles.commentsLoading}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[styles.commentsLoadingText, { color: colors.muted }]}>Loading the conversation…</Text>
          </View>
        ) : null}
        {!commentsLoading && comments.length === 0 ? (
          <Text style={[styles.noComments, { color: colors.muted }]}>No comments yet.</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 14, paddingBottom: 40 },
  storyHeader: { borderRadius: 18, padding: 18 },
  domain: { fontSize: 11, fontWeight: '900', letterSpacing: 0.6, textTransform: 'uppercase' },
  title: {
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 25,
    fontWeight: '700',
    letterSpacing: -0.35,
    lineHeight: 32,
    marginTop: 8,
  },
  metadata: { fontSize: 12, marginTop: 10 },
  storyText: { fontSize: 15, lineHeight: 23, marginTop: 18 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 20 },
  primaryButton: { alignItems: 'center', borderRadius: 12, flex: 1, minHeight: 46, justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
    minHeight: 46,
    justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '800' },
  discussionHeader: { alignItems: 'baseline', flexDirection: 'row', marginTop: 28 },
  discussionTitle: {
    fontFamily: Platform.select({ ios: 'Georgia', default: 'serif' }),
    fontSize: 22,
    fontWeight: '700',
  },
  discussionCount: { fontSize: 12, marginLeft: 10 },
  commentsLoading: { alignItems: 'center', flexDirection: 'row', gap: 10, justifyContent: 'center', padding: 24 },
  commentsLoadingText: { fontSize: 13 },
  noComments: { fontSize: 14, paddingVertical: 28, textAlign: 'center' },
});
