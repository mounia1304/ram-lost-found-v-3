// storage.js
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebaseConfig";
import uuid from "react-native-uuid";

/**
 * Upload une image vers Firebase Storage à partir d'une URI
 * @param {string} uri - URI de l'image à uploader
 * @returns {Promise<string>} URL de téléchargement de l'image
 */
export const uploadImageAsync = async (uri) => {
  try {
    // Vérification de l'URI
    if (!uri || typeof uri !== "string") {
      throw new Error("URI invalide");
    }

    // Convertir l'URI en Blob (méthode compatible avec Expo)
    const response = await fetch(uri);
    const blob = await response.blob();

    // Générer un nom de fichier unique avec extension
    const extension = uri.split(".").pop() || "jpg";
    const filename = `${uuid.v4()}.${extension}`;

    // Référence vers Firebase Storage
    const imageRef = ref(storage, `found_images/${filename}`);

    // Upload du blob
    await uploadBytes(imageRef, blob);

    // Récupérer et retourner l'URL publique
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error("Erreur  lors de l'upload de l'image :", error);
    throw error;
  }
};
