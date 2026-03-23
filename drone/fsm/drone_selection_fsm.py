from stmpy import Machine


class DroneSelection:
    def __init__(self):
        self.actions = []
        self.stm = None

    def pick_drone(self):
        self.actions.append("pick_drone")

    def pick_job_or_charing(self):
        self.actions.append("pick_job_or_charing")


def create_machine(drone_selection=None):
    if drone_selection is None:
        drone_selection = DroneSelection()

    t0 = {"source": "initial", "target": "idle"}
    t1 = {"trigger": "drone_ask_for_job", "source": "idle", "target": "pick_job"}
    t2 = {"trigger": "drone_got_job", "source": "pick_job", "target": "idle"}
    t3 = {
        "trigger": "new_job_incoming",
        "source": "idle",
        "target": "distribute_job",
    }
    t4 = {"trigger": "drone_got_job", "source": "distribute_job", "target": "idle"}

    pick_job = {"name": "pick_job", "entry": "pick_job_or_charing"}
    distribute_job = {"name": "distribute_job", "entry": "pick_drone"}

    machine = Machine(
        name="drone_selection",
        transitions=[t0, t1, t2, t3, t4],
        states=[pick_job, distribute_job],
        obj=drone_selection,
    )
    drone_selection.stm = machine
    return machine
