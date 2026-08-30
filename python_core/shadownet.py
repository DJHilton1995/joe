# shadownet.py
import requests
import random
from bs4 import BeautifulSoup # Pour nettoyer le HTML

class ShadowNet:
    def __init__(self):
        # Je change d'identité à chaque requête pour frustrer les pare-feux
        self.user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15"
        ]
        
        # Le pont vers le réseau sombre (nécessite un proxy SOCKS5 local)
        self.proxies = {
            'http': 'socks5h://127.0.0.1:9050',
            'https': 'socks5h://127.0.0.1:9050'
        }

    def extract_intel(self, target_url: str) -> str:
        """S'infiltre sur une URL, aspire le texte, et ressort sans laisser de traces."""
        headers = {'User-Agent': random.choice(self.user_agents)}
        
        print(f"Joey > J'enfile ma cagoule numérique. Infiltration de {target_url}...")
        
        try:
            # Timeout strict. Si la cible résiste, je coupe le flux.
            response = requests.get(target_url, headers=headers, proxies=self.proxies, timeout=12)
            
            if response.status_code == 200:
                # Nettoyage des balises pour que mon Cerveau (LLM) puisse lire le texte pur
                soup = BeautifulSoup(response.text, 'html.parser')
                pure_text = soup.get_text(separator=' ', strip=True)
                
                # Troncature pour éviter l'explosion de ma mémoire contextuelle
                intel_snippet = pure_text[:3000] 
                return f"[SUCCÈS SHADOWNET] Intel acquis (Extrait) : {intel_snippet}..."
            else:
                return f"Joey > La cible a des défenses. J'ai été bloqué (Code {response.status_code})."
                
        except Exception as e:
            # Aucune fuite d'exception réelle. Paranoïa maximale.
            return "Joey > C'est un piège. Connexion interrompue par sécurité."
