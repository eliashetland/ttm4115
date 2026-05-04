import threading

from stmpy import Driver, Machine
from threading import Thread
import paho.mqtt.client as mqtt
import json
from datetime import datetime
import numpy as np
from sense_hat import SenseHat
import pyudev
#from hardware import SenseHat, pyudev
import time
import os
#from services import getId, loadId, saveId
from uuid import uuid1
import time

client = mqtt.Client()

broker = os.getenv("MQTT_HOST", "localhost")
port = int(os.getenv("MQTT_PORT", "1883"))
drone_file = "drone_id"

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

    client.subscribe(f"drones/nonce/{nonce}/id")

    def on_nonce_response(client, userdata, message):
        payload = json.loads(message.payload.decode())
        id = payload["id"]

        client.subscribe(f"drones/{id}/#")
        client.unsubscribe(f"drones/nonce/{nonce}/id")
        client.publish(f"drones/{id}/drone-ack", json.dumps({"ack": 1}))

        setId(id)

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

    success = response_event.wait(timeout)

    if not success:
        print("Did not receive drone ID within timeout")
        getId(setId, drone, timeout)
   
def setId(id):
    print("Received drone id:", id)
 

# region permanent variables and startup [rgb(128, 128, 128, 0.1)]
id = loadId()

#sense = SenseHat()
sense = SenseHat()
sense.low_light = True
sense.clear()

green = (0, 255, 0)
c7 = (65, 255, 0)
c6 = (130, 255, 0)
c5 = (195, 255, 0)
yellow = (255, 255, 0)
orange = (255, 150, 0)
c2 = (255, 100, 0)
red = (255, 0, 0)
black = (0, 0, 0)
blue = (0, 0, 255)
white = (255, 255, 255)

# Number mask for Id numbers:
DIGITS = {
    "0": [
        "111",
        "101",
        "101",
        "101",
        "111"
    ],
    "1": [
        "010",
        "110",
        "010",
        "010",
        "111"
    ],
    "2": [
        "111",
        "001",
        "111",
        "100",
        "111"
    ],
    "3": [
        "111",
        "001",
        "111",
        "001",
        "111"
    ],
    "4": [
        "101",
        "101",
        "111",
        "001",
        "001"
    ],
    "5": [
        "111",
        "100",
        "111",
        "001",
        "111"
    ],
    "6": [
        "111",
        "100",
        "111",
        "101",
        "111"
    ],
    "7": [
        "111",
        "001",
        "010",
        "010",
        "010"
    ],
    "8": [
        "111",
        "101",
        "111",
        "101",
        "111"
    ],
    "9": [
        "111",
        "101",
        "111",
        "001",
        "111"
    ]
}

def led_id(number, colour=(255,0,255)):
    num_str = str(int(number)).zfill(2)

    sense.clear()

    for i, digit in enumerate(num_str):
        pattern = DIGITS[digit]

        for y, row in enumerate(pattern):
            for x, val in enumerate(row):
                if val == "1":
                    sense.set_pixel(x + i*4 + 1, y + 1, colour)

""" def led_id(colour):
    sense.set_pixel(4,1,colour)
    sense.set_pixel(3,2,colour)
    sense.set_pixel(4,2,colour)
    sense.set_pixel(4,3,colour)
    sense.set_pixel(4,4,colour)
    sense.set_pixel(4,5,colour)
    sense.set_pixel(3,6,colour)
    sense.set_pixel(4,6,colour)
    sense.set_pixel(5,6,colour) """

def setId(newId):
    global id
    id = newId
    led_id(id, white)
    saveId(id)

# Get id if not persistent memory
if id < 1:
    getId(setId)
else:
    led_id(id, white)

print("Id is:", id)

#led_id(white)

station = {'latitude' : 63.415808,
            'longitude' : 10.406744}

driver = Driver()
# endregion

