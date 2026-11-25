
import { useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, layout } from '../theme';
import { rows } from '../data/rows';
import FilmRow from '../components/FilmRow';
import FilmCard from '../components/FilmCard';
import FilterSheet from '../components/FilterSheet';

const FILTERS = [
  { key: 'genre', label: 'Genre' },
  { key: 'year', label: 'Year' },
  { key: 'department', label: 'Department' },
];

export default function HomeScreen({
  navigation,
  favoriteIds,
  toggleFavorite,
  films,
  loading,
  error,
  onRetry,
}) {
  const [query, setQuery] = useState('');

  const [filters, setFilters] = useState({
    genre: null,
    year: null,
    department: null,
  });

  const [openFilter, setOpenFilter] = useState(null);

  const searchText = query.trim().toLowerCase();
  const isSearching = searchText.length > 0;

  const uniqueValues = (key) => [
    ...new Set(
      key === 'genre'
        ? films.flatMap((f) => f.genres ?? [f.genre])
        : films.map((f) => f[key])
    ),
  ].sort();

  const visibleFilms = films.filter((f) => {
    const matchesSearch = String(f.title ?? '')
      .trim()
      .toLowerCase()
      .startsWith(searchText);

    const matchesGenre =
      filters.genre === null ||
      (f.genres ?? [f.genre]).includes(filters.genre);

    const matchesYear =
      filters.year === null || f.year === filters.year;

    const matchesDept =
      filters.department === null ||
      f.department === filters.department;

    return (
      matchesSearch &&
      matchesGenre &&
      matchesYear &&
      matchesDept
    );
  });

  const sections = rows.map((row) => ({
    ...row,
    films: visibleFilms.filter((f) =>
      (f.tags ?? []).includes(row.id)
    ),
  }));

  sections.push({
    id: 'all',
    title: 'All Films',
    films: visibleFilms,
  });

  const visibleSections = sections.filter(
    (section) => section.films.length > 0
  );

  const openFilm = (film) => {
    navigation.navigate('FilmDetails', {
      filmId: film.id,
    });
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.logo}>
        Sine<Text style={styles.logoAccent}>Kampus</Text>
      </Text>

      <View style={styles.search}>
        <Ionicons
          name="search"
          size={18}
          color={colors.textMuted}
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Search campus short films"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.chips}>
        {FILTERS.map((f) => {
          const value = filters[f.key];
          const active = value !== null;

          return (
            <Pressable
              key={f.key}
              style={[
                styles.chip,
                active && styles.chipActive,
              ]}
              onPress={() => setOpenFilter(f.key)}
            >
              <Text style={styles.chipText}>
                {active ? String(value) : f.label}
              </Text>

              <Ionicons
                name="chevron-down"
                size={14}
                color={colors.text}
              />
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {loading && films.length === 0 && (
          <ActivityIndicator
            color={colors.accentLight}
            style={styles.status}
          />
        )}

        {error && films.length === 0 && (
          <View style={styles.status}>
            <Text style={styles.empty}>
              Films could not be loaded. {error}
            </Text>

            <Pressable
              style={styles.retryButton}
              onPress={onRetry}
            >
              <Text style={styles.retryText}>
                Try again
              </Text>
            </Pressable>
          </View>
        )}

        {isSearching ? (
          <View style={styles.searchResults}>
            {visibleFilms.map((film) => (
              <View
                key={film.id}
                style={styles.searchResultRow}
              >
                <View style={styles.searchResultCard}>
                  <FilmCard
                    film={film}
                    isFavorite={favoriteIds.includes(film.id)}
                    onPress={() => openFilm(film)}
                    onToggleFavorite={() =>
                      toggleFavorite(film.id)
                    }
                  />
                </View>
              </View>
            ))}
          </View>
        ) : (
          visibleSections.map((section) => (
            <FilmRow
              key={section.id}
              title={section.title}
              films={section.films}
              favoriteIds={favoriteIds}
              onOpen={openFilm}
              onToggleFavorite={toggleFavorite}
            />
          ))
        )}

        {!loading &&
          !error &&
          visibleFilms.length === 0 && (
            <Text style={styles.empty}>
              No films found. Try another search.
            </Text>
          )}
      </ScrollView>

      <FilterSheet
        visible={openFilter !== null}
        title={
          FILTERS.find((f) => f.key === openFilter)?.label ?? ''
        }
        options={
          openFilter ? uniqueValues(openFilter) : []
        }
        selected={
          openFilter ? filters[openFilter] : null
        }
        onSelect={(value) => {
          setFilters({
            ...filters,
            [openFilter]: value,
          });
          setOpenFilter(null);
        }}
        onClose={() => setOpenFilter(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: layout.topPadding,
  },

  logo: {
    fontFamily: fonts.title,
    fontSize: 28,
    color: colors.text,
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  logoAccent: {
    color: colors.accentLight,
  },

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    marginHorizontal: 16,
    marginTop: 12,
  },

  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.text,
  },

  chips: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
    flexWrap: 'wrap',
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 0.5,
    borderColor: colors.border,
  },

  chipActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },

  chipText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.text,
  },

  content: {
    paddingTop: 8,
    paddingBottom: 110,
  },

  searchResults: {
    width: '100%',
    paddingHorizontal: 10,
    gap: 24,
  },

  searchResultRow: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 6,
  },

  searchResultCard: {
    width: '50%',
  },

  empty: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },

  status: {
    marginTop: 36,
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  retryButton: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 14,
  },

  retryText: {
    fontFamily: fonts.bodyBold,
    color: colors.text,
  },
});
