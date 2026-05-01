from uuid import uuid1
import paho.mqtt.client as mqtt
import os
import json
import threading

client = mqtt.Client()

broker = os.getenv("MQTT_BROKER", "localhost")
port = os.getenv("MQTT_PORT", 1883)

client.connect(broker, port)
client.loop_start()

drone = {
    "droneId": -1,
    "name": "HAHA",
    "model": "lmao",
    "manufacturer": "bruther",
    "batterylevel": 40,
    "position": {
      "latitude": 24,
      "longitude": 14,
      "altitude": 54,
      "timestamp": 1777553417274
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

def getId(setId, timeout=5):
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
        raise TimeoutError("Did not receive drone ID within timeout")
   
def setId(id):
    print("Received drone id:", id)
 
getId(setId)