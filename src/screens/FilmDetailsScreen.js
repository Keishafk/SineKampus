import { View, Text, Image, Pressable, ScrollView, Linking, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';
import { films } from '../data/films';

// Receives route (has the film id) plus the favorites props from App.js
export default function FilmDetailsScreen({ route, favoriteIds, toggleFavorite }) {
  // The phone's screen width, so the poster size adapts to any phone
  const { width } = useWindowDimensions();

  // TODO (SineKampus): change 0.42 to make the poster bigger or smaller
  const posterWidth = width * 0.42;
  // Height is 1.5 times the width, which keeps the 2:3 poster shape
  const posterHeight = posterWidth * 1.5;

  // Finds the tapped film in films.js using the id sent from the previous screen
  const film = films.find((f) => f.id === route.params.filmId);

  // Shows a message instead of crashing if the film id isn't found
  if (!film) {
    return (
      <View style={styles.screen}>
        <Text style={styles.missing}>Film not found. Check the ids in films.js.</Text>
      </View>
    );
  }

  // True if this film is in the favorites list
  const isFavorite = favoriteIds.includes(film.id);

  // Opens the film's link, or shows a message if there is none yet
  const watchNow = () => {
    if (film.link) {
      Linking.openURL(film.link);
    } else {
      Alert.alert('Coming soon', 'No link has been added for this film yet.');
    }
  };

  return (
    // ScrollView lets the page scroll if the description is long
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Poster with a fixed pixel size, or the dark fallback box when poster is null */}
      {film.poster ? (
        <Image
          source={film.poster}
          style={{ width: posterWidth, height: posterHeight, borderRadius: 14 }}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.fallback, { width: posterWidth, height: posterHeight }]}>
          <Text style={styles.fallbackText}>{film.title}</Text>
        </View>
      )}

      {/* Film title in the serif font */}
      <Text style={styles.title}>{film.title}</Text>

      {/* Genre, year, and department shown as small pills */}
      <View style={styles.tags}>
        <Text style={styles.tag}>{film.genre}</Text>
        <Text style={styles.tag}>{film.year}</Text>
        <Text style={styles.tag}>{film.department}</Text>
      </View>

      {/* Buttons row: Watch now takes the space, the heart sits beside it */}
      <View style={styles.buttons}>
        <Pressable style={styles.watchButton} onPress={watchNow}>
          <Ionicons name="play" size={18} color={colors.text} />
          <Text style={styles.watchText}>Watch now</Text>
        </Pressable>

        {/* Heart icon button, filled and green when favorited */}
        <Pressable style={styles.heartButton} onPress={() => toggleFavorite(film.id)}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? colors.accentLight : colors.text}
          />
        </Pressable>
      </View>

      {/* Description shows only if the film has one */}
      {film.description ? <Text style={styles.description}>{film.description}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  // alignItems centers everything horizontally
  content: { alignItems: 'center', padding: 20, paddingBottom: 40 },
  missing: { fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', marginTop: 60 },
  fallback: { backgroundColor: colors.surface, borderRadius: 14, justifyContent: 'center', alignItems: 'center', padding: 12 },
  fallbackText: { fontFamily: fonts.title, fontSize: 18, color: colors.text, textAlign: 'center' },
  title: { fontFamily: fonts.title, fontSize: 26, color: colors.text, textAlign: 'center', marginTop: 20 },
  // flexWrap moves pills to the next line if they don't fit
  tags: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 14 },
  tag: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  // Row with Watch now and the heart, stretches to the full width
  buttons: { flexDirection: 'row', gap: 10, width: '100%', marginTop: 24 },
  // flex: 1 makes the Watch now button take all the leftover space
  watchButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    height: 48,
    borderRadius: 12,
  },
  watchText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  // Square heart button, same height as Watch now
  heartButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  // Text under the buttons, left aligned for easier reading
  description: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: colors.textMuted, marginTop: 24, width: '100%' },
});