
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { colors, fonts } from '../theme';
import FilmCard from './FilmCard';

export default function FilmRow({
  title,
  films,
  favoriteIds,
  onOpen,
  onToggleFavorite,
}) {
  const { width } = useWindowDimensions();

  const cardWidth = width * 0.44;

  return (
    <View style={styles.row}>
      {title ? (
        <Text style={styles.title}>
          {title}
        </Text>
      ) : null}

      <FlatList
        horizontal
        data={films}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => (
          <View style={styles.gap} />
        )}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <FilmCard
              film={item}
              isFavorite={favoriteIds.includes(item.id)}
              onPress={() => onOpen(item)}
              onToggleFavorite={() =>
                onToggleFavorite(item.id)
              }
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: 24,
  },

  title: {
    fontFamily: fonts.title,
    fontSize: 20,
    color: colors.text,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  list: {
    paddingHorizontal: 16,
  },

  gap: {
    width: 12,
  },
});
