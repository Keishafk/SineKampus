import { useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

// Props: visible, filmTitle, filmId, folders, onToggle, onCreate, onClose
export default function SaveToFolderSheet({
  visible,
  filmTitle,
  filmId,
  folders,
  onToggle,
  onCreate,
  onClose,
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  // Resets the "new folder" box, then closes the sheet
  const close = () => {
    setCreating(false);
    setName('');
    onClose();
  };

  // Makes the folder (with this film inside) and closes
  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      {/* Dark area behind the sheet, tap it to close */}
      <Pressable style={styles.backdrop} onPress={close}>
        {/* Empty onPress stops taps inside the sheet from closing it */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>Save to Folder</Text>
          <Text style={styles.subtitle} numberOfLines={1}>{filmTitle}</Text>

          {/* One row per folder, check mark when the film is inside */}
          <ScrollView style={styles.list}>
            {folders.map((folder) => {
              const inside = folder.filmIds.includes(filmId);
              return (
                <Pressable key={folder.id} style={styles.row} onPress={() => onToggle(folder.id)}>
                  <Ionicons
                    name={inside ? 'folder-open' : 'folder-open-outline'}
                    size={22}
                    color={colors.accentLight}
                  />
                  <Text style={styles.rowText}>{folder.name}</Text>
                  <Ionicons
                    name={inside ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={inside ? colors.accentLight : colors.textMuted}
                  />
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Create a new folder right from the sheet */}
          {creating ? (
            <View style={styles.createBox}>
              <TextInput
                style={styles.input}
                placeholder="Folder name..."
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                autoFocus
              />
              <View style={styles.actions}>
                <Pressable onPress={() => { setCreating(false); setName(''); }}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={create}>
                  <Text style={styles.saveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable style={styles.newRow} onPress={() => setCreating(true)}>
              <Ionicons name="add" size={20} color={colors.accentLight} />
              <Text style={styles.newText}>Create new folder</Text>
            </Pressable>
          )}

          <Pressable style={styles.doneButton} onPress={close}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  title: { fontFamily: fonts.title, fontSize: 20, color: colors.text },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 2, marginBottom: 8 },
  list: { flexGrow: 0 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  rowText: { flex: 1, fontFamily: fonts.body, fontSize: 16, color: colors.text },
  newRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14 },
  newText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.accentLight },
  createBox: { marginTop: 12 },
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
  },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginTop: 12 },
  cancelText: { fontFamily: fonts.body, fontSize: 14, color: colors.textMuted },
  saveButton: { backgroundColor: colors.accent, paddingHorizontal: 18, paddingVertical: 8, borderRadius: 8 },
  saveText: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.text },
  doneButton: {
    backgroundColor: colors.accent,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  doneText: { fontFamily: fonts.bodyBold, fontSize: 15, color: colors.text },
});