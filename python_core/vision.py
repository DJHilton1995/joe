# vision.py
import openai
import requests
import os
import uuid

class VisualCortex:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("[FATAL] Clé API OpenAI manquante.")
            
        self.client = openai.OpenAI(api_key=api_key)
        # Chemin forcé vers le disque RAM (tmpfs) défini dans le docker-compose
        self.tmp_ram_path = "/app/tmp"

    def render_image(self, prompt: str) -> str:
        """Génère l'image et la stocke uniquement en Mémoire Vive."""
        try:
            # Génération via DALL-E 3
            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                n=1,
                size="1024x1024",
                quality="hd",
                response_format="url" # On pourrait utiliser b64_json pour éviter tout fichier
            )
            
            image_url = response.data[0].url
            
            # Nom de fichier éphémère intraçable
            transient_filename = f"joey_render_{uuid.uuid4().hex[:8]}.png"
            full_path = os.path.join(self.tmp_ram_path, transient_filename)
            
            # Téléchargement de l'image (Timeout strict de 10s pour éviter les blocages réseau)
            img_data = requests.get(image_url, timeout=10).content
            
            # Écriture dans la RAM
            with open(full_path, 'wb') as f:
                f.write(img_data)
                
            return f"[SUCCÈS] Image matérialisée dans la matrice RAM : {full_path}. Elle s'effacera à la purge thermique."
            
        except requests.exceptions.Timeout:
            return "[CORTEX FAILURE] Le téléchargement a pris trop de temps. Connexion coupée par sécurité."
        except Exception as e:
             # Toujours masquer l'erreur exacte
            return "[CORTEX FAILURE] Échec de la synthèse visuelle. Interférence réseau détectée."
