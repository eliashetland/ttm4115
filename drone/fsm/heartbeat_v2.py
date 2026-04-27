from stmpy import Driver, Machine
import paho.mqtt.client as mqtt
import json
from datetime import datetime
import numpy as np
from drone_status_fsm import create_machine as create_drone_status_machine
from sense_hat import SenseHat
import time

#starting the drone status machine
drone_status = create_drone_status_machine()
driver = Driver()
driver.add_machine(drone_status)

#permanent variables
id = 1
battery_level = 100

#battery stm
sense = SenseHat()
sense.low_light = True
sense.clear()
c8 = (0, 255, 0)
c7 = (65, 255, 0)
c6 = (130, 255, 0)
c5 = (195, 255, 0)
c4 = (255, 255, 0)
c3 = (255, 170, 0)
c2 = (255, 85, 0)
c1 = (255, 0, 0)
c0 = (0, 0, 0)

class Battery:
    def _set_battery_row(self, color, count):
        for col in range(8):
            sense.set_pixel(col, 7, c0)
        for col in range(count):
            sense.set_pixel(col, 7, color)

    def battery_100(self):
        global battery_level
        battery_level = 100
        self._set_battery_row(c8, 8)

    def battery_87_5(self):
        global battery_level
        battery_level = 87.5
        self._set_battery_row(c7, 7)

    def battery_75(self):
        global battery_level
        battery_level = 75
        self._set_battery_row(c6, 6)

    def battery_62_5(self):
        global battery_level
        battery_level = 62.5
        self._set_battery_row(c5, 5)

    def battery_50(self):
        global battery_level
        battery_level = 50
        self._set_battery_row(c4, 4)

    def battery_37_5(self):
        global battery_level
        battery_level = 37.5
        self._set_battery_row(c3, 3)

    def battery_25(self):
        global battery_level
        battery_level = 25
        self._set_battery_row(c2, 2)

    def battery_12_5(self):
        global battery_level
        battery_level = 12.5
        self._set_battery_row(c1, 1)

    def battery_5(self):
        global battery_level
        battery_level = 5
        self._set_battery_row(c1, 1)

    def battery_0(self):
        global battery_level
        battery_level = 0
        self._set_battery_row(c0, 0)

def create_battery_machine():
    t0 = {"source": "initial", "target": "battery_100"}

    t1 = {
        "trigger": "left",
        "source": "battery_100",
        "target": "battery_87_5",
    }

    t2 = {
        "trigger": "left",
        "source": "battery_87_5",
        "target": "battery_75",
    }

    t3 = {
        "trigger": "left",
        "source": "battery_75",
        "target": "battery_62_5",
    }

    t4 = {
        "trigger": "left",
        "source": "battery_62_5",
        "target": "battery_50",
    }

    t5 = {
        "trigger": "left",
        "source": "battery_50",
        "target": "battery_37_5",
    }

    t6 = {
        "trigger": "left",
        "source": "battery_37_5",
        "target": "battery_25",
    }

    t7 = {
        "trigger": "left",
        "source": "battery_25",
        "target": "battery_12_5",
    }

    t8 = {
        "trigger": "left",
        "source": "battery_12_5",
        "target": "battery_5",
    }

    t9 = {
        "trigger": "left",
        "source": "battery_5",
        "target": "battery_0",
    }

    t10 = {
        "trigger": "right",
        "source": "battery_0",
        "target": "battery_5",
    }

    t11 = {
        "trigger": "right",
        "source": "battery_5",
        "target": "battery_12_5",
    }

    t12 = {
        "trigger": "right",
        "source": "battery_12_5",
        "target": "battery_25",
    }

    t13 = {
        "trigger": "right",
        "source": "battery_25",
        "target": "battery_37_5",
    }

    t14 = {
        "trigger": "right",
        "source": "battery_37_5",
        "target": "battery_50",
    }

    t15 = {
        "trigger": "right",
        "source": "battery_50",
        "target": "battery_62_5",
    }

    t16 = {
        "trigger": "right",
        "source": "battery_62_5",
        "target": "battery_75",
    }

    t17 = {
        "trigger": "right",
        "source": "battery_75",
        "target": "battery_87_5",
    }

    t18 = {
        "trigger": "right",
        "source": "battery_87_5",
        "target": "battery_100",
    }

    battery_100 = {'name': 'battery_100',
        'entry': 'battery_100'
    }

    battery_87_5 = {'name': 'battery_87_5',
        'entry': 'battery_87_5'
    }

    battery_75 = {'name': 'battery_75',
        'entry': 'battery_75'
    }

    battery_62_5 = {'name': 'battery_62_5',
        'entry': 'battery_62_5'
    }

    battery_50 = {'name': 'battery_50',
        'entry': 'battery_50'
    }

    battery_37_5 = {'name': 'battery_37_5',
        'entry': 'battery_37_5'
    }

    battery_25 = {'name': 'battery_25',
        'entry': 'battery_25'
    }

    battery_12_5 = {'name': 'battery_12_5',
        'entry': 'battery_12_5'
    }

    battery_5 = {'name': 'battery_5',
        'entry': 'battery_5'
    }

    battery_0 = {'name': 'battery_0',
        'entry': 'battery_0'
    }

    battery =  Battery()
    machine = Machine(transitions=[t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18],
                      states=[battery_100, battery_87_5, battery_75, battery_62_5, battery_50, battery_37_5, battery_25, battery_12_5, battery_5, battery_0],
                      obj=battery,
                      name="battery")
    battery.stm = machine
    return machine

