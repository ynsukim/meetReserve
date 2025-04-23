import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="drawingCanvas/index"
          options={{ presentation: 'fullScreenModal' }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
} 