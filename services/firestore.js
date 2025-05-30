import { firestore } from "../services/databaseService/firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { uploadImageAsync } from "./databaseService/storage"; // Importer la fonction depuis storage.js
// Référence à la collection 'users'
const usersCollection = collection(firestore, "users");

/**
 * Ajouter un nouvel utilisateur dans Firestore
 * @param {string} userId - L'UID du user (venant de l'auth Firebase)
 * @param {object} userData - Les données du user {email, nom, prénom, etc.}
 */
export const createUserDocument = async (userId, userData) => {
  try {
    const userRef = doc(usersCollection, userId);
    await setDoc(userRef, userData);
  } catch (error) {
    throw new Error("Erreur lors de la création du profil utilisateur.");
  }
};

/**
 * Récupérer les infos d'un utilisateur
 * @param {string} userId - L'UID du user
 * @returns {object} - Données du user
 */
export const getUserDocument = async (userId) => {
  try {
    const userRef = doc(usersCollection, userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      throw new Error("Utilisateur non trouvé.");
    }
  } catch (error) {
    throw new Error(
      "Erreur lors de la récupération des informations utilisateur."
    );
  }
};

/**
 * Mettre à jour les infos d'un utilisateur
 * @param {string} userId - L'UID du user
 * @param {object} newData - Les nouvelles données
 */
export const updateUserDocument = async (userId, newData) => {
  try {
    const userRef = doc(usersCollection, userId);
    await updateDoc(userRef, newData);
  } catch (error) {
    throw new Error("Erreur lors de la mise à jour du profil utilisateur.");
  }
};

/**
 * Supprimer un utilisateur
 * @param {string} userId - L'UID du user
 */
export const deleteUserDocument = async (userId) => {
  try {
    const userRef = doc(usersCollection, userId);
    await deleteDoc(userRef);
  } catch (error) {
    throw new Error("Erreur lors de la suppression du profil utilisateur.");
  }
};
