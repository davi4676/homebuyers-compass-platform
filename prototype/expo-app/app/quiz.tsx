import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';

export default function QuizScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz</Text>
      <Text style={styles.text}>Quiz flow can be implemented here. Same logic as the web app can be shared or adapted.</Text>
      <Link href="/" asChild>
        <Pressable>
          <Text style={styles.link}>← Back to Home</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#475569',
    marginBottom: 24,
  },
  link: {
    fontSize: 16,
    color: '#e11d48',
    fontWeight: '600',
  },
});
