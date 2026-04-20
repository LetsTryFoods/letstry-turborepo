# Daily Task Report — April 7 to April 18, 2026
**Developer:** a-s-t-e-y-a  
**Project:** LetsTry Foods — letstry-turborepo

---

## April 7 — Monday
**Work: Cloudflare R2 Storage Migration (Backend)**

- Migrated the backend file storage from AWS S3 to **Cloudflare R2** — updated `upload.service.ts` with the new S3-compatible client for R2
- Fixed presigned URL generation: enabled `forcePathStyle: true` on the S3Client, which is required by R2 for correct request signing
- Updated `getCloudFrontUrl` to correctly prefix the R2 public domain to file keys instead of the old S3 domain
- Updated `.env.development` with new R2 credentials: endpoint, access key, secret key, and bucket name (`cdn-bucket-main`)
- Wrote and ran a verification script (`test-r2-simple.ts`) to confirm presigned URL generation is working correctly
- Cleaned up temporary test files after successful verification

---

## April 8 — Tuesday
**Work: Mobile App — Production Build Configuration**

- Set up production signing configuration for the Android app (`apps/letstry-mobile`) — added a `release` signing block in the Gradle build file pointing to the production keystore
- Enabled **code minification (R8)** and **resource shrinking** to reduce the final APK/AAB size and protect source code
- Verified Java 17 compatibility with the existing local build environment
- Confirmed the production build connects to the live API: `https://apiv3.letstryfoods.com/graphql`
- Documented the production build steps — keystore generation, Gradle properties config, and the `assembleRelease` / `bundleRelease` commands

---

## April 9 — Wednesday
**Work: Internal Script — Unpacked Shipment Detection**

- Designed and planned a new internal script app (`apps/scripts`) within the Turborepo to identify operational gaps in order fulfillment
- Script logic: connects to MongoDB, finds all shipments with `currentStatusCode: 'PUP'` (Picked Up), then cross-references the `packingorders` collection to find orders that were never marked as completed
- Set up `apps/scripts` as a new minimal Node.js/TypeScript package with `mongodb` and `dotenv` as dependencies
- Planned the `find-unpacked-shipments.ts` core script with aggregation logic for the DB lookup
- Updated `turbo.json` to register the new scripts app within the monorepo pipeline

---

## April 10 — Thursday
*No work on this project.*

---

## April 11 — Friday
*No work on this project.*

---

## April 12 — Saturday
*No work on this project.*

---

## April 13 — Sunday
**Work: Major Development Day — Backend, Admin Dashboard, Payment Gateway**

### Backend Security
- Disabled **GraphQL Playground, Introspection, and GraphiQL** in production by making them conditional on `NODE_ENV` (`core.module.ts`) — schema is no longer publicly accessible in live environment
- Set up **MongoDB Atlas automated backup** — wrote `mongodb_backup.sh` script to dump the database and store backups in R2-compatible object storage

### Admin Dashboard — Orders
- Fixed a pagination bug on the Orders page that was loading all records instead of paginated results
- Implemented server-side lazy-loading and proper pagination for orders — updated `order.resolver.ts`, `order.repository.ts`, `order.query-service.ts`, and the `orders.ts` GraphQL query
- Added a reusable `Pagination` UI component (`apps/admin/components/ui/pagination.tsx`) used across the dashboard

### Admin Dashboard — Customers
- Built server-side pagination for the Customers module — refactored `UserService` to fetch paginated results at DB level
- Fixed the customer `avatar` field missing from the Identity schema and GraphQL type — added it to `identity.schema.ts` and wired it through the `useCustomers` hook
- Fixed missing `totalSpent` field in the customer data mapping that was causing `undefined` values in the UI
- Trimmed the `GET_ALL_CUSTOMERS` GraphQL query to remove unused metadata fields, reducing payload size

### Admin Dashboard — Image Loading
- Created a centralized `getCdnUrl` utility (`apps/admin/lib/utils/image-utils.ts`) to resolve all image keys through the production R2 CDN
- Applied `getCdnUrl` across all 15+ admin dashboard components: Orders, Customers, Products, Categories, Reviews, Packing, Reports, Payments, SEO pages, and the global image preview dialog
- Fixed broken images across the entire admin dashboard — previously many images were 404ing due to relative path or missing CDN prefix

### Payment Gateway
- Integrated Zaakpay into the payment service layer — replaced placeholder buyer data with real customer details (name, email, phone, address, city, state, pincode) fetched from the user's saved delivery address

### Git
- Resolved a Git merge conflict that was blocking the sync with the remote `master` branch

---

## April 14 — Monday
**Work: Zaakpay Checksum Debugging + Payment Mode Fix + Server Setup**

