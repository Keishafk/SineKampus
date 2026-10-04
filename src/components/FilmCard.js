// FilmCard.js — ONE poster card (poster + title + year/department + heart button). The Home and Favorites screens reuse it

// React Native's built-in building blocks:
//  View      = a box (like a <div> on the web)
//  Text      = any text. Text MUST be inside <Text>.
//  Image     = shows a picture
//  Pressable = anything the user can tap
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

// Ionicons gives us the heart icon.
import { Ionicons } from '@expo/vector-icons';

// Our shared colors and fonts from theme.js.
import { colors, fonts } from '../theme';

// A component is a function that returns what should appear on screen.
// It receives "props" (inputs) from the screen that uses it:
//   film             = one film object from films.js
//   isFavorite       = true/false, is this film in the user's favorites?
//   onPress          = function to run when the card is tapped (open details)
//   onToggleFavorite = function to run when the heart is tapped
export default function FilmCard({ film, isFavorite, onPress, onToggleFavorite }) {
  return (
    // The whole card is tappable. `style={styles.card}` applies the styles defined at the bottom of this file.
    <Pressable style={styles.card} onPress={onPress}>

      {/* ---------- POSTER AREA ---------- */}
      <View style={styles.posterBox}>
        {/*
          This is a conditional: "if film.poster has a value, show the Image; otherwise show the fallback box".
          - A require() image counts as "has a value".
          - null counts as "no value", so the fallback shows.
          TODO (SineKampus): if you later use online images, write poster: { uri: 'https://...' } in films.js. This same code will still work.
        */}
        {film.poster ? (
          <Image
            source={film.poster}
            style={styles.posterImage}
            // 'cover' fills the whole box and crops the edges if the picture isn't exactly 2:3. It never stretches the image.
            resizeMode="cover"
          />
        ) : (
          // FALLBACK: a plain dark box with the title centered.
          <View style={styles.posterFallback}>
            <Text style={styles.fallbackTitle}>{film.title}</Text>
          </View>
        )}

        {/* ---------- HEART BUTTON ---------- */}
        {/* It sits on the top-right corner of the poster. */}
        <Pressable
          style={styles.heartButton}
          onPress={onToggleFavorite}
          // hitSlop makes the tappable area 8px bigger on every side, so small fingers don't miss the button.
          hitSlop={8}
        >
          <Ionicons
            // Filled heart if favorited, outline heart if not.
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={18}
            // Light green when favorited, white when not.
            color={isFavorite ? colors.accentLight : colors.text}
          />
        </Pressable>
      </View>

      {/* ---------- TEXT BELOW THE POSTER ---------- */}
      {/* numberOfLines={1} cuts long text with "..." instead of wrapping. */}
      <Text style={styles.title} numberOfLines={1}>{film.title}</Text>
      <Text style={styles.meta} numberOfLines={1}>
        {/* {} lets us put JavaScript values inside text. */}
        {film.year} · {film.department}
      </Text>
    </Pressable>
  );
}

// StyleSheet.create holds all the styles for this file.
// It works like CSS, but names are camelCase (borderRadius, not border-radius).
const styles = StyleSheet.create({
  // flex: 1 lets two cards share a row equally (the grid has 2 columns).
  card: { flex: 1 },

  posterBox: {
    // aspectRatio keeps the poster 2:3 on any screen size.
    // Width is set by the grid, and the height follows from this ratio.
    aspectRatio: 2 / 3,
    borderRadius: 12,
    // overflow: 'hidden' clips the image to the rounded corners.
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },

  // Makes the image fill the whole poster box.
  posterImage: { width: '100%', height: '100%' },

  posterFallback: {
    flex: 1,
    // justifyContent centers vertically, alignItems centers horizontally.
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
  },

  fallbackTitle: {
    fontFamily: fonts.title,
    fontSize: 17,
    color: colors.text,
    textAlign: 'center',
  },

  heartButton: {
    // position: 'absolute' places it freely over the poster
    // instead of stacking it in the normal flow.
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    // Half of the width/height makes a perfect circle.
    borderRadius: 15,
    // Semi-transparent dark background so the icon is readable on any poster.
    backgroundColor: 'rgba(11, 15, 16, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.text,
    marginTop: 8,
  },

  meta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});