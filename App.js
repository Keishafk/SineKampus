
import { useCallback, useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, PlayfairDisplay_500Medium } from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';

import { colors, fonts } from './src/theme';
import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import FilmDetailsScreen from './src/screens/FilmDetailsScreen';
import SaveToFolderSheet from './src/components/SaveToFolderSheet';
import { getFilms } from './src/api/films';

const FAVORITES_KEY = 'sinekampus_favorites';
const FOLDERS_KEY = 'sinekampus_folders';

const DEFAULT_FOLDERS = [
  {
    id: 'watch-later',
    name: 'Watch Later',
    filmIds: [],
  },
  {
    id: 'my-favorites',
    name: 'My Favorites',
    filmIds: [],
  },
  {
    id: 'already-watched',
    name: 'Already Watched',
    filmIds: [],
  },
];

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

function Tabs({
  favoriteIds,
  toggleFavorite,
  films,
  filmsLoading,
  filmsError,
  reloadFilms,
  folderApi,
}) {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarActiveTintColor: colors.accentLight,
        tabBarInactiveTintColor: colors.textMuted,

        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 70 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 16) + 14,
          paddingTop: 8,
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
            films={films}
            loading={filmsLoading}
            error={filmsError}
            onRetry={reloadFilms}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Favorites">
        {(props) => (
          <FavoritesScreen
            {...props}
            favoriteIds={favoriteIds}
            toggleFavorite={toggleFavorite}
            films={films}
            loading={filmsLoading}
            error={filmsError}
            onRetry={reloadFilms}
            folderApi={folderApi}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export default function App() {
  const [loaded] = useFonts({
    PlayfairDisplay_500Medium,
    Inter_400Regular,
    Inter_500Medium,
  });

  const [folders, setFolders] = useState(DEFAULT_FOLDERS);
  const [foldersLoaded, setFoldersLoaded] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState(null);

  const [films, setFilms] = useState([]);
  const [filmsLoading, setFilmsLoading] = useState(true);
  const [filmsError, setFilmsError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadFolders() {
      try {
        const savedFolders = await AsyncStorage.getItem(FOLDERS_KEY);

        if (savedFolders) {
          const parsedFolders = JSON.parse(savedFolders);

          if (Array.isArray(parsedFolders)) {
            const validFolders = parsedFolders
              .filter((folder) => folder && folder.id && folder.name)
              .map((folder) => ({
                id: String(folder.id),
                name: String(folder.name),
                filmIds: Array.isArray(folder.filmIds)
                  ? folder.filmIds.map(String)
                  : [],
              }));

            if (active) {
              setFolders(validFolders);
            }

            return;
          }
        }

        // Migrate existing favorites into the default My Favorites folder.
        const savedFavorites = await AsyncStorage.getItem(FAVORITES_KEY);

        if (savedFavorites) {
          const oldFavoriteIds = savedFavorites
            .split(',')
            .filter(Boolean);

          const migratedFolders = DEFAULT_FOLDERS.map((folder) => ({
            ...folder,
            filmIds:
              folder.id === 'my-favorites'
                ? oldFavoriteIds
                : [],
          }));

          if (active) {
            setFolders(migratedFolders);
          }
        }
      } catch (error) {
        console.warn('Could not load favorite folders:', error);
      } finally {
        if (active) {
          setFoldersLoaded(true);
        }
      }
    }

    loadFolders();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!foldersLoaded) return;

    AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(folders)).catch(() => {
      // Folder changes remain available for this session if storage fails.
    });
  }, [folders, foldersLoaded]);

  // Load films when the app starts.
  useEffect(() => {
    const controller = new AbortController();

    getFilms(controller.signal)
      .then((loadedFilms) => {
        if (!controller.signal.aborted) {
          setFilms(loadedFilms);
          setFilmsError(null);
        }
      })
      .catch((error) => {
        if (
          error.name !== 'AbortError' &&
          !controller.signal.aborted
        ) {
          setFilmsError(error.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setFilmsLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  // Used when the user manually retries loading films.
  const reloadFilms = useCallback(async () => {
    setFilmsLoading(true);
    setFilmsError(null);

    try {
      const loadedFilms = await getFilms();

      setFilms(loadedFilms);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setFilmsError(error.message);
      }
    } finally {
      setFilmsLoading(false);
    }
  }, []);

  // Combine film IDs from every folder.
  const favoriteIds = useMemo(() => {
    const ids = new Set();

    folders.forEach((folder) => {
      folder.filmIds.forEach((id) => {
        ids.add(String(id));
      });
    });

    return Array.from(ids);
  }, [folders]);

  const createFolder = useCallback((name) => {
    const trimmedName = name.trim();

    if (!trimmedName) return null;

    const newFolder = {
      id: `folder-${Date.now()}`,
      name: trimmedName,
      filmIds: [],
    };

    setFolders((current) => [...current, newFolder]);

    return newFolder.id;
  }, []);

  const renameFolder = useCallback((folderId, name) => {
    const trimmedName = name.trim();

    if (!trimmedName) return;

    setFolders((current) =>
      current.map((folder) =>
        folder.id === folderId
          ? { ...folder, name: trimmedName }
          : folder
      )
    );
  }, []);

  const deleteFolder = useCallback((folderId) => {
    setFolders((current) =>
      current.filter((folder) => folder.id !== folderId)
    );
  }, []);

  const toggleFilmInFolder = useCallback((folderId, filmId) => {
    const normalizedFilmId = String(filmId);

    setFolders((current) =>
      current.map((folder) => {
        if (folder.id !== folderId) return folder;

        const exists = folder.filmIds.some(
          (id) => String(id) === normalizedFilmId
        );

        return {
          ...folder,
          filmIds: exists
            ? folder.filmIds.filter(
                (id) => String(id) !== normalizedFilmId
              )
            : [...folder.filmIds, normalizedFilmId],
        };
      })
    );
  }, []);

  const addFilmsToFolder = useCallback((folderId, filmIds) => {
    const normalizedIds = filmIds.map(String);

    setFolders((current) =>
      current.map((folder) => {
        if (folder.id !== folderId) return folder;

        const existingIds = new Set(
          folder.filmIds.map(String)
        );

        return {
          ...folder,
          filmIds: [
            ...folder.filmIds,
            ...normalizedIds.filter((id) => !existingIds.has(id)),
          ],
        };
      })
    );
  }, []);

  const openSaveToFolder = useCallback((filmId) => {
    const film = films.find(
      (item) => String(item.id) === String(filmId)
    );

    setSelectedFilm({
      id: String(filmId),
      title: film?.title || 'this film',
    });
  }, [films]);

  const createFolderWithFilm = useCallback((name, filmId) => {
    const folderId = createFolder(name);

    if (folderId) {
      addFilmsToFolder(folderId, [filmId]);
    }
  }, [createFolder, addFilmsToFolder]);

  const folderApi = {
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    toggleFilmInFolder,
    addFilmsToFolder,
  };

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
                toggleFavorite={openSaveToFolder}
                films={films}
                filmsLoading={filmsLoading}
                filmsError={filmsError}
                reloadFilms={reloadFilms}
                folderApi={folderApi}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="FilmDetails"
            options={{
              title: '',
              headerTintColor: colors.text,
              headerTransparent: true,
              headerStyle: {
                backgroundColor: 'transparent',
              },
              headerShadowVisible: false,
            }}
          >
            {(props) => (
              <FilmDetailsScreen
                {...props}
                favoriteIds={favoriteIds}
                toggleFavorite={openSaveToFolder}
                films={films}
                filmsLoading={filmsLoading}
                filmsError={filmsError}
                reloadFilms={reloadFilms}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>

      <SaveToFolderSheet
        visible={Boolean(selectedFilm)}
        filmId={selectedFilm?.id}
        filmTitle={selectedFilm?.title}
        folders={folders}
        onToggle={toggleFilmInFolder}
        onCreate={createFolderWithFilm}
        onClose={() => setSelectedFilm(null)}
      />
    </>
  );
}
