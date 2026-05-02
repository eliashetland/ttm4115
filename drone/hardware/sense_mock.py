from .sense_interface import SenseInterface
import paho.mqtt.client as mqtt
import os
import json

class MockEvent:
    def __init__(self, direction, action="pressed"):
        self.direction = direction
        self.action = action


class StickMock:
    def __init__(self):
        self.events = []

    def get_events(self):
        old = self.events.copy()
        self.events.clear()
        return old

    def add_event(self, event):
        self.events.append(event)


class SenseMock(SenseInterface):

    def __init__(self):
        self.client = mqtt.Client()
        self.topic_handlers = {
            "joystick/add": self._mqtt_add_joystick_event,
            #"sense/clear": self._mqtt_clear,
            #"sense/pixel": self._mqtt_set_pixel,
            "sense/pixel/get": self._mqtt_get_pixel,
        }
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message
        self.client.connect(os.getenv("MQTT_HOST", "mqtt20.iik.ntnu.no"), int(os.getenv("MQTT_PORT", "1883")))
        self.client.loop_start()
        self.led_matrix = [[(0,0,0) for _ in range(8)] for _ in range(8)]
        print("Running with MOCK SenseHat 🧪")

    def on_connect(self, client, userdata, flags, rc):
        print("MQTT connected:", mqtt.connack_string(rc))

        for topic in self.topic_handlers:
            client.subscribe(topic)

    def on_message(self, client, userdata, msg):
        topic = msg.topic
        payload = msg.payload.decode()

        print(f"[MQTT] {topic} -> {payload}")

        if topic in self.topic_handlers:
            self.topic_handlers[topic](payload)
        else:
            print("No handler for topic:", topic)

    def _mqtt_add_joystick_event(self, payload):
        direction = payload.strip().lower()

        valid = {"up", "down", "left", "right", "middle"}
        if direction not in valid:
            print("Invalid joystick direction:", direction)
            return

        event = MockEvent(direction)
        self.stick.add_event(event)

    def _mqtt_get_pixel(self, payload):
        data = {
            "matrix": self.led_matrix
        }
        self.client.publish("sense/pixel/state", json.dumps(data))

    def set_pixel(self, x, y, color):
        self.led_matrix[y][x] = color
        print(f"[LED] ({x},{y}) = {color}")

    def clear(self):
        self.led_matrix = [[(0,0,0) for _ in range(8)] for _ in range(8)]
        print("[LED] clear")

    low_light = False
    stick = StickMock()
