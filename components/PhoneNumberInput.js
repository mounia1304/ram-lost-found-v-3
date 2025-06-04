import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Platform,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  parsePhoneNumber,
  isValidPhoneNumber,
  getCountries,
  getCountryCallingCode,
  AsYouType,
} from "libphonenumber-js";

// Composant Flag avec SVG depuis flagcdn.com (CDN gratuit et fiable)
const Flag = ({ countryCode, size = 24 }) => {
  const flagUrl = `https://flagcdn.com/w${size}/${countryCode.toLowerCase()}.png`;

  return (
    <Image
      source={{ uri: flagUrl }}
      style={[
        styles.flagImage,
        { width: size, height: size * 0.75 }, // Ratio 4:3 pour les drapeaux
      ]}
      defaultSource={{ uri: "https://flagcdn.com/w24/un.png" }} // Drapeau par défaut
    />
  );
};

const COLORS = {
  primary: "#c2002f",
  secondary: "#003366",
  text: "#333333",
  textLight: "#767676",
  border: "#e0e0e0",
  error: "#e74c3c",
  success: "#27ae60",
  background: "#f8f9fa",
  white: "#ffffff",
};

// Configuration des pays avec noms français
const COUNTRY_DATA = {
  // Pays autorisés pour RAM
  MA: { name: "Maroc", code: "MA" },
  FR: { name: "France", code: "FR" },
  ES: { name: "Espagne", code: "ES" },
  DZ: { name: "Algérie", code: "DZ" },
  TN: { name: "Tunisie", code: "TN" },
  EG: { name: "Égypte", code: "EG" },
  LB: { name: "Liban", code: "LB" },
  JO: { name: "Jordanie", code: "JO" },
  AE: { name: "Émirats Arabes Unis", code: "AE" },
  SA: { name: "Arabie Saoudite", code: "SA" },
  QA: { name: "Qatar", code: "QA" },
  KW: { name: "Koweït", code: "KW" },
  BH: { name: "Bahreïn", code: "BH" },
  OM: { name: "Oman", code: "OM" },
  US: { name: "États-Unis", code: "US" },
  CA: { name: "Canada", code: "CA" },
  GB: { name: "Royaume-Uni", code: "GB" },
  DE: { name: "Allemagne", code: "DE" },
  IT: { name: "Italie", code: "IT" },
  BE: { name: "Belgique", code: "BE" },
  NL: { name: "Pays-Bas", code: "NL" },
  CH: { name: "Suisse", code: "CH" },
  AT: { name: "Autriche", code: "AT" },
  PT: { name: "Portugal", code: "PT" },
  IE: { name: "Irlande", code: "IE" },
  SE: { name: "Suède", code: "SE" },
  NO: { name: "Norvège", code: "NO" },
  DK: { name: "Danemark", code: "DK" },
  FI: { name: "Finlande", code: "FI" },
  BR: { name: "Brésil", code: "BR" },
  AR: { name: "Argentine", code: "AR" },
  CL: { name: "Chili", code: "CL" },
  CO: { name: "Colombie", code: "CO" },
  PE: { name: "Pérou", code: "PE" },
  CN: { name: "Chine", code: "CN" },
  JP: { name: "Japon", code: "JP" },
  KR: { name: "Corée du Sud", code: "KR" },
  IN: { name: "Inde", code: "IN" },
  TH: { name: "Thaïlande", code: "TH" },
  VN: { name: "Vietnam", code: "VN" },
  MY: { name: "Malaisie", code: "MY" },
  SG: { name: "Singapour", code: "SG" },
  ID: { name: "Indonésie", code: "ID" },
  PH: { name: "Philippines", code: "PH" },
  AU: { name: "Australie", code: "AU" },
  NZ: { name: "Nouvelle-Zélande", code: "NZ" },
  ZA: { name: "Afrique du Sud", code: "ZA" },
  NG: { name: "Nigeria", code: "NG" },
  KE: { name: "Kenya", code: "KE" },
  SN: { name: "Sénégal", code: "SN" },
  CI: { name: "Côte d'Ivoire", code: "CI" },
  GH: { name: "Ghana", code: "GH" },
  ET: { name: "Éthiopie", code: "ET" },
  UG: { name: "Ouganda", code: "UG" },
  TZ: { name: "Tanzanie", code: "TZ" },
  MX: { name: "Mexique", code: "MX" },
  UY: { name: "Uruguay", code: "UY" },
  TR: { name: "Turquie", code: "TR" },
  IL: { name: "Israël", code: "IL" },
};

