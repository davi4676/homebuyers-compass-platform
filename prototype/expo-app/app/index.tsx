import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>🧭</Text>
        <Text style={styles.title}>Homebuyer&apos;s Compass</Text>
        <Text style={styles.subtitle}>
          Your homebuying journey, all in one place. Get your free guide, compare options, and track your progress.
        </Text>
      </View>
      <View style={styles.actions}>
        <Link href="/quiz" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Get my free guide</Text>
          </Pressable>
        </Link>
      </View>
      <Text style={styles.footer}>Built with Expo SDK 54 • React Native • Web, iOS & Android</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
    maxWidth: 400,
  },
  emoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
  },
  primaryButton: {
    backgroundColor: '#e11d48',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 24 : 40,
    fontSize: 12,
    color: '#94a3b8',
  },
});
