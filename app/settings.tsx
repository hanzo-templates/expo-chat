import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { setConfig, useConfig } from '../hanzo';
import { t } from '../theme';

export default function Settings() {
  const cfg = useConfig();
  return (
    <ScrollView style={s.wrap} contentContainerStyle={{ padding: t.pad, gap: 18 }}>
      <Field label="API base" value={cfg.base} onChange={(base) => setConfig({ base })} />
      <Field label="Model" value={cfg.model} onChange={(model) => setConfig({ model })} />
      <Field label="API key" value={cfg.key} onChange={(key) => setConfig({ key })} secure
        hint="Held in memory only. Persist it with expo-secure-store before you ship." />
    </ScrollView>
  );
}

function Field({ label, value, onChange, secure, hint }: {
  label: string; value: string; onChange: (v: string) => void; secure?: boolean; hint?: string;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={s.input}
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={secure ? 'sk-…' : undefined}
        placeholderTextColor={t.dim}
      />
      {hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: t.bg },
  label: { color: t.text, fontSize: 15, fontWeight: '600' },
  hint: { color: t.dim, fontSize: 13, lineHeight: 18 },
  input: {
    backgroundColor: t.card, color: t.text, borderRadius: t.radius, borderWidth: 1,
    borderColor: t.line, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16,
  },
});
