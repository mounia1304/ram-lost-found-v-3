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
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function ProfileScreen({ navigation }) {
  const [userInfo, setUserInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    photoURL: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState(userInfo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Récupérer les données de l'utilisateur depuis Firestore
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const currentUser = auth.currentUser;
      console.log("Current user:", currentUser);

      if (!currentUser) {
        console.log("Pas d'utilisateur connecté");
        Alert.alert("Erreur", "Utilisateur non connecté");
        navigation.navigate("Login");
        return;
      }

      console.log("User ID:", currentUser.uid);
      const userDocRef = doc(firestore, "ownersData", currentUser.uid);
      console.log("Document référence:", userDocRef);

      const userDoc = await getDoc(userDocRef);
      console.log("Document existe:", userDoc.exists());

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Données utilisateur récupérées:", userData);

        const userProfile = {
          firstName: userData.firstName || "",
          lastName: userData.lastName || "",
          email: userData.email || currentUser.email || "",
          phone: userData.phone || "",
          photoURL: userData.photoURL || null,
        };

        console.log("Profil utilisateur formaté:", userProfile);
        setUserInfo(userProfile);
        setTempUserInfo(userProfile);
      } else {
        console.log("Document n'existe pas, création avec données de base");
        // Si le document n'existe pas, créer avec les données de base
        const basicUserInfo = {
          firstName: currentUser.displayName?.split(" ")[0] || "",
          lastName:
            currentUser.displayName?.split(" ").slice(1).join(" ") || "",
          email: currentUser.email || "",
          phone: "",
          photoURL: currentUser.photoURL || null,
        };
        console.log("Infos de base:", basicUserInfo);
        setUserInfo(basicUserInfo);
        setTempUserInfo(basicUserInfo);
      }
    } catch (error) {
      console.error("Erreur complète:", error);
      console.error("Message d'erreur:", error.message);
      Alert.alert(
        "Erreur",
        `Impossible de récupérer les données: ${error.message}`
      );
    } finally {
      setLoading(false);
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

      // Validation des données
      if (!tempUserInfo.firstName.trim()) {
        Alert.alert("Erreur", "Le prénom est requis");
        return;
      }

      if (!tempUserInfo.lastName.trim()) {
        Alert.alert("Erreur", "Le nom de famille est requis");
        return;
      }

      // Mettre à jour dans Firestore
      await updateDoc(doc(firestore, "ownersData", currentUser.uid), {
        firstName: tempUserInfo.firstName.trim(),
        lastName: tempUserInfo.lastName.trim(),
        phone: tempUserInfo.phone.trim(),
        photoURL: tempUserInfo.photoURL,
        updatedAt: new Date().toISOString(),
      });

      setUserInfo(tempUserInfo);
      setIsEditing(false);
      Alert.alert("Succès", "Profil mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder les modifications");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setTempUserInfo(userInfo);
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.replace("Login");
          } catch (error) {
            console.error("Erreur lors de la déconnexion:", error);
            Alert.alert("Erreur", "Impossible de se déconnecter");
          }
        },
      },
    ]);
  };

  const pickImage = () => {
    // TODO: Implémenter la sélection d'image avec expo-image-picker
    Alert.alert("Info", "Fonctionnalité de sélection d'image à venir");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D80000" />
          <Text style={styles.loadingText}>Chargement du profil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const ProfileHeader = () => (
    <View style={styles.headerGradient}>
      <View style={styles.profileHeader}>
        <TouchableOpacity
          style={styles.avatarContainer}
          onPress={isEditing ? pickImage : undefined}
        >
          {(isEditing ? tempUserInfo.photoURL : userInfo.photoURL) ? (
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
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={16} color="white" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.userName}>
          {userInfo.firstName && userInfo.lastName
            ? `${userInfo.firstName} ${userInfo.lastName}`
            : "Nom non renseigné"}
        </Text>
        <Text style={styles.userEmail}>{userInfo.email}</Text>

        {/* Bouton debug pour recharger */}
        <TouchableOpacity
          style={styles.debugButton}
          onPress={() => {
            setLoading(true);
            fetchUserData();
          }}
        >
          <Text style={styles.debugButtonText}>🔄 Recharger</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const InfoSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );

  const InfoItem = ({
    label,
    value,
    icon,
    editable = false,
    onChangeText,
    keyboardType = "default",
  }) => (
    <View style={styles.infoItem}>
      <View style={styles.infoLeft}>
        <View style={styles.infoIcon}>
          <Ionicons name={icon} size={20} color="#D80000" />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>

      {isEditing && editable ? (
        <TextInput
          style={styles.infoInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={`Entrer ${label.toLowerCase()}`}
        />
      ) : (
        <Text style={styles.infoValue}>{value || "Non renseigné"}</Text>
      )}
    </View>
  );

  const ActionButton = ({
    title,
    icon,
    onPress,
    color = "#D80000",
    variant = "filled",
    disabled = false,
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        variant === "outlined" && styles.actionButtonOutlined,
        disabled && styles.actionButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <View
        style={[
          styles.actionButtonContent,
          variant === "filled"
            ? { backgroundColor: disabled ? "#ccc" : color }
            : {
                borderColor: disabled ? "#ccc" : color,
                backgroundColor: "white",
              },
        ]}
      >
        {disabled ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Ionicons
            name={icon}
            size={20}
            color={variant === "filled" ? "white" : color}
          />
        )}
        <Text
          style={[
            styles.actionButtonText,
            {
              color: variant === "filled" ? "white" : disabled ? "#ccc" : color,
              marginLeft: disabled ? 8 : 8,
            },
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader />

        <View style={styles.content}>
          <InfoSection title="Informations personnelles">
            <InfoItem
              label="Prénom"
              value={isEditing ? tempUserInfo.firstName : userInfo.firstName}
              icon="person-outline"
              editable={true}
              onChangeText={(text) =>
                setTempUserInfo((prev) => ({ ...prev, firstName: text }))
              }
            />
            <InfoItem
              label="Nom de famille"
              value={isEditing ? tempUserInfo.lastName : userInfo.lastName}
              icon="person-outline"
              editable={true}
              onChangeText={(text) =>
                setTempUserInfo((prev) => ({ ...prev, lastName: text }))
              }
            />
            <InfoItem
              label="Email"
              value={userInfo.email}
              icon="mail-outline"
              editable={false}
            />
            <InfoItem
              label="Téléphone"
              value={isEditing ? tempUserInfo.phone : userInfo.phone}
              icon="call-outline"
              editable={true}
              keyboardType="phone-pad"
              onChangeText={(text) =>
                setTempUserInfo((prev) => ({ ...prev, phone: text }))
              }
            />
          </InfoSection>

          <InfoSection title="Actions">
            {isEditing ? (
              <View style={styles.editActions}>
                <View style={styles.editActionButton}>
                  <ActionButton
                    title="Sauvegarder"
                    icon="checkmark"
                    onPress={handleSaveProfile}
                    color="#4ECDC4"
                    disabled={saving}
                  />
                </View>
                <View style={styles.editActionButton}>
                  <ActionButton
                    title="Annuler"
                    icon="close"
                    onPress={handleCancelEdit}
                    variant="outlined"
                    color="#8E8E93"
                    disabled={saving}
                  />
                </View>
              </View>
            ) : (
              <>
                <ActionButton
                  title="Modifier le profil"
                  icon="create-outline"
                  onPress={() => setIsEditing(true)}
                />
                <ActionButton
                  title="Mes objets perdus"
                  icon="sad-outline"
                  onPress={() => navigation.navigate("MyLostItems")}
                />
                <ActionButton
                  title="Mes objets trouvés"
                  icon="happy-outline"
                  onPress={() => navigation.navigate("MyFoundItems")}
                />
                <ActionButton
                  title="Historique des matches"
                  icon="link-outline"
                  onPress={() => navigation.navigate("MatchHistory")}
                />
              </>
            )}
          </InfoSection>

          <InfoSection title="Paramètres">
            <ActionButton
              title="Notifications"
              icon="notifications-outline"
              onPress={() => navigation.navigate("NotificationSettings")}
            />
            <ActionButton
              title="Confidentialité"
              icon="shield-outline"
              onPress={() => navigation.navigate("PrivacySettings")}
            />
            <ActionButton
              title="Aide et support"
              icon="help-circle-outline"
              onPress={() => navigation.navigate("Help")}
            />
          </InfoSection>

          <View style={styles.logoutSection}>
            <ActionButton
              title="Déconnexion"
              icon="log-out-outline"
              onPress={handleLogout}
              color="#FF6B6B"
              variant="outlined"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  headerGradient: {
    backgroundColor: "#D80000",
    paddingTop: 20,
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "white",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "white",
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#4ECDC4",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
  },
  debugButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 15,
  },
  debugButtonText: {
    color: "white",
    fontSize: 14,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  sectionContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF5F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#666",
    flex: 1,
    textAlign: "right",
  },
  infoInput: {
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
    textAlign: "right",
  },
  actionButton: {
    marginBottom: 12,
  },
  actionButtonOutlined: {
    // Style pour les boutons outlined
  },
  actionButtonDisabled: {
    opacity: 0.7,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "transparent",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  editActions: {
    flexDirection: "row",
    gap: 12,
  },
  editActionButton: {
    flex: 1,
  },
  logoutSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
});