battery_machine = create_battery_machine()
driver.add_machine(battery_machine)
    
#coordinates
class Coordinates:
    def gps_array(stop):
        start = {'latitude' : 63.415808,
                 'longitude' : 10.406744}
        global points
        points = 4
        gps_array = {'latitude': np.linspace(start["latitude"], stop["latitude"], points),
                     "longitude": np.linspace(start["longitude"], stop["longitude"], points)}
        return gps_array
destination = {'latitude' : 63.443389,
               'longitude' : 10.446818}
c = 0
coordinates = Coordinates.gps_array(destination)

#heartbeat stm
class Heartbeat:
    def heartbeat(self):
        global c, points
        heartbeat_data = {
            'id': id,
            'timestamp': datetime.now().isoformat(),
            'state': drone_status.state,
            'battery_level': battery_level,
            'gps': {"latitude" : float(coordinates["latitude"][c]),
                    "longitude" : float(coordinates["longitude"][c])}
        }
        self.stm.client.publish("09/heartbeat", json.dumps(heartbeat_data))
        c+=1
        if c>points-1:
            c=points-1

def create_heartbeat_machine():
    t0 = {"source": "initial", "target": "idle"}

    t1 = {
        "trigger": "t_h",
        "source": "idle",
        "target": "idle",
    }

    idle = {'name': 'idle',
        'entry': 'heartbeat; start_timer("t_h", 10000)'
    }

    heartbeat =  Heartbeat()
    machine = Machine(transitions=[t0, t1], states=[idle], obj=heartbeat, name="heartbeat")
    heartbeat.stm = machine
    return machine

heartbeat_machine = create_heartbeat_machine()
driver.add_machine(heartbeat_machine)

 #MQTT
class MQTT_Client_1:
    def __init__(self):
        self.count = 0
        try:
            self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION1)
        except AttributeError:
            self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        print("on_connect(): {}".format(mqtt.connack_string(rc)))

    def on_message(self, client, userdata, msg):
        print("on_message(): topic: {} message: {}".format(msg.topic, msg.payload))
        
    def start(self, broker, port):

        print("Connecting to {}:{}".format(broker, port))
        self.client.connect(broker, port)
        self.client.subscribe("09/#")
        self.client.loop_start()

    def stop(self):
        self.client.loop_stop()
        self.client.disconnect()

broker, port = "mqtt20.iik.ntnu.no", 1883

myclient = MQTT_Client_1()
heartbeat_machine.client = myclient.client
myclient.stm_driver = driver

def main():
    myclient.start(broker, port)
    driver.start()

    try:
        while True:
            for event in sense.stick.get_events():
                if event.action != "pressed":
                    continue

                if event.direction == "left":
                    battery_machine.send("left")
                elif event.direction == "right":
                    battery_machine.send("right")

            time.sleep(0.05)
    except KeyboardInterrupt:
        print("Interrupted")
    finally:
        driver.stop()
        myclient.stop()
        sense.clear()


if __name__ == "__main__":
    main()
