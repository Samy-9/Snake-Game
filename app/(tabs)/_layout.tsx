import { Tabs } from 'expo-router';
import { Platform, useWindowDimensions } from 'react-native';
import { Gamepad as Game, Chrome as Home } from 'lucide-react-native';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <Tabs 
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000000',
          borderTopWidth: 0,
          ...(isLargeScreen ? {
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 80,
            height: '100%',
            paddingTop: Platform.OS === 'web' ? 20 : 60,
            flexDirection: 'column',
            alignItems: 'center',
          } : {}),
        },
        tabBarItemStyle: {
          ...(isLargeScreen ? {
            height: 60,
            width: '100%',
            marginVertical: 10,
          } : {}),
        },
        tabBarActiveTintColor: '#4ade80',
        tabBarInactiveTintColor: '#6b7280',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Snake',
          tabBarIcon: ({ size, color }) => (
            <Game size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}