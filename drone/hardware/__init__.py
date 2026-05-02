import os

if os.getenv("RUNNING_IN_DOCKER") == "1":
    print("MOCKING HARDWARE MODULES")
    from .sense_mock import SenseMock as Sense
else:
    print("NO MOCKING HARDWARE MODULES")
    from .sense_pi import SensePi as Sense
