import requests

# Adresse de ton API locale
API_URL = "http://127.0.0.1:5000/compare"

# Liste de paires de descriptions à tester
descriptions = [
    ("Un téléphone Samsung Galaxy noir trouvé dans l’avion", "Téléphone Samsung noir perdu pendant le vol"),
    ("Sac rouge avec des fleurs brodées", "Sac de sport noir avec fermeture éclair"),
    ("Porte-monnaie en cuir brun", "Petit portefeuille marron"),
    ("Valise grise rigide", "Valise rigide couleur argent"),
    ("Ordinateur portable Dell noir", "MacBook Air en aluminium")
]

# Seuil de similarité à partir duquel on affiche le résultat
THRESHOLD = 0.65

# Lancer les tests
for i, (desc1, desc2) in enumerate(descriptions, start=1):
    payload = {
        "description1": desc1,
        "description2": desc2
    }

    response = requests.post(API_URL, json=payload)
    if response.status_code == 200:
        result = response.json()
        score = result['similarity_score']

        if score >= THRESHOLD:
            print(f"\n🔍 Test {i} (score ≥ {THRESHOLD}):")
            print(f"→ {desc1}")
            print(f"→ {desc2}")
            print(f"✔️ Similarity: {score}")
    else:
        print(f"❌ Erreur lors du test {i}: {response.status_code}")
