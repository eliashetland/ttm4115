# Drone State Machines

This folder contains the shared Python environment for the drone code.

Run it with Docker Compose from [ttm4115/docker-compose.yaml](/Users/martinbrekkenilsen/Library/CloudStorage/OneDrive-NTNU/Semester 8/ttm4115/project_repo/ttm4115/docker-compose.yaml):

```sh
docker compose up --build -d drone
```

Use the container as a consistent Python environment:

```sh
docker compose exec drone python --version
docker compose exec drone sh
```

If the container was already running before this setup change, recreate it first:

```sh
docker compose up --build --force-recreate --remove-orphans -d drone
```

The notebooks in `fsm/` are kept in the repository, but this Docker setup does not run Jupyter.
