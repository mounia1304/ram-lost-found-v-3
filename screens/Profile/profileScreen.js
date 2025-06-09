import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
  Animated,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { auth, firestore } from "../../services/databaseService/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfileScreen({ navigation }) {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    photoURL: null,
    PNR: null,
    documentId: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState({ ...userInfo });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  // Charte graphique RAM
  const COLORS = {
    primary: "#C20831",
    secondary: "#A22032",
    tertiary: "#B49360",
    neutral0: "#FFFFFF",
    neutral100: "#FAFAFA",
    neutral200: "#EBEAE8",
    neutral500: "#C2C1BE",
    neutral700: "#7B7A78",
    neutral900: "#333231",
    textDefault: "#595855",
    textInverse: "#FFFFFF",
    textLight: "#999999",
    textDark: "#1A1717",
    backgroundDefault: "#FFFFFF",
    backgroundAlternative: "#F7F7F7",
    backgroundAccent1: "#F0DDDD",
    backgroundAccent2: "#F6F2ED",
    backgroundPrimaryOpacity: "rgba(194, 8, 49, .8)",
    backgroundSecondaryOpacity: "rgba(97, 55, 78, .8)",
    borderDefault: "#D8D7D4",
    borderInverse: "#FFFFFF",
    borderDark: "#929292",
    iconDefault: "#C20831",
    iconInverse: "#FFFFFF",
    shadowDefault: "rgba(0, 0, 0, .1)",
    ramAccentPrimary: "#CCD7E3",
    ramAccentPrimaryDark: "#5C7693",
    ramAccentPrimaryLight: "#E3E9F0",
    semanticPositive: "#00875D",
    semanticNegative: "#A90044",
    semanticCaution: "#B7501F",
    semanticCautionDark: "#843009",
    semanticInformative: "#2790F1",
    backgroundSemanticPositive: "#DBF0EB",
    backgroundSemanticNegative: "#F2D9E3",
    backgroundSemanticCaution: "#FEF0E3",
    backgroundSemanticInformative: "#DFEEFD",
  };

  useEffect(() => {
    fetchUserData();

    // Animation d'apparition
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      console.log("Current user email:", currentUser?.email);

      if (!currentUser) {
        console.log("No current user, navigating to login");
        navigation.navigate("Login");
        return;
      }

      // Chercher le document par email dans la collection ownersData
      const ownersQuery = query(
        collection(firestore, "ownersData"),
        where("email", "==", currentUser.email)
      );

      const querySnapshot = await getDocs(ownersQuery);
      console.log("Query result size:", querySnapshot.size);

      if (!querySnapshot.empty) {
        // Document trouvé avec email
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        const documentId = userDoc.id; // C'est le PNR ou autre identifiant

        console.log("Found user data with document ID:", documentId, userData);

        const userProfile = {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || currentUser.email || "",
          phone: userData.phone || "",
          photoURL: userData.photoURL || null,
          PNR: userData.PNR || documentId,
          documentId: documentId,
        };

        console.log("Processed user profile:", userProfile);
        setUserInfo(userProfile);
        setTempUserInfo(userProfile);
      } else {
        console.log(
          "No user document found with email, checking direct email as doc ID"
        );

        // Fallback: essayer avec l'email comme ID de document (en cas de structure différente)
        const cleanEmail = currentUser.email.replace(/[^a-zA-Z0-9]/g, "_");
        const userDocRef = doc(firestore, "ownersData", cleanEmail);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log("Found user data with email as doc ID:", userData);

          const userProfile = {
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || currentUser.email || "",
            phone: userData.phone || "",
            photoURL: userData.photoURL || null,
            documentId: cleanEmail,
          };

          setUserInfo(userProfile);
          setTempUserInfo(userProfile);
        } else {
          console.log("No user document found anywhere, creating new one");
          // Créer un nouveau document avec un ID unique
          const newUserInfo = {
            firstName: currentUser.displayName?.split(" ")[0] || "",
            lastName:
              currentUser.displayName?.split(" ").slice(1).join(" ") || "",
            email: currentUser.email || "",
            phone: "",
            photoURL: currentUser.photoURL || null,
            userId: currentUser.uid,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // Utiliser l'email nettoyé comme ID ou générer un PNR
          const docId = cleanEmail || `PNR_${Date.now()}`;
          const userDocRef = doc(firestore, "ownersData", docId);
          await setDoc(userDocRef, newUserInfo);
          console.log("Created new user document with ID:", docId, newUserInfo);

          setUserInfo({ ...newUserInfo, documentId: docId });
          setTempUserInfo({ ...newUserInfo, documentId: docId });
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert(
        "Erreur",
        "Impossible de charger le profil: " + error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!auth.currentUser || !userInfo.documentId) return;

    let unsubscribe;

    if (userInfo.documentId) {
      const userDocRef = doc(firestore, "ownersData", userInfo.documentId);
      unsubscribe = onSnapshot(
        userDocRef,
        (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            const userProfile = {
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              email: userData.email || auth.currentUser.email || "",
              phone: userData.phone || "",
              photoURL: userData.photoURL || null,
              PNR: userData.PNR || userInfo.PNR,
              documentId: userInfo.documentId,
            };
            setUserInfo(userProfile);
            if (!isEditing) {
              setTempUserInfo(userProfile);
            }
          }
        },
        (error) => {
          console.error("Error listening to user data:", error);
        }
      );
    }

    return () => unsubscribe && unsubscribe();
  }, [isEditing, userInfo.documentId]);

  const handlePickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission requise", "Accès à la galerie nécessaire");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets) {
        setUploadingImage(true);
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();

        const storage = getStorage();
        const storageRef = ref(
          storage,
          `profile_images/${auth.currentUser.uid}`
        );
        await uploadBytes(storageRef, blob);

        const downloadURL = await getDownloadURL(storageRef);
        setTempUserInfo((prev) => ({ ...prev, photoURL: downloadURL }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Erreur", "Impossible de changer la photo: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert("Erreur", "Utilisateur non connecté");
        return;
      }

      if (!tempUserInfo.firstName.trim() || !tempUserInfo.lastName.trim()) {
        Alert.alert("Erreur", "Le prénom et le nom sont requis");
        return;
      }

      const documentId = userInfo.documentId;
      const userDocRef = doc(firestore, "ownersData", documentId);

      const updateData = {
        firstName: tempUserInfo.firstName.trim(),
        lastName: tempUserInfo.lastName.trim(),
        phone: tempUserInfo.phone.trim(),
        photoURL: tempUserInfo.photoURL,
        email: currentUser.email,
        userId: currentUser.uid,
        updatedAt: new Date(),
      };

      if (userInfo.PNR) {
        updateData.PNR = userInfo.PNR;
      }

      console.log("Updating user data in document:", documentId, updateData);
      await updateDoc(userDocRef, updateData);

      setUserInfo({ ...tempUserInfo, documentId, PNR: userInfo.PNR });
      setIsEditing(false);
      Alert.alert("Succès", "Profil mis à jour avec succès");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Erreur", "Échec de la mise à jour: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace("Home");
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Erreur", "Échec de la déconnexion");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec gradient RAM */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          style={styles.headerGradient}
        >
          <Animated.View style={[styles.profileHeader, { opacity: fadeAnim }]}>
            <TouchableOpacity
              onPress={isEditing ? handlePickImage : null}
              disabled={uploadingImage}
              style={styles.avatarContainer}
              activeOpacity={isEditing ? 0.8 : 1}
            >
              {uploadingImage ? (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator size="small" color={COLORS.textInverse} />
                </View>
              ) : tempUserInfo.photoURL || userInfo.photoURL ? (
                <Image
                  source={{
                    uri: isEditing ? tempUserInfo.photoURL : userInfo.photoURL,
                  }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons
                    name="person"
                    size={40}
                    color={COLORS.textInverse}
                  />
                </View>
              )}
              {isEditing && (
                <View style={styles.editBadge}>
                  <Ionicons
                    name="camera"
                    size={14}
                    color={COLORS.textInverse}
                  />
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.userName}>
              {isEditing
                ? `${tempUserInfo.firstName} ${tempUserInfo.lastName}`.trim() ||
                  "Nom d'utilisateur"
                : `${userInfo.firstName} ${userInfo.lastName}`.trim() ||
                  "Nom d'utilisateur"}
            </Text>
            <Text style={styles.userEmail}>{userInfo.email}</Text>
          </Animated.View>
        </LinearGradient>

        {/* Section d'informations */}
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.iconDefault}
              />
              <Text style={styles.sectionTitle}>Informations personnelles</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prénom</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={tempUserInfo.firstName}
                  onChangeText={(text) =>
                    setTempUserInfo({ ...tempUserInfo, firstName: text })
                  }
                  placeholder="Votre prénom"
                  placeholderTextColor={COLORS.textLight}
                />
              ) : (
                <View style={styles.inputDisplay}>
                  <Text style={styles.inputValue}>
                    {userInfo.firstName || "Non renseigné"}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={tempUserInfo.lastName}
                  onChangeText={(text) =>
                    setTempUserInfo({ ...tempUserInfo, lastName: text })
                  }
                  placeholder="Votre nom"
                  placeholderTextColor={COLORS.textLight}
                />
              ) : (
                <View style={styles.inputDisplay}>
                  <Text style={styles.inputValue}>
                    {userInfo.lastName || "Non renseigné"}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputDisplay, styles.disabledInput]}>
                <Text style={[styles.inputValue, { color: COLORS.textLight }]}>
                  {userInfo.email}
                </Text>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={COLORS.textLight}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Téléphone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={tempUserInfo.phone}
                  onChangeText={(text) =>
                    setTempUserInfo({ ...tempUserInfo, phone: text })
                  }
                  placeholder="Votre numéro de téléphone"
                  placeholderTextColor={COLORS.textLight}
                  keyboardType="phone-pad"
                />
              ) : (
                <View style={styles.inputDisplay}>
                  <Text style={styles.inputValue}>
                    {userInfo.phone || "Non renseigné"}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveProfile}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[COLORS.semanticPositive, "#00A368"]}
                    style={styles.buttonGradient}
                  >
                    {saving ? (
                      <ActivityIndicator
                        color={COLORS.textInverse}
                        size="small"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color={COLORS.textInverse}
                        />
                        <Text style={styles.buttonText}>Enregistrer</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setTempUserInfo({ ...userInfo });
                    setIsEditing(false);
                  }}
                  disabled={saving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>Annuler</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setTempUserInfo({ ...userInfo });
                  setIsEditing(true);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  style={styles.buttonGradient}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={COLORS.textInverse}
                  />
                  <Text style={styles.buttonText}>Modifier le profil</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* Menu d'options */}
          <View style={styles.menuSection}>
            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: COLORS.backgroundSemanticCaution },
                ]}
              >
                <Ionicons
                  name="shield-outline"
                  size={20}
                  color={COLORS.semanticCaution}
                />
              </View>
              <Text style={styles.menuText}>Confidentialité</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.neutral700}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} activeOpacity={0.8}>
              <View
                style={[
                  styles.menuIcon,
                  { backgroundColor: COLORS.ramAccentPrimaryLight },
                ]}
              >
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color={COLORS.ramAccentPrimaryDark}
                />
              </View>
              <Text style={styles.menuText}>Aide & Support</Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.neutral700}
              />
            </TouchableOpacity>
          </View>

          {/* Déconnexion */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <View style={styles.logoutContent}>
              <Ionicons
                name="log-out-outline"
                size={20}
                color={COLORS.semanticNegative}
              />
              <Text style={styles.logoutText}>Se déconnecter</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  loadingContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7B7A78",
    textAlign: "center",
  },
  scrollContainer: {
    paddingBottom: 30,
  },

  // Header
  headerGradient: {
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarLoading: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    zIndex: 1,
  },
  editBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#B49360",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  pnrContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  pnrLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  pnrValue: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  profileStats: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 20,
  },

  // Content
  content: {
    marginTop: -20,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "rgba(0, 0, 0, .1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#D8D7D4",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEAE8",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333231",
    marginLeft: 12,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7B7A78",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D8D7D4",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: "#333231",
    backgroundColor: "#FAFAFA",
  },
  inputDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: "#F7F7F7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D8D7D4",
  },
  disabledInput: {
    backgroundColor: "#EBEAE8",
  },
  inputValue: {
    fontSize: 16,
    color: "#333231",
    flex: 1,
  },

  // Actions
  actionsContainer: {
    marginBottom: 20,
  },
  editButton: {
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#C20831",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButton: {
    borderRadius: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#00875D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 12,
  },
  cancelButton: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#C20831",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#C20831",
    fontSize: 16,
    fontWeight: "600",
  },

  // Menu
  menuSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
    shadowColor: "rgba(0, 0, 0, .1)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#D8D7D4",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: "#333231",
    flex: 1,
    fontWeight: "500",
  },

  // Logout
  logoutButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F2D9E3",
    elevation: 1,
    shadowColor: "rgba(169, 0, 68, 0.1)",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#A90044",
  },
});
