import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import PhoneInput from "react-native-phone-number-input";
import { saveLostObjectReport } from "../../services/reportLostService";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/databaseService/firebaseConfig";

// Import des constantes
import { objectTypes } from "../../constants/objecttypes";

// Couleurs (reprises de votre thème RAM)
const COLORS = {
  primary: "#c2002f",
  primaryDark: "#a4001f",
  secondary: "#003366",
  gold: "#d4af37",
  light: "#ffffff",
  background: "#f8f9fa",
  text: "#333333",
  textLight: "#767676",
  border: "#e0e0e0",
  success: "#28a745",
  error: "#dc3545",
  card: "#ffffff",
};

// Couleurs disponibles pour multi-sélection
const AVAILABLE_COLORS = [
  { name: "Noir", value: "noir" },
  { name: "Blanc", value: "blanc" },
  { name: "Gris", value: "gris" },
  { name: "Bleu", value: "bleu" },
  { name: "Rouge", value: "rouge" },
  { name: "Vert", value: "vert" },
  { name: "Jaune", value: "jaune" },
  { name: "Marron", value: "marron" },
  { name: "Beige", value: "beige" },
  { name: "Multi-couleur", value: "multicolore" },
];

// Composant de sélecteur personnalisé pour remplacer le Picker
const CustomSelector = ({ label, options, selectedValue, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);

  // Vérification de sécurité pour les options
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <View>
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            styles.selectorButtonText,
            !selectedValue && styles.placeholderText,
          ]}
        >
          {selectedValue || label}
        </Text>
        <Ionicons name="chevron-down" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.optionsList}>
              {safeOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionItem,
                    selectedValue === option && styles.selectedOption,
                  ]}
                  onPress={() => {
                    onSelect(option);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedValue === option && styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                  {selectedValue === option && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const ReportLostScreen = ({ navigation }) => {
  // États des formulaires avec valeurs par défaut sécurisées
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    pnr: "",
    type: "",
    description: "",
    detailedDescription: "",
    location: "",
    color: [],
    additionalDetails: "",
  });

  // État pour l'image
  const [image, setImage] = useState(null);

  // État de chargement
  const [isLoading, setIsLoading] = useState(false);

  // État progression du formulaire
  const [currentStep, setCurrentStep] = useState(1);
  const scrollViewRef = useRef();
  const phoneInput = useRef(null);

  // État pour l'authentification
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // État pour les conditions générales
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Vérification de l'authentification au chargement du composant
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // L'utilisateur est connecté
        setIsAuthenticated(true);

        // Pré-remplir les informations de l'utilisateur si disponibles
        if (user.displayName) {
          const nameParts = user.displayName.split(" ");
          if (nameParts.length > 0) {
            setFormData((prev) => ({
              ...prev,
              firstName: nameParts[0] || "",
              lastName: nameParts.slice(1).join(" ") || "",
            }));
          }
        }

        if (user.email) {
          setFormData((prev) => ({
            ...prev,
            email: user.email,
          }));
        }

        if (user.phoneNumber) {
          setFormData((prev) => ({
            ...prev,
            phone: user.phoneNumber || "",
          }));
        }
      } else {
        // L'utilisateur n'est pas connecté, rediriger vers la connexion
        setIsAuthenticated(false);
        redirectToAuth();
      }
      setAuthChecked(true);
    });

    // Nettoyer l'abonnement lors du démontage du composant
    return () => unsubscribe();
  }, []);

  // Fonction pour rediriger vers l'authentification
  const redirectToAuth = () => {
    Alert.alert(
      "Authentification requise",
      "Vous devez être connecté pour déclarer un objet perdu.",
      [
        {
          text: "Se connecter",
          onPress: () =>
            navigation.navigate("Login", { returnTo: "ReportLost" }),
        },
        {
          text: "Créer un compte",
          onPress: () =>
            navigation.navigate("Register", { returnTo: "ReportLost" }),
        },
        {
          text: "Annuler",
          style: "cancel",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  // Fonctions gestion formulaire avec vérifications de sécurité
  const updateFormField = (field, value) => {
    if (typeof field === "string" && field.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [field]: value !== undefined && value !== null ? value : "",
      }));
    }
  };

  // Fonction pour gérer les couleurs multi-sélection
  const toggleColor = (colorValue) => {
    if (!colorValue || typeof colorValue !== "string") return;

    setFormData((prev) => {
      const colors = Array.isArray(prev.color) ? [...prev.color] : [];
      const index = colors.indexOf(colorValue);

      if (index > -1) {
        colors.splice(index, 1); // Retire la couleur si déjà présente
      } else {
        colors.push(colorValue); // Ajoute la couleur
      }

      return { ...prev, color: colors };
    });
  };

  // Fonction pour sélectionner une image depuis la galerie
  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission requise",
          "Vous devez autoriser l'accès à votre galerie de photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Erreur lors de la sélection d'image:", error);
      Alert.alert("Erreur", "Impossible d'accéder à la galerie de photos");
    }
  };

  // Validation du PNR (6 caractères alphanumériques)
  const validatePNR = (pnr) => {
    if (!pnr || typeof pnr !== "string") return false;
    const pnrRegex = /^[A-Za-z0-9]{6}$/;
    return pnrRegex.test(pnr);
  };

  // Fonction pour valider l'étape actuelle
  const validateCurrentStep = () => {
    if (currentStep === 1) {
      // Validation des informations personnelles
      if (!formData.lastName || !formData.lastName.trim())
        return "Le nom est requis";
      if (!formData.email || !formData.email.trim())
        return "L'email est requis";
      if (!/^\S+@\S+\.\S+$/.test(formData.email))
        return "Format d'email invalide";
      if (!formData.phone || !formData.phone.trim())
        return "Le numéro de téléphone est requis";
      if (!formData.pnr || !formData.pnr.trim()) return "Le PNR est requis";
      if (!validatePNR(formData.pnr))
        return "Le PNR doit contenir exactement 6 caractères (lettres et chiffres)";
    } else if (currentStep === 2) {
      // Validation des informations de l'objet
      if (!formData.type) return "Le type d'objet est requis";
      if (!formData.location || !formData.location.trim())
        return "Le lieu de perte est requis";
      if (
        (formData.type === "Autre" ||
          formData.type === "autre" ||
          formData.type === "other") &&
        (!formData.detailedDescription || !formData.detailedDescription.trim())
      )
        return "La description détaillée est requise pour 'Autre'";
      if (!Array.isArray(formData.color) || formData.color.length === 0)
        return "Veuillez sélectionner au moins une couleur";
    } else if (currentStep === 3) {
      if (!acceptTerms) return "Vous devez accepter les conditions générales";
    }

    return null; // Aucune erreur
  };

  // Fonction pour passer à l'étape suivante
  const goToNextStep = () => {
    const error = validateCurrentStep();

    if (error) {
      Alert.alert("Formulaire incomplet", error);
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      // Faire défiler vers le haut après un court délai
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }, 100);
    }
  };

  // Fonction pour revenir à l'étape précédente
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      // Faire défiler vers le haut après un court délai
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }, 100);
    } else {
      // Retour à l'écran précédent
      navigation.goBack();
    }
  };

  // Fonction pour soumettre le formulaire
  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      // Validation finale
      const error = validateCurrentStep();
      if (error) {
        Alert.alert("Erreur de validation", error);
        return;
      }

      // Préparer les données finales
      const finalData = {
        ...formData,
      };

      // Envoyer à Firebase
      const result = await saveLostObjectReport(finalData, image);

      // Vérifier si le résultat contient le shortCode
      const shortCode = result && result.shortCode ? result.shortCode : "N/A";

      // Afficher confirmation
      Alert.alert(
        "Déclaration enregistrée",
        `Votre déclaration a été enregistrée avec succès. Votre numéro de référence est ${shortCode}. Vous recevrez une notification si votre objet est retrouvé.`,
        [
          {
            text: "OK",
            onPress: () => {
              // Retourner à l'écran d'accueil
              navigation.navigate("Profile");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'enregistrement de votre déclaration. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Si la vérification d'authentification n'est pas terminée, afficher un indicateur de chargement
  if (!authChecked) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          Vérification de l'authentification...
        </Text>
      </View>
    );
  }

  // Afficher le contenu en fonction de l'étape actuelle
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>
              Vos informations personnelles
            </Text>
            <Text style={styles.fieldLabel}>Prénom</Text>
            <TextInput
              style={styles.input}
              value={formData.firstName || ""}
              onChangeText={(text) => updateFormField("firstName", text)}
              placeholder="Votre prénom"
              placeholderTextColor="#999"
            />

            <Text style={styles.fieldLabel}>Nom *</Text>
            <TextInput
              style={styles.input}
              value={formData.lastName || ""}
              onChangeText={(text) => updateFormField("lastName", text)}
              placeholder="Votre nom"
              placeholderTextColor="#999"
            />

            <Text style={styles.fieldLabel}>Email *</Text>
            <TextInput
              style={styles.input}
              value={formData.email || ""}
              onChangeText={(text) => updateFormField("email", text)}
              placeholder="exemple@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.fieldLabel}>Téléphone *</Text>
            <PhoneInput
              ref={phoneInput}
              defaultValue={formData.phone || ""}
              defaultCode="MA"
              layout="first"
              onChangeText={(text) => updateFormField("phone", text)}
              onChangeFormattedText={(text) => updateFormField("phone", text)}
              containerStyle={styles.phoneContainer}
              textContainerStyle={styles.phoneTextContainer}
              textInputStyle={styles.phoneInput}
              codeTextStyle={styles.phoneCodeText}
              flagButtonStyle={styles.phoneFlagButton}
              placeholder="Numéro de téléphone"
            />

            <Text style={styles.fieldLabel}>PNR *</Text>
            <TextInput
              style={styles.input}
              value={formData.pnr || ""}
              onChangeText={(text) =>
                updateFormField("pnr", text.toUpperCase())
              }
              placeholder="Ex: ABC123"
              placeholderTextColor="#999"
              maxLength={6}
              autoCapitalize="characters"
            />
            <Text style={styles.formNote}>
              Code de réservation (6 caractères alphanumériques)
            </Text>

            <Text style={styles.formNote}>
              * Ces informations sont nécessaires pour vous contacter si votre
              objet est retrouvé.
            </Text>
          </View>
        );

      case 2:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Détails de l'objet perdu</Text>

            <Text style={styles.fieldLabel}>Type d'objet *</Text>
            <CustomSelector
              label="Sélectionnez un type d'objet"
              options={objectTypes || []}
              selectedValue={formData.type}
              onSelect={(value) => updateFormField("type", value)}
            />

            <Text style={styles.fieldLabel}>Lieu de perte *</Text>
            <TextInput
              style={styles.input}
              value={formData.location || ""}
              onChangeText={(text) => updateFormField("location", text)}
              placeholder="poche de siège, toilettes..."
              placeholderTextColor="#999"
            />

            {(formData.type === "Autre" || formData.type === "other") && (
              <>
                <Text style={styles.fieldLabel}>Description détaillée *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.detailedDescription || ""}
                  onChangeText={(text) =>
                    updateFormField("detailedDescription", text)
                  }
                  placeholder="Décrivez précisément votre objet"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </>
            )}

            <Text style={styles.fieldLabel}>Couleur(s) *</Text>
            <View style={styles.colorContainer}>
              {AVAILABLE_COLORS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorButton,
                    Array.isArray(formData.color) &&
                      formData.color.includes(color.value) &&
                      styles.colorButtonSelected,
                  ]}
                  onPress={() => toggleColor(color.value)}
                >
                  <Text
                    style={[
                      styles.colorButtonText,
                      Array.isArray(formData.color) &&
                        formData.color.includes(color.value) &&
                        styles.colorButtonTextSelected,
                    ]}
                  >
                    {color.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Informations supplémentaires</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.additionalDetails || ""}
              onChangeText={(text) =>
                updateFormField("additionalDetails", text)
              }
              placeholder="Toute information utile pour retrouver votre objet..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        );

      case 3:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Photo et confirmation</Text>

            <Text style={styles.fieldLabel}>Ajouter une photo</Text>
            <Text style={styles.formNote}>
              Une photo augmente vos chances de retrouver votre objet de 65%.
            </Text>

            <View style={styles.imageOptions}>
              <TouchableOpacity
                style={styles.imageOptionButton}
                onPress={pickImage}
              >
                <Ionicons
                  name="images-outline"
                  size={24}
                  color={COLORS.primary}
                />
                <Text style={styles.imageOptionText}>Galerie</Text>
              </TouchableOpacity>
            </View>

            {image && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={COLORS.error}
                  />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Récapitulatif</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Nom:</Text>
                <Text style={styles.summaryValue}>
                  {formData.firstName || ""} {formData.lastName || ""}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Email:</Text>
                <Text style={styles.summaryValue}>{formData.email || ""}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Téléphone:</Text>
                <Text style={styles.summaryValue}>{formData.phone || ""}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>PNR:</Text>
                <Text style={styles.summaryValue}>{formData.pnr || ""}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Type:</Text>
                <Text style={styles.summaryValue}>{formData.type || ""}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Lieu:</Text>
                <Text style={styles.summaryValue}>
                  {formData.location || ""}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Couleurs:</Text>
                <Text style={styles.summaryValue}>
                  {Array.isArray(formData.color)
                    ? formData.color
                        .map((c) => {
                          const colorObj = AVAILABLE_COLORS.find(
                            (item) => item.value === c
                          );
                          return colorObj ? colorObj.name : c;
                        })
                        .join(", ")
                    : ""}
                </Text>
              </View>
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    acceptTerms && styles.checkboxChecked,
                  ]}
                >
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={16} color="white" />
                  )}
                </View>
                <Text style={styles.checkboxText}>
                  J'accepte les conditions générales d'utilisation *
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.consentText}>
              En soumettant ce formulaire, vous acceptez que vos données
              personnelles soient traitées conformément à notre politique de
              confidentialité pour le traitement de votre déclaration.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={goToPreviousStep}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Déclarer un objet perdu</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentStep / 3) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>Étape {currentStep} sur 3</Text>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}

          <View style={styles.buttonSpacing} />
        </ScrollView>

        <View style={styles.buttonContainer}>
          {currentStep < 3 ? (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={goToNextStep}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    Soumettre ma déclaration
                  </Text>
                  <Ionicons name="checkmark" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButton: {
    padding: 5,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
  },
  progressText: {
    textAlign: "center",
    marginTop: 5,
    color: COLORS.textLight,
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  formNote: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 8,
    fontStyle: "italic",
  },
  phoneContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    width: "100%",
  },
  phoneTextContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  phoneInput: {
    fontSize: 16,
    color: COLORS.text,
  },
  phoneCodeText: {
    fontSize: 16,
    color: COLORS.text,
  },
  phoneFlagButton: {
    borderRadius: 8,
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
  },
  selectorButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  placeholderText: {
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
  },
  optionsList: {
    maxHeight: 300,
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedOption: {
    backgroundColor: "#f9f9f9",
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  selectedOptionText: {
    fontWeight: "bold",
    color: COLORS.primary,
  },
  colorContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  colorButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  colorButtonSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  colorButtonText: {
    fontSize: 14,
    color: COLORS.text,
  },
  colorButtonTextSelected: {
    color: "white",
  },
  imageOptions: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  imageOptionButton: {
    alignItems: "center",
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    width: "100%",
  },
  imageOptionText: {
    marginTop: 8,
    color: COLORS.text,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    marginTop: 16,
    alignItems: "center",
    position: "relative",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: "white",
    borderRadius: 20,
  },
  summaryContainer: {
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  summaryLabel: {
    width: 80,
    fontWeight: "500",
    color: COLORS.text,
  },
  summaryValue: {
    flex: 1,
    color: COLORS.textLight,
  },
  checkboxContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 6,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  consentText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 16,
    lineHeight: 18,
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: COLORS.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  buttonSpacing: {
    height: 60,
  },
  // Styles pour l'authentification
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.text,
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  authRequiredTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  authRequiredText: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: "center",
    marginBottom: 30,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginBottom: 10,
    width: "80%",
    alignItems: "center",
  },
  authButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerButton: {
    backgroundColor: COLORS.secondary,
  },
});
export default ReportLostScreen;
