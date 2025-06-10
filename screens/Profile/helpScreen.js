// HelpScreen.js - Version corrigée sans expo-mail-composer
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Couleurs RAM
const COLORS = {
  primary: "#C20831",
  secondary: "#A22032",
  tertiary: "#B49360",
  white: "#FFFFFF",
  background: "#FAFAFA",
  surface: "#FFFFFF",
  text: "#333231",
  textLight: "#7B7A78",
  textMuted: "#999999",
  border: "#EBEAE8",
  success: "#C87C88",
  warning: "#B7501F",
  info: "#2790F1",
  shadow: "rgba(0, 0, 0, 0.1)",
};

const HelpScreen = ({ navigation }) => {
  // 📞 APPELER LE SERVICE CLIENT
  const callSupport = () => {
    Alert.alert(
      "📞 Appeler le support",
      "Voulez-vous appeler le service client RAM Lost & Found ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Appeler",
          onPress: () => {
            const phoneNumber = "tel:+212522489797";
            Linking.openURL(phoneNumber).catch((err) => {
              console.error("Erreur appel:", err);
              Alert.alert(
                "Erreur",
                "Impossible d'ouvrir l'application téléphone"
              );
            });
          },
        },
      ]
    );
  };

  // 📧 ENVOYER UN EMAIL - Version avec Linking (plus compatible)
  const sendEmail = () => {
    const email = "support.lostandfound@royalairmaroc.com";
    const subject = encodeURIComponent(
      "Support RAM Lost & Found - Demande d'aide"
    );
    const body = encodeURIComponent(`Bonjour,

Je vous contacte concernant votre service Lost & Found.

Détails de ma demande :
- Type de demande : 
- Numéro de déclaration (si applicable) : 
- Description du problème : 

Merci pour votre aide.

Cordialement,`);

    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;

    Linking.canOpenURL(mailtoUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(mailtoUrl);
        } else {
          Alert.alert(
            "Email non disponible",
            "Aucune application email configurée.\n\nVous pouvez nous contacter à :\nsupport.lostandfound@royalairmaroc.com"
          );
        }
      })
      .catch((err) => {
        console.error("Erreur email:", err);
        Alert.alert(
          "Erreur",
          "Impossible d'ouvrir l'application email.\n\nContactez-nous à :\nsupport.lostandfound@royalairmaroc.com"
        );
      });
  };

  // 🌐 OUVRIR LE SITE WEB
  const openWebsite = () => {
    const url = "https://www.royalairmaroc.com";
    Linking.openURL(url).catch((err) => {
      console.error("Erreur site web:", err);
      Alert.alert("Erreur", "Impossible d'ouvrir le navigateur");
    });
  };

  // 💬 OUVRIR WHATSAPP
  const openWhatsApp = () => {
    const phoneNumber = "+212522489797";
    const message = encodeURIComponent(
      "Bonjour, j'ai besoin d'aide concernant RAM Lost & Found"
    );
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${message}`;

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert(
            "WhatsApp non disponible",
            `WhatsApp n'est pas installé.\n\nVous pouvez nous écrire au :\n${phoneNumber}`
          );
        }
      })
      .catch((err) => {
        console.error("Erreur WhatsApp:", err);
        Alert.alert("Erreur", "Impossible d'ouvrir WhatsApp");
      });
  };

  // 📱 OUVRIR SMS
  const sendSMS = () => {
    const phoneNumber = "+212522489797";
    const message = encodeURIComponent(
      "Bonjour, j'ai besoin d'aide concernant RAM Lost & Found"
    );
    const smsUrl = `sms:${phoneNumber}?body=${message}`;

    Linking.canOpenURL(smsUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(smsUrl);
        } else {
          Alert.alert("SMS non disponible", "Impossible d'envoyer un SMS");
        }
      })
      .catch((err) => {
        console.error("Erreur SMS:", err);
        Alert.alert("Erreur", "Impossible d'ouvrir l'application SMS");
      });
  };

  // 🎨 COMPOSANT BOUTON D'ACTION
  const ActionButton = ({
    icon,
    title,
    subtitle,
    onPress,
    gradient,
    textColor = COLORS.white,
  }) => (
    <TouchableOpacity
      style={styles.actionButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient colors={gradient} style={styles.actionButtonGradient}>
        <View style={styles.actionButtonIcon}>
          <Ionicons name={icon} size={24} color={textColor} />
        </View>
        <View style={styles.actionButtonContent}>
          <Text style={[styles.actionButtonTitle, { color: textColor }]}>
            {title}
          </Text>
          <Text
            style={[
              styles.actionButtonSubtitle,
              { color: textColor, opacity: 0.8 },
            ]}
          >
            {subtitle}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={textColor} />
      </LinearGradient>
    </TouchableOpacity>
  );

  // 🆘 COMPOSANT FAQ
  const FAQItem = ({ question, answer }) => (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>❓ {question}</Text>
      <Text style={styles.faqAnswer}>{answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nous contacter</Text>
          <Text style={styles.sectionSubtitle}>
            Notre équipe est là pour vous aider 24h/7j
          </Text>

          <ActionButton
            icon="call"
            title="Appeler le support"
            subtitle="Service client disponible 24h/7j"
            onPress={callSupport}
            gradient={[COLORS.warning, "#D68910"]}
          />

          <ActionButton
            icon="mail"
            title="Envoyer un email"
            subtitle="Réponse sous 24h ouvrées"
            onPress={sendEmail}
            gradient={[COLORS.info, "#3498DB"]}
          />

          <ActionButton
            icon="logo-whatsapp"
            title="WhatsApp"
            subtitle="Chat en temps réel"
            onPress={openWhatsApp}
            gradient={["#25D366", "#128C7E"]}
          />

          <ActionButton
            icon="globe"
            title="Site web RAM"
            subtitle="royalairmaroc.com"
            onPress={openWebsite}
            gradient={[COLORS.primary, COLORS.secondary]}
          />
        </View>

        {/* Horaires */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="time-outline" size={20} color={COLORS.primary} />
            <Text style={styles.infoTitle}>Horaires de service</Text>
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>📞 Téléphone : 24h/7j</Text>
            <Text style={styles.infoText}>📧 Email : Lun-Ven 8h-18h</Text>
            <Text style={styles.infoText}>💬 WhatsApp : 8h-22h</Text>
            <Text style={styles.infoText}>📱 SMS : 24h/7j</Text>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>❓ Questions fréquentes</Text>

          <FAQItem
            question="Combien de temps gardez-vous les objets trouvés ?"
            answer="Les objets sont conservés pendant 90 jours dans nos centres avant d'être remis aux autorités compétentes."
          />

          <FAQItem
            question="Comment récupérer mon objet ?"
            answer="Présentez-vous avec une pièce d'identité et le numéro de référence de votre déclaration dans l'un de nos centres."
          />

          <FAQItem
            question="Puis-je modifier ma déclaration ?"
            answer="Oui, vous pouvez modifier votre déclaration via l'application ou en contactant notre service client."
          />

          <FAQItem
            question="Comment améliorer mes chances de retrouver mon objet ?"
            answer="Ajoutez des photos haute résolution et une description très détaillée lors de votre déclaration."
          />
        </View>

        {/* Centres de collecte */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Centres de collecte</Text>

          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Aéroport Mohammed V</Text>
            <Text style={styles.locationAddress}>
              Terminal 1 & 2 - Casablanca
            </Text>
            <Text style={styles.locationHours}>Ouvert 24h/7j</Text>
          </View>

          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Aéroport Marrakech</Text>
            <Text style={styles.locationAddress}>Terminal 1 - Marrakech</Text>
            <Text style={styles.locationHours}>6h00 - 23h00</Text>
          </View>
        </View>

        {/* Urgence */}
        <View style={styles.emergencyCard}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            style={styles.emergencyGradient}
          >
            <Ionicons name="alert-circle" size={24} color={COLORS.white} />
            <View style={styles.emergencyContent}>
              <Text style={styles.emergencyTitle}>Urgence ?</Text>
              <Text style={styles.emergencyText}>
                Pour les objets de valeur ou documents importants,
                contactez-nous immédiatement !
              </Text>
            </View>
            <TouchableOpacity
              style={styles.emergencyButton}
              onPress={callSupport}
            >
              <Ionicons name="call" size={16} color={COLORS.warning} />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },

  // Content
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
    lineHeight: 20,
  },

  // Action buttons
  actionButton: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  actionButtonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 13,
    lineHeight: 16,
  },

  // Contact card
  contactCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  contactGradient: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
  },
  contactContent: {
    flex: 1,
    marginLeft: 16,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: 4,
    lineHeight: 18,
  },

  // Info card
  infoCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 10,
  },
  infoContent: {
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textLight,
  },

  // FAQ
  faqItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 18,
  },

  // Location cards
  locationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    elevation: 1,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  locationHours: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "500",
  },

  // Emergency card
  emergencyCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    elevation: 4,
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emergencyGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  emergencyContent: {
    flex: 1,
    marginLeft: 16,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.white,
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 13,
    color: COLORS.white,
    opacity: 0.9,
    lineHeight: 17,
  },
  emergencyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomSpace: {
    height: 30,
  },
});

export default HelpScreen;
