import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function UserProfileScreen({ navigation }) {
  // 🎭 DONNÉES MOCKÉES
  const [userInfo, setUserInfo] = useState({
    displayName: "Ahmed Benali",
    email: "ahmed.benali@email.com",
    photoURL: null,
    phone: "+212 6 12 34 56 78",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState(userInfo);

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: () => {
          console.log("Déconnexion simulée");
          Alert.alert("Info", "Déconnexion simulée (pas de Firebase encore)");
        },
      },
    ]);
  };

  const handleSaveProfile = () => {
    setUserInfo(tempUserInfo);
    setIsEditing(false);
    Alert.alert("Succès", "Profil mis à jour avec succès");
  };

  const handleCancelEdit = () => {
    setTempUserInfo(userInfo);
    setIsEditing(false);
  };

  const pickImage = () => {
    console.log("Sélection d'image simulée");
    Alert.alert("Info", "Sélection d'image simulée");
  };

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

        <Text style={styles.userName}>{userInfo.displayName}</Text>
        <Text style={styles.userEmail}>{userInfo.email}</Text>
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
  }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        variant === "outlined" && styles.actionButtonOutlined,
      ]}
      onPress={onPress}
    >
      <View
        style={[
          styles.actionButtonContent,
          variant === "filled"
            ? { backgroundColor: color }
            : { borderColor: color, backgroundColor: "white" },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={variant === "filled" ? "white" : color}
        />
        <Text
          style={[
            styles.actionButtonText,
            { color: variant === "filled" ? "white" : color },
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
              label="Nom complet"
              value={
                isEditing ? tempUserInfo.displayName : userInfo.displayName
              }
              icon="person-outline"
              editable={true}
              onChangeText={(text) =>
                setTempUserInfo((prev) => ({ ...prev, displayName: text }))
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
                  />
                </View>
                <View style={styles.editActionButton}>
                  <ActionButton
                    title="Annuler"
                    icon="close"
                    onPress={handleCancelEdit}
                    variant="outlined"
                    color="#8E8E93"
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
                  title="Mes objets perdus (3)"
                  icon="sad-outline"
                  onPress={() => console.log("Navigate to My Lost Items")}
                />
                <ActionButton
                  title="Mes objets trouvés (1)"
                  icon="happy-outline"
                  onPress={() => console.log("Navigate to My Found Items")}
                />
                <ActionButton
                  title="Historique des matches (2)"
                  icon="link-outline"
                  onPress={() => console.log("Navigate to Match History")}
                />
              </>
            )}
          </InfoSection>

          <InfoSection title="Paramètres">
            <ActionButton
              title="Notifications"
              icon="notifications-outline"
              onPress={() => console.log("Navigate to Notification Settings")}
            />
            <ActionButton
              title="Confidentialité"
              icon="shield-outline"
              onPress={() => console.log("Navigate to Privacy Settings")}
            />
            <ActionButton
              title="Aide et support"
              icon="help-circle-outline"
              onPress={() => console.log("Navigate to Help")}
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
