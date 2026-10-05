import { useState } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, PlayfairDisplay_500Medium } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
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
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    border: colors.border,
    text: colors.text,
  },
};

// Storage helpers
function getFavorites() {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }

  return Storage.getItemSync(KEY);
}

function saveFavorites(value) {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      // Ignore browser storage errors
    }
    return;
  }

  Storage.setItemSync(KEY, value);
}

// The bottom tabs: Home and Favorites
function Tabs({ favoriteIds, toggleFavorite }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.accentLight,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: layout.tabBarHeight,
          paddingBottom: layout.tabBarBottomPadding,
          paddingTop: 6,
        },

        tabBarLabelStyle: {
          fontFamily: fonts.body,
          fontSize: 11,
        },

        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={
              route.name === 'Home'
                ? 'home-outline'
                : 'heart-outline'
            }
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home">
        {(props) => (
          <HomeScreen
            {...props}
            favoriteIds={favoriteIds}
            toggleFavorite={toggleFavorite}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Favorites">
        {(props) => (
          <FavoritesScreen
            {...props}
            favoriteIds={favoriteIds}
            toggleFavorite={toggleFavorite}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  // Loads the fonts
  const [loaded] = useFonts({
    PlayfairDisplay_500Medium,
    Inter_400Regular,
    Inter_500Medium,
  });

  // Load saved favorites
  const [favoriteIds, setFavoriteIds] = useState(() => {
    const saved = getFavorites();
    return saved ? saved.split(',') : [];
  });

  // Add/remove favorites
  const toggleFavorite = (id) => {
    const next = favoriteIds.includes(id)
      ? favoriteIds.filter((x) => x !== id)
      : [...favoriteIds, id];

    setFavoriteIds(next);

    // Save favorites
    saveFavorites(next.join(','));
  };

  // Show nothing until fonts are ready
  if (!loaded) return null;

  return (
    <>
      <StatusBar style="light" />

      <NavigationContainer theme={navTheme}>
        <Stack.Navigator>
          <Stack.Screen
            name="Tabs"
            options={{ headerShown: false }}
          >
            {() => (
              <Tabs
                favoriteIds={favoriteIds}
                toggleFavorite={toggleFavorite}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="FilmDetails"
            options={{
              title: '',
              headerTintColor: colors.text,
              headerStyle: {
                backgroundColor: colors.background,
              },
              headerShadowVisible: false,
            }}
          >
            {(props) => (
              <FilmDetailsScreen
                {...props}
                favoriteIds={favoriteIds}
                toggleFavorite={toggleFavorite}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}