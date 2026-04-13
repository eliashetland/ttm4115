from stmpy import Machine


class DroneStatus:
    def __init__(self):
        self.actions = []
        self.stm = None

    def ask_for_job(self):
        self.actions.append("ask_for_job")

    def fly_to_destination(self):
        self.actions.append("fly_to_destination")

    def report_flying_started(self):
        self.actions.append("report_flying_started")

    def drop_package(self):
        self.actions.append("drop_package")

    def report_delivery_result(self):
        self.actions.append("report_delivery_result")

    def fly_to_base(self):
        self.actions.append("fly_to_base")

    def fly_to_charger(self):
        self.actions.append("fly_to_charger")


def create_machine(drone_status=None):
    if drone_status is None:
        drone_status = DroneStatus()

    t0 = {"source": "initial", "target": "waiting_for_job"}
    t1 = {"trigger": "t", "source": "waiting_for_job", "target": "waiting_for_job"}
    t2 = {
        "trigger": "new_job_delivery",
        "source": "waiting_for_job",
        "target": "delivering",
    }
    t3 = {
        "trigger": "new_job_charging",
        "source": "waiting_for_job",
        "target": "charging",
    }
    t4 = {
        "trigger": "destination_reached",
        "source": "delivering",
        "target": "drop_of",
    }
    t5 = {
        "trigger": "packaged_dropped_of",
        "source": "drop_of",
        "target": "returning",
    }
    t6 = {
        "trigger": "arrived_at_base",
        "source": "returning",
        "target": "waiting_for_job",
    }
    t7 = {
        "trigger": "charging_complete",
        "source": "charging",
        "target": "waiting_for_job",
    }

    waiting_for_job = {
        "name": "waiting_for_job",
        "entry": 'ask_for_job; start_timer("t", 10000)',
        "exit": 'stop_timer("t")',
    }
    delivering = {
        "name": "delivering",
        "entry": "fly_to_destination; report_flying_started",
    }
    drop_of = {
        "name": "drop_of",
        "entry": "drop_package; report_delivery_result",
    }
    returning = {"name": "returning", "entry": "fly_to_base"}
    charging = {"name": "charging", "entry": "fly_to_charger"}

    machine = Machine(
        name="drone_status",
        transitions=[t0, t1, t2, t3, t4, t5, t6, t7],
        states=[waiting_for_job, delivering, drop_of, returning, charging],
        obj=drone_status,
    )
    drone_status.stm = machine
    return machine
