import {
  collection,
  doc,
  setDoc,
  addDoc,
  Timestamp,
  runTransaction,
  query,
  where,
  getDocs,
  updateDoc,
  getFirestore,
} from "firebase/firestore";
import { firestore } from "./databaseService/firebaseConfig";
import { uploadImageAsync } from "./databaseService/storage";
import { getAuth } from "firebase/auth";

/**
 * Génère un code court unique pour les objets perdus (ex: LST0001)
 */
const generateLostShortCode = async () => {
  try {
    if (!firestore) {
      throw new Error("Firestore n'est pas initialisé");
    }

    const counterRef = doc(firestore, "counters", "lostObjects");

    const shortCode = await runTransaction(firestore, async (transaction) => {
      const counterSnap = await transaction.get(counterRef);

      let newCount = 1;
      if (counterSnap.exists()) {
        const data = counterSnap.data();
        newCount = (data.lastCount || 0) + 1;
      }

      transaction.set(counterRef, { lastCount: newCount }, { merge: true });

      const padded = String(newCount).padStart(4, "0");
      return `LST${padded}`;
    });

    return shortCode;
  } catch (error) {
    console.error("❌ Erreur generateLostShortCode:", error);
    throw error;
  }
};

/**
 * Enregistre un rapport d'objet perdu + données propriétaire
 * @param {Object} data - Données du formulaire (inclut infos perso + objet)
 * @param {string} imageUri - URI de l'image
 * @returns {Promise<{ docId: string, shortCode: string }>}
 */
export const saveLostObjectReport = async (data, imageUri) => {
  try {
    console.log("🚀 Début enregistrement LOST");
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
      throw new Error("Utilisateur non connecté");
    }

    const userId = currentUser.uid;

    if (!firestore) {
      console.error("❌ Firestore n'est pas initialisé");
      throw new Error("Firestore n'est pas initialisé");
    }

    if (!data || !data.lastName || !data.email || !data.phone || !data.pnr) {
      throw new Error("Données propriétaire manquantes");
    }

    if (!data.type || !data.location) {
      throw new Error("Données objet manquantes");
    }

    // Upload image si présente
    let imageUrl = "";
    if (imageUri && typeof imageUri === "string") {
      try {
        imageUrl = await uploadImageAsync(imageUri);
      } catch (imageError) {
        console.warn(
          "⚠️ Erreur upload image, continuation sans image :",
          imageError
        );
      }
    }

    // Enregistrement propriétaire
    const ownersCollection = collection(firestore, "ownersData");
    const ownerDoc = await addDoc(ownersCollection, {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      PNR: data.pnr.trim(),
      userId,
      createdAt: Timestamp.now(),
    });
    const ownerId = ownerDoc.id;

    // Génération du short code
    const shortCode = await generateLostShortCode();

    // Préparation et enregistrement lostObject
    const lostObjectsCollection = collection(firestore, "lostObjects");
    const lostDocRef = doc(lostObjectsCollection);
    const docId = lostDocRef.id;

    const lostData = {
      ref: shortCode,
      type: data.type,
      description: data.detailedDescription.trim(),
      location: data.location,
      imageUrl,
      color: Array.isArray(data.color) ? data.color : [],
      additionalDetails: data.additionalDetails
        ? data.additionalDetails.trim()
        : "",
      status: "lost",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      docPath: `/lostObjects/${docId}`,
      ownerId,
      userId, // identifiant Firebase de l'utilisateur
    };
    await setDoc(lostDocRef, lostData);

    console.log("✅ Objet perdu enregistré :", docId);

    // --- NOUVEAU : appel API Flask pour générer vecteur + comparaison ---
    (async () => {
      try {
        const fullDescription = `
Type: ${data.type}.
Couleur(s): ${Array.isArray(data.color) ? data.color.join(", ") : ""}.
Lieu de perte: ${data.location}.
Description: ${data.detailedDescription || ""}.
Détails supplémentaires: ${data.additionalDetails || ""}.
        `.trim();
        console.log({
          docId,
          description: fullDescription,
          type: "lost",
          userId,
        });
        const response = await fetch(
          " https://d1fa-41-92-20-80.ngrok-free.app/generate-embedding",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              docId,
              description: fullDescription,
              type: "lost",
              userId,
            }),
          }
        );

        if (!response.ok) {
          console.warn("⚠️ API Flask erreur status:", response.status);
        } else {
          const result = await response.json();
          console.log("✅ API Flask réponse :", result);
        }
      } catch (apiError) {
        console.warn("⚠️ Erreur appel API Flask :", apiError);
      }
    })();

    // --- fin appel API ---

    return { docId, shortCode };
  } catch (error) {
    console.error("❌ Erreur saveLostObjectReport :", error);
    if (error.code) {
      console.error("Code erreur Firebase :", error.code);
    }
    throw new Error(`Erreur lors de l'enregistrement : ${error.message}`);
  }
};

/**
 * Récupère un objet perdu par son code de référence
 * @param {string} refCode - Code de référence (ex: LST0001)
 * @returns {Promise<Object|null>}
 */
export const getLostObjectByRef = async (refCode) => {
  try {
    if (!firestore) {
      throw new Error("Firestore n'est pas initialisé");
    }

    const lostObjectsCollection = collection(firestore, "lostObjects");
    const q = query(lostObjectsCollection, where("ref", "==", refCode));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  } catch (error) {
    console.error("❌ Erreur getLostObjectByRef :", error);
    throw error;
  }
};

/**
 * Met à jour le statut d'un objet perdu
 * @param {string} docId - ID du document
 * @param {string} newStatus - Nouveau statut ('lost', 'found', 'returned')
 * @returns {Promise<void>}
 */
export const updateLostObjectStatus = async (docId, newStatus) => {
  try {
    if (!firestore) {
      throw new Error("Firestore n'est pas initialisé");
    }

    const docRef = doc(firestore, "lostObjects", docId);
    await updateDoc(docRef, {
      status: newStatus,
      updatedAt: Timestamp.now(),
    });
    console.log(`✅ Statut mis à jour : ${newStatus}`);
  } catch (error) {
    console.error("❌ Erreur updateLostObjectStatus :", error);
    throw error;
  }
};
