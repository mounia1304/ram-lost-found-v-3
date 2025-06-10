import {
  collection,
  addDoc,
  Timestamp,
  serverTimestamp,
  doc,
  setDoc,
  runTransaction,
} from "firebase/firestore";
import { firestore } from "./databaseService/firebaseConfig";
import { uploadImageAsync } from "./databaseService/storage";

/**
 * Génère un code court unique (ex : FND1234)
 */
const generateShortCode = async () => {
  const counterRef = doc(firestore, "counters", "foundObjects");

  const shortCode = await runTransaction(firestore, async (transaction) => {
    const counterSnap = await transaction.get(counterRef);

    let newCount = 1;
    if (counterSnap.exists()) {
      const data = counterSnap.data();
      newCount = (data.lastCount || 0) + 1;
    }

    transaction.set(counterRef, { lastCount: newCount }, { merge: true });

    const padded = String(newCount).padStart(4, "0"); // FND0001, FND0023...
    return `FND${padded}`;
  });

  return shortCode;
};

/**
 * Enregistre le rapport d'objet trouvé avec image et code QR.
 * @param {Object} data - Données du formulaire.
 * @param {string} imageUri - URI de l'image sélectionnée.
 * @returns {Promise<{ docId: string, shortCode: string }>}
 */
export const saveFoundObjectReport = async (data, imageUri) => {
  try {
    console.log("🚀 Début enregistrement FOUND");
    let imageUrl = "";

    // Upload image si fournie
    if (
      imageUri &&
      typeof imageUri === "string" &&
      imageUri.startsWith("file")
    ) {
      console.log("⏫ Upload image en cours...");
      imageUrl = await uploadImageAsync(imageUri);
      console.log("✅ Image uploadée :", imageUrl);
    }

    // Génération du short code unique
    const shortCode = await generateShortCode();

    // Génération d'un docId (Firestore auto-ID)
    const newDocRef = doc(collection(firestore, "foundObjects"));
    const docId = newDocRef.id;

    // Création des données à enregistrer
    const reportData = {
      type: data.typeObjet,
      description: data.description,
      location: data.lieu,
      volId: data.numVol,
      email: data.email,
      phone: data.telephone,
      createdAt: serverTimestamp(),
      updatedAt: null,
      image: imageUrl,
      ref: shortCode,
      docPath: `/foundObjects/${docId}`,
      status: "found",
      pickupLocation: null,
    };

    // Enregistrement dans Firestore
    await setDoc(newDocRef, reportData);
    console.log("✅ Rapport enregistré :", docId);

    // --- 🔁 Appel à l'API Flask pour générer embedding et comparer ---
    (async () => {
      try {
        const fullDescription = `
Type: ${data.typeObjet}.
Lieu de trouve: ${data.lieu}.
Vol n°: ${data.numVol}.
Description: ${data.description}.
        `.trim();

        const response = await fetch(
          "https://17e7-105-190-182-242.ngrok-free.app/generate-embedding",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              docId,
              description: fullDescription,
              type: "found",
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
    console.error("❌ Erreur saveFoundObjectReport :", error);
    throw error;
  }
};
