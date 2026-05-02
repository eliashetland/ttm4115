import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from stmpy import Driver

from fsm.delivery_status_fsm import DeliveryStatus, create_machine as create_delivery_status_machine
from fsm.drone_selection_fsm import DroneSelection, create_machine as create_drone_selection_machine
from fsm.drone_status_fsm import DroneStatus, create_machine as create_drone_status_machine
from fsm.general_drone_fsm import GeneralDrone, create_machine as create_general_drone_machine
from heartbeat_fsm import Heartbeat, create_heartbeat_machine as create_heartbeat_drone_machine


PAUSE = 0.05


def run_machine(machine, controller, events):
    driver = Driver()
    driver.add_machine(machine)
    driver.start()

    time.sleep(PAUSE)
    for event in events:
        controller.stm.send(event)
        time.sleep(PAUSE)

    actions = list(controller.actions)
    driver.stop()
    time.sleep(PAUSE)
    return actions


def check(name, actual, expected):
    ok = actual == expected
    status = "PASS" if ok else "FAIL"
    print(status, name)
    print("  expected:", expected)
    print("  actual:  ", actual)
    print()
    return ok


def test_general_drone_ok():
    drone = GeneralDrone(battery_ok=True)
    machine = create_general_drone_machine(drone)
    actual = run_machine(
        machine,
        drone,
        [
            "drone_chosen",
            "battery_checked",
            "start_delivery",
            "package_delivered",
            "return_to_base",
            "arrived_at_base",
            "charging_complete",
        ],
    )
    expected = [
        "stop_charge_timer",
        "check_battery",
        "battery_ok",
        "start_flight",
        "navigate_to_destination",
        "drop_package",
        "fly_to_base",
        "start_charge_timer",
        "stop_charge_timer",
        "stop_charge_timer",
    ]
    return check("general_drone ok path", actual, expected)


def test_general_drone_low_battery():
    drone = GeneralDrone(battery_ok=False)
    machine = create_general_drone_machine(drone)
    actual = run_machine(machine, drone, ["drone_chosen", "battery_checked", "charging_complete"])
    expected = [
        "stop_charge_timer",
        "check_battery",
        "battery_low",
        "start_charge_timer",
        "stop_charge_timer",
        "stop_charge_timer",
    ]
    return check("general_drone low battery path", actual, expected)


def test_delivery_status_ok():
    delivery_status = DeliveryStatus(order_ok=True)
    machine = create_delivery_status_machine(delivery_status)
    actual = run_machine(
        machine,
        delivery_status,
        ["recive_order", "order_processed", "delivery_ok", "order_complete"],
    )
    expected = [
        "waiting_for_order",
        "order_recieved",
        "order_ok",
        "order_on_the_way",
        "delivered",
        "waiting_for_order",
    ]
    return check("delivery_status ok path", actual, expected)


def test_delivery_status_failed_order():
    delivery_status = DeliveryStatus(order_ok=False)
    machine = create_delivery_status_machine(delivery_status)
    actual = run_machine(machine, delivery_status, ["recive_order", "order_processed"])
    expected = [
        "waiting_for_order",
        "order_recieved",
        "order_failed",
        "waiting_for_order",
    ]
    return check("delivery_status failed order path", actual, expected)


def test_drone_status():
    drone_status = DroneStatus()
    machine = create_drone_status_machine(drone_status)
    actual = run_machine(
        machine,
        drone_status,
        [
            "new_job_delivery",
            "destination_reached",
            "packaged_dropped_of",
            "arrived_at_base",
            "new_job_charging",
            "charging_complete",
        ],
    )
    expected = [
        "ask_for_job",
        "fly_to_destination",
        "report_flying_started",
        "drop_package",
        "report_delivery_result",
        "fly_to_base",
        "ask_for_job",
        "fly_to_charger",
        "ask_for_job",
    ]
    return check("drone_status", actual, expected)


def test_drone_selection():
    drone_selection = DroneSelection()
    machine = create_drone_selection_machine(drone_selection)
    actual = run_machine(
        machine,
        drone_selection,
        ["new_job_incoming", "drone_got_job", "drone_ask_for_job", "drone_got_job"],
    )
    expected = ["pick_drone", "pick_job_or_charing"]
    return check("drone_selection", actual, expected)


def main():
    results = [
        test_general_drone_ok(),
        test_general_drone_low_battery(),
        test_delivery_status_ok(),
        test_delivery_status_failed_order(),
        test_drone_status(),
        test_drone_selection(),
    ]

    if all(results):
        print("All FSM checks passed.")
        return 0

    print("One or more FSM checks failed.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
