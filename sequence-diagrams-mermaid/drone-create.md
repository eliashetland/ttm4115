# Drone Create

```mermaid
sequenceDiagram
    participant Drone
    participant API

    API->>API: Subscribe 09/drones/create

    API->>API: Subscribe to 09/drones/${ID from database}/#

    loop Until Ack Received
        Drone->>Drone: Generate nonce

        Drone->>Drone: Subscribe 09/drones/nonce/${nonce}/id

        Drone-)+API: Publish Drone Info + nonce to 09/drones/create

        API->>API: createDrone()

        API->>API: Subscribe 09/drones/${ID}/#

        API--)-Drone: Publish Drone ID to 09/drones/nonce/${nonce}/id

        opt Got id
            Drone->>Drone: Subscribe 09/drones/${ID}/#

            Drone->>Drone: Unsubscribe 09/drones/nonce/${nonce}/id

            Drone-)API: Publish Ack 09/drones/${ID}/drone-ack

            API--)Drone: Publish Ack 09/drones/${ID}/api-ack
        end
    end

    Drone->>Drone: Save ID to Persistent Memory
```
