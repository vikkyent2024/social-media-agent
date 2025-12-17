# Future-Safe Status Flow Proposal

## 1. Drafting (Current State)

- **Action**: The generation script (`minimal_generate_post.ts`) runs.
- **Output**: A new `SocialPost` record is created.
- **State**: `status` is set to `draft`.
- **Purpose**: Content is safely stored but not visible publicly.

## 2. Approval (Future UI/CLI)

- **Action**: A user or reviewer accesses records with `status: draft`.
- **Logic**: Reviewer verifies content accuracy and tone.
- **Transition**:
  - If accepted: DB record updated to `approved`.
  - If rejected: DB record deleted or updated to `rejected` (if enum allows, otherwise kept as draft/deleted).

## 3. Posting (Future Worker)

- **Action**: A separate scheduled job (cron) runs periodically.
- **Logic**:
  - Query DB for records where `status: approved`.
  - For each record, send payload to the `platform` API (Twitter/LinkedIn).
- **Transition**:
  - **Success**: DB record updated to `posted`.
  - **Failure**: Log error, potentially revert to `draft` or `error` state (if added in future).
