from sentence_transformers import SentenceTransformer

# Charger le modèle une seule fois
model = SentenceTransformer('all-MiniLM-L6-v2')

def encode(text):
    return model.encode(text, convert_to_tensor=True)
