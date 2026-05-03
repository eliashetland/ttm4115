import os

if os.getenv("RUNNING_IN_DOCKER") == "1":
    print("MOCKING HARDWARE MODULES")
    from .sense_mock import SenseMock as SenseHat
    from . import pyudev_mock as pyudev
else:
    print("NO MOCKING HARDWARE MODULES")
    from sense_hat import SenseHat as SenseHat
    import pyudev as pyudev

__all__ = ["SenseHat", "pyudev"]