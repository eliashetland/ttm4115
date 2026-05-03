class SenseInterface:
    def set_pixel(self, x, y, color):
        raise NotImplementedError()

    def clear(self):
        raise NotImplementedError()

    def get_joystick_events(self):
        raise NotImplementedError()