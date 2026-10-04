import { Modal, View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../theme';

// Props: visible, title, options, selected, onSelect, onClose
export default function FilterSheet({ visible, title, options, selected, onSelect, onClose }) {
  return (
    // Modal draws on top of the screen and slides up
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* The dark area behind the sheet, tap it to close */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Empty onPress stops taps inside the sheet from closing it */}
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>{title}</Text>

          {/* "All" option clears this filter (null means no filter) */}
          <Row label="All" active={selected === null} onPress={() => onSelect(null)} />

          {/* One row per option, built from the films data */}
          <FlatList
            data={options}
            keyExtractor={(item) => String(item)}
            renderItem={({ item }) => (
              <Row label={String(item)} active={selected === item} onPress={() => onSelect(item)} />
            )}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// One tappable row inside the sheet
function Row({ label, active, onPress }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <Text style={[styles.rowText, active && styles.rowTextActive]}>{label}</Text>
      {/* Check mark shows only on the selected row */}
      {active && <Ionicons name="checkmark" size={20} color={colors.accentLight} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Fills the screen and pushes the sheet to the bottom
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  // Rounded top corners, and max height so long lists scroll
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
  },
  title: { fontFamily: fonts.title, fontSize: 20, color: colors.text, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  rowText: { fontFamily: fonts.body, fontSize: 16, color: colors.text },
  rowTextActive: { fontFamily: fonts.bodyBold, color: colors.accentLight },
});