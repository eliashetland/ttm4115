# Drone Create

```mermaid
sequenceDiagram
    participant Drone
    participant API

    API->>API: Subscribe drones/create

    API->>API: Subscribe to drones/${ID from database}/#

    loop Until Ack Received
        Drone->>Drone: Generate nonce

        Drone->>Drone: Subscribe drones/nonce/${nonce}/id

        Drone-)+API: Publish Drone Info + nonce to drones/create

        API->>API: createDrone()

        API->>API: Subscribe drones/${ID}/#

        API--)-Drone: Publish Drone ID to drones/nonce/${nonce}/id

        opt Got id
            Drone->>Drone: Subscribe drones/${ID}/#

            Drone->>Drone: Unsubscribe drones/nonce/${nonce}/id

            Drone-)API: Publish Ack drones/${ID}/drone-ack

            API--)Drone: Publish Ack drones/${ID}/api-ack
        end
    end

    Drone->>Drone: Save ID to Persistent Memory
```
