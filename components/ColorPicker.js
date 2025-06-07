// components/ColorPicker.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ColorPicker = ({
  selectedColors = [],
  onColorSelect,
  colorPalette,
  maxSelectable,
  style,
  titleStyle,
  title = "Sélectionnez une ou plusieurs couleurs",
  selectedTitle = "Couleurs sélectionnées:",
  showSelectedSection = true,
  allowMultiple = true,
}) => {
  const toggleColor = (color) => {
    if (!allowMultiple) {
      // Mode sélection unique
      onColorSelect([color.value]);
      return;
    }

    let newColors = [...selectedColors];
    const colorIndex = newColors.indexOf(color.value);

    if (colorIndex > -1) {
      newColors.splice(colorIndex, 1);
    } else {
      if (maxSelectable && newColors.length >= maxSelectable) {
        // Remplacer la première couleur si limite atteinte
        newColors.shift();
      }
      newColors.push(color.value);
    }

    onColorSelect(newColors);
  };

  const isSelected = (colorValue) => selectedColors.includes(colorValue);

  const removeColor = (colorValue) => {
    const newColors = selectedColors.filter((color) => color !== colorValue);
    onColorSelect(newColors);
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, titleStyle]}>{title}</Text>

      {/* Grille de couleurs */}
      <View style={styles.colorsGrid}>
        {colorPalette.map((color, index) => (
          <TouchableOpacity
            key={color.value}
            onPress={() => toggleColor(color)}
            style={[
              styles.colorButton,
              { backgroundColor: color.hex || color.color || "#CCC" },
              isSelected(color.value) && styles.selectedColor,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.colorText,
                {
                  color:
                    color.textColor ||
                    getContrastColor(color.hex || color.color || "#CCC"),
                },
              ]}
              numberOfLines={2}
            >
              {color.name}
            </Text>

            {isSelected(color.value) && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={14} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Fonction utilitaire pour déterminer la couleur de texte contrastée
const getContrastColor = (hexColor) => {
  if (!hexColor) return "#000";

  // Convertir hex en RGB
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculer la luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? "#000" : "#FFF";
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  colorsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  colorButton: {
    width: (width - 60) / 4,
    height: 40,
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#c2002f",
    shadowColor: "#c2002f",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    transform: [{ scale: 0.95 }],
  },
  colorText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    paddingHorizontal: 4,
  },
  checkmark: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#c2002f",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  selectedScrollContent: {
    paddingRight: 16,
  },
  selectedColorBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedColorText: {
    fontSize: 12,
    fontWeight: "600",
    marginRight: 4,
  },
  removeIcon: {
    marginLeft: 4,
  },
  noSelection: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});

export default ColorPicker;
