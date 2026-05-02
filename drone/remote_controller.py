import tkinter as tk
import json
import paho.mqtt.client as mqtt
import time

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
        self.client.on_message = self.on_message
        self.client.subscribe("sense/pixel/state")
        self.live_refresh = False
        self.refresh_rate_ms = 100
        self.build_ui()
        self.led_rects = [[None for _ in range(8)] for _ in range(8)]
        self._init_led_grid()
        self.get_led()

    def on_message(self, client, userdata, msg):
        if msg.topic == "sense/pixel/state":
            data = json.loads(msg.payload.decode())
            self.draw_matrix(data["matrix"])
    
    def _init_led_grid(self):
        size = 25
        padding = 3

        for y in range(8):
            for x in range(8):
                x0 = x * (size + padding)
                y0 = y * (size + padding)
                x1 = x0 + size
                y1 = y0 + size

                rect = self.canvas.create_rectangle(
                    x0, y0, x1, y1,
                    fill="#000000",
                    outline=""
                )

                self.led_rects[y][x] = rect

    def get_led(self):
        self.client.publish("sense/pixel/get", "1")

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

        tk.Button(
            joystick_frame, text="↑", width=5, command=lambda: self.send_joystick("up")
        ).grid(row=0, column=1)

        tk.Button(
            joystick_frame,
            text="←",
            width=5,
            command=lambda: self.send_joystick("left"),
        ).grid(row=1, column=0)

        tk.Button(
            joystick_frame,
            text="●",
            width=5,
            command=lambda: self.send_joystick("middle"),
        ).grid(row=1, column=1)

        tk.Button(
            joystick_frame,
            text="→",
            width=5,
            command=lambda: self.send_joystick("right"),
        ).grid(row=1, column=2)

        tk.Button(
            joystick_frame,
            text="↓",
            width=5,
            command=lambda: self.send_joystick("down"),
        ).grid(row=2, column=1)

        # LED controls
        led_frame = tk.LabelFrame(self.root, text="LED Control")
        led_frame.pack(padx=10, pady=10)

        self.canvas = tk.Canvas(self.root, width=240, height=240, bg="black")
        self.canvas.pack(pady=10)

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

        tk.Button(led_frame, text="Set Pixel", command=self.set_pixel).grid(
            row=2, column=0, columnspan=5, pady=5
        )
        tk.Button(led_frame, text="Clear Display", command=self.clear_led).grid(
            row=3, column=0, columnspan=5
        )
        tk.Button(led_frame, text="Get LED State", command=self.get_led).grid(
            row=4, column=0, columnspan=5, pady=5
        )

        self.live_var = tk.BooleanVar()

        tk.Checkbutton(
            led_frame,
            text="Live Refresh",
            variable=self.live_var,
            command=self.toggle_live_refresh,
        ).grid(row=5, column=0, columnspan=5)

    def draw_matrix(self, matrix):
        for y in range(8):
            for x in range(8):
                r, g, b = matrix[y][x]
                color = f'#{r:02x}{g:02x}{b:02x}'

                self.canvas.itemconfig(
                    self.led_rects[y][x],
                    fill=color
                )

    def toggle_live_refresh(self):
        self.live_refresh = self.live_var.get()

        if self.live_refresh:
            print("Live refresh ON")
            self.live_update_loop()
        else:
            print("Live refresh OFF")

    def live_update_loop(self):
        if not self.live_refresh:
            return

        # Request LED state
        self.client.publish("sense/pixel/get", "1")

        # Schedule next refresh
        self.root.after(self.refresh_rate_ms, self.live_update_loop)

# ---------- start app ----------
root = tk.Tk()
app = RemoteGUI(root)
root.mainloop()
