import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, layout } from '../theme';
import { films } from '../data/films';

// "1 movie", "2 movies"
const movieCount = (n) => `${n} ${n === 1 ? 'movie' : 'movies'}`;

const DANGER = '#EF4444';

// Receives navigation plus the folder functions from App.js
export default function FavoritesScreen({ navigation, folderApi }) {
  const { folders, createFolder, renameFolder, deleteFolder, toggleFilmInFolder, addFilmsToFolder } = folderApi;

  // Which folder is open (null = showing the folder list)
  const [openId, setOpenId] = useState(null);
  // "Create New Folder" box
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  // Rename box inside a folder
  const [renaming, setRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');
  // Delete confirmation box
  const [confirmDelete, setConfirmDelete] = useState(false);
  // "Add Movies" popup and the films ticked in it
  const [adding, setAdding] = useState(false);
  const [selected, setSelected] = useState([]);

  // The open folder (undefined if none, or if it was just deleted)
  const folder = folders.find((f) => f.id === openId);

  // ---------- handlers ----------
  const saveNewFolder = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createFolder(trimmed);
    setNewName('');
    setCreating(false);
  };

  const openFolder = (id) => {
    setOpenId(id);
    setRenaming(false);
    setConfirmDelete(false);
  };

  const saveRename = () => {
    const trimmed = renameText.trim();
    if (!trimmed) return;
    renameFolder(folder.id, trimmed);
    setRenaming(false);
  };

  const removeFolder = () => {
    deleteFolder(folder.id);
    setOpenId(null);
    setConfirmDelete(false);
  };

  const openAddMovies = () => {
    setSelected([]);
    setAdding(true);
  };

  const toggleSelected = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const confirmAdd = () => {
    addFilmsToFolder(folder.id, selected);
    setAdding(false);
  };

  // ---------- VIEW 1: the folder list ----------
  if (!folder) {
    return (
      <View style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.heading}>Favorites</Text>
          <Text style={styles.subtitle}>Organize your favorite movies into folders</Text>

          {/* Create New Folder card */}
          {creating ? (
            <View style={styles.createCard}>
              <Text style={styles.createTitle}>Create New Folder</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter folder name..."
                placeholderTextColor={colors.textMuted}
                value={newName}
                onChangeText={setNewName}
                autoFocus
              />
              <View style={styles.actions}>
                <Pressable onPress={() => { setCreating(false); setNewName(''); }}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.smallButton} onPress={saveNewFolder}>
                  <Text style={styles.smallButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.createCard} onPress={() => setCreating(true)}>
              <View style={styles.createRow}>
                <View style={styles.createIcon}>
                  <Ionicons name="folder-open-outline" size={24} color={colors.accentLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.createTitle}>Create New Folder</Text>
                  <Text style={styles.createHint}>Give your collection a custom name</Text>
                </View>
                <Ionicons name="add" size={22} color={colors.accentLight} />
              </View>
            </Pressable>
          )}

          <Text style={styles.sectionTitle}>My Folders ({folders.length})</Text>

          {/* Folder cards, two per row */}
          <View style={styles.grid}>
            {folders.map((f) => (
              <View key={f.id} style={styles.cell}>
                <Pressable style={styles.folderCard} onPress={() => openFolder(f.id)}>
                  <View style={styles.folderTop}>
                    <Ionicons name="folder-open-outline" size={30} color={colors.accentLight} />
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </View>
                  <Text style={styles.folderName} numberOfLines={1}>{f.name}</Text>
                  <Text style={styles.folderCount}>{movieCount(f.filmIds.length)}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ---------- VIEW 2: inside one folder ----------
  const folderFilms = films.filter((f) => folder.filmIds.includes(f.id));
  // Only films not already in this folder can be added
  const addableFilms = films.filter((f) => !folder.filmIds.includes(f.id));

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Top bar: back to folders + rename */}
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => setOpenId(null)}>
            <Ionicons name="chevron-back" size={18} color={colors.textMuted} />
            <Text style={styles.backText}>Folders</Text>
          </Pressable>

          {!renaming && (
            <Pressable
              style={styles.backButton}
              onPress={() => { setRenameText(folder.name); setRenaming(true); }}
            >
              <Ionicons name="create-outline" size={16} color={colors.text} />
              <Text style={styles.renameText}>Rename</Text>
            </Pressable>
          )}
        </View>

        {/* Folder name, or the rename box */}
        {renaming ? (
          <View style={styles.createCard}>
            <TextInput
              style={styles.input}
              value={renameText}
              onChangeText={setRenameText}
              placeholder="Folder name..."
              placeholderTextColor={colors.textMuted}
              autoFocus
            />
            <View style={styles.actions}>
              <Pressable onPress={() => setRenaming(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.smallButton} onPress={saveRename}>
                <Text style={styles.smallButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.folderHeader}>
            <Ionicons name="folder-open-outline" size={28} color={colors.accentLight} />
            <View>
              <Text style={styles.folderTitle}>{folder.name}</Text>
              <Text style={styles.folderCount}>{movieCount(folder.filmIds.length)}</Text>
            </View>
          </View>
        )}

        {/* Add Movies button */}
        <Pressable style={styles.addButton} onPress={openAddMovies}>
          <Ionicons name="add" size={20} color={colors.text} />
          <Text style={styles.addText}>Add Movies</Text>
        </Pressable>

        {/* Movies in this folder */}
        {folderFilms.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="film-outline" size={28} color={colors.textMuted} />
            <Text style={styles.empty}>No movies yet. Add your first movie.</Text>
          </View>
        ) : (
          folderFilms.map((film) => (
            <Pressable
              key={film.id}
              style={styles.movieRow}
              onPress={() => navigation.navigate('FilmDetails', { filmId: film.id })}
            >
              <View style={styles.movieIcon}>
                <Ionicons name="film-outline" size={20} color={colors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.movieTitle} numberOfLines={1}>{film.title}</Text>
                <Text style={styles.movieMeta} numberOfLines={1}>{film.genre}</Text>
              </View>
              <Pressable hitSlop={8} onPress={() => toggleFilmInFolder(folder.id, film.id)}>
                <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
              </Pressable>
            </Pressable>
          ))
        )}

        {/* Delete folder + confirmation */}
        {confirmDelete ? (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>Delete this folder?</Text>
            <Text style={styles.confirmText}>
              The folder will be removed. Movies in other folders will remain.
            </Text>
            <View style={styles.actions}>
              <Pressable onPress={() => setConfirmDelete(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.smallButton, { backgroundColor: DANGER }]} onPress={removeFolder}>
                <Text style={styles.smallButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable style={styles.deleteButton} onPress={() => setConfirmDelete(true)}>
            <Ionicons name="trash-outline" size={16} color={DANGER} />
            <Text style={styles.deleteText}>Delete Folder</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* "Choose movies to add" popup */}
      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAdding(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <Text style={styles.sheetTitle}>Choose movies to add</Text>

            <ScrollView style={{ flexGrow: 0 }}>
              {addableFilms.length === 0 && (
                <Text style={styles.empty}>All movies are already in this folder.</Text>
              )}
              {addableFilms.map((film) => {
                const on = selected.includes(film.id);
                return (
                  <Pressable key={film.id} style={styles.pickRow} onPress={() => toggleSelected(film.id)}>
                    <Ionicons
                      name={on ? 'checkbox' : 'square-outline'}
                      size={22}
                      color={on ? colors.accentLight : colors.textMuted}
                    />
                    <Text style={styles.pickText} numberOfLines={1}>{film.title}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={styles.actions}>
              <Pressable onPress={() => setAdding(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.smallButton, selected.length === 0 && { opacity: 0.4 }]}
                disabled={selected.length === 0}
                onPress={confirmAdd}
              >
                <Text style={styles.smallButtonText}>Add Selected</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, paddingTop: layout.topPadding },
  content: { paddingHorizontal: 16, paddingBottom: 30 },
  heading: { fontFamily: fonts.title, fontSize: 28, color: colors.text, paddingTop: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted, marginTop: 4, marginBottom: 16 },

  // Create New Folder card (dashed border)
  createCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    padding: 14,
  },
  createRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  createIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text },
  createHint: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },

  input: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.background,
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 10,
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginTop: 12 },
  cancelText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  smallButton: { backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  smallButtonText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },

  // Folder grid
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.text, marginTop: 24, marginBottom: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -6 },
  cell: { width: '50%', padding: 6 },
  folderCard: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, minHeight: 120, justifyContent: 'space-between' },
  folderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  folderName: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text, marginTop: 14 },
  folderCount: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },

  // Inside a folder
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  renameText: { fontFamily: fonts.body, fontSize: 14, color: colors.text },
  folderHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  folderTitle: { fontFamily: fonts.title, fontSize: 24, color: colors.text },
  addButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    height: 46,
    borderRadius: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  addText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  movieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  movieIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieTitle: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  movieMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 2 },
  emptyBox: { alignItems: 'center', gap: 8, paddingVertical: 30 },
  empty: { fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', paddingVertical: 12 },

  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    height: 44,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: DANGER,
    marginTop: 20,
  },
  deleteText: { fontFamily: fonts.body, fontSize: 14, color: DANGER },
  confirmBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginTop: 20 },
  confirmTitle: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
  confirmText: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 4 },

  // "Add Movies" popup
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  sheetTitle: { fontFamily: fonts.title, fontSize: 20, color: colors.text, marginBottom: 8 },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  pickText: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.text },
});