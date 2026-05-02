# Drone State Machines

This folder contains the shared Python environment for the drone code.

Run it with Docker Compose from [ttm4115/docker-compose.yaml](/Users/martinbrekkenilsen/Library/CloudStorage/OneDrive-NTNU/Semester 8/ttm4115/project_repo/ttm4115/docker-compose.yaml):

```sh
docker compose run --build --rm drone
```

That runs the default Python entrypoint in [drone/fsm/test_fsms.py](/Users/martinbrekkenilsen/Library/CloudStorage/OneDrive-NTNU/Semester 8/ttm4115/project_repo/ttm4115/drone/fsm/test_fsms.py).

Run a different Python file by overriding the command:

```sh
docker compose run --rm drone python path/to/file.py
docker compose run --rm drone sh
```

The notebooks in `fsm/` are kept in the repository, but this Docker setup does not run Jupyter.

## Remote Controller for simulated Mocks

It is now possible to simulate the joysticks on the mocks throug the remote_controller.py

```bash
python remote_controller.py
```

## Id management on the drone

The id is either set manually in the drone_id file under /home/pi/drone_id, or it gets automatically assigned from the server when requested.
