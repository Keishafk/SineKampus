import { View, Text, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { colors, fonts } from '../theme';
import FilmCard from './FilmCard';

// One row: a title on top and posters that scroll sideways
export default function FilmRow({ title, films, favoriteIds, onOpen, onToggleFavorite }) {
  // The phone's screen width, so the card size adapts to any phone
  const { width } = useWindowDimensions();
  // Each card is 44% of the screen, so about 2 and a half cards are visible
  const cardWidth = width * 0.44;

  return (
    <View style={styles.row}>
      {/* The row title, like "Winners of SineLikha 2025" */}
      <Text style={styles.title}>{title}</Text>

      <FlatList
        // horizontal makes the list scroll sideways instead of down
        horizontal
        data={films}
        keyExtractor={(item) => item.id}
        // Hides the scroll bar at the bottom of the row
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        // A 12px gap between posters
        ItemSeparatorComponent={() => <View style={styles.gap} />}
        renderItem={({ item }) => (
          // A fixed width keeps every poster the same size
          <View style={{ width: cardWidth }}>
            <FilmCard
              film={item}
              isFavorite={favoriteIds.includes(item.id)}
              onPress={() => onOpen(item)}
              onToggleFavorite={() => onToggleFavorite(item.id)}
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Space between one row and the next
  row: { marginBottom: 24 },
  title: { fontFamily: fonts.title, fontSize: 20, color: colors.text, paddingHorizontal: 16, marginBottom: 12 },
  // Space at the start and end of the row
  list: { paddingHorizontal: 16 },
  gap: { width: 12 },
});