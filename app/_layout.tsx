import { Tabs } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { t } from '../theme';

const icon = (glyph: string) => ({ color }: { color: string }) => (
  <Text style={{ color, fontSize: 20 }}>{glyph}</Text>
);

export default function RootLayout() {
  return (
    <>
      <Head>
        <title>Hanzo Chat</title>
      </Head>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: t.accent,
          tabBarInactiveTintColor: t.dim,
          tabBarStyle: { backgroundColor: t.card, borderTopColor: t.line },
          headerStyle: { backgroundColor: t.bg },
          headerTintColor: t.text,
          sceneStyle: { backgroundColor: t.bg },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Chat', tabBarIcon: icon('◆') }} />
        <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: icon('⚙') }} />
      </Tabs>
    </>
  );
}
