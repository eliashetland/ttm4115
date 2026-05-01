from stmpy import Driver, Machine
from threading import Thread
import paho.mqtt.client as mqtt
import json
from datetime import datetime
import numpy as np
from drone_status_fsm import DroneStatus, create_machine as create_drone_status_machine
from sense_hat import SenseHat
import time
import pyudev

#starting the drone status machine
drone_status_machine = create_drone_status_machine()
driver = Driver()
driver.add_machine(drone_status_machine)

#permanent variables
id = 1

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
blue = (0, 0, 255)
pink = (255, 0, 255)
white = (255, 255, 255)

def led_id(colour):
    sense.set_pixel(4,1,colour)
    sense.set_pixel(3,2,colour)
    sense.set_pixel(4,2,colour)
    sense.set_pixel(4,3,colour)
    sense.set_pixel(4,4,colour)
    sense.set_pixel(4,5,colour)
    sense.set_pixel(3,6,colour)
    sense.set_pixel(4,6,colour)
    sense.set_pixel(5,6,colour)

led_id(white)

class Battery:
    def __init__(self, sense):
        self.sense = sense

    def led_stripe(self, length, colour):
        for col in range(length):
            self.sense.set_pixel(col, 7, colour)
        for col in range(length,8):
            self.sense.set_pixel(col, 7, c0)
        
    def battery_100(self):
        self.level = 100
        self.led_stripe(8,c8)

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
        self.led_stripe(4,c4)

    def battery_37_5(self):
        self.level = 37.5
        self.led_stripe(3,c3)

    def battery_25(self):
        self.level = 25
        self.led_stripe(2,c2)

    def battery_12_5(self):
        self.level = 12.5
        self.led_stripe(1,c1)
    
    def battery_5_on(self):
        self.level = 5
        self.led_stripe(1,c1)

    def battery_5_off(self):
        self.level = 5
        self.led_stripe(0,c0)

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
        "target": "battery_5_on",
    }

    t9 = {
        "trigger": "t_b",
        "source": "battery_5_on",
        "target": "battery_5_off",
    }

    t10 = {
        "trigger": "t_b",
        "source": "battery_5_off",
        "target": "battery_5_on",
    }

    t11 = {
        "trigger": "right",
        "source": "battery_5_on",
        "target": "battery_12_5",
    }

    t12 = {
        "trigger": "right",
        "source": "battery_5_off",
        "target": "battery_12_5",
    }

    t13 = {
        "trigger": "right",
        "source": "battery_12_5",
        "target": "battery_25",
    }

    t14 = {
        "trigger": "right",
        "source": "battery_25",
        "target": "battery_37_5",
    }

    t15 = {
        "trigger": "right",
        "source": "battery_37_5",
        "target": "battery_50",
    }

    t16 = {
        "trigger": "right",
        "source": "battery_50",
        "target": "battery_62_5",
    }

    t17 = {
        "trigger": "right",
        "source": "battery_62_5",
        "target": "battery_75",
    }

    t18 = {
        "trigger": "right",
        "source": "battery_75",
        "target": "battery_87_5",
    }

    t19 = {
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

    battery_5_on = {'name': 'battery_5_on',
        'entry': 'battery_5_on; start_timer("t_b", 500)',
        'exit' : 'stop_timer("t_b")'
    }

    battery_5_off = {'name': 'battery_5_off',
        'entry': 'battery_5_off; start_timer("t_b", 500)',
        'exit' : 'stop_timer("t_b")'
    }

    battery =  Battery(sense)
    machine = Machine(transitions=[t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19],
                      states=[battery_100, battery_87_5, battery_75, battery_62_5, battery_50, battery_37_5, battery_25, battery_12_5, battery_5_on, battery_5_off],
                      obj=battery,
                      name="battery")
    battery.stm = machine
    return machine, battery

battery_machine, battery = create_battery_machine()
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
            'state': drone_status_machine.state,
            'battery_level': battery.level,
            'gps': {"latitude" : float(coordinates["latitude"][c]),
                    "longitude" : float(coordinates["longitude"][c])}
        }
        self.stm.client.publish("09/heartbeat", json.dumps(heartbeat_data))
        c+=1
        if c==points-1:
            drone_status_machine.send("delivered")

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
		device = monitor.poll(timeout=0.1)
		if device is not None and device.action == 'add':
			drone_status_machine.send("new_job_charging")
			sense.set_pixel(0,0,blue)
		elif device is not None and device.action == 'remove':
			drone_status_machine.send("charging_complete")
			sense.set_pixel(0,0,c0)
finally:
    sense.clear()
    driver.stop()