
from uuid import uuid1
import paho.mqtt.client as mqtt
import os
import json

client = mqtt.Client()

broker = os.getenv("MQTT_BROKER", "mqtt20.iik.ntnu.no")
port = os.getenv("MQTT_PORT", 1883)

client.connect(broker, port)

drone = {
  "nonce": 24,
  "timestamp": 1777553417274,
  "drone": {
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
}

def getId(stm):
    nonce = uuid1()
    
    client.subscribe(f"drones/nonce/{nonce}/id")        
    
    def on_nonce_response(client, userdata, message):
        id = json.loads(message).id
        client.subscribe(f"drones/{id}/#")
        client.unsubscribe(f"drones/nonce/{nonce}/id")
        client.publish(f"drones/{id}/drone-ack", json.dumps({"ack": 1}))
        stm.id = id
        stm.send("gotId")
    
    client.message_callback_add(f"drones/nonce/{nonce}/id", on_nonce_response)
    client.publish("drones/create", json.dumps({"drone": drone, "nonce": nonce}))

getId()