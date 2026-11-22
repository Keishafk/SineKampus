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
import { films } from './src/data/films';
import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import FilmDetailsScreen from './src/screens/FilmDetailsScreen';
import SaveToFolderSheet from './src/components/SaveToFolderSheet';

// The name the folders are saved under
const FOLDERS_KEY = 'sinekampus_folders';

// Folders every user starts with
const DEFAULT_FOLDERS = [
  { id: 'watch-later', name: 'Watch Later', filmIds: [] },
  { id: 'my-favorites', name: 'My Favorites', filmIds: [] },
  { id: 'already-watched', name: 'Already Watched', filmIds: [] },
];

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
function getSaved(key) {
  if (Platform.OS === 'web') {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  return Storage.getItemSync(key);
}

function save(key, value) {
  if (Platform.OS === 'web') {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore browser storage errors
    }
    return;
  }

  Storage.setItemSync(key, value);
}

// Reads the saved folders, or falls back to the default ones
function loadFolders() {
  try {
    const saved = getSaved(FOLDERS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_FOLDERS;
  } catch {
    return DEFAULT_FOLDERS;
  }
}

// The bottom tabs: Home and Favorites
function Tabs({ favoriteIds, toggleFavorite, folderApi }) {
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
            name={route.name === 'Home' ? 'home-outline' : 'heart-outline'}
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
        {(props) => <FavoritesScreen {...props} folderApi={folderApi} />}
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

  // All folders, each one: { id, name, filmIds: [] }
  const [folders, setFolders] = useState(loadFolders);

  // The film id whose "Save to Folder" sheet is open (null = closed)
  const [sheetFilmId, setSheetFilmId] = useState(null);

  // Saves the new folders list in state and in storage
  const updateFolders = (next) => {
    setFolders(next);
    save(FOLDERS_KEY, JSON.stringify(next));
  };

  // Make a new folder (optionally with some films already inside)
  const createFolder = (name, filmIds = []) => {
    updateFolders([...folders, { id: Date.now().toString(), name, filmIds }]);
  };

  const renameFolder = (folderId, name) => {
    updateFolders(folders.map((f) => (f.id === folderId ? { ...f, name } : f)));
  };

  const deleteFolder = (folderId) => {
    updateFolders(folders.filter((f) => f.id !== folderId));
  };

  // Add the film if it's not in the folder, remove it if it is
  const toggleFilmInFolder = (folderId, filmId) => {
    updateFolders(
      folders.map((f) =>
        f.id !== folderId
          ? f
          : {
              ...f,
              filmIds: f.filmIds.includes(filmId)
                ? f.filmIds.filter((x) => x !== filmId)
                : [...f.filmIds, filmId],
            }
      )
    );
  };

  // Add many films at once (used by "Add Movies")
  const addFilmsToFolder = (folderId, filmIds) => {
    updateFolders(
      folders.map((f) =>
        f.id !== folderId
          ? f
          : { ...f, filmIds: [...new Set([...f.filmIds, ...filmIds])] }
      )
    );
  };

  // Everything the Favorites screen needs, in one object
  const folderApi = {
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    toggleFilmInFolder,
    addFilmsToFolder,
  };

  // A film shows a filled heart if it is inside ANY folder
  const favoriteIds = [...new Set(folders.flatMap((f) => f.filmIds))];

  // The heart now opens the "Save to Folder" sheet instead of toggling
  const toggleFavorite = (id) => setSheetFilmId(id);

  // Show nothing until fonts are ready
  if (!loaded) return null;

  const sheetFilm = films.find((f) => f.id === sheetFilmId);

  return (
    <>
      <StatusBar style="light" />

      <NavigationContainer theme={navTheme}>
        <Stack.Navigator>
          <Stack.Screen name="Tabs" options={{ headerShown: false }}>
            {() => (
              <Tabs
                favoriteIds={favoriteIds}
                toggleFavorite={toggleFavorite}
                folderApi={folderApi}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="FilmDetails"
            options={{
              title: '',
              headerTintColor: colors.text,
              headerStyle: { backgroundColor: colors.background },
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

      {/* The "Save to Folder" popup, works from any screen */}
      <SaveToFolderSheet
        visible={sheetFilmId !== null}
        filmTitle={sheetFilm?.title ?? ''}
        filmId={sheetFilmId}
        folders={folders}
        onToggle={(folderId) => toggleFilmInFolder(folderId, sheetFilmId)}
        onCreate={(name) => createFolder(name, [sheetFilmId])}
        onClose={() => setSheetFilmId(null)}
      />
    </>
  );
}