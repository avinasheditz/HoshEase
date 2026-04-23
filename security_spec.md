# Security Specification: HospEase Admin

## 1. Data Invariants
- A **Trip** must always belong to a valid `hospitalId`.
- A **Hospital** must have a valid `subscriptionPlanId`.
- Only **Admins** can perform write operations on `hospitals`, `customers`, and `subscriptionPlans`.
- **Trips** can be read by admins and updated by the respective hospital (though this dashboard is for global admins, we'll focus on admin access).
- **Reviews** can be deleted by Admins.

## 2. The "Dirty Dozen" Payloads (Targeting PERMISSION_DENIED)
1. **Unauthorized Create**: Non-admin attempting to create a hospital.
2. **ID Poisoning**: Attempting to create a hospital with a 1MB string as ID.
3. **Ghost Field**: Adding `isVerified: true` to a hospital update.
4. **Immutability Breach**: Attempting to change `createdAt` on a trip update.
5. **PII Leak**: Non-admin attempting to list all customer phone numbers.
6. **State Skip**: Jumping a trip status from `requested` directly to `completed` without `accepted`.
7. **Negative Rating**: Creating a review with `rating: -5`.
8. **Orphaned Trip**: Creating a trip with a non-existent `hospitalId`.
9. **Self-Promotion**: An unauthenticated user creating an admin document in `/admins/`.
10. **Huge Document**: Sending a 2MB payload for a hospital document.
11. **Future Timestamp**: Setting `createdAt` to a time in the future.
12. **Status Lock Breach**: Updating a trip after it has reached `completed` state.

## 3. Test Runner (Mock file)
Successfully implemented in `firestore.rules`.
