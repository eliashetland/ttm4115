from stmpy import Driver, Machine
from threading import Thread
import paho.mqtt.client as mqtt
import json
from datetime import datetime
import numpy as np
from drone_status_fsm import DroneStatus, create_machine as create_drone_status_machine
from sense_hat import SenseHat
import time

#starting the drone status machine
drone_status = create_drone_status_machine()
driver = Driver()
driver.add_machine(drone_status)

#permanent variables
id = 1234

#battery stm
sense = SenseHat()
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
    def battery_100():
        global battery_level
        battery_level = 100
        for col in range(8):
            sense.set_pixel(col, 7, c0)
        for col in range(8):
            sense.set_pixel(col, 7, c8)

    def battery_87_5():
        global battery_level
        battery_level = 87.5
        for col in range(8):
            sense.set_pixel(col, 7, c0)
        for col in range(7):
            sense.set_pixel(col, 7, c7)

    def battery_75():
        global battery_level
        battery_level = 75
        for col in range(8):
            sense.set_pixel(col, 7, c0)
        for col in range(6):
            sense.set_pixel(col, 7, c6)

    def battery_62_5():
        global battery_level
        battery_level = 62.5
        for col in range(8):
            sense.set_pixel(col, 7, c0)
        for col in range(5):
            sense.set_pixel(col, 7, c5)

    def battery_50():
        global battery_level
        battery_level = 50
        for col in range(8):
            sense.set_pixel(col, 7, c0)
        for col in range(4):
            sense.set_pixel(col, 7, c4)

    def battery_37_5():
        global battery_level
        battery_level = 37.5
        for col in range(8):
            sense.set_pixel(col, 7, c0)
        for col in range(3):
            sense.set_pixel(col, 7, c3)

    def battery_25():
        global battery_level
        battery_level = 25
        for col in range(8):
            sense.set_pixel(col, 7, c0)
        for col in range(2):
            sense.set_pixel(col, 7, c2)

    def battery_12_5():
        global battery_level
        battery_level = 12.5
        for col in range(8):
            sense.set_pixel(col, 7, c0)
        for col in range(1):
            sense.set_pixel(col, 7, c1)
    
    def battery_5():
        global battery_level
        battery_level = 5
        for col in range(8):
            sense.set_pixel(col, 7, c0)
        while battery_machine.state == "battery_5":
            sense.set_pixel(0, 7, c1)
            time.sleep(500)
            sense.set_pixel(0, 7, c0)
            time.sleep(500)
        

    def battery_0():
        global battery_level
        battery_level = 0
        for col in range(8):
            sense.set_pixel(col, 7, c0)

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
        "source": "batter_75",
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
        "source": "battery_12.5",
        "target": "battery_5",
    }

    t8 = {
        "trigger": "left",
        "source": "battery_5",
        "target": "battery_0",
    }

    t9 = {
        "trigger": "right",
        "source": "battery_0",
        "target": "battery_5",
    }

    t10 = {
        "trigger": "right",
        "source": "battery_5",
        "target": "battery_12_5",
    }

    t11 = {
        "trigger": "right",
        "source": "battery_12_5",
        "target": "battery_25",
    }

    t12 = {
        "trigger": "right",
        "source": "battery_25",
        "target": "battery_37_5",
    }

    t13 = {
        "trigger": "right",
        "source": "battery_37_5",
        "target": "battery_50",
    }

    t14 = {
        "trigger": "right",
        "source": "battery_50",
        "target": "battery_62_5",
    }

    t15 = {
        "trigger": "right",
        "source": "battery_62_5",
        "target": "battery_75",
    }

    t16 = {
        "trigger": "right",
        "source": "battery_75",
        "target": "battery_87_5",
    }

    t17 = {
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
    machine = Machine(transitions=[t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17],
                      states=[battery_100, battery_87_5, battery_75, battery_62_5, battery_50, battery_37_5, battery_25, battery_12_5, battery_5, battery_0],
                      obj=battery,
                      name="battery")
    battery.stm = machine
    return machine

battery_machine = create_battery_machine()
driver.add_machine(battery_machine)
    
#coordinates
class Coordinates:
    def __init__(self):
        pass
    def gps_array(stop):
        start = {'latitude' : 63.418568,
                 'longitude' : 10.402834}
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
            'gps': {"latitude" : coordinates["latitude"][c],
                    "longitude" : coordinates["longitude"][c]}
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

        try:
            # line below should not have the () after the function!
            thread = Thread(target=self.client.loop_forever)
            thread.start()
        except KeyboardInterrupt:
            print("Interrupted")
            self.client.disconnect()

broker, port = "mqtt20.iik.ntnu.no", 1883

myclient = MQTT_Client_1()
heartbeat_machine.client = myclient.client
myclient.stm_driver = driver

myclient.start(broker, port)
driver.start()

while True:
  for event in sense.stick.get_events():
    # Check if the joystick was pressed
    if event.action == "pressed":
      
      # Check which direction
      if event.direction == "up":
        battery_machine.send("up")      # Up arrow
      elif event.direction == "down":
        battery_machine.send("down")      # Down arrow
      elif event.direction == "left": 
        battery_machine.send("left")      # Left arrow
      elif event.direction == "right":
        battery_machine.send("right")      # Right arrow
      elif event.direction == "middle":
        battery_machine.send("middle")      # Enter key 