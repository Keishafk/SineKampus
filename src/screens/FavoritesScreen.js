import { View, Text, FlatList, StyleSheet } from 'react-native';
import { colors, fonts, layout } from '../theme';
import { films } from '../data/films';
import FilmCard from '../components/FilmCard';

// Receives navigation plus the favorites props from App.js
export default function FavoritesScreen({ navigation, favoriteIds, toggleFavorite }) {
  // Keeps only the films whose id is in the favorites list
  const favoriteFilms = films.filter((f) => favoriteIds.includes(f.id));

  return (
    // A plain View now, the top space comes from layout.topPadding in theme.js
    <View style={styles.screen}>
      <Text style={styles.heading}>Favorites</Text>

      {/* Same 2-column grid as before */}
      <FlatList
        data={favoriteFilms}
        numColumns={2}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <FilmCard
              film={item}
              isFavorite
              // Opens the details screen for this film
              onPress={() => navigation.navigate('FilmDetails', { filmId: item.id })}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          </View>
        )}
        // Shown when there are no favorites yet
        ListEmptyComponent={
          <Text style={styles.empty}>No favorites yet. Go find something to watch.</Text>
        }
      />
    </View>
  );
}
 
const styles = StyleSheet.create({
  // paddingTop is the space above the heading, change it in theme.js
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: layout.topPadding },
  heading: { fontFamily: fonts.title, fontSize: 28, color: colors.text, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  grid: { paddingHorizontal: 10, paddingBottom: 20 },
  // Each cell takes half the width
  cell: { width: '50%', padding: 6 },
  empty: { fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});