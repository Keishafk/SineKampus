import { useState } from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, layout } from '../theme';
import FilmCard from '../components/FilmCard';

export default function FavoritesScreen({
  navigation,
  favoriteIds,
  toggleFavorite,
  films,
  loading,
  error,
  onRetry,
  folderApi,
}) {
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [folderModalMode, setFolderModalMode] = useState('create');
  const [folderName, setFolderName] = useState('');
  const [addFilmsVisible, setAddFilmsVisible] = useState(false);
  const [selectedFilmIds, setSelectedFilmIds] = useState([]);

  const {
    folders,
    createFolder,
    renameFolder,
    deleteFolder,
    addFilmsToFolder,
  } = folderApi;

  const selectedFolder = folders.find(
    (folder) => folder.id === selectedFolderId
  );

  const folderFilms = selectedFolder
    ? films.filter((film) =>
        selectedFolder.filmIds.some(
          (id) => String(id) === String(film.id)
        )
      )
    : [];

  const openCreateFolder = () => {
    setFolderModalMode('create');
    setFolderName('');
    setFolderModalVisible(true);
  };

  const openRenameFolder = () => {
    if (!selectedFolder) return;

    setFolderModalMode('rename');
    setFolderName(selectedFolder.name);
    setFolderModalVisible(true);
  };

  const saveFolderName = () => {
    const name = folderName.trim();

    if (!name) return;

    if (folderModalMode === 'create') {
      createFolder(name);
    } else if (selectedFolder) {
      renameFolder(selectedFolder.id, name);
    }

    setFolderModalVisible(false);
    setFolderName('');
  };

  const confirmDeleteFolder = () => {
    if (!selectedFolder) return;

    Alert.alert(
      'Delete Folder',
      `Are you sure you want to delete "${selectedFolder.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteFolder(selectedFolder.id);
            setSelectedFolderId(null);
          },
        },
      ]
    );
  };

  const openAddFilms = () => {
    setSelectedFilmIds([]);
    setAddFilmsVisible(true);
  };

  const toggleSelectedFilm = (filmId) => {
    const id = String(filmId);

    setSelectedFilmIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const saveSelectedFilms = () => {
    if (!selectedFolder || selectedFilmIds.length === 0) {
      setAddFilmsVisible(false);
      return;
    }

    addFilmsToFolder(selectedFolder.id, selectedFilmIds);
    setAddFilmsVisible(false);
    setSelectedFilmIds([]);
  };

  const renderFilmGrid = (filmList) => (
    <View style={styles.grid}>
      {filmList.map((film) => (
        <View key={String(film.id)} style={styles.cell}>
          <FilmCard
            film={film}
            isFavorite={favoriteIds.includes(String(film.id))}
            onPress={() =>
              navigation.navigate('FilmDetails', {
                filmId: film.id,
              })
            }
            onToggleFavorite={() => toggleFavorite(film.id)}
          />
        </View>
      ))}
    </View>
  );

  const renderFolderList = () => (
    <>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>Favorites</Text>

        <Pressable
          style={styles.addFolderButton}
          onPress={openCreateFolder}
        >
          <Ionicons
            name="add"
            size={21}
            color={colors.background}
          />
          <Text style={styles.addFolderText}>New Folder</Text>
        </Pressable>
      </View>

      {folders.length === 0 ? (
        <Text style={styles.empty}>
          No folders yet. Create one to organize your films.
        </Text>
      ) : (
        <View style={styles.folderList}>
          {folders.map((folder) => (
            <Pressable
              key={folder.id}
              style={styles.folderCard}
              onPress={() => setSelectedFolderId(folder.id)}
            >
              <View style={styles.folderIcon}>
                <Ionicons
                  name="folder"
                  size={25}
                  color={colors.accentLight}
                />
              </View>

              <View style={styles.folderInfo}>
                <Text style={styles.folderName}>
                  {folder.name}
                </Text>
                <Text style={styles.folderCount}>
                  {folder.filmIds.length}{' '}
                  {folder.filmIds.length === 1 ? 'film' : 'films'}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          ))}
        </View>
      )}
    </>
  );

  const renderFolderDetails = () => (
    <>
      <View style={styles.detailHeader}>
        <Pressable
          style={styles.backButton}
          onPress={() => setSelectedFolderId(null)}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.detailHeadingContainer}>
          <Text style={styles.heading} numberOfLines={1}>
            {selectedFolder.name}
          </Text>
          <Text style={styles.folderCount}>
            {selectedFolder.filmIds.length}{' '}
            {selectedFolder.filmIds.length === 1 ? 'film' : 'films'}
          </Text>
        </View>

        <Pressable
          style={styles.iconButton}
          onPress={openRenameFolder}
        >
          <Ionicons
            name="pencil-outline"
            size={20}
            color={colors.text}
          />
        </Pressable>

        <Pressable
          style={styles.iconButton}
          onPress={confirmDeleteFolder}
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color={colors.text}
          />
        </Pressable>
      </View>

      <Pressable
        style={styles.addFilmsButton}
        onPress={openAddFilms}
      >
        <Ionicons
          name="add"
          size={20}
          color={colors.background}
        />
        <Text style={styles.addFilmsText}>Add Films</Text>
      </Pressable>

      {loading ? (
        <ActivityIndicator
          color={colors.accentLight}
          style={styles.empty}
        />
      ) : error ? (
        <View>
          <Text style={styles.empty}>
            Films could not be loaded. {error}
          </Text>

          <Pressable onPress={onRetry}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : folderFilms.length === 0 ? (
        <Text style={styles.empty}>
          This folder is empty. Add some films to get started.
        </Text>
      ) : (
        renderFilmGrid(folderFilms)
      )}
    </>
  );

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {selectedFolder
          ? renderFolderDetails()
          : renderFolderList()}
      </ScrollView>

      <Modal
        visible={folderModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFolderModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalHeading}>
              {folderModalMode === 'create'
                ? 'Create Folder'
                : 'Rename Folder'}
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Folder name"
              placeholderTextColor={colors.textMuted}
              value={folderName}
              onChangeText={setFolderName}
              maxLength={40}
              autoFocus
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setFolderModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[
                  styles.saveButton,
                  !folderName.trim() && styles.disabledButton,
                ]}
                onPress={saveFolderName}
                disabled={!folderName.trim()}
              >
                <Text style={styles.saveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={addFilmsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddFilmsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.addFilmsModal}>
            <View style={styles.addFilmsHeader}>
              <Text style={styles.modalHeading}>Add Films</Text>

              <Pressable
                onPress={() => setAddFilmsVisible(false)}
                hitSlop={10}
              >
                <Ionicons
                  name="close"
                  size={23}
                  color={colors.text}
                />
              </Pressable>
            </View>

            {loading ? (
              <ActivityIndicator
                color={colors.accentLight}
                style={styles.empty}
              />
            ) : error ? (
              <Text style={styles.empty}>
                Films could not be loaded. {error}
              </Text>
            ) : (
              <ScrollView
                style={styles.availableFilms}
                showsVerticalScrollIndicator={false}
              >
                {films.map((film) => {
                  const alreadyInFolder = selectedFolder?.filmIds.some(
                    (id) => String(id) === String(film.id)
                  );

                  const selected = selectedFilmIds.includes(
                    String(film.id)
                  );

                  return (
                    <Pressable
                      key={String(film.id)}
                      style={[
                        styles.availableFilmRow,
                        alreadyInFolder && styles.existingFilmRow,
                      ]}
                      disabled={alreadyInFolder}
                      onPress={() => toggleSelectedFilm(film.id)}
                    >
                      <View style={styles.availableFilmInfo}>
                        <Text style={styles.availableFilmTitle}>
                          {film.title}
                        </Text>
                        <Text style={styles.availableFilmMeta}>
                          {alreadyInFolder
                            ? 'Already in this folder'
                            : `${film.year || ''} ${film.department || ''}`}
                        </Text>
                      </View>

                      <Ionicons
                        name={
                          alreadyInFolder || selected
                            ? 'checkbox'
                            : 'square-outline'
                        }
                        size={22}
                        color={
                          alreadyInFolder || selected
                            ? colors.accentLight
                            : colors.textMuted
                        }
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <Pressable
              style={styles.saveButtonFull}
              onPress={saveSelectedFilms}
              disabled={loading || Boolean(error)}
            >
              <Text style={styles.saveText}>
                Add Selected Films ({selectedFilmIds.length})
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: layout.topPadding,
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },

  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 18,
  },

  heading: {
    fontFamily: fonts.title,
    fontSize: 28,
    color: colors.text,
  },

  addFolderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentLight,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
  },

  addFolderText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.background,
  },

  folderList: {
    gap: 10,
  },

  folderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
  },

  folderIcon: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  folderInfo: {
    flex: 1,
  },

  folderName: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.text,
  },

  folderCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },

  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },

  backButton: {
    padding: 5,
    marginRight: 8,
  },

  detailHeadingContainer: {
    flex: 1,
  },

  iconButton: {
    padding: 9,
    marginLeft: 3,
  },

  addFilmsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accentLight,
    borderRadius: 9,
    paddingVertical: 11,
    marginBottom: 18,
  },

  addFilmsText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.background,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },

  cell: {
    width: '50%',
    padding: 6,
  },

  empty: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
  },

  retry: {
    fontFamily: fonts.bodyBold,
    color: colors.accentLight,
    textAlign: 'center',
    marginTop: 12,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },

  modal: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },

  modalHeading: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: colors.text,
    marginBottom: 16,
  },

  modalInput: {
    height: 48,
    backgroundColor: colors.background,
    borderRadius: 9,
    paddingHorizontal: 13,
    color: colors.text,
    fontFamily: fonts.body,
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },

  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 11,
  },

  cancelText: {
    fontFamily: fonts.body,
    color: colors.textMuted,
  },

  saveButton: {
    backgroundColor: colors.accentLight,
    borderRadius: 9,
    paddingHorizontal: 20,
    paddingVertical: 11,
  },

  saveText: {
    fontFamily: fonts.bodyBold,
    color: colors.background,
    textAlign: 'center',
  },

  disabledButton: {
    opacity: 0.4,
  },

  addFilmsModal: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
  },

  addFilmsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  availableFilms: {
    flexGrow: 0,
    marginBottom: 16,
  },

  availableFilmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  existingFilmRow: {
    opacity: 0.5,
  },

  availableFilmInfo: {
    flex: 1,
    paddingRight: 10,
  },

  availableFilmTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.text,
  },

  availableFilmMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },

  saveButtonFull: {
    backgroundColor: colors.accentLight,
    borderRadius: 9,
    paddingVertical: 13,
    marginTop: 4,
  },
});