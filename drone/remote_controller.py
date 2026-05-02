import tkinter as tk
import json
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883

class RemoteGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Drone Remote Controller 🚁")

        # MQTT setup
        self.client = mqtt.Client()
        self.client.connect(BROKER, PORT)
        self.client.loop_start()

        self.build_ui()

    # ---------- MQTT helpers ----------
    def send_joystick(self, direction):
        self.client.publish("joystick/add", direction)
        print("Sent joystick:", direction)

    def clear_led(self):
        self.client.publish("sense/clear", "1")

    def set_pixel(self):
        try:
            x = int(self.x_entry.get())
            y = int(self.y_entry.get())
            r = int(self.r_entry.get())
            g = int(self.g_entry.get())
            b = int(self.b_entry.get())

            payload = json.dumps({"x": x, "y": y, "r": r, "g": g, "b": b})
            self.client.publish("sense/pixel", payload)
        except ValueError:
            print("Invalid pixel values")

    # ---------- UI ----------
    def build_ui(self):
        joystick_frame = tk.LabelFrame(self.root, text="Joystick")
        joystick_frame.pack(padx=10, pady=10)

        tk.Button(joystick_frame, text="↑", width=5,
                  command=lambda: self.send_joystick("up")).grid(row=0, column=1)

        tk.Button(joystick_frame, text="←", width=5,
                  command=lambda: self.send_joystick("left")).grid(row=1, column=0)

        tk.Button(joystick_frame, text="●", width=5,
                  command=lambda: self.send_joystick("middle")).grid(row=1, column=1)

        tk.Button(joystick_frame, text="→", width=5,
                  command=lambda: self.send_joystick("right")).grid(row=1, column=2)

        tk.Button(joystick_frame, text="↓", width=5,
                  command=lambda: self.send_joystick("down")).grid(row=2, column=1)

        # LED controls
        led_frame = tk.LabelFrame(self.root, text="LED Control")
        led_frame.pack(padx=10, pady=10)

        tk.Label(led_frame, text="X").grid(row=0, column=0)
        tk.Label(led_frame, text="Y").grid(row=0, column=1)
        tk.Label(led_frame, text="R").grid(row=0, column=2)
        tk.Label(led_frame, text="G").grid(row=0, column=3)
        tk.Label(led_frame, text="B").grid(row=0, column=4)

        self.x_entry = tk.Entry(led_frame, width=4)
        self.y_entry = tk.Entry(led_frame, width=4)
        self.r_entry = tk.Entry(led_frame, width=4)
        self.g_entry = tk.Entry(led_frame, width=4)
        self.b_entry = tk.Entry(led_frame, width=4)

        self.x_entry.grid(row=1, column=0)
        self.y_entry.grid(row=1, column=1)
        self.r_entry.grid(row=1, column=2)
        self.g_entry.grid(row=1, column=3)
        self.b_entry.grid(row=1, column=4)

        tk.Button(led_frame, text="Set Pixel", command=self.set_pixel).grid(row=2, column=0, columnspan=5, pady=5)
        tk.Button(led_frame, text="Clear Display", command=self.clear_led).grid(row=3, column=0, columnspan=5)

# ---------- start app ----------
root = tk.Tk()
app = RemoteGUI(root)
root.mainloop()