// Pays exclus (non supportés)
const EXCLUDED_COUNTRIES = [
  "AF",
  "KP",
  "IR",
  "SY",
  "IQ",
  "LY",
  "SO",
  "SS",
  "VE",
  "MM",
  "BY",
  "RU",
];

const PhoneInput = ({
  onPhoneChange,
  defaultCountry = "MA",
  label = "Numéro de téléphone",
  placeholder = "Entrez votre numéro",
  excludeCountries = [],
  preferredCountries = ["MA", "FR", "ES", "DZ", "TN"],
}) => {
  const [selectedCountry, setSelectedCountry] = useState(defaultCountry);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formattedNumber, setFormattedNumber] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [callingCode, setCallingCode] = useState("");

  // Filtrer les pays disponibles
  const availableCountries = Object.keys(COUNTRY_DATA).filter(
    (countryCode) =>
      !EXCLUDED_COUNTRIES.includes(countryCode) &&
      !excludeCountries.includes(countryCode)
  );

  // Organiser les pays (préférés en premier)
  const organizedCountries = [
    ...preferredCountries.filter((code) => availableCountries.includes(code)),
    ...availableCountries.filter((code) => !preferredCountries.includes(code)),
  ];

  // Filtrer par recherche
  const filteredCountries = organizedCountries.filter((countryCode) => {
    const country = COUNTRY_DATA[countryCode];
    return (
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      countryCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  useEffect(() => {
    try {
      const code = getCountryCallingCode(selectedCountry);
      setCallingCode(code);
    } catch (error) {
      console.warn("Error getting calling code:", error);
      setCallingCode("");
    }
  }, [selectedCountry]);

  const handlePhoneNumberChange = (text) => {
    setPhoneNumber(text);

    try {
      // Formatage en temps réel
      const asYouType = new AsYouType(selectedCountry);
      const formatted = asYouType.input(text);
      setFormattedNumber(formatted);

      // Validation
      const fullNumber = `+${callingCode}${text}`;
      const valid = isValidPhoneNumber(fullNumber, selectedCountry);
      setIsValid(valid);

      // Callback vers le parent
      if (onPhoneChange) {
        let parsedNumber = null;
        try {
          parsedNumber = parsePhoneNumber(fullNumber, selectedCountry);
        } catch (e) {
          // Ignore parsing errors
        }

        onPhoneChange({
          raw: text,
          formatted: formatted,
          fullNumber: fullNumber,
          isValid: valid,
          countryCode: selectedCountry,
          callingCode: callingCode,
          parsedNumber: parsedNumber,
        });
      }
    } catch (error) {
      console.warn("Phone validation error:", error);
      setIsValid(false);
    }
  };

  const selectCountry = (countryCode) => {
    setSelectedCountry(countryCode);
    setShowCountryPicker(false);
    setSearchQuery("");

    // Re-valider le numéro avec le nouveau pays
    if (phoneNumber) {
      handlePhoneNumberChange(phoneNumber);
    }
  };

  const renderCountryItem = ({ item: countryCode }) => {
    const country = COUNTRY_DATA[countryCode];
    let code = "";
    try {
      code = getCountryCallingCode(countryCode);
    } catch (e) {
      code = "";
    }

    return (
      <TouchableOpacity
        style={[
          styles.countryItem,
          selectedCountry === countryCode && styles.selectedCountryItem,
        ]}
        onPress={() => selectCountry(countryCode)}
      >
        <Flag countryCode={countryCode} size={32} />
        <View style={styles.countryInfo}>
          <Text style={styles.countryName}>{country.name}</Text>
          <Text style={styles.countryCode}>+{code}</Text>
        </View>
        {selectedCountry === countryCode && (
          <Ionicons name="checkmark" size={20} color={COLORS.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const selectedCountryData = COUNTRY_DATA[selectedCountry];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        {/* Sélecteur de pays */}
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setShowCountryPicker(true)}
        >
          <Flag countryCode={selectedCountry} size={24} />
          <Text style={styles.callingCodeText}>+{callingCode}</Text>
          <Ionicons name="chevron-down" size={16} color={COLORS.textLight} />
        </TouchableOpacity>

        {/* Input téléphone */}
        <TextInput
          style={[
            styles.phoneInput,
            !isValid && phoneNumber.length > 0 && styles.phoneInputError,
            isValid && phoneNumber.length > 0 && styles.phoneInputSuccess,
          ]}
          value={phoneNumber}
          onChangeText={handlePhoneNumberChange}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textLight}
          keyboardType="phone-pad"
          maxLength={15}
          returnKeyType="done"
        />

        {/* Indicateur de validation */}
        <View style={styles.validationIndicator}>
          {phoneNumber.length > 0 && (
            <Ionicons
              name={isValid ? "checkmark-circle" : "close-circle"}
              size={20}
              color={isValid ? COLORS.success : COLORS.error}
            />
          )}
        </View>
      </View>

      {/* Message de validation */}
      {phoneNumber.length > 0 && (
        <View style={styles.messageContainer}>
          <Ionicons
            name={isValid ? "checkmark-circle" : "warning"}
            size={14}
            color={isValid ? COLORS.success : COLORS.error}
          />
          <Text
            style={[
              styles.messageText,
              { color: isValid ? COLORS.success : COLORS.error },
            ]}
          >
            {isValid
              ? `✓ Numéro valide: ${formattedNumber}`
              : "Numéro de téléphone invalide"}
          </Text>
        </View>
      )}

      {/* Modal de sélection de pays */}
      <Modal
        visible={showCountryPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner un pays</Text>
            <TouchableOpacity
              onPress={() => setShowCountryPicker(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* Barre de recherche */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Rechercher un pays..."
              placeholderTextColor={COLORS.textLight}
              autoCorrect={false}
            />
          </View>

          {/* Liste des pays */}
          <FlatList
            data={filteredCountries}
            renderItem={renderCountryItem}
            keyExtractor={(item) => item}
            style={styles.countryList}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    overflow: "hidden",
  },
  flagImage: {
    borderRadius: 2,
    resizeMode: "cover",
  },
  countrySelector: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    backgroundColor: COLORS.background,
    minWidth: 90,
  },
  callingCodeText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
    marginLeft: 8,
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingHorizontal: 15,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    ...(Platform.OS === "web" && {
      outlineStyle: "none",
    }),
  },
  phoneInputError: {
    borderColor: COLORS.error,
  },
  phoneInputSuccess: {
    borderColor: COLORS.success,
  },
  validationIndicator: {
    paddingHorizontal: 12,
  },
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  messageText: {
    fontSize: 14,
    marginLeft: 6,
    flex: 1,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === "android" ? 25 : 0,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
  },
  closeButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 10,
    ...(Platform.OS === "web" && {
      outlineStyle: "none",
    }),
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
  },
  selectedCountryItem: {
    backgroundColor: "rgba(194, 0, 47, 0.05)",
  },
  countryInfo: {
    flex: 1,
    marginLeft: 15,
  },
  countryName: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  countryCode: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 65,
  },
});

export default PhoneInput;
