from flask import Flask, request, jsonify
from firebase_admin import credentials, firestore, initialize_app
from sentence_transformers import SentenceTransformer
from datetime import datetime
import numpy as np

# Initialise Firebase
cred = credentials.Certificate("serviceAccountKey.json")
initialize_app(cred)
db = firestore.client()

model = SentenceTransformer("paraphrase-MiniLM-L6-v2")

app = Flask(__name__)

@app.route("/")
def index():
    return "API Flask pour embeddings - RAM Lost & Found"

def get_collection_name(object_type):
    if object_type == "lost":
        return "lostObjects"
    elif object_type == "found":
        return "foundObjects"
    else:
        return None

def cosine_similarity(vec1, vec2):
    vec1 = np.array(vec1)
    vec2 = np.array(vec2)
    return np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

def save_match(lost_id, found_id, score, user_id=None):
    match_data = {
        "lost_id": lost_id,
        "found_id": found_id,
        "score": score,
        "user_Id": user_id,
        "status": "waiting",
        "timestamp": datetime.now(timezone.utc)

    }
    db.collection("matches").add(match_data)
 # 🔁 Met à jour les statuts des objets liés
    try:
        db.collection("lostObjects").document(lost_id).update({"status": "matched"})
        db.collection("foundObjects").document(found_id).update({"status": "matched"})
    except Exception as e:
        print(f"[⚠️] Erreur lors de la mise à jour des statuts : {e}")



@app.route("/generate-embedding", methods=["POST"])
def generate_embedding():
    data = request.json
    doc_id = data.get("docId")
    description = data.get("description")
    object_type = data.get("type")  # "lost" ou "found"
    userId = data.get("userId")  #  Extraire userId

    if not doc_id or not description or object_type not in ["lost", "found"]:
        # Stocke dans une collection temporaire
        db.collection("objects_pending").add({
            "docId": doc_id,
            "description": description,
            "type": object_type,
            "timestamp": datetime.utcnow(),
            "error": "Champs manquants ou invalides"
        })
        return jsonify({"error": "Champs requis manquants. Enregistré dans objects_pending"}), 400

    try:
        # Génère l'embedding
        embedding = model.encode(description).tolist()

        # Met à jour le document original
        collection_name = get_collection_name(object_type)
        doc_ref = db.collection(collection_name).document(doc_id)
        doc_ref.update({"embedding": embedding})

        # Recherche des correspondances dans l’autre collection
        opposite_type = "found" if object_type == "lost" else "lost"
        opposite_collection = get_collection_name(opposite_type)
        # Filtre par status
        status_filter = "found" if object_type == "lost" else "lost"
        candidates = db.collection(opposite_collection).where("status", "==", status_filter).stream()


        for doc in candidates:
            candidate = doc.to_dict()
            candidate_embedding = candidate.get("embedding")
            if candidate_embedding:
                score = cosine_similarity(embedding, candidate_embedding)
                if score > 0.5:
                    lost_id = doc_id if object_type == "lost" else doc.id
                    found_id = doc.id if object_type == "lost" else doc_id
                    save_match(lost_id, found_id, score, user_id)

        return jsonify({
            "message": f"Embedding généré et correspondances recherchées pour {doc_id} ({object_type})",
            "embedding": embedding
        }), 200

    except Exception as e:
        # Sauvegarde en cas d’échec dans pending
        print(f"[ ERREUR dans /generate-embedding] {str(e)}")
        db.collection("objects_pending").add({
            "docId": doc_id,
            "description": description,
            "type": object_type,
            "timestamp": datetime.utcnow(),
            "error": str(e)
        })
        return jsonify({"error": "Erreur lors du traitement. Stocké dans objects_pending."}), 500

@app.route("/process-pending-objects", methods=["POST"])
def process_pending_objects():
    try:
        pending_docs = db.collection("objects_pending").stream()
        processed = []

        for doc in pending_docs:
            data = doc.to_dict()
            doc_id = data.get("docId")
            description = data.get("description")
            object_type = data.get("type")

            if not doc_id or not description or object_type not in ["lost", "found"]:
                continue

            try:
                # Génère embedding
                embedding = model.encode(description).tolist()

                # Met à jour l'objet dans sa vraie collection
                collection_name = get_collection_name(object_type)
                db.collection(collection_name).document(doc_id).update({"embedding": embedding})

                # Cherche des correspondances
                opposite_type = "found" if object_type == "lost" else "lost"
                opposite_collection = get_collection_name(opposite_type)
                status_filter = "found" if object_type == "lost" else "lost"
                candidates = db.collection(opposite_collection).where("status", "==", status_filter).stream()

                for candidate_doc in candidates:
                    candidate = candidate_doc.to_dict()
                    candidate_embedding = candidate.get("embedding")
                    if candidate_embedding:
                        score = cosine_similarity(embedding, candidate_embedding)
                        if score > 0.5:
                            lost_id = doc_id if object_type == "lost" else candidate_doc.id
                            found_id = candidate_doc.id if object_type == "lost" else doc_id
                            save_match(lost_id, found_id, score)

                # Supprime le document temporaire
                db.collection("objects_pending").document(doc.id).delete()
                processed.append(doc_id)

            except Exception as err:
                print(f"Erreur traitement {doc_id}: {err}")
                continue

        return jsonify({
            "message": "Traitement terminé",
            "processed": processed
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500






if __name__ == "__main__":
  app.run(host="0.0.0.0", port=5000, debug=True)

