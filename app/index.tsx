import { useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable,
  StyleSheet, Text, TextInput, View,
} from 'react-native';
import { complete, Msg, useConfig } from '../hanzo';
import { t } from '../theme';

const GREETING: Msg = {
  role: 'assistant',
  content: 'Ask me anything. Set a Hanzo API key in Settings to talk to a real model.',
};

export default function Chat() {
  const cfg = useConfig();
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const list = useRef<FlatList<Msg>>(null);

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    setDraft('');
    setErr(null);
    setBusy(true);

    // Push the user turn plus an empty assistant turn, then stream into it.
    const history = [...msgs.filter((m) => m !== GREETING), { role: 'user', content: text } as Msg];
    setMsgs([...history, { role: 'assistant', content: '' }]);

    try {
      await complete(history, (chunk) =>
        setMsgs((prev) => {
          const next = prev.slice();
          next[next.length - 1] = {
            role: 'assistant',
            content: next[next.length - 1].content + chunk,
          };
          return next;
        }),
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setMsgs(history);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={s.wrap}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <FlatList
        ref={list}
        data={msgs}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: t.pad, gap: 10 }}
        onContentSizeChange={() => list.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => <Bubble msg={item} />}
      />
      {err && <Text style={s.err}>{err}</Text>}
      <View style={s.bar}>
        <TextInput
          style={s.input}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={send}
          placeholder={cfg.key ? `Message ${cfg.model}` : 'Set a key in Settings'}
          placeholderTextColor={t.dim}
          multiline
        />
        <Pressable style={[s.send, (busy || !draft.trim()) && { opacity: 0.4 }]} onPress={send}>
          {busy ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.sendText}>↑</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const mine = msg.role === 'user';
  return (
    <View style={[s.bubble, mine ? s.mine : s.theirs]}>
      <Text style={[s.text, mine && { color: '#fff' }]}>{msg.content || '…'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: t.bg },
  bubble: { maxWidth: '86%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  mine: { alignSelf: 'flex-end', backgroundColor: t.accent, borderBottomRightRadius: 4 },
  theirs: { alignSelf: 'flex-start', backgroundColor: t.card, borderWidth: 1, borderColor: t.line, borderBottomLeftRadius: 4 },
  text: { color: t.text, fontSize: 16, lineHeight: 23 },
  err: { color: '#ff6b6b', fontSize: 13, paddingHorizontal: t.pad, paddingBottom: 6 },
  bar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: t.pad,
    borderTopWidth: 1, borderTopColor: t.line, backgroundColor: t.bg,
  },
  input: {
    flex: 1, maxHeight: 120, backgroundColor: t.card, color: t.text, borderRadius: 20,
    borderWidth: 1, borderColor: t.line, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16,
  },
  send: { width: 40, height: 40, borderRadius: 20, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 22 },
});
