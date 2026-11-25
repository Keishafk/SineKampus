
import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

export default function SaveToFolderSheet({
  visible,
  filmId,
  filmTitle,
  folders,
  onToggle,
  onCreate,
  onClose,
}) {
  const [newFolderName, setNewFolderName] = useState('');

  const isInFolder = (folder) =>
    folder.filmIds.some((id) => String(id) === String(filmId));

  const handleCreate = () => {
    const name = newFolderName.trim();

    if (!name) return;

    onCreate(name, filmId);
    setNewFolderName('');
  };

  const handleClose = () => {
    setNewFolderName('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={handleClose}
        />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.headingContainer}>
              <Text style={styles.heading}>Save to Folder</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {filmTitle}
              </Text>
            </View>

            <Pressable
              onPress={handleClose}
              hitSlop={10}
              style={styles.closeButton}
            >
              <Ionicons
                name="close"
                size={23}
                color={colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.folderList}
            showsVerticalScrollIndicator={false}
          >
            {folders.map((folder) => {
              const selected = isInFolder(folder);

              return (
                <Pressable
                  key={folder.id}
                  style={styles.folderRow}
                  onPress={() => onToggle(folder.id, filmId)}
                >
                  <View style={styles.folderIcon}>
                    <Ionicons
                      name="folder-outline"
                      size={21}
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
                    name={
                      selected
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={23}
                    color={
                      selected
                        ? colors.accentLight
                        : colors.textMuted
                    }
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.createContainer}>
            <TextInput
              style={styles.input}
              placeholder="New folder name"
              placeholderTextColor={colors.textMuted}
              value={newFolderName}
              onChangeText={setNewFolderName}
              maxLength={40}
            />

            <Pressable
              style={[
                styles.createButton,
                !newFolderName.trim() && styles.disabledButton,
              ]}
              onPress={handleCreate}
              disabled={!newFolderName.trim()}
            >
              <Ionicons
                name="add"
                size={21}
                color={colors.background}
              />
            </Pressable>
          </View>

          <Pressable
            style={styles.doneButton}
            onPress={handleClose}
          >
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
    maxHeight: '75%',
  },

  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    opacity: 0.5,
    marginBottom: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  headingContainer: {
    flex: 1,
  },

  heading: {
    fontFamily: fonts.title,
    fontSize: 23,
    color: colors.text,
  },

  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },

  closeButton: {
    padding: 5,
  },

  folderList: {
    flexGrow: 0,
  },

  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },

  folderIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  folderInfo: {
    flex: 1,
  },

  folderName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
  },

  folderCount: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
  },

  createContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    gap: 10,
  },

  input: {
    flex: 1,
    height: 46,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 13,
    color: colors.text,
    fontFamily: fonts.body,
  },

  createButton: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    opacity: 0.4,
  },

  doneButton: {
    backgroundColor: colors.accentLight,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 16,
  },

  doneText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.background,
  },
});