
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import { getFilm } from '../api/films';
import FacebookVideoModal from '../components/FacebookVideoModal';

const departmentIcons = {
  'College of Criminal Justice and Sciences': 'shield-checkmark-outline',
  'College of Nursing': 'medkit-outline',
  'College of Engineering and Architecture': 'construct-outline',
  'College of Management': 'briefcase-outline',
  'College of Education': 'school-outline',
  'College of Agriculture and Technology': 'leaf-outline',
  'College of Computing and Information Sciences': 'laptop-outline',
};

export default function FilmDetailsScreen({
  route,
  favoriteIds,
  toggleFavorite,
  films,
}) {
  const { width } = useWindowDimensions();

  const posterWidth = width * 0.48;

  const cachedFilm = films.find(
    (f) => f.id === route.params.filmId
  );

  const [film, setFilm] = useState(cachedFilm ?? null);
  const [loading, setLoading] = useState(!cachedFilm);
  const [error, setError] = useState(null);
  const [playerVisible, setPlayerVisible] = useState(false);
  const [loadedPosterRatio, setLoadedPosterRatio] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    getFilm(route.params.filmId, controller.signal)
      .then((loadedFilm) => {
        if (!controller.signal.aborted) {
          setFilm(loadedFilm);
          setError(null);
        }
      })
      .catch((requestError) => {
        if (
          requestError.name !== 'AbortError' &&
          !controller.signal.aborted
        ) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [cachedFilm, route.params.filmId]);

  if (loading && !film) {
    return (
      <View style={styles.screen}>
        <ActivityIndicator
          color={colors.accentLight}
          style={styles.loading}
        />
      </View>
    );
  }

  if (!film) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>
          {error ?? 'Film not found.'}
        </Text>
      </View>
    );
  }

  const isFavorite = favoriteIds.includes(film.id);

  const genre = Array.isArray(film.genres)
    ? film.genres.join(', ')
    : film.genre;

  const departmentIcon =
    departmentIcons[film.department] ?? 'school-outline';

  const posterAspectRatio = loadedPosterRatio ?? 2 / 3;

  const watchNow = () => {
    if (film.link) {
      setPlayerVisible(true);
    } else {
      Alert.alert(
        'Coming soon',
        'No link has been added for this film yet.'
      );
    }
  };

  return (
    <>
      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <ImageBackground
            source={require('../../assets/images/movie-details-bg.png')}
            style={[styles.heroBackground, { width }]}
            resizeMode="cover"
          >
            <View style={styles.backdropOverlay} />

            <LinearGradient
              colors={[
                'rgba(11, 16, 16, 0)',
                'rgba(11, 16, 16, 0.65)',
                colors.background,
              ]}
              locations={[0, 0.55, 1]}
              style={styles.bottomFade}
              pointerEvents="none"
            />

            <View style={styles.hero}>
              {film.poster ? (
                <View
                  style={[
                    styles.posterContainer,
                    {
                      width: posterWidth,
                      aspectRatio: posterAspectRatio,
                    },
                  ]}
                >
                  <Image
                    source={film.poster}
                    style={styles.poster}
                    resizeMode="contain"
                    onLoad={({ nativeEvent }) => {
                      const {
                        width: imageWidth,
                        height: imageHeight,
                      } = nativeEvent.source;

                      if (imageWidth && imageHeight) {
                        setLoadedPosterRatio(
                          imageWidth / imageHeight
                        );
                      }
                    }}
                  />
                </View>
              ) : (
                <View
                  style={[
                    styles.fallback,
                    {
                      width: posterWidth,
                      aspectRatio: posterAspectRatio,
                    },
                  ]}
                >
                  <Text style={styles.fallbackText}>
                    {film.title}
                  </Text>
                </View>
              )}

              <Text style={styles.title}>
                {film.title}
              </Text>

              <View style={styles.movieMeta}>
                {genre ? (
                  <Text style={styles.genre}>
                    {genre}
                  </Text>
                ) : null}

                {genre && film.year ? (
                  <Text style={styles.metaSeparator}>•</Text>
                ) : null}

                {film.year ? (
                  <Text style={styles.year}>
                    {film.year}
                  </Text>
                ) : null}
              </View>

              {film.department ? (
                <View style={styles.department}>
                  <Ionicons
                    name={departmentIcon}
                    size={17}
                    color={colors.accentLight}
                  />
                  <Text style={styles.departmentText}>
                    {film.department}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.buttons}>
              <Pressable
                style={styles.watchButton}
                onPress={watchNow}
              >
                <Ionicons
                  name="play"
                  size={17}
                  color={colors.text}
                />
                <Text style={styles.watchText}>
                  Watch Now
                </Text>
              </Pressable>

              <Pressable
                style={styles.heartButton}
                onPress={() => toggleFavorite(film.id)}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={
                    isFavorite
                      ? colors.accentLight
                      : colors.text
                  }
                />
              </Pressable>
            </View>
          </ImageBackground>

          {film.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Synopsis
              </Text>

              <Text style={styles.description}>
                {film.description}
              </Text>
            </View>
          ) : null}

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>
              Movie Information
            </Text>

            {genre ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Genre
                </Text>
                <Text style={styles.infoValue}>
                  {genre}
                </Text>
              </View>
            ) : null}

            {film.year ? (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  Release Year
                </Text>
                <Text style={styles.infoValue}>
                  {film.year}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>

      {playerVisible && (
        <FacebookVideoModal
          visible
          videoUrl={film.link}
          onClose={() => setPlayerVisible(false)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingBottom: 60,
  },

  loading: {
    flex: 1,
  },

  missing: {
    color: colors.text,
    fontFamily: fonts.body,
    textAlign: 'center',
    marginTop: 40,
  },

  heroBackground: {
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 28,
    overflow: 'hidden',
  },

  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 8, 12, 0.48)',
  },

  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 170,
  },

  hero: {
    width: '100%',
    alignItems: 'center',
  },

  posterContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  poster: {
    width: '100%',
    height: '100%',
  },

  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
  },

  fallbackText: {
    color: colors.text,
    fontFamily: fonts.title,
    textAlign: 'center',
  },

  title: {
    color: colors.text,
    fontFamily: fonts.title,
    fontSize: 28,
    textAlign: 'center',
    marginTop: 20,
  },

  movieMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 8,
  },

  genre: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  metaSeparator: {
    color: colors.textMuted,
    fontSize: 14,
  },

  year: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },

  department: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 8,
  },

  departmentText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 13,
    textAlign: 'center',
    flexShrink: 1,
  },

  buttons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 22,
    width: '100%',
  },

  watchButton: {
    flex: 1,
    height: 50,
    backgroundColor: colors.accent,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  watchText: {
    color: colors.text,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
  },

  heartButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  section: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 26,
  },

  infoSection: {
    width: '100%',
    paddingHorizontal: 24,
    marginTop: 42,
  },

  sectionTitle: {
    color: colors.text,
    fontFamily: fonts.title,
    fontSize: 21,
    marginBottom: 14,
  },

  description: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 23,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 5,
    gap: 16,
  },

  infoLabel: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: 14,
  },

  infoValue: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
});