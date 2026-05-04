import queue
import threading
import time
import paho.mqtt.client as mqtt
import os
from services import loadId

class Context:
    def __init__(self):
        pass

class Device:
    def __init__(self, action):
        self.action = str(action)
        self.subsystem = "usb"

class Monitor:
    def __init__(self, context):
        self.q = queue.Queue()
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.connect(
            os.getenv("MQTT_HOST", "mqtt20.iik.ntnu.no"),
            int(os.getenv("MQTT_PORT", "1883")),
        )
        self.client.loop_start()
    
    @classmethod
    def from_netlink(self, context):
        return Monitor(context)

    def filter_by(self, subsystem):
        pass
    
    def on_connect(self, client, userdata, flags, rc):
        print("MQTT connected:", mqtt.connack_string(rc))

        id = -1
        while id < 1:
            id = loadId()

        self.topic_handlers = {
            f"drones/{id}/usb/action": self._mqtt_add_usb_action,
        }

        for topic in self.topic_handlers:
            client.subscribe(topic)
        
    def _mqtt_add_usb_action(self, payload):
        action = payload.strip().lower()

        valid = {"add", "remove"}
        if action not in valid:
            print("Invalid USB action:", action)
            return

        self.q.put(Device(action))

    def on_message(self, client, userdata, msg):
        topic = msg.topic
        payload = msg.payload.decode()

        print(f"[MQTT] {topic} -> {payload}")

        if topic in self.topic_handlers:
            self.topic_handlers[topic](payload)
        else:
            print("No handler for topic:", topic)

    def start(self):
        pass

    def poll(self, timeout=0.1):
        try:
            que = self.q.get(timeout=timeout)
            return que
        except queue.Empty:
            return None
        
    def simulate_add(self):
        self.q.put(Device("add"))

    def simulate_remove(self):
        self.q.put(Device("remove"))