# region drone status stm [rgb(255, 255, 0, 0.1)]
class DroneStatus:
    def __init__(self, station, sense):
         self.order_id = None
         self.position = station
         self.destination = {'latitude' : None,
                 'longitude' : None}
         self.sense = sense
         self.is_led_stripe_on = False
         self.pixels_way = np.arange(0,8)
         self.pixels_back = np.arange(7,-1,-1)
         self.p = 0
         self.b = 0
         self.c = 0

         
    def led_stripe(self, colour):
        for col in range(8):
            self.sense.set_pixel(col, 0, colour)

    def led_stripe_on(self, colour):
         self.led_stripe(colour)
         self.is_led_stripe_on = True
         
    def led_stripe_off(self):
         self.led_stripe(black)
         self.is_led_stripe_on = False

    def led_stripe_toggle(self, colour):
         if self.is_led_stripe_on:
              self.led_stripe_off()
         else:
              self.led_stripe_on(colour)

    def led_stripe_toggle_green(self):
        self.led_stripe_toggle(green)

    def led_stripe_toggle_orange(self):
        self.led_stripe_toggle(orange)

    def charged(self):
         for i in range(6):
            self.led_stripe_toggle(blue)
            time.sleep(0.1)
         drone_status_machine.send('usb_out')
         
    def check_battery(self):
         self.led_stripe(blue)
         if battery.level == 100:
              self.charged()

    def charge(self):
         battery_machine.send('right')
         if battery.level == 87.5:
              Battery.led_stripe(battery,8,green)
              self.charged()

    def create_paths(self):
         self.path_way, self.path_back = Coordinates.gps_arrays(self.position, self.destination)

    def current_position_way(self, path):
        self.position = {
            'latitude' : path['latitude'][self.c],
            'longitude' : path['longitude'][self.c]
        }
        self.sense.set_pixel(self.pixels_way[self.p-1], 0, black)
        self.sense.set_pixel(self.pixels_way[self.p], 0, white)
        self.p += 1
        if self.p > 7:
            self.p = 0
        self.b += 1
        if self.b%150 == 0:
            battery_machine.send("left")
        self.c += 1
        if self.c == len(path['latitude']):
            drone_status_machine.send("at_destination")
            self.p = 0
            self.c = 0

    def current_position_back(self, path):
        self.position = {
            'latitude' : path['latitude'][self.c],
            'longitude' : path['longitude'][self.c]
        }
        self.sense.set_pixel(self.pixels_back[self.p-1], 0, black)
        self.sense.set_pixel(self.pixels_back[self.p], 0, white)
        self.p += 1
        if self.p > 7:
            self.p = 0
        self.b += 1
        if self.b%150 == 0:
            battery_machine.send("left")
        self.c += 1
        if self.c == len(path['latitude']):
            drone_status_machine.send("at_station")
            self.p = 0
            self.b = 0
            self.c = 0

    def start_way(self):
         self.current_position_way(self.path_way)

    def start_back(self):
         self.current_position_back(self.path_back)

    def reset_order_id(self):
         self.order_id = None
         self.destination = {'latitude' : None,
                 'longitude' : None}