### Zaakpay Checksum (Overnight — 1:38 AM to 1:01 PM)
- Debugged **Zaakpay error 183 (checksum mismatch)** through an intensive overnight session — 19 commits across ~12 hours
- Identified root cause: non-checksum parameters like `paymentOptionTypes` must be excluded from the hash string per Zaakpay V8 spec
- Fixed parameter ordering to match the exact sequence required by Zaakpay's checksum algorithm
- Fixed a trailing `&` bug in the checksum string — parameters must be joined without a trailing ampersand
- Updated `zaakpay-payment.service.ts`, `zaakpay-gateway.service.ts`, `payment.service.ts`, and `payment-executor.service.ts` to implement corrected logic

### Payment Mode Storage
- Removed the internal `PaymentMethod` enum mapping from the Zaakpay webhook handler
- Updated `payment.schema.ts` to remove the enum constraint, `payment.graphql.ts` to use a plain `String` type, and `admin-payment.input.ts` to accept string-based filters
- Raw payment mode values from Zaakpay (e.g., `UPIAPP`, `UPI002`, `CC`) are now stored directly in the database — eliminates incorrect auto-categorization

### Server Setup (Excloud)
- Completed environment setup on the new **Excloud** server — provisioned services and confirmed all backend processes running correctly in production

---

## April 15 — Tuesday
**Work: Mobile App — Vehicle Marker Fix + Zaakpay Debugger Tool + Backup Script Fix**

### Mobile App — Vehicle Marker (react-native-maps)
- Fixed a rendering bug where the delivery vehicle icon was displaying as a plain grey circle with no image — reverted to a simplified direct image-in-marker pattern instead of a nested view wrapper
- Removed an overcomplicated rotation wrapper that was causing a **white ghost rectangle** artifact around the marker on certain Android devices
- Fixed vehicle orientation: rotation is now correctly applied based on the GPS `course` heading so the icon points in the direction of travel
- Verified the fix renders correctly without layout artifacts on both iOS and Android

### Zaakpay Debugger Tool
- Built a full **custom HTML debugger** (`apps/scripts/zaakpay-debugger.html`) to compare POST-based backend payment initiation vs a direct GET-based URL side by side
- The tool displays both request flows, their parameters, and the generated checksum — used to isolate why UPI options weren't appearing in backend-initiated sessions

### MongoDB Backup Script
- Fixed a **cross-platform incompatibility** in `mongodb_backup.sh` — the `date -v-5d` flag for backup retention only works on macOS/BSD
- Added OS detection to use `date --date` on Linux and `date -v` on macOS — backup retention now works correctly on the Excloud Ubuntu server
- Created a `mongodb_setup_check.sh` verification script to confirm all required binaries (`mongodump`, `aws`, `tar`, `gzip`) and environment variables are present before a backup runs
- Created `server_setup.sh` — a full server provisioning script that installs MongoDB Database Tools (via official MongoDB 8.0 apt repo for Ubuntu 24.04 Noble), AWS CLI v2, Docker, Node.js, Nginx, PM2, and pnpm

---

## April 16 — Wednesday
**Work: Zaakpay Return URL — Vendor Coordination**

- Escalated the Zaakpay return URL issue with the Zaakpay technical team — the callback URL after payment was not being honoured despite correct backend configuration
- Shared payment flow logs and test session details with Zaakpay support to help them identify the gateway-side config that needed to be changed
- Continued testing and validating the rest of the payment flow (checksum, payload structure, webhook receipt) in parallel while awaiting vendor response

---

## April 17 — Thursday
**Work: Zaakpay Return URL — Resolution & Validation**

- Zaakpay team confirmed and applied the fix on their gateway — return URL configuration was a merchant-account-level setting that required vendor intervention
- Validated the complete end-to-end payment flow: initiation → Zaakpay gateway redirect → payment selection → transaction → callback to return URL → order status update
- Confirmed UPI, cards, and net banking options all appearing correctly in the Zaakpay payment screen

---

## April 18 — Friday (Today)
**Work: Post-Integration Monitoring**

- Monitoring live payment sessions for stability after the Zaakpay return URL fix went live
- Active debugging of edge cases using the `zaakpay-debugger.html` tool built on April 15
- Payment integration considered stable; observing production traffic

---

## Summary

| Date | Key Work | Type |
|---|---|---|
| Apr 7 | Cloudflare R2 storage migration | Code |
| Apr 8 | Mobile production build setup | Code |
| Apr 9 | Internal unpacked shipments script | Code |
| Apr 10–12 | No letstry-turborepo activity | — |
| Apr 13 | Admin dashboard, GraphQL security, MongoDB backup, Zaakpay start | Code |
| Apr 14 | Zaakpay checksum fix (overnight), payment mode, server setup | Code |
| Apr 15 | Vehicle marker fix, Zaakpay debugger, backup script cross-platform | Code |
| Apr 16–17 | Zaakpay return URL — vendor coordination and resolution | Coordination |
| Apr 18 | Live monitoring and validation | Ongoing |
