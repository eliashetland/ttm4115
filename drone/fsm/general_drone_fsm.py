from stmpy import Machine


class GeneralDrone:
    def __init__(self, battery_ok=True):
        self.battery_ok = battery_ok
        self.actions = []
        self.stm = None

    def stop_charge_timer(self):
        self.actions.append("stop_charge_timer")

    def check_battery(self):
        self.actions.append("check_battery")

    def check_battery_level(self):
        if self.battery_ok:
            self.actions.append("battery_ok")
            return "dispatched"
        self.actions.append("battery_low")
        return "charging"

    def start_flight(self):
        self.actions.append("start_flight")

    def navigate_to_destination(self):
        self.actions.append("navigate_to_destination")

    def drop_package(self):
        self.actions.append("drop_package")

    def fly_to_base(self):
        self.actions.append("fly_to_base")

    def start_charge_timer(self):
        self.actions.append("start_charge_timer")


def create_machine(drone=None):
    if drone is None:
        drone = GeneralDrone()

    t0 = {"source": "initial", "target": "idle"}
    t1 = {"trigger": "drone_chosen", "source": "idle", "target": "selected"}
    t2 = {
        "trigger": "battery_checked",
        "source": "selected",
        "function": drone.check_battery_level,
    }
    t3 = {
        "trigger": "start_delivery",
        "source": "dispatched",
        "target": "delivering",
    }
    t4 = {
        "trigger": "package_delivered",
        "source": "delivering",
        "target": "delivered",
    }
    t5 = {
        "trigger": "return_to_base",
        "source": "delivered",
        "target": "returning",
    }
    t6 = {
        "trigger": "arrived_at_base",
        "source": "returning",
        "target": "charging",
    }
    t7 = {
        "trigger": "charging_complete",
        "source": "charging",
        "target": "idle",
    }

    idle = {"name": "idle", "entry": "stop_charge_timer"}
    selected = {"name": "selected", "entry": "check_battery"}
    dispatched = {"name": "dispatched", "entry": "start_flight"}
    delivering = {"name": "delivering", "entry": "navigate_to_destination"}
    delivered = {"name": "delivered", "entry": "drop_package"}
    returning = {"name": "returning", "entry": "fly_to_base"}
    charging = {
        "name": "charging",
        "entry": 'start_charge_timer; start_timer("t_charge", 10000)',
        "exit": 'stop_charge_timer; stop_timer("t_charge")',
    }

    machine = Machine(
        name="general_drone",
        transitions=[t0, t1, t2, t3, t4, t5, t6, t7],
        states=[idle, selected, dispatched, delivering, delivered, returning, charging],
        obj=drone,
    )
    drone.stm = machine
    return machine
