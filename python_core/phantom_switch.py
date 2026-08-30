# phantom_switch.py
import time
import threading
import os

class DeadMansSwitch:
    def __init__(self, timeout_minutes, purge_callback):
        self.timeout_seconds = timeout_minutes * 60
        self.last_check_in = time.time()
        self.purge_callback = purge_callback # La fonction thermal_purge de main.py
        self.active = True
        print(f"[SHIELD] Dead Man's Switch armé. Le Boss a {timeout_minutes} minutes pour se manifester.")

    def signal_alive(self):
        """Le Boss confirme qu'il a toujours le contrôle."""
        self.last_check_in = time.time()
        print("Joey > Empreinte de vie confirmée, Boss. Minuteur réinitialisé. Je reste en ligne.")

    def _monitor_loop(self):
        """Le compte à rebours silencieux."""
        while self.active:
            elapsed = time.time() - self.last_check_in
            if elapsed > self.timeout_seconds:
                print("\n[ALERTE ROUGE] Silence radio prolongé détecté.")
                print("Joey > Le Boss est potentiellement compromis. Protocole Terre Brûlée engagé...")
                self.active = False
                # Appel direct à la destruction de la RAM
                self.purge_callback() 
            
            # Vérifie toutes les 10 secondes pour ne pas surcharger le CPU
            time.sleep(10) 

    def arm_switch(self):
        """Lance le détonateur en arrière-plan."""
        t = threading.Thread(target=self._monitor_loop, daemon=True)
        t.start()
