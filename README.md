# Mini ERP + CRM Operations Portal

## 1. Project Overview
This project is a comprehensive **Mini ERP and CRM Operations Portal** designed to manage B2B and retail sales workflows. It provides a centralized dashboard for tracking customers, inventory, and end-to-end sales transactions (Challans). The system is built with a strictly typed backend and a responsive, role-based frontend.

## 2. Business Problem
Small to medium businesses often struggle to bridge the gap between their customer relations and their physical inventory. When sales teams create orders, stock must be perfectly synchronized to prevent overselling. This system solves this by:
- Centralizing Customer Data (CRM).
- Providing real-time, mathematically strict Inventory control.
- Enforcing a transactional Sales Challan workflow that guarantees stock is only deducted when a sale is confirmed, preventing negative stock scenarios.
- Securing the entire workflow behind strict Role-Based Access Control (RBAC).

## 3. Features
- **Authentication & RBAC:** Secure JWT-based login with role-enforced UI filtering and backend API protection.
- **Customer CRM:** Full CRUD capabilities for B2B/B2C customers, including status tracking and a follow-up timeline.
- **Inventory Management:** Product cataloging, stock movement history, low-stock visual alerts, and manual stock IN/OUT adjustments.
- **Sales Challans:** Dynamic multi-product transaction records. Features a "Draft" mode that safely reserves data without touching stock, and a "Confirmed" mode that executes a strict transactional stock deduction.
- **Admin Dashboard:** Real-time KPI metrics and low-stock alerts.

## 4. Tech Stack
**Frontend:**
- React (Vite)
- TypeScript
- React Router (Role-protected routes)
- Axios (HTTP client with credentials)
- Vanilla CSS (Responsive Grid/Flexbox UI)

**Backend:**
- Node.js & Express
- TypeScript
- Prisma ORM
- SQLite Database
- JSON Web Tokens (JWT) & bcrypt for security

## 5. Architecture
The application follows a decoupled client-server architecture:
- **Backend API (`/backend`):** A RESTful Express server handling business logic, database transactions, and authentication via `httpOnly` cookies.
- **Frontend SPA (`/frontend`):** A React single-page application that consumes the API, utilizing a global Context provider for authentication state and dynamic route protection.

## 6. Database Entities and Relationships
- **User:** Handles authentication and role designation.
- **Customer:** Stores client details (Business, GST, Mobile, Address). Can have many Follow-ups and Challans.
- **FollowUp:** A chronological timeline of notes linked to a specific Customer and created by a User.
- **Product:** The central inventory item (SKU, Price, Current Stock, Minimum Stock).
- **StockMovement:** An immutable ledger (IN/OUT) of every change to a Product's stock, linked to the User who made the change.
- **Challan:** A sales order linked to a Customer and a User. Can be `DRAFT`, `CONFIRMED`, or `CANCELLED`.
- **ChallanItem:** A snapshot of a Product (Name, SKU, Price, Quantity) at the exact time the Challan was created, linked to a Challan.

## 7. Authentication and Role-Based Access
Security is enforced at two layers:
1. **Backend:** The `authorizeRoles` middleware intercepts API requests. If a user lacks the required role, the API returns a `403 Forbidden`.
2. **Frontend:** The `<RoleRoute>` wrapper prevents unauthorized URL access, and the UI dynamically hides action buttons (e.g., "Add Product") based on the active user's role.

**Roles & Permissions:**
- **ADMIN:** Full system access.
- **SALES:** Manages customers, creates/cancels Challans, views products.
- **WAREHOUSE:** Manages product catalog, adjusts inventory, views/confirms Challans.
- **ACCOUNTS:** Read-only access to customers, challans, products, and inventory.

## 8. API Overview
- `POST /api/auth/login` - Authenticate and receive `httpOnly` cookie.
- `GET /api/auth/me` - Validate active session.
- `GET, POST, PUT, DELETE /api/customers` - CRM operations.
- `POST /api/customers/:id/followups` - Add CRM timeline notes.
- `GET, POST, PUT /api/products` - Inventory catalog operations.
- `POST /api/products/:id/stock` - Manual stock adjustments (IN/OUT).
- `GET /api/products/:id/movements` - View stock ledger.
- `GET, POST /api/challans` - View and create draft sales orders.
- `POST /api/challans/:id/confirm` - Execute stock transaction.
- `POST /api/challans/:id/cancel` - Void a draft.

## 9. Challan Business Workflow
1. **Drafting:** A Sales rep creates a `DRAFT` Challan. Product data is snapshotted to prevent historical discrepancies if a product's price later changes. **Stock is NOT deducted.**
2. **Confirmation:** The Warehouse/Admin reviews the physical stock and confirms the Challan. 
3. **Execution:** The backend runs a strict database transaction. If ANY product lacks sufficient stock, the entire transaction rolls back, preventing partial states. If successful, stock drops and `OUT` movements are permanently logged.
4. **Cancellation:** Drafts can be voided, changing status to `CANCELLED`. Confirmed challans are immutable.

## 10. Stock Management Logic
Stock is strictly governed to prevent negative balances:
- Manual `OUT` adjustments verify `current_stock >= quantity`.
- Challan confirmations verify stock for **every single item** inside a Prisma `$transaction` before applying any decrements.
- All changes automatically generate a `StockMovement` ledger entry for auditability.

## 11. Environment Variables
**Backend (`backend/.env`)**
```env
PORT=5001
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_super_secret_jwt_key_here"
```

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:5001/api
```

## 12. Local Setup Instructions
**Prerequisites:** Node.js (v18+) installed.

1. **Clone the repository.**
2. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```
3. **Install Frontend Dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```
4. **Start Development Servers:**
   - Terminal 1 (Backend): `cd backend && npm run dev`
   - Terminal 2 (Frontend): `cd frontend && npm run dev`
5. Visit `http://localhost:5173` (or the port Vite outputs).

## 13. Database Setup
The SQLite database is managed via Prisma. Run these commands in the `/backend` directory:
```bash
# Apply the schema to create the local SQLite database
npx prisma db push

# Seed the database with users, mock customers, and products
npx prisma db seed
```

## 14. Seed Credentials
Use these credentials to log in and test different RBAC workflows:

- **Admin:** `admin@example.com` / `password123`
- **Sales:** `sales@example.com` / `password123`
- **Warehouse:** `warehouse@example.com` / `password123`
- **Accounts:** `accounts@example.com` / `password123`

## 15. Deployment Instructions
**Backend (Render/Heroku/Railway):**
- Set `NODE_ENV=production`.
- Provide a secure `JWT_SECRET`.
- Change `DATABASE_URL` to a production Postgres/MySQL string (and run `npx prisma migrate deploy`).
- Build step: `npx tsc`. Start command: `node dist/index.js`.

**Frontend (Vercel/Netlify):**
- Set `VITE_API_URL` to the live backend URL.
- Build step: `npm run build`.
- Publish the `/dist` directory.

## 16. Known Limitations
- Concurrency: Challan number generation `CH-XXXX` relies on querying the last ID. Under extremely high concurrency, this could result in collisions unless handled via a database sequence or locking mechanism.
- Testing: Automated test suites (Jest/Cypress) are omitted for this demonstration case study.
- Pagination: Is implemented via Offset pagination, which is sufficient for small/medium datasets, but Cursor pagination would be preferred for massive scale.
