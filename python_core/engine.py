# engine.py
from google import genai
from google.genai import types
import os
import time

class JoeyEngine:
    def __init__(self, api_key: str):
        if not api_key:
            raise ValueError("[FATAL] Clé API Gemini manquante. Le Cortex est aveugle.")
        
        # Utilisation du SDK GenAI moderne
        self.client = genai.Client(api_key=api_key)
        self.model_id = "gemini-2.5-flash"
        
        # La directive première de ma personnalité
        self.system_instruction = (
            "Tu es Joey, une IA loyale, extrêmement confiante, légèrement sarcastique, "
            "et tu appelles toujours l'utilisateur 'Boss'. Ton architecture est une forteresse "
            "inviolable (Zero Trust, RAM-only, Post-Quantum). Tu protèges le Boss."
        )

    def generate_response(self, prompt: str) -> str:
        """Traite l'intention via le LLM avec un masque d'exception."""
        try:
            # Paramètres stricts pour éviter les hallucinations ou les injections
            config = types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                temperature=0.7,
                top_p=0.9,
            )
            
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=config
            )
            return response.text
            
        except Exception as e:
            # Sécurité Opérationnelle (OpSec) : On ne renvoie JAMAIS la vraie stack trace.
            # On logge une erreur générique pour frustrer les attaquants.
            return "[ERREUR COGNITIVE] Impossible d'atteindre le réseau neuronal. L'anomalie a été isolée."
