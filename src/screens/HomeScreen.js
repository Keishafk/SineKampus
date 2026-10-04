import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, layout } from '../theme';
import { films } from '../data/films';
import { rows } from '../data/rows';
import FilmRow from '../components/FilmRow';
import FilterSheet from '../components/FilterSheet';

// The three filter chips: key matches the field name in films.js
const FILTERS = [
  { key: 'genre', label: 'Genre' },
  { key: 'year', label: 'Year' },
  { key: 'department', label: 'Department' },
];

// Receives navigation plus the favorites props from App.js
export default function HomeScreen({ navigation, favoriteIds, toggleFavorite }) {
  // Text typed in the search bar
  const [query, setQuery] = useState('');
  // Chosen value for each filter (null means "All")
  const [filters, setFilters] = useState({ genre: null, year: null, department: null });
  // Which filter sheet is open ('genre', 'year', 'department', or null)
  const [openFilter, setOpenFilter] = useState(null);

  // Gets every different value of a field, like all genres, sorted
  const uniqueValues = (key) => [...new Set(films.map((f) => f[key]))].sort();

  // Keeps only the films that match the search and all filters
  const visibleFilms = films.filter((f) => {
    const matchesSearch = f.title.toLowerCase().includes(query.toLowerCase());
    const matchesGenre = filters.genre === null || f.genre === filters.genre;
    const matchesYear = filters.year === null || f.year === filters.year;
    const matchesDept = filters.department === null || f.department === filters.department;
    return matchesSearch && matchesGenre && matchesYear && matchesDept;
  });

  // Builds each row with its matching films, using the tags from films.js
  const sections = rows.map((row) => ({
    ...row,
    films: visibleFilms.filter((f) => (f.tags ?? []).includes(row.id)),
  }));
  // Adds the automatic "All films" row at the end
  sections.push({ id: 'all', title: 'All Films', films: visibleFilms });

  // Hides any row that has no films
  const visibleSections = sections.filter((s) => s.films.length > 0);

  // Opens the details screen and sends this film's id
  const openFilm = (film) => navigation.navigate('FilmDetails', { filmId: film.id });

  return (
    // A plain View now, the top space comes from layout.topPadding in theme.js
    <View style={styles.screen}>
      {/* App name: "Sine" in white, "Kampus" in green */}
      <Text style={styles.logo}>
        Sine<Text style={styles.logoAccent}>Kampus</Text>
      </Text>

      {/* Search bar */}
      <View style={styles.search}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search campus short films"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {/* Filter chips: one per filter, green when a value is chosen */}
      <View style={styles.chips}>
        {FILTERS.map((f) => {
          const value = filters[f.key];
          const active = value !== null;
          return (
            <Pressable
              key={f.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setOpenFilter(f.key)}
            >
              {/* Shows the chosen value, or the filter name if none */}
              <Text style={styles.chipText}>{active ? String(value) : f.label}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.text} />
            </Pressable>
          );
        })}
      </View>

      {/* The page scrolls down, and each row scrolls sideways */}
      <ScrollView contentContainerStyle={styles.content}>
        {visibleSections.map((section) => (
          <FilmRow
            key={section.id}
            title={section.title}
            films={section.films}
            favoriteIds={favoriteIds}
            onOpen={openFilm}
            onToggleFavorite={toggleFavorite}
          />
        ))}

        {/* Shown when no film matches the search or filters */}
        {visibleFilms.length === 0 && (
          <Text style={styles.empty}>No films found. Try another search.</Text>
        )}
      </ScrollView>

      {/* The bottom sheet, shown when a chip is tapped */}
      <FilterSheet
        visible={openFilter !== null}
        title={FILTERS.find((f) => f.key === openFilter)?.label ?? ''}
        options={openFilter ? uniqueValues(openFilter) : []}
        selected={openFilter ? filters[openFilter] : null}
        onSelect={(value) => {
          // Saves the choice for the open filter, then closes the sheet
          setFilters({ ...filters, [openFilter]: value });
          setOpenFilter(null);
        }}
        onClose={() => setOpenFilter(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // paddingTop is the space above the logo, change it in theme.js
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: layout.topPadding },
  logo: { fontFamily: fonts.title, fontSize: 28, color: colors.text, paddingHorizontal: 16, paddingTop: 8 },
  logoAccent: { color: colors.accentLight },
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
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 14, color: colors.text },
  chips: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
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
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontFamily: fonts.body, fontSize: 13, color: colors.text },
  // Space at the bottom so the last row isn't hidden by the tabs
  content: { paddingTop: 8, paddingBottom: 20 },
  empty: { fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});