# Adapter Architecture & Shiprocket Integration Plan

## Folder Structure

```text
apps/backend/src/shipment/
├── controllers/              # HTTP layer only, no business logic
├── adapters/
│   ├── interface/
│   │   └── delivery-partner.adapter.interface.ts
│   ├── dtdc/
│   │   ├── dtdc.adapter.ts
│   │   └── dtdc.mapper.ts   # mapping here, not in provider
│   └── shiprocket/
│       ├── shiprocket.adapter.ts
│       └── shiprocket.mapper.ts
├── providers/
│   ├── dtdc/
│   │   └── dtdc-api.service.ts       # pure HTTP calls only
│   └── shiprocket/
│       ├── shiprocket-api.service.ts  # pure HTTP calls only
│       └── shiprocket-auth.service.ts # JWT login + uses RedisService
├── core/
│   ├── services/
│   │   ├── shipment.service.ts
│   │   └── pickup-location.service.ts
│   ├── factories/
│   │   └── delivery-partner.factory.ts
│   ├── dto/
│   └── entities/
└── infrastructure/
    ├── repositories/         # all DB access lives here
    ├── cache/
    │   └── redis.service.ts
    └── config/
        └── config.service.ts
```

## Strict Layer Rules

- **Controllers**: HTTP layer only, no business logic. Calls Core services.
- **Core**: Contains business logic, Factories, DTOs, and Entities. Calls Adapters, Repositories, and PickupLocation.
- **Adapters**: Transforms data using Mappers and delegates to Provider services.
- **Providers**: Pure external HTTP calls. Authentication securely utilizes Infrastructure Cache (Redis).
- **Infrastructure**: Shared boundaries, Database (Repositories), Cache (Redis), and Configuration. No business logic.

## Flow

`Controller` → `shipment.service` → `factory.getAdapter()` → `adapter` → `mapper` + `provider-api-service` → `external API`

## Implementation Breakdown

### 1. Infrastructure Layer

- **Redis Service (`redis.service.ts`)**: Handles generic KV caching with TTL functions.
- **Repositories (`shipment.repository.ts`, `...`)**: Abstracts Mongoose/TypeORM DB operations (`create`, `findById`, `update`).

### 2. Core Layer

- **Entities**:
  - `PickupLocation`: `name, phone, generic address fields, isActive`.
  - `Shipment`: Adds `provider` (Enum) and `pickupLocationId`.
- **DTOs**:
  - Add validation schema for `PickupLocationDto`.
  - `CreateShipmentDto`: Relies on `pickupLocationId` and `provider`.
- **Delivery Partner Factory (`delivery-partner.factory.ts`)**:
  - Dynamically returns `IDeliveryPartnerAdapter` implementation.
- **Services**:
  - `PickupLocationService`: Simple CRUD using the repository.
  - `ShipmentService`: Retrieves pickup location via repository. Uses the factory to get the adapter, executes `adapter.createShipment()`, and saves the tracking response via repository.

### 3. Adapters & Mappers Layer

- **Interface (`delivery-partner.adapter.interface.ts`)**: Standardizes `createShipment`, `trackShipment`, `cancelShipment`.
- **DTDC (`dtdc.adapter.ts`, `dtdc.mapper.ts`)**:
  - Mapper transforms internal unified payload to `DtdcBookingPayload`.
  - Adapter gets mapped payload -> calls `DtdcApiService` -> translates response to internal standard.
- **Shiprocket (`shiprocket.adapter.ts`, `shiprocket.mapper.ts`)**:
  - Mapper transforms internal unified payload to Shiprocket Custom Order format.
  - Adapter gets mapped payload -> interacts with Auth context -> calls `ShiprocketApiService` -> standardizes response.

### 4. Providers Layer (Pure HTTP)

- **Shiprocket Auth (`shiprocket-auth.service.ts`)**: Uses `RedisService`. Fetch JWT if not in cache, saves with a 9-day TTL (key: `SHIPROCKET_JWT_TOKEN`).
- **Shiprocket API (`shiprocket-api.service.ts`)**: Generates standard Axios HTTP requests (Orders, Track, AWB) using the token from Auth Service.
- **DTDC API (`dtdc-api.service.ts`)**: Primitive DTDC HTTP calls payload.

### 5. Controllers Layer

- `PickupLocationController`: Expose standard REST endpoints.
- `ShipmentController`: Triggers `shipment.service.ts` operations cleanly.
