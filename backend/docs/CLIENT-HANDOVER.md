# Riverside Community Hub — Handover Guide

This guide is for Riverside staff and admin users — no technical background needed.

**Live site:** https://riverside-community-hub-delta.vercel.app

---

## 1. Getting a staff or admin account

New sign-ups from the public "Sign up" page are always created as regular **Members**. Staff and Admin accounts can't be self-created for security reasons — they have to be set up by whoever manages the Supabase project (your developer or IT contact). To get one:

1. Have your developer create the account in Supabase (Authentication → add user with your email).
2. They then flag it as `staff` or `admin` in the database.
3. You'll log in normally at `/login` with the email and password they set up.

Once that's done, you'll see extra dashboard options that regular members don't have.

## 2. Logging in

Go to the site → **Log in** → enter your email and password. If you're a Member, you'll land on the main site. If you're Staff or Admin, you'll also see a **Dashboard** link.

## 3. Approving or rejecting bookings

1. Log in and open the **Dashboard**.
2. Under "Pending bookings," you'll see every request waiting for a decision — who requested it, which room/equipment, and the requested time.
3. Click **Approve** or **Reject**. The member's booking updates instantly; there's no separate confirmation step.
4. The system won't let two people book the same room/equipment for overlapping times — this is enforced automatically, so you don't need to manually check for double-bookings.

## 4. Managing the member directory

Still on the Dashboard, under "Member directory":
- Use the search box to find a member by name.
- Each member shows their membership tier and status. A member flagged **"Expiring soon"** is within 30 days of their one-year membership anniversary. **"Expired"** means that date has passed.
- Membership renewal is currently manual — there's no online payment. To renew someone, your developer or admin updates their `joined_at` date directly in Supabase. There's no button for this in the dashboard yet.

## 5. Viewing your numbers

The top of the Dashboard shows three live figures:
- **Bookings this month**
- **Total donations** (all-time, across all campaigns)
- **Active members** — note: this currently counts every registered profile, not just members whose status shows as "active." Flag this with your developer if you want it to match the status shown in the member directory.

## 6. Donations

- Anyone — including visitors who aren't logged in — can donate from the **Donate** page. They pick a campaign (e.g. "Winter parcels"), enter an amount, and optionally check "Adopt a food parcel" for a recurring pledge. This logs their *intent* to give recurring donations; it does not set up real recurring billing or charge a card, since there's no payment gateway connected yet.
- The progress bar on the Donate page updates automatically as soon as a donation is recorded.
- To pull a report of all donations (for your board or funders), a staff/admin account can export a CSV from the system. Ask your developer for this export if you don't see a download button on the dashboard yet — it's built on the backend but not yet wired to a visible button.

## 7. What members can do (for reference)

Members — anyone who signs up on the public site — can:
- Browse rooms/equipment and their availability
- Request a booking (this always starts as "pending" until staff approves it)
- View and cancel their own pending bookings
- Donate, and optionally attach the donation to their account

## 8. Things to know before relying on this for real operations

- **Membership renewal has no self-service or payment flow.** All renewals are a manual database edit today.
- **Row Level Security policies are not yet turned on** in the Supabase project — access control currently works because the app's own server checks each request, not because the database itself restricts it. This is fine for the demo but is worth finishing before treating this as production-ready, since it's one of the criteria in the original project brief.
- **The CSV donation export exists but isn't linked from the dashboard UI yet** — it works if called directly, but there's no button for staff to click today.

## 9. Who to contact

For anything beyond what's covered here — new staff accounts, adding rooms/equipment, fixing a stuck booking — contact your developer/maintainer directly rather than editing the Supabase project yourself, to avoid accidentally breaking a booking or membership record.