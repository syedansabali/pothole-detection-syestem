import time
import random
import json
import urllib.request
from datetime import datetime

# ==========================================
# FIREBASE REALTIME DATABASE CONFIGURATION
# ==========================================
# Agar zaroorat ho to apna exact Firebase DB URL yahan update karein
FIREBASE_DB_URL = "https://road-hazard-detection-ff1b3-default-rtdb.asia-southeast1.firebasedatabase.app"

# Hyderabad to Tando Jam Corridor Waypoints (Sindh, Pakistan)
ROUTE_WAYPOINTS = [
    {"lat": 25.3960, "lng": 68.3578, "name": "Hyderabad City Hub"},
    {"lat": 25.4050, "lng": 68.3980, "name": "Fateh Chowk N-120"},
    {"lat": 25.4180, "lng": 68.4600, "name": "Rahuki Toll Plaza"},
    {"lat": 25.4285, "lng": 68.5320, "name": "SAU Gate 1 Tando Jam"},
    {"lat": 25.4350, "lng": 68.5450, "name": "Tando Jam Main Bazaar"}
]

def push_hazard_to_firebase(hazard):
    """Sends detected pothole payload to Firebase Realtime Database."""
    endpoint = f"{FIREBASE_DB_URL}/hazards/{hazard['id']}.json"
    data_bytes = json.dumps(hazard).encode('utf-8')
    req = urllib.request.Request(endpoint, data=data_bytes, method='PUT')
    req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=4) as res:
            if res.status == 200:
                print(f"[*] FIREBASE SYNC: Added {hazard['severity']} hazard at ({hazard['latitude']}, {hazard['longitude']}) | Force: {hazard['impactForceG']}g | Depth: {hazard['depthEstCm']}cm")
    except Exception as err:
        print(f"[!] Firebase request warning: {err}")

class TelemetrySimulator:
    def __init__(self):
        self.waypoint_index = 0
        self.progress = 0.0
        self.hazard_count = 100
        self.speed = 65.0

    def step(self):
        start_node = ROUTE_WAYPOINTS[self.waypoint_index]
        end_node = ROUTE_WAYPOINTS[(self.waypoint_index + 1) % len(ROUTE_WAYPOINTS)]
        
        # Linear interpolation between checkpoints
        current_lat = round(start_node["lat"] + (end_node["lat"] - start_node["lat"]) * self.progress, 5)
        current_lng = round(start_node["lng"] + (end_node["lng"] - start_node["lng"]) * self.progress, 5)
        
        self.progress += 0.035
        if self.progress >= 1.0:
            self.progress = 0.0
            self.waypoint_index = (self.waypoint_index + 1) % len(ROUTE_WAYPOINTS)
            
        # Vehicle dynamics simulation
        self.speed = max(40.0, min(92.0, self.speed + random.uniform(-2.5, 2.5)))
        pitch_deg = round(random.uniform(-1.0, 2.2), 1)
        roll_deg = round(random.uniform(-1.2, 1.2), 1)
        
        # 20% probability of encountering road anomaly / pothole
        has_pothole = random.random() < 0.20
        if has_pothole:
            self.hazard_count += 1
            severity_choice = random.choice(["Medium", "High", "Critical"])
            hazard_payload = {
                "id": f"HAZ-{self.hazard_count}",
                "type": "POTHOLE",
                "title": f"{severity_choice} Road Pothole",
                "severity": severity_choice,
                "status": "PENDING",
                "latitude": current_lat,
                "longitude": current_lng,
                "locationName": ROUTE_WAYPOINTS[self.waypoint_index]["name"],
                "thumbnailUrl": "",
                "depthEstCm": round(random.uniform(8.5, 21.0), 1),
                "impactForceG": round(random.uniform(1.1, 2.6), 2),
                "vehiclesAffected": random.randint(1, 4),
                "unitId": "ROAD_UNIT_01",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "timeDisplay": datetime.now().strftime("%H:%M:%S PKT")
            }
            push_hazard_to_firebase(hazard_payload)
        else:
            print(f"[TELEMETRY] Speed: {round(self.speed)} KM/H | GPS: ({current_lat}, {current_lng}) | Pitch: {pitch_deg} deg | Roll: {roll_deg} deg")

if __name__ == "__main__":
    print("=" * 65)
    print("ROADGUARD TELEMETRY & POTHOLE SENSOR SIMULATION")
    print("Route: Hyderabad <-> Tando Jam Corridor (N-120)")
    print("=" * 65)
    
    simulator = TelemetrySimulator()
    while True:
        simulator.step()
        time.sleep(2)