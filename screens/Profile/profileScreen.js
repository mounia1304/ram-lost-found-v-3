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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth, firestore } from "../../services/databaseService/firebaseConfig";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
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
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState({ ...userInfo });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Couleurs RAM
  const COLORS = {
    primary: "#C20831",
    secondary: "#61374E",
    background: "#FAFAFA",
    text: "#333231",
    textLight: "#7B7A78",
    border: "#EBEAE8",
    success: "#00875D",
    danger: "#A90044",
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigation.navigate("Login");
        return;
      }

      const userDocRef = doc(firestore, "ownersData", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserInfo({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || currentUser.email || "",
          phone: userData.phone || "",
          photoURL: userData.photoURL || null,
        });
        setTempUserInfo({
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || currentUser.email || "",
          phone: userData.phone || "",
          photoURL: userData.photoURL || null,
        });
      } else {
        // Si le document n'existe pas, on le crée avec les infos de base
        const newUserInfo = {
          firstName: currentUser.displayName?.split(" ")[0] || "",
          lastName:
            currentUser.displayName?.split(" ").slice(1).join(" ") || "",
          email: currentUser.email || "",
          phone: "",
          photoURL: currentUser.photoURL || null,
          createdAt: new Date().toISOString(),
        };

        await setDoc(userDocRef, newUserInfo);

        setUserInfo(newUserInfo);
        setTempUserInfo(newUserInfo);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Erreur", "Impossible de charger le profil");
    } finally {
      setLoading(false);
    }
  };

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
      Alert.alert("Erreur", "Impossible de changer la photo");
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

      const userDocRef = doc(firestore, "ownersData", currentUser.uid);

      await updateDoc(userDocRef, {
        firstName: tempUserInfo.firstName.trim(),
        lastName: tempUserInfo.lastName.trim(),
        phone: tempUserInfo.phone.trim(),
        photoURL: tempUserInfo.photoURL,
        updatedAt: new Date().toISOString(),
      });

      setUserInfo(tempUserInfo);
      setIsEditing(false);
      Alert.alert("Succès", "Profil mis à jour");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Erreur", "Échec de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vraiment vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace("Home");
          } catch (error) {
            Alert.alert("Erreur", "Échec de la déconnexion");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header du profil */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            onPress={isEditing ? handlePickImage : null}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <View style={styles.avatarLoading}>
                <ActivityIndicator size="small" color="white" />
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
                <Ionicons name="person" size={40} color="white" />
              </View>
            )}
            {isEditing && (
              <View style={styles.editBadge}>
                <Ionicons name="camera" size={16} color="white" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.userName}>
            {isEditing
              ? `${tempUserInfo.firstName} ${tempUserInfo.lastName}`
              : `${userInfo.firstName} ${userInfo.lastName}`}
          </Text>
          <Text style={styles.userEmail}>{userInfo.email}</Text>
        </View>

        {/* Section d'édition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>

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
              />
            ) : (
              <Text style={styles.inputValue}>
                {userInfo.firstName || "Non renseigné"}
              </Text>
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
              />
            ) : (
              <Text style={styles.inputValue}>
                {userInfo.lastName || "Non renseigné"}
              </Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <Text style={styles.inputValue}>{userInfo.email}</Text>
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
                placeholder="Votre numéro"
                keyboardType="phone-pad"
              />
            ) : (
              <Text style={styles.inputValue}>
                {userInfo.phone || "Non renseigné"}
              </Text>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={saving}
                activeOpacity={0.7}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.buttonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setTempUserInfo({ ...userInfo });
                  setIsEditing(false);
                }}
                disabled={saving}
                activeOpacity={0.7}
              >
                <Text style={[styles.buttonText, { color: COLORS.primary }]}>
                  Annuler
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => {
                setTempUserInfo({ ...userInfo });
                setIsEditing(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Modifier le profil</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Déconnexion */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
          <Text style={[styles.logoutText, { color: COLORS.danger }]}>
            Déconnexion
          </Text>
        </TouchableOpacity>
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
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#EBEAE8",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#C20831",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
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
    bottom: 0,
    right: 0,
    backgroundColor: "#61374E",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333231",
  },
  userEmail: {
    fontSize: 16,
    color: "#7B7A78",
    marginTop: 5,
  },
  section: {
    backgroundColor: "#FFFFFF",
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333231",
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EBEAE8",
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: "#7B7A78",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#EBEAE8",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333231",
  },
  inputValue: {
    fontSize: 16,
    color: "#333231",
    paddingVertical: 12,
  },
  actionsContainer: {
    marginHorizontal: 15,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    minHeight: 50,
  },
  editButton: {
    backgroundColor: "#C20831",
  },
  saveButton: {
    backgroundColor: "#00875D",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#C20831",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuText: {
    fontSize: 16,
    color: "#333231",
    marginLeft: 10,
    flex: 1,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    marginTop: 20,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  actionsContainer: {
    marginHorizontal: 15,
    zIndex: 1, // Ajouté pour s'assurer que les boutons sont au-dessus
  },
});
