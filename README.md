## Payment Withdrawal Module (Node.js, Express, MongoDB)

This project implements a secure, scalable, and concurrency-safe **wallet withdrawal** module using **Node.js (Express)** and **MongoDB (Mongoose)**, aligned with the assessment requirements.

### Tech Stack

- **Backend**: Node.js (Express)
- **Database**: MongoDB
- **ODM**: Mongoose

### Key Design Decisions

- **Financial precision**: Wallet balances and withdrawal debits are stored as **integer minor units** in cents (e.g., `100.25` → `10025`), avoiding floating-point rounding issues.
- **Data model**:
  - `User`: registration/login user with unique email, hashed password (`password`), and `isActive` status.
  - `Wallet`: one wallet per user (`user` is unique), holds `balanceCents` and `currency`.
  - `Withdrawal`: records each withdrawal request, amount, destination, status (`pending → processing → success/failed`), optional `failureReason`, and `idempotencyKey`.
- **Security**:
  - Input validation via `express-validator` and manual whitelisting of fields.
  - No dynamic query building from user input; MongoDB injection-safe patterns.
  - JWT authentication; user identity comes from the token (not request body).
  - **Replay / duplicate prevention** via `Idempotency-Key` header and a unique `(user, idempotencyKey)` index.
- **Concurrency & atomicity**:
  - Atomic wallet update using `findOneAndUpdate` with a conditional predicate:
    - Query: `{ user: userId, balanceCents: { $gte: amountCents } }`
    - Update: `{ $inc: { balanceCents: -amountCents } }`
  - This pattern ensures the wallet **never goes negative** and prevents double spending under concurrent load.
- **Note on MongoDB transactions**: MongoDB multi-document transactions require a **replica set**. This project is designed to run on a local standalone MongoDB too, so it uses atomic single-document updates for wallet balance correctness.
- **Scalability**:
  - Stateless HTTP API ready for horizontal scaling behind a load balancer.
  - Database-level concurrency guarantees (atomic update).
  - Service layer (`withdrawalService`) is designed such that it can be invoked either directly from the HTTP request or from a background job/queue worker.

### API

#### Registration

`POST /auth/register`

Body:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

Response (201):

```json
{
  "message": "Registration successful",
  "userId": "..."
}
```

#### Login

`POST /auth/login`

Body:

```json
{
  "email": "john@example.com",
  "password": "StrongPass123"
}
```

Response (200):

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "isActive": true
  }
}
```

Use this token for protected APIs:

- `Authorization: Bearer <token>`

#### Get Wallet Balance

`GET /wallets`

Headers:

- `Authorization: Bearer <token>`

Response (200):

```json
{
  "balanceCents": 9000,
  "currency": "INR"
}
```

#### Deposit / Add Wallet Balance

`POST /wallets/deposit`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer <token>`

Body:

```json
{
  "amount": 100,
  "currency": "INR"
}
```

Response (200):

```json
{
  "message": "Deposit successful",
  "balanceCents": 10000,
  "currency": "INR"
}
```

#### Create Withdrawal

`POST /withdrawals`

Headers:

- `Content-Type: application/json`
- `Authorization: Bearer <token>`
- `Idempotency-Key: <optional unique key for this operation>`

Body:

```json
{
  "amount": 100.5,
  "currency": "INR",
  "destination": "bank-account-xxxx"
}
```

Response (201):

```json
{
  "id": "652fcf4ad2...",
  "status": "success",
  "amountCents": 10050,
  "currency": "INR",
  "destination": "bank-account-xxxx",
  "createdAt": "2026-02-24T12:34:56.789Z"
}
```

If balance is insufficient:

```json
{
  "message": "Insufficient balance or wallet not found"
}
```

### Running the Project

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the example:

```bash
copy .env.example .env
```

3. Ensure MongoDB is running and the `MONGO_URI` in `.env` is correct.

4. Start the server:

```bash
npm run dev
```

Server listens on `http://localhost:3000`.

### Example Usage (Manual)

1. Register and login to get a JWT:

```bash
curl -X POST http://localhost:3000/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"firstName\":\"John\",\"lastName\":\"Doe\",\"email\":\"john@example.com\",\"password\":\"StrongPass123\"}"

curl -X POST http://localhost:3000/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@example.com\",\"password\":\"StrongPass123\"}"
```

2. Deposit some balance:

```bash
curl -X POST http://localhost:3000/wallets/deposit ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <JWT_FROM_LOGIN>" ^
  -d "{\"amount\":100,\"currency\":\"INR\"}"
```

3. Trigger a withdrawal:

```bash
curl -X POST http://localhost:3000/withdrawals ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer <JWT_FROM_LOGIN>" ^
  -H "Idempotency-Key: withdraw-001" ^
  -d "{\"amount\":5,\"currency\":\"INR\",\"destination\":\"bank-account-xxxx\"}"
```

4. Verify that:

- The wallet balance decreased by `amountCents`.
- A `withdrawals` document exists with status `success`.

### Concurrency, Idempotency, and Safety

- **Multiple concurrent withdrawals for the same user**:
  - Only one request that finds `balanceCents >= amountCents` will succeed for the final funds.
  - Others will fail with `Insufficient balance or wallet not found`, preventing double spending.
- **Idempotency**:
  - Repeating a request with the same `Idempotency-Key` returns the same `Withdrawal` record.
  - The `(user, idempotencyKey)` unique index enforces this at the database level.

### Extensibility

- The `withdrawalService` can be extracted into a separate worker process and called from:
  - An HTTP handler (as implemented).
  - A background job queue (e.g., Bull, RabbitMQ, SQS) for real payment gateway integration and retry logic.
- Additional statuses (`processing`, `failed`) can be wired in if integrating with an actual payment gateway.

