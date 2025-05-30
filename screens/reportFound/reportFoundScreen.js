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
import PhoneInput from "react-native-phone-number-input";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";

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

  // États du formulaire avec useForm
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      typeObjet: "",
      description: "",
      lieu: "",
      numVol: "",
      email: "",
      telephone: "",
      acceptTerms: false,
    },
  });

  // États locaux
  const [currentStep, setCurrentStep] = useState(1);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const phoneInput = useRef(null);
  const scrollViewRef = useRef();

  // Surveillance des valeurs pour les alertes conditionnelles
  const typeObjet = watch("typeObjet");
  const description = watch("description");

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
    reset();
    setImage(null);
    setCurrentStep(1);
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

  // Validation spécifique par étape avec alertes détaillées
  const validateStep = (step) => {
    const values = getValues();

    if (step === 1) {
      // Validation type d'objet
      if (!values.typeObjet?.trim()) {
        Alert.alert(
          "Type d'objet requis",
          "Veuillez sélectionner le type d'objet trouvé dans la liste."
        );
        return false;
      }

      // Validation description si "Autre" est sélectionné
      const isAutre = values.typeObjet?.trim().toLowerCase() === "autre";
      if (isAutre && !values.description?.trim()) {
        Alert.alert(
          "Description requise",
          "Vous avez sélectionné 'Autre'. Veuillez fournir une description détaillée de l'objet."
        );
        return false;
      }

      if (isAutre && values.description?.length < 10) {
        Alert.alert(
          "Description insuffisante",
          "La description doit contenir au moins 10 caractères pour identifier l'objet."
        );
        return false;
      }
    }

    if (step === 2) {
      // Validation numéro de vol
      if (!values.numVol?.trim()) {
        Alert.alert(
          "Numéro de vol requis",
          "Veuillez saisir le numéro de vol où l'objet a été trouvé (ex: AT123)."
        );
        return false;
      }

      // Validation format numéro de vol
      const volPattern = /^[A-Z]{2}\d+$/i;
      if (!volPattern.test(values.numVol)) {
        Alert.alert(
          "Format de vol invalide",
          "Le numéro de vol doit suivre le format: 2 lettres suivies de chiffres (ex: AT123, RL456)."
        );
        return false;
      }

      // Validation lieu
      if (!values.lieu?.trim()) {
        Alert.alert(
          "Lieu requis",
          "Veuillez préciser où exactement l'objet a été trouvé (ex: Siège 12A, Toilettes, Compartiment bagage)."
        );
        return false;
      }

      if (values.lieu.length < 3) {
        Alert.alert(
          "Lieu trop vague",
          "Veuillez être plus précis sur le lieu de découverte pour faciliter l'identification."
        );
        return false;
      }
    }

    if (step === 3) {
      // Validation email
      if (!values.email?.trim()) {
        Alert.alert(
          "Email requis",
          "Votre adresse email est nécessaire pour vous contacter en cas de réclamation."
        );
        return false;
      }

      const emailPattern = /^\S+@\S+\.\S+$/;
      if (!emailPattern.test(values.email)) {
        Alert.alert(
          "Email invalide",
          "Veuillez saisir une adresse email valide (ex: exemple@mail.com)."
        );
        return false;
      }

      // Validation téléphone
      const phoneNumber =
        phoneInput.current?.getNumberAfterPossiblyEliminatingZero()
          ?.formattedNumber;
      if (!phoneNumber) {
        Alert.alert(
          "Téléphone requis",
          "Votre numéro de téléphone est nécessaire pour un contact rapide en cas de besoin."
        );
        return false;
      }

      // Mettre à jour la valeur du téléphone
      setValue("telephone", phoneNumber);
    }

    if (step === 4) {
      // Validation conditions générales
      if (!values.acceptTerms) {
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
  const onSubmit = async (data) => {
    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      const imageToUpload = image;

      const form = {
        typeObjet: data.typeObjet,
        description: data.description,
        date: new Date().toISOString(), // Date automatique basée sur le moment de la déclaration
        lieu: data.lieu,
        numVol: data.numVol,
        email: data.email,
        telephone: data.telephone,
      };

      const { docId, shortCode } = await saveFoundObjectReport(
        form,
        imageToUpload
      );

      // Alert simple puis navigation directe
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
    const isAutre = typeObjet?.trim().toLowerCase() === "autre";

    switch (currentStep) {
      case 1:
        return (
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>{STEPS[0].title}</Text>

            <Text style={styles.fieldLabel}>Type d'objet *</Text>
            <Controller
              control={control}
              name="typeObjet"
              render={({ field: { onChange, value } }) => (
                <CustomSelector
                  label="Sélectionnez un type d'objet"
                  options={objectTypes}
                  selectedValue={value}
                  onSelect={onChange}
                />
              )}
            />

            <Text style={styles.fieldLabel}>
              Description {isAutre ? "*" : "(optionnel)"}
            </Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.modernInput, styles.textArea]}
                  value={value || ""}
                  onChangeText={onChange}
                  placeholder="Décrivez l'objet en détail (marque, taille, couleur, signes distinctifs...)"
                  placeholderTextColor={COLORS.textLight}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              )}
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
            <Controller
              control={control}
              name="numVol"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.modernInput}
                  placeholder="ex : AT123, RL456"
                  placeholderTextColor={COLORS.textLight}
                  value={value || ""}
                  onChangeText={onChange}
                  autoCapitalize="characters"
                />
              )}
            />
            <Text style={styles.helperText}>
              Format attendu: 2 lettres suivies de chiffres
            </Text>

            <Text style={styles.fieldLabel}>Lieu de découverte *</Text>
            <Controller
              control={control}
              name="lieu"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.modernInput}
                  placeholder="ex: Siège 12A, Toilettes, Compartiment bagage..."
                  placeholderTextColor={COLORS.textLight}
                  value={value || ""}
                  onChangeText={onChange}
                />
              )}
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
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.modernInput}
                  placeholder="exemple@mail.com"
                  placeholderTextColor={COLORS.textLight}
                  value={value || ""}
                  onChangeText={onChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              )}
            />

            <Text style={styles.fieldLabel}>Téléphone *</Text>
            <View style={styles.phoneContainer}>
              <PhoneInput
                ref={phoneInput}
                defaultValue=""
                defaultCode="MA"
                layout="first"
                onChangeFormattedText={(text) => setValue("telephone", text)}
                containerStyle={styles.phoneInputContainer}
                textContainerStyle={styles.phoneTextContainer}
                textInputStyle={styles.phoneTextInput}
                codeTextStyle={styles.phoneCodeText}
                flagButtonStyle={styles.phoneFlagButton}
              />
            </View>
            <Text style={styles.helperText}>
              Vos coordonnées sont utilisées uniquement pour vous contacter si
              nécessaire
            </Text>
          </View>
        );

      case 4:
        // Récupérer les valeurs uniquement au moment de l'affichage de l'étape 4
        const step4Values = {
          typeObjet: getValues("typeObjet"),
          description: getValues("description"),
          numVol: getValues("numVol"),
          lieu: getValues("lieu"),
          email: getValues("email"),
          telephone: getValues("telephone"),
        };

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
                  {step4Values.typeObjet || "Non défini"}
                </Text>
              </View>

              {step4Values.description?.trim() && (
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Description:</Text>
                  <Text style={styles.summaryValue}>
                    {step4Values.description}
                  </Text>
                </View>
              )}

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Numéro de vol:</Text>
                <Text style={styles.summaryValue}>
                  {step4Values.numVol || "Non défini"}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Lieu:</Text>
                <Text style={styles.summaryValue}>
                  {step4Values.lieu || "Non défini"}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Email:</Text>
                <Text style={styles.summaryValue}>
                  {step4Values.email || "Non défini"}
                </Text>
              </View>

              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Téléphone:</Text>
                <Text style={styles.summaryValue}>
                  {step4Values.telephone || "Non renseigné"}
                </Text>
              </View>
            </View>

            <Controller
              control={control}
              name="acceptTerms"
              render={({ field: { onChange, value } }) => (
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => onChange(!value)}
                >
                  <View
                    style={[styles.checkbox, value && styles.checkboxChecked]}
                  >
                    {value && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    J'accepte les conditions générales
                  </Text>
                </TouchableOpacity>
              )}
            />

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
                onPress={handleSubmit(onSubmit)}
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
  phoneContainer: {
    marginBottom: 8,
  },
  phoneInputContainer: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 0,
    height: 50,
  },
  phoneTextContainer: {
    backgroundColor: "transparent",
    paddingVertical: 0,
  },
  phoneTextInput: {
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
  phoneCodeText: {
    fontSize: 16,
    color: COLORS.text,
  },
  phoneFlagButton: {
    paddingHorizontal: 8,
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
