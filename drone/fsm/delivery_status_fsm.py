from stmpy import Machine


class DeliveryStatus:
    def __init__(self, order_ok=True):
        self.order_ok = order_ok
        self.actions = []
        self.stm = None

    def waiting_for_order(self):
        self.actions.append("waiting_for_order")

    def order_recieved(self):
        self.actions.append("order_recieved")

    def check_order(self):
        if self.order_ok:
            self.actions.append("order_ok")
            return "on_the_way"
        self.actions.append("order_failed")
        return "idle"

    def order_on_the_way(self):
        self.actions.append("order_on_the_way")

    def delivered(self):
        self.actions.append("delivered")


def create_machine(delivery_status=None):
    if delivery_status is None:
        delivery_status = DeliveryStatus()

    t0 = {"source": "initial", "target": "idle"}
    t1 = {"trigger": "recive_order", "source": "idle", "target": "receive_order"}
    t2 = {
        "trigger": "order_processed",
        "source": "receive_order",
        "function": delivery_status.check_order,
    }
    t3 = {"trigger": "delivery_ok", "source": "on_the_way", "target": "delivered"}
    t4 = {
        "trigger": "delivery_failed",
        "source": "on_the_way",
        "target": "receive_order",
    }
    t5 = {"trigger": "order_complete", "source": "delivered", "target": "idle"}

    idle = {"name": "idle", "entry": "waiting_for_order"}
    receive_order = {"name": "receive_order", "entry": "order_recieved"}
    on_the_way = {"name": "on_the_way", "entry": "order_on_the_way"}
    delivered = {"name": "delivered", "entry": "delivered"}

    machine = Machine(
        name="delivery_status",
        transitions=[t0, t1, t2, t3, t4, t5],
        states=[idle, receive_order, on_the_way, delivered],
        obj=delivery_status,
    )
    delivery_status.stm = machine
    return machine
