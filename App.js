import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, PlayfairDisplay_500Medium } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
// The phone's key-value storage, like a small notebook
import Storage from 'expo-sqlite/kv-store';
import { colors, fonts, layout } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import FilmDetailsScreen from './src/screens/FilmDetailsScreen';

// The name the favorites are saved under
const KEY = 'sinekampus_favorites';

// Tabs sit at the bottom, the Stack opens screens on top of them
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Makes the navigation backgrounds match our dark theme
const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, card: colors.background, border: colors.border, text: colors.text },
};

// The bottom tabs: Home and Favorites
function Tabs({ favoriteIds, toggleFavorite }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Hides the top header, our screens draw their own titles
        headerShown: false,
        // Active tab is light green, inactive is gray
        tabBarActiveTintColor: colors.accentLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          // NAVBAR HEIGHT: change tabBarHeight in theme.js
          height: layout.tabBarHeight,
          // Space under the icons: change tabBarBottomPadding in theme.js
          paddingBottom: layout.tabBarBottomPadding,
          // Small space above the icons
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11 },
        // Picks the icon for each tab by its name
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={route.name === 'Home' ? 'home-outline' : 'heart-outline'} size={size} color={color} />
        ),
      })}
    >
      {/* Passes the favorites props down to each screen */}
      <Tab.Screen name="Home">
        {(props) => <HomeScreen {...props} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />}
      </Tab.Screen>
      <Tab.Screen name="Favorites">
        {(props) => <FavoritesScreen {...props} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  // Loads the fonts, "loaded" becomes true when they're ready
  const [loaded] = useFonts({ PlayfairDisplay_500Medium, Inter_400Regular, Inter_500Medium });

  // Starts with whatever was saved last time, like '1,3' turned into ['1','3']
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const saved = Storage.getItemSync(KEY);
    return saved ? saved.split(',') : [];
  });

  // Removes the id if it's already a favorite, adds it if not
  const toggleFavorite = (id) => {
    const next = favoriteIds.includes(id)
      ? favoriteIds.filter((x) => x !== id)
      : [...favoriteIds, id];
    setFavoriteIds(next);
    // Saves the list as plain text like '1,3'
    Storage.setItemSync(KEY, next.join(','));
  };

  // Show nothing until the fonts are ready
  if (!loaded) return null;

  return (
    <>
      {/* Light status bar icons for the dark background */}
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator>
          {/* The first stack screen is the tabs, with no header */}
          <Stack.Screen name="Tabs" options={{ headerShown: false }}>
            {() => <Tabs favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />}
          </Stack.Screen>
          {/* The details screen opens on top, with a back arrow */}
          <Stack.Screen
            name="FilmDetails"
            options={{ title: '', headerTintColor: colors.text, headerStyle: { backgroundColor: colors.background }, headerShadowVisible: false }}
          >
            {(props) => <FilmDetailsScreen {...props} favoriteIds={favoriteIds} toggleFavorite={toggleFavorite} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}