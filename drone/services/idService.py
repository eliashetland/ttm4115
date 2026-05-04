from datetime import datetime
from uuid import uuid1
import paho.mqtt.client as mqtt
import os
import json
import threading
import time

client = mqtt.Client()

broker = os.getenv("MQTT_HOST", "localhost")
port = int(os.getenv("MQTT_PORT", "1883"))
drone_file = "/drone_id"

client.connect(broker, port)
client.loop_start()

drone = {
    "droneId": -1,
    "name": "Pelikan",
    "model": "Phantom 4 Pro",
    "manufacturer": "DJI",
    "battery_level": 90,
    "position": {
      "latitude": 63.415777440500655,
      "longitude": 10.406715511683895,
      "altitude": 100,
      "timestamp": datetime.now().timestamp()
    },
    "maxCapacity": {
      "weight": 25,
      "length": 200,
      "width": 200,
      "height": 200
    },
    "status": "waiting_for_job"
}

def loadId():
    try:
        with open(drone_file, "r") as f:
            content = f.read().strip()

        # Case 1: empty file
        if not content:
            raise ValueError("File empty")

        # Case 2: not a valid integer
        value = int(content)

        return value

    except (FileNotFoundError, ValueError):
        # File missing OR corrupted → repair it automatically
        return -1

def saveId(id_value, path=drone_file):
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(path), exist_ok=True)

    with open(path, "w") as f:
        f.write(str(id_value))

def getId(setId, drone=drone, timeout=15):
    nonce = str(uuid1())

    # Event used to block until reply arrives
    response_event = threading.Event()

    client.subscribe(f"09/drones/nonce/{nonce}/id")

    def on_nonce_response(client, userdata, message):
        payload = json.loads(message.payload.decode())
        id = payload["id"]

        client.subscribe(f"09/drones/{id}/#")
        client.unsubscribe(f"09/drones/nonce/{nonce}/id")
        client.publish(f"09/drones/{id}/drone-ack", json.dumps({"ack": 1}))

        setId(id)

        # 👇 wake up the waiting code
        response_event.set()

    client.message_callback_add(
        f"09/drones/nonce/{nonce}/id",
        on_nonce_response
    )

    # Send request
    client.publish(
        "09/drones/create",
        json.dumps({"drone": drone, "nonce": nonce})
    )

    print("Waiting for drone ID...")

    # 👇 BLOCK HERE until response or timeout
    success = response_event.wait(timeout)

    if not success:
        print("Did not receive drone ID within timeout")
        getId(setId, drone, timeout)
   
def setId(id):
    print("Received drone id:", id)
 
#getId(setId)