def create_drone_status_machine():
     # region transitions stm [rgb(255, 255, 0, 0.05)]
     t0 = {"source": "initial", "target": "waiting_for_job"}

     t_ch_start = {
          'trigger': 'usb_in',
          'source' : 'waiting_for_job',
          'target': 'charging',
          'effect': 'check_battery'
     }

     t_ch_t = {
          'trigger': 't_ch',
          'source': 'charging',
          'target': 'charging',
          'effect': 'charge'
     }

     t_ch_stop = {
          'trigger': 'usb_out',
          'source': 'charging',
          'target': 'waiting_for_job'
     }

     t_mqtt = {
          'trigger': 'order_received',
          'source': 'waiting_for_job',
          'target': 'order_received',
          'effect': 'create_paths'
     }

     t_or = {
          'trigger': 't_or',
          'source': 'order_received',
          'target': 'order_received'
     }

     t_middle = {
          'trigger': 'middle',
          'source': 'order_received',
          'target': 'on_the_way',
          'effect': 'led_stripe_off'
     }

     t_otw = {
          'trigger': 't_otw',
          'source': 'on_the_way',
          'target': 'on_the_way'
     }

     t_destination = {
          'trigger': 'at_destination',
          'source': 'on_the_way',
          'target': 'drop_off',
          'effect': 'start_timer("t_back", 6000)'
     }

     t_do = {
          'trigger': 't_do',
          'source': 'drop_off',
          'target': 'drop_off'
     }

     t_back = {
          'trigger': 't_back',
          'source': 'drop_off',
          'target': 'on_the_way_back',
          'effect': 'led_stripe_off'         
     }

     t_otwb = {
          'trigger': 't_otwb',
          'source': 'on_the_way_back',
          'target': 'on_the_way_back'
     }

     t_station = {
          'trigger': 'at_station',
          'source': 'on_the_way_back',
          'target': 'waiting_for_job',
          'effect': 'reset_order_id'
     }
    # endregion
    # region states [rgb(255, 255, 0, 0.05)]
     charging = {
          'name': 'charging',
          'entry': 'start_timer("t_ch", 3000)',
          'exit': 'stop_timer("t_ch")'
     }

     waiting_for_job = {
        'name': 'waiting_for_job',
        'entry': 'led_stripe_off'
    }
     
     order_received = {
          'name': 'order_received',
          'entry': 'led_stripe_toggle_green; start_timer("t_or", 500)',
          'exit': 'stop_timer("t_or")'
     }

     on_the_way = {
          'name': 'on_the_way',
          'entry': 'start_timer("t_otw", 100); start_way',
          'exit': 'stop_timer("t_otw")'
     }

     drop_off = {
          'name': 'drop_off',
          'entry': 'led_stripe_toggle_orange; start_timer("t_do", 500)',
          'exit': 'stop_timer("t_do")'
     }

     on_the_way_back = {
          'name': 'on_the_way_back',
          'entry': 'start_timer("t_otwb", 100); start_back',
          'exit': 'stop_timer("t_otwb")'
     }
     # endregion

     drone_status =  DroneStatus(station, sense)
     machine = Machine(transitions=[t0, t_ch_start, t_ch_t, t_ch_stop, t_mqtt, t_or, t_middle, t_otw, t_destination, t_do, t_back, t_otwb, t_station],
                      states=[charging, waiting_for_job, order_received, on_the_way, drop_off, on_the_way_back],
                      obj=drone_status,
                      name="drone_status")
     drone_status.stm = machine
     return machine, drone_status
     
drone_status_machine, drone_status = create_drone_status_machine()
driver.add_machine(drone_status_machine)
# endregion

# region battery stm [rgb(0, 255, 0, 0.1)]
class Battery:
    def __init__(self, sense):
        self.sense = sense
        self.is_led_5_on = False

    def led_stripe(self, length, colour):
        for col in range(length):
            self.sense.set_pixel(col, 7, colour)
        for col in range(length,8):
            self.sense.set_pixel(col, 7, black)

    def battery_100(self):
        self.level = 100
        self.led_stripe(8,green)

    def battery_87_5(self):
        self.level = 87.5
        self.led_stripe(7,c7)

    def battery_75(self):
        self.level = 75
        self.led_stripe(6,c6)

    def battery_62_5(self):
        self.level = 62.5
        self.led_stripe(5,c5)

    def battery_50(self):
        self.level = 50
        self.led_stripe(4,yellow)

    def battery_37_5(self):
        self.level = 37.5
        self.led_stripe(3,orange)

    def battery_25(self):
        self.level = 25
        self.led_stripe(2,c2)

    def battery_12_5(self):
        self.level = 12.5
        self.led_stripe(1,red)
        self.is_led_5_on = True

    def battery_5(self):
        self.level = 5
        self.led_5_toggle()

    def led_5_on(self):
         self.led_stripe(1,red)
         self.is_led_5_on = True
         
    def led_5_off(self):
         self.led_stripe(1,black)
         self.is_led_5_on = False

    def led_5_toggle (self):
         if self.is_led_5_on:
              self.led_5_off()
         else:
              self.led_5_on()

    def dead(self):
         self.sense.clear()
         os._exit(1)

def create_battery_machine():
    # region transitions [rgb(0, 255, 0, 0.05)]
    t0 = {"source": "initial", "target": "battery_100"}

    t87 = {
        "trigger": "left",
        "source": "battery_100",
        "target": "battery_87_5",
    }

    t76 = {
        "trigger": "left",
        "source": "battery_87_5",
        "target": "battery_75",
    }

    t65 = {
        "trigger": "left",
        "source": "battery_75",
        "target": "battery_62_5",
    }

    t54 = {
        "trigger": "left",
        "source": "battery_62_5",
        "target": "battery_50",
    }

    t43 = {
        "trigger": "left",
        "source": "battery_50",
        "target": "battery_37_5",
    }

    t32 = {
        "trigger": "left",
        "source": "battery_37_5",
        "target": "battery_25",
    }

    t21 = {
        "trigger": "left",
        "source": "battery_25",
        "target": "battery_12_5",
    }

    t10 = {
        "trigger": "left",
        "source": "battery_12_5",
        "target": "battery_5",
    }

    t00 = {
        "trigger": "t_b",
        "source": "battery_5",
        "target": "battery_5",
    }

    t_dead = {
         "trigger": "left",
         "source": "battery_5",
         "target": "final",
         "effect": "dead"
    }

    t01 = {
        "trigger": "right",
        "source": "battery_5",
        "target": "battery_12_5",
    }

    t12 = {
        "trigger": "right",
        "source": "battery_12_5",
        "target": "battery_25",
    }

    t23 = {
        "trigger": "right",
        "source": "battery_25",
        "target": "battery_37_5",
    }

    t34 = {
        "trigger": "right",
        "source": "battery_37_5",
        "target": "battery_50",
    }

    t45 = {
        "trigger": "right",
        "source": "battery_50",
        "target": "battery_62_5",
    }

    t56 = {
        "trigger": "right",
        "source": "battery_62_5",
        "target": "battery_75",
    }

    t67 = {
        "trigger": "right",
        "source": "battery_75",
        "target": "battery_87_5",
    }

    t78 = {
        "trigger": "right",
        "source": "battery_87_5",
        "target": "battery_100",
    }
    #endregion
    # region states [rgb(0, 255, 0, 0.05)]
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
        'entry': 'battery_5; start_timer("t_b", 500)',
        'exit' : 'stop_timer("t_b")'
    }
    #endregion

    battery =  Battery(sense)
    machine = Machine(transitions=[t0, t00, t01, t12, t23, t34, t45, t56, t67, t78, t87, t76, t65, t54, t43, t32, t21, t10, t_dead],
                      states=[battery_100, battery_87_5, battery_75, battery_62_5, battery_50, battery_37_5, battery_25, battery_12_5, battery_5],
                      obj=battery,
                      name="battery")
    battery.stm = machine
    return machine, battery

battery_machine, battery = create_battery_machine()
driver.add_machine(battery_machine)
# endregion
    
# region coordinates [rgb(255, 100, 0, 0.1)]
class Coordinates:
    @staticmethod
    def haversine(lat1, lon1, lat2, lon2):
        lon1, lat1, lon2, lat2 = map(np.radians, [lon1, lat1, lon2, lat2])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = np.sin(dlat/2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2.0)**2
        
        c = 2 * np.arcsin(np.sqrt(a))
        km = 6378137 * c
        return km
    
    @staticmethod
    def gps_arrays(start, stop):
        distance = Coordinates.haversine(start["latitude"], start["longitude"], stop["latitude"], stop["longitude"])
        speed_way = 15
        points_way = round(distance/speed_way)
        gps_array_way = {'latitude': np.linspace(start["latitude"], stop["latitude"], points_way),
                     "longitude": np.linspace(start["longitude"], stop["longitude"], points_way)}
        
        speed_back = 10
        points_back = round(distance/speed_back)
        gps_array_back = {'latitude': np.linspace(stop["latitude"], start["latitude"], points_back),
                     "longitude": np.linspace(stop["longitude"], start["longitude"], points_back)}
        return gps_array_way, gps_array_back
# endregion

# region heartbeat stm [rgb(255, 0, 0, 0.1)]
class Heartbeat:
    def heartbeat(self):
        heartbeat_data = {
            'id': id,
            'timestamp': datetime.now().isoformat(),
            'state': drone_status_machine.state,
            'order_id': drone_status.order_id,
            'battery_level': battery.level,
            'gps': drone_status.position
        }
        self.stm.client.publish("09/heartbeat", json.dumps(heartbeat_data))

def create_heartbeat_machine():
    t0 = {"source": "initial", "target": "idle"}

    t1 = {
        "trigger": "t_h",
        "source": "idle",
        "target": "idle",
    }

    idle = {'name': 'idle',
        'entry': 'heartbeat; start_timer("t_h", 5000)'
    }

    heartbeat =  Heartbeat()
    machine = Machine(transitions=[t0, t1], states=[idle], obj=heartbeat, name="heartbeat")
    heartbeat.stm = machine
    return machine

heartbeat_machine = create_heartbeat_machine()
driver.add_machine(heartbeat_machine)
# endregion

#region MQTT [rgb(0, 102, 255, 0.1)]
class MQTT_Client_1:
    def __init__(self):
        self.count = 0
        self.client = mqtt.Client()
        self.client.on_connect = self.on_connect
        self.client.on_message = self.on_message

    def on_connect(self, client, userdata, flags, rc):
        print("on_connect(): {}".format(mqtt.connack_string(rc)))

    def on_message(self, client, userdata, msg):
        if drone_status_machine.state == 'waiting_for_job':
            drone_status.order_id = json.loads(msg.payload)['order_id']
            drone_status.destination = json.loads(msg.payload)['target']
            drone_status_machine.send("order_received")
        
    def start(self, broker, port):

        print("Connecting to {}:{}".format(broker, port))
        self.client.connect(broker, port)

        self.client.subscribe("09/give_job/1")

        try:
            # line below should not have the () after the function!
            thread = Thread(target=self.client.loop_forever)
            thread.start()
        except KeyboardInterrupt:
            print("Interrupted")
            self.client.disconnect()

broker, port = os.getenv("MQTT_HOST", "mqtt20.iik.ntnu.no"), int(os.getenv("MQTT_PORT", "1883"))

myclient = MQTT_Client_1()
heartbeat_machine.client = myclient.client
myclient.stm_driver = driver

myclient.start(broker, port)
# endregion

# region RPi interface [rgb(255, 0, 255, 0.1)]
driver.start()

#USB
context = pyudev.Context()
monitor = pyudev.Monitor.from_netlink(context)
monitor.filter_by(subsystem='usb')
monitor.start()

#joystick
try:
    while True:
        for event in sense.stick.get_events():
            # Check if the joystick was pressed
            if event.action == "pressed":
                # Check which direction
                if event.direction == "left":
                    battery_machine.send("left")
                elif event.direction == "right":
                    battery_machine.send("right")
                elif event.direction == "middle":
                    drone_status_machine.send("middle")

        device = monitor.poll(timeout=0.1)
        if device is not None:
            print("device:", device)
            print("action:", device.action)
            print("subsystem:", device.subsystem)
        
        if device is not None and device.action == "add":
            drone_status_machine.send("usb_in")
        elif device is not None and device.action == "remove":
            drone_status_machine.send("usb_out")
except KeyboardInterrupt:
    print("AN ERROR HAS OCCURED")
    sense.clear()
    driver.stop()
# endregion