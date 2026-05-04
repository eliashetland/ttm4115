import tkinter as tk
import json
import paho.mqtt.client as mqtt
import time
import os

BROKER = os.getenv("MQTT_HOST", "mqtt20.iik.ntnu.no")
PORT = 1883


class RemoteGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Drone Remote Controller 🚁")

        self.client = mqtt.Client()
        self.client.connect(BROKER, PORT)
        self.client.loop_start()

        self.client.on_message = self.on_message

        # CHANGED: mock instead of drones
        self.client.subscribe("mock/+/sense/pixel/state")

        self.live_refresh = False
        self.refresh_rate_ms = 100
        self.id = tk.IntVar(value=1)

        self.build_ui()

        self.led_rects = [[None for _ in range(8)] for _ in range(8)]
        self._init_led_grid()

        self.get_led()

    def get_drone_id(self):
        try:
            return int(self.id.get())
        except:
            return None

    # CHANGED: mock topic base
    def topic(self, suffix):
        mid = self.get_drone_id()
        if not mid:
            return None
        return f"mock/{mid}/{suffix}"

    def on_message(self, client, userdata, msg):
        if msg.topic.endswith("sense/pixel/state"):
            try:
                mid = self.get_drone_id()
                topic_id = int(msg.topic.split("/")[1])

                if mid != topic_id:
                    return

                data = json.loads(msg.payload.decode())
                self.draw_matrix(data["matrix"])
            except:
                pass

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
        t = self.topic("sense/pixel/get")
        if t:
            self.client.publish(t, "1")

    def send_joystick(self, direction):
        t = self.topic("joystick/add")
        if t:
            self.client.publish(t, direction)

    def send_usb(self, action):
        t = self.topic("usb/action")
        if t:
            self.client.publish(t, action)

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

    def build_ui(self):
        id_frame = tk.LabelFrame(self.root, text="Mock ID")
        id_frame.pack(padx=10, pady=10)

        tk.Spinbox(id_frame, from_=1, to=99, textvariable=self.id, width=5).pack()

        usb_frame = tk.LabelFrame(self.root, text="USB")
        usb_frame.pack(padx=10, pady=10)

        tk.Button(usb_frame, text="Add USB",
                  command=lambda: self.send_usb("add")).grid(row=0, column=0)

        tk.Button(usb_frame, text="Remove USB",
                  command=lambda: self.send_usb("remove")).grid(row=1, column=0)

        joystick_frame = tk.LabelFrame(self.root, text="Joystick")
        joystick_frame.pack(padx=10, pady=10)

        tk.Button(joystick_frame, text="↑",
                  command=lambda: self.send_joystick("up")).grid(row=0, column=1)

        tk.Button(joystick_frame, text="←",
                  command=lambda: self.send_joystick("left")).grid(row=1, column=0)

        tk.Button(joystick_frame, text="●",
                  command=lambda: self.send_joystick("middle")).grid(row=1, column=1)

        tk.Button(joystick_frame, text="→",
                  command=lambda: self.send_joystick("right")).grid(row=1, column=2)

        tk.Button(joystick_frame, text="↓",
                  command=lambda: self.send_joystick("down")).grid(row=2, column=1)

        self.canvas = tk.Canvas(self.root, width=240, height=240, bg="black")
        self.canvas.pack(pady=10)

        tk.Button(
            self.root,
            text="Get LED State",
            command=self.get_led
        ).pack()

        self.live_var = tk.BooleanVar()

        tk.Checkbutton(
            self.root,
            text="Live Refresh",
            variable=self.live_var,
            command=self.toggle_live_refresh,
        ).pack()

    def draw_matrix(self, matrix):
        for y in range(8):
            for x in range(8):
                r, g, b = matrix[y][x]
                color = f'#{r:02x}{g:02x}{b:02x}'
                self.canvas.itemconfig(self.led_rects[y][x], fill=color)

    def toggle_live_refresh(self):
        self.live_refresh = self.live_var.get()
        if self.live_refresh:
            self.live_update_loop()

    def live_update_loop(self):
        if not self.live_refresh:
            return

        self.get_led()
        self.root.after(self.refresh_rate_ms, self.live_update_loop)


root = tk.Tk()
app = RemoteGUI(root)
root.mainloop()