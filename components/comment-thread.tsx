import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

import { palette } from '@/constants/palette';
import { plainText, relativeTime } from '@/lib/format';
import type { CommentNode } from '@/types/hn';

type CommentThreadProps = {
  comment: CommentNode;
  depth?: number;
};

export function CommentThread({ comment, depth = 0 }: CommentThreadProps) {
  const [collapsed, setCollapsed] = useState(false);
  const colors = palette[useColorScheme() ?? 'light'];
  const indentation = Math.min(depth, 4) * 12;
  const body = comment.deleted ? '[deleted]' : plainText(comment.text);

  return (
    <View style={[styles.wrapper, { marginLeft: indentation }]}>
      <Pressable
        accessibilityLabel={`${collapsed ? 'Expand' : 'Collapse'} comment by ${comment.by ?? 'unknown'}`}
        accessibilityRole="button"
        hitSlop={8}
        onPress={() => setCollapsed((value) => !value)}
        style={styles.header}>
        <View style={[styles.depthMarker, { backgroundColor: depth ? colors.subtle : colors.accent }]} />
        <Text style={[styles.author, { color: colors.text }]}>{comment.by ?? '[deleted]'}</Text>
        <Text style={[styles.time, { color: colors.muted }]}>{relativeTime(comment.time)}</Text>
        <Text style={[styles.collapse, { color: colors.muted }]}>{collapsed ? '+' : '−'}</Text>
      </Pressable>

      {!collapsed && (
        <>
          <Text selectable style={[styles.body, { color: comment.deleted ? colors.muted : colors.text }]}>
            {body || '[empty comment]'}
          </Text>
          {comment.replies.map((reply) => (
            <CommentThread comment={reply} depth={depth + 1} key={reply.id} />
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 18 },
  header: { alignItems: 'center', flexDirection: 'row', minHeight: 28 },
  depthMarker: { borderRadius: 2, height: 16, marginRight: 8, width: 3 },
  author: { fontSize: 12, fontWeight: '800' },
  time: { fontSize: 12, marginLeft: 7 },
  collapse: { fontSize: 18, fontWeight: '700', marginLeft: 'auto', paddingHorizontal: 8 },
  body: { fontSize: 15, lineHeight: 22, paddingLeft: 11, paddingRight: 4, paddingTop: 6 },
});
