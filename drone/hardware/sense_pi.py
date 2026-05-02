from sense_hat import SenseHat
from .sense_interface import SenseInterface

class SensePi(SenseInterface):
    def __init__(self):
        self.sense = SenseHat()
        self.sense.low_light = True

    def set_pixel(self, x, y, color):
        self.sense.set_pixel(x, y, color)

    def clear(self):
        self.sense.clear()

    def get_joystick_events(self):
        return self.sense.stick.get_events()