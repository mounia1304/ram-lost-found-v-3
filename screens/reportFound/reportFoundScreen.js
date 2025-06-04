import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  Dimensions,
  SafeAreaView,
  ActivityIndicator,
  Modal,
} from "react-native";
// Remplacer l'import PhoneInput par notre composant
import PhoneInput from "../../components/PhoneNumberInput";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

// Constantes et services
import { objectTypes } from "../../constants/objecttypes";
import { saveFoundObjectReport } from "../../services/reportFoundService";

// Couleurs modernes et professionnelles
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
  shadow: "rgba(0,0,0,0.1)",
};

// Dimensions de l'écran
const { width } = Dimensions.get("window");

// Définition des étapes du formulaire
const STEPS = [
  { id: 1, title: "Informations sur l'objet" },
  { id: 2, title: "Lieu de découverte" },
  { id: 3, title: "Vos coordonnées" },
  { id: 4, title: "Photo et confirmation" },
];

// Composant de sélecteur personnalisé pour le type d'objet
const CustomSelector = ({ label, options, selectedValue, onSelect }) => {
  const [modalVisible, setModalVisible] = useState(false);

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
              {options.map((option, index) => (
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

function ReportFoundScreen() {
  const navigation = useNavigation();

  // États du formulaire
  const [formData, setFormData] = useState({
    typeObjet: "",
    description: "",
    lieu: "",
    numVol: "",
    email: "",
    telephone: "",
    acceptTerms: false,
  });

  // NOUVEAUX ÉTATS pour le téléphone
  const [phoneData, setPhoneData] = useState(null);
  const [phoneError, setPhoneError] = useState("");

  const [currentStep, setCurrentStep] = useState(1);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  // NOUVELLE FONCTION pour gérer le changement de téléphone
  const handlePhoneChange = (phoneDataReceived) => {
    setPhoneData(phoneDataReceived);

    // Mettre à jour formData.telephone avec le numéro complet formaté
    setFormData((prev) => ({
      ...prev,
      telephone: phoneDataReceived.fullNumber || phoneDataReceived.raw || "",
    }));

    // Gérer les erreurs de validation
    if (phoneDataReceived.raw && !phoneDataReceived.isValid) {
      setPhoneError("Numéro de téléphone invalide");
    } else {
      setPhoneError("");
    }
  };

  // Gestion des changements de formulaire
  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Demande d'autorisation pour accéder à la galerie
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permission requise pour accéder à la galerie.");
      }
    })();
  }, []);

  // Réinitialisation du formulaire
  const resetForm = () => {
    setFormData({
      typeObjet: "",
      description: "",
      lieu: "",
      numVol: "",
      email: "",
      telephone: "",
      acceptTerms: false,
    });
    setImage(null);
    setCurrentStep(1);
    // Réinitialiser les données de téléphone
    setPhoneData(null);
    setPhoneError("");
  };

  // Sélection d'une image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  // VALIDATION MISE À JOUR pour le téléphone
  const validateStep = (step) => {
    if (step === 1) {
      // Validation type d'objet
      if (!formData.typeObjet?.trim()) {
        Alert.alert(
          "Type d'objet requis",
          "Veuillez sélectionner le type d'objet trouvé dans la liste."
        );
        return false;
      }

      // Validation description si "Autre" est sélectionné
      const isAutre = formData.typeObjet?.trim().toLowerCase() === "autre";
      if (isAutre && !formData.description?.trim()) {
        Alert.alert(
          "Description requise",
          "Vous avez sélectionné 'Autre'. Veuillez fournir une description détaillée de l'objet."
        );
        return false;
      }

      if (isAutre && formData.description?.length < 10) {
        Alert.alert(
          "Description insuffisante",
          "La description doit contenir au moins 10 caractères pour identifier l'objet."
        );
        return false;
      }
    }

    if (step === 2) {
      // Validation numéro de vol
      if (!formData.numVol?.trim()) {
        Alert.alert(
          "Numéro de vol requis",
          "Veuillez saisir le numéro de vol où l'objet a été trouvé (ex: AT123)."
        );
        return false;
      }

      // Validation format numéro de vol
      const volPattern = /^[A-Z]{2}\d+$/i;
      if (!volPattern.test(formData.numVol)) {
        Alert.alert(
          "Format de vol invalide",
          "Le numéro de vol doit suivre le format: 2 lettres suivies de chiffres (ex: AT123, RL456)."
        );
        return false;
      }

      // Validation lieu
      if (!formData.lieu?.trim()) {
        Alert.alert(
          "Lieu requis",
          "Veuillez préciser où exactement l'objet a été trouvé (ex: Siège 12A, Toilettes, Compartiment bagage)."
        );
        return false;
      }

      if (formData.lieu.length < 3) {
        Alert.alert(
          "Lieu trop vague",
          "Veuillez être plus précis sur le lieu de découverte pour faciliter l'identification."
        );
        return false;
      }
    }

    if (step === 3) {
      // Validation email
      if (!formData.email?.trim()) {
        Alert.alert(
          "Email requis",
          "Votre adresse email est nécessaire pour vous contacter en cas de réclamation."
        );
        return false;
      }

      const emailPattern = /^\S+@\S+\.\S+$/;
      if (!emailPattern.test(formData.email)) {
        Alert.alert(
          "Email invalide",
          "Veuillez saisir une adresse email valide (ex: exemple@mail.com)."
        );
        return false;
      }

      // NOUVELLE VALIDATION pour le téléphone
      if (!phoneData || !phoneData.isValid) {
        Alert.alert(
          "Téléphone requis",
          "Votre numéro de téléphone valide est nécessaire pour un contact rapide en cas de besoin."
        );
        return false;
      }
    }

    if (step === 4) {
      // Validation conditions générales
      if (!formData.acceptTerms) {
        Alert.alert(
          "Conditions générales",
          "Vous devez accepter les conditions générales pour pouvoir soumettre votre déclaration."
        );
        return false;
      }
    }

    return true;
  };

  // Navigation entre les étapes
  const goToNextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
          }
        }, 100);
      }
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }, 100);
    } else {
      navigation.goBack();
    }
  };

  // Soumission du formulaire
  const onSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      const imageToUpload = image;

      // Préparer les données avec les nouvelles informations de téléphone
      const form = {
        typeObjet: formData.typeObjet,
        description: formData.description,
        date: new Date().toISOString(),
        lieu: formData.lieu,
        numVol: formData.numVol,
        email: formData.email,
        telephone: formData.telephone,
        // Inclure les données complètes du téléphone
        phoneCountry: phoneData?.countryCode || "",
        phoneFormatted: phoneData?.formatted || "",
        phoneCallingCode: phoneData?.callingCode || "",
      };

      const { docId, shortCode } = await saveFoundObjectReport(
        form,
        imageToUpload
      );

      Alert.alert(
        "Succès",
        "Votre déclaration a été enregistrée avec succès !",
        [
          {
            text: "OK",
            onPress: () => {
              resetForm();
              navigation.navigate("QRCode", {
                docId: docId,
                shortCode: shortCode,
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erreur lors de l'enregistrement :", error);
      Alert.alert(
        "Erreur",
        "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  };

  // Indicateur de progression moderne
  const renderProgressIndicator = () => {
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(currentStep / STEPS.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          Étape {currentStep} sur {STEPS.length}
        </Text>
      </View>
    );
  };

  // Rendu des différentes étapes du formulaire
  const renderStepContent = () => {
    const isAutre = formData.typeObjet?.trim().toLowerCase() === "autre";

    switch (currentStep) {
      case 1:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>{STEPS[0].title}</Text>

            <Text style={styles.fieldLabel}>Type d'objet *</Text>
            <CustomSelector
              label="Sélectionnez un type d'objet"
              options={objectTypes}
              selectedValue={formData.typeObjet}
              onSelect={(value) => handleChange("typeObjet", value)}
            />

            <Text style={styles.fieldLabel}>
              Description {isAutre ? "*" : "(optionnel)"}
            </Text>
            <TextInput
              style={[styles.modernInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleChange("description", text)}
              placeholder="Décrivez l'objet en détail (marque, taille, couleur, signes distinctifs...)"
              placeholderTextColor={COLORS.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Text style={styles.helperText}>
              {isAutre
                ? "Description obligatoire pour le type 'Autre'"
                : "Plus votre description est précise, plus il sera facile de retrouver le propriétaire."}
            </Text>
          </View>
        );

      case 2:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>{STEPS[1].title}</Text>

            <Text style={styles.fieldLabel}>Numéro de vol *</Text>
            <TextInput
              style={styles.modernInput}
              placeholder="ex : AT123, RL456"
              placeholderTextColor={COLORS.textLight}
              value={formData.numVol}
              onChangeText={(text) => handleChange("numVol", text)}
              autoCapitalize="characters"
            />
            <Text style={styles.helperText}>
              Format attendu: 2 lettres suivies de chiffres
            </Text>

            <Text style={styles.fieldLabel}>Lieu de découverte *</Text>
            <TextInput
              style={styles.modernInput}
              placeholder="ex: Siège 12A, Toilettes, Compartiment bagage..."
              placeholderTextColor={COLORS.textLight}
              value={formData.lieu}
              onChangeText={(text) => handleChange("lieu", text)}
            />
            <Text style={styles.helperText}>
              Soyez le plus précis possible pour faciliter l'identification
            </Text>
          </View>
        );

      case 3:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>{STEPS[2].title}</Text>

            <Text style={styles.fieldLabel}>Email *</Text>
            <TextInput
              style={styles.modernInput}
              placeholder="exemple@mail.com"
              placeholderTextColor={COLORS.textLight}
              value={formData.email}
              onChangeText={(text) => handleChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* REMPLACEMENT du PhoneInput par WebCompatiblePhoneInput */}
            <View style={styles.phoneFieldContainer}>
              <PhoneInput
                label="Téléphone *"
                defaultCountry="MA"
                onPhoneChange={handlePhoneChange}
                placeholder="Entrez votre numéro"
                preferredCountries={["MA", "FR", "ES", "DZ", "TN"]}
                excludeCountries={["AF", "KP", "IR", "SY", "IQ"]}
              />
              {phoneError && (
                <Text style={styles.phoneErrorText}>{phoneError}</Text>
              )}
            </View>

            <Text style={styles.helperText}>
              Vos coordonnées sont utilisées uniquement pour vous contacter si
              nécessaire
            </Text>
          </View>
        );

      case 4:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>{STEPS[3].title}</Text>

            <Text style={styles.fieldLabel}>Photo de l'objet</Text>
            <Text style={styles.formNote}>
              Une photo augmente considérablement les chances de retrouver le
              propriétaire.
            </Text>

            <TouchableOpacity
              style={styles.imagePickerContainer}
              onPress={pickImage}
            >
              {image ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: image }} style={styles.previewImage} />
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
              ) : (
                <View style={styles.addPhotoButton}>
                  <Ionicons
                    name="camera-outline"
                    size={32}
                    color={COLORS.primary}
                  />
                  <Text style={styles.addPhotoText}>+ Ajouter une photo</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Récapitulatif</Text>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Type d'objet:</Text>
                <Text style={styles.summaryValue}>
                  {formData.typeObjet || "Non défini"}
                </Text>
              </View>

              {formData.description?.trim() && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Description:</Text>
                  <Text style={styles.summaryValue}>
                    {formData.description}
                  </Text>
                </View>
              )}

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Numéro de vol:</Text>
                <Text style={styles.summaryValue}>
                  {formData.numVol || "Non défini"}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Lieu:</Text>
                <Text style={styles.summaryValue}>
                  {formData.lieu || "Non défini"}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Email:</Text>
                <Text style={styles.summaryValue}>
                  {formData.email || "Non défini"}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Téléphone:</Text>
                <Text style={styles.summaryValue}>
                  {phoneData?.formatted ||
                    formData.telephone ||
                    "Non renseigné"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => handleChange("acceptTerms", !formData.acceptTerms)}
            >
              <View
                style={[
                  styles.checkbox,
                  formData.acceptTerms && styles.checkboxChecked,
                ]}
              >
                {formData.acceptTerms && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                J'accepte les conditions générales
              </Text>
            </TouchableOpacity>

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
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={goToPreviousStep}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Déclarer un objet trouvé</Text>
          <View style={{ width: 24 }} />
        </View>

        {renderProgressIndicator()}

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {renderStepContent()}
          <View style={styles.buttonSpacing} />
        </ScrollView>

        <View style={styles.buttonContainer}>
          {currentStep < STEPS.length ? (
            <View style={styles.navigationButtons}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={styles.previousButton}
                  onPress={goToPreviousStep}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="arrow-back"
                    size={20}
                    color={COLORS.textLight}
                  />
                  <Text style={styles.previousButtonText}>Précédent</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.nextButton,
                  currentStep === 1 && styles.nextButtonFullWidth,
                ]}
                onPress={goToNextStep}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Continuer</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.navigationButtons}>
              <TouchableOpacity
                style={styles.previousButton}
                onPress={goToPreviousStep}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="arrow-back"
                  size={20}
                  color={COLORS.textLight}
                />
                <Text style={styles.previousButtonText}>Précédent</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={onSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Déclarer l'objet</Text>
                    <Ionicons name="checkmark" size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    paddingVertical: 12,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
    borderRadius: 3,
  },
  progressText: {
    textAlign: "center",
    marginTop: 8,
    color: COLORS.textLight,
    fontSize: 12,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 24,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 24,
    textAlign: "center",
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  modernInput: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "400",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
    fontStyle: "italic",
  },
  // NOUVEAUX STYLES pour le champ téléphone
  phoneFieldContainer: {
    marginTop: 16,
  },
  phoneErrorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 5,
    marginLeft: 5,
  },
  selectorButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  selectorButtonText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "400",
  },
  placeholderText: {
    color: COLORS.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxHeight: "70%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
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
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
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
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    borderRadius: 6,
    marginVertical: 2,
  },
  selectedOption: {
    backgroundColor: "#f8f9fa",
    borderColor: COLORS.primary,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "400",
  },
  selectedOptionText: {
    fontWeight: "600",
    color: COLORS.primary,
  },
  imagePickerContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  addPhotoButton: {
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  addPhotoText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  imagePreviewContainer: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  summaryLabel: {
    fontWeight: "600",
    color: COLORS.text,
    width: 110,
    fontSize: 14,
  },
  summaryValue: {
    flex: 1,
    color: COLORS.textLight,
    fontSize: 14,
    lineHeight: 20,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 4,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
  },
  consentText: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 18,
    textAlign: "center",
  },
  formNote: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 12,
    fontStyle: "italic",
  },
  buttonContainer: {
    padding: 20,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previousButton: {
    backgroundColor: "#f0f0f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    flex: 0.45,
  },
  previousButtonText: {
    color: COLORS.textLight,
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    flex: 0.5,
  },
  nextButtonFullWidth: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: COLORS.success,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    flex: 0.5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    marginRight: 8,
  },
  buttonSpacing: {
    height: 60,
  },
});

export default ReportFoundScreen;
