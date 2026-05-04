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
    "name": "Example Drone",
    "model": "Example Model",
    "manufacturer": "Example Manufacturer",
    "batterylevel": 40,
    "position": {
      "latitude": 24,
      "longitude": 14,
      "altitude": 54,
      "timestamp": int(time.time())
    },
    "maxCapacity": {
      "maxWeight": 2,
      "maxVolume": 3,
      "currentLoad": 1,
      "currentOrders": [],
      "weight": 5,
      "length": 3,
      "width": 2,
      "height": 6
    },
    "status": "idle"
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

    client.subscribe(f"drones/nonce/{nonce}/id")

    def on_nonce_response(client, userdata, message):
        payload = json.loads(message.payload.decode())
        id = payload["id"]

        client.subscribe(f"drones/{id}/#")
        client.unsubscribe(f"drones/nonce/{nonce}/id")
        client.publish(f"drones/{id}/drone-ack", json.dumps({"ack": 1}))

        setId(id)

        # 👇 wake up the waiting code
        response_event.set()

    client.message_callback_add(
        f"drones/nonce/{nonce}/id",
        on_nonce_response
    )

    # Send request
    client.publish(
        "drones/create",
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