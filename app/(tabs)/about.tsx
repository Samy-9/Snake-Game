import { View, Text, StyleSheet, Platform } from 'react-native';

export default function About() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How to Play Snake</Text>
      <View style={styles.instructionsContainer}>
        <Text style={styles.subtitle}>Game Modes:</Text>
        <Text style={styles.text}>• Classic: Traditional snake game</Text>
        <Text style={styles.text}>• Ghost: Snake can pass through itself</Text>
        <Text style={styles.text}>• Portal: Snake can travel through walls</Text>
        
        <Text style={styles.subtitle}>Controls:</Text>
        {Platform.OS === 'web' ? (
          <Text style={styles.text}>Use arrow keys to control the snake</Text>
        ) : (
          <Text style={styles.text}>Use the on-screen buttons to control the snake</Text>
        )}
        
        <Text style={styles.subtitle}>Rules:</Text>
        <Text style={styles.text}>• Eat the apples to grow longer</Text>
        <Text style={styles.text}>• Don't hit the walls (except in Portal mode)</Text>
        <Text style={styles.text}>• Don't collide with yourself (except in Ghost mode)</Text>
        <Text style={styles.text}>• Try to get the highest score!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionsContainer: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  subtitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    color: '#d1d5db',
    marginBottom: 8,
    lineHeight: 24,
  },
});