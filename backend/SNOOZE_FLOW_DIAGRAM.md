# 🔄 snoozeCount Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   HARDWARE ↔️ BACKEND SYNC                       │
└─────────────────────────────────────────────────────────────────┘

╔═══════════════════════════════════════════════════════════════╗
║  STEP 1: Hardware Fetches Medicines (GET)                     ║
╚═══════════════════════════════════════════════════════════════╝

    Hardware                           Backend
       │                                  │
       │────── GET /upcoming ─────────────>│
       │                                  │
       │<──────── Response ───────────────│
       │                                  │
       │   {                              │
       │     "id": "1",                   │
       │     "status": "pending",         │
       │     "snoozeCount": 0  ← Track!  │
       │   }                              │
       │                                  │


╔═══════════════════════════════════════════════════════════════╗
║  STEP 2: User Presses Snooze Button (1st time)               ║
╚═══════════════════════════════════════════════════════════════╝

    Hardware                           Backend
       │                                  │
   [SNOOZE]                               │
   snoozeCount++                          │
   (now = 1)                              │
       │                                  │
       │── POST /upcoming ────────────────>│
       │   {                              │
       │     "id": "1",                   │
       │     "status": "snoozed",         │
       │     "snoozeCount": 1             │
       │   }                              │
       │                                  │
       │                              [SAVES]
       │                           snoozeCount = 1
       │                           status = "snoozed"
       │                                  │
       │<──────── Response ───────────────│
       │   {                              │
       │     "status": "snoozed",         │
       │     "snoozeCount": 1,            │
       │     "movedTo": "upcoming"        │
       │   }                              │
       │                                  │


╔═══════════════════════════════════════════════════════════════╗
║  STEP 3: User Presses Snooze Button (2nd time)               ║
╚═══════════════════════════════════════════════════════════════╝

    Hardware                           Backend
       │                                  │
   [SNOOZE]                               │
   snoozeCount++                          │
   (now = 2)                              │
       │                                  │
       │── POST /upcoming ────────────────>│
       │   {                              │
       │     "id": "1",                   │
       │     "status": "snoozed",         │
       │     "snoozeCount": 2             │
       │   }                              │
       │                                  │
       │                              [SAVES]
       │                           snoozeCount = 2
       │                           status = "snoozed"
       │                                  │
       │<──────── Response ───────────────│
       │   {                              │
       │     "status": "snoozed",         │
       │     "snoozeCount": 2,            │
       │     "movedTo": "upcoming"        │
       │   }                              │
       │                                  │


╔═══════════════════════════════════════════════════════════════╗
║  STEP 4: User Presses Snooze Button (3rd time) → MISSED!     ║
╚═══════════════════════════════════════════════════════════════╝

    Hardware                           Backend
       │                                  │
   [SNOOZE]                               │
   snoozeCount++                          │
   (now = 3)                              │
       │                                  │
       │── POST /upcoming ────────────────>│
       │   {                              │
       │     "id": "1",                   │
       │     "status": "snoozed",         │
       │     "snoozeCount": 3             │
       │   }                              │
       │                                  │
       │                          [AUTO-MOVES TO MISSED]
       │                           snoozeCount = 3
       │                           status = "missed"  ← Changed!
       │                                  │
       │<──────── Response ───────────────│
       │   {                              │
       │     "status": "missed",          │
       │     "snoozeCount": 3,            │
       │     "movedTo": "missed dataset"  │
       │   }                              │
       │                                  │
   [RESET]                                │
   snoozeCount = 0                        │
   Display "Missed!"                      │
       │                                  │


╔═══════════════════════════════════════════════════════════════╗
║  ALTERNATIVE: Backend Auto-Increment (No snoozeCount sent)   ║
╚═══════════════════════════════════════════════════════════════╝

    Hardware                           Backend
       │                                  │
   [SNOOZE]                               │
   (not tracking count)                   │
       │                                  │
       │── POST /upcoming ────────────────>│
       │   {                              │
       │     "id": "1",                   │
       │     "status": "snoozed"          │
       │     // No snoozeCount!           │
       │   }                              │
       │                                  │
       │                          [AUTO-INCREMENT]
       │                           snoozeCount++
       │                           (0 → 1 → 2 → 3)
       │                                  │
       │<──────── Response ───────────────│
       │   {                              │
       │     "status": "snoozed",         │
       │     "snoozeCount": 1,  ← Backend tracked!
       │     "movedTo": "upcoming"        │
       │   }                              │
       │                                  │


╔═══════════════════════════════════════════════════════════════╗
║  SYNC CHECK: Hardware Re-fetches After Network Recovery      ║
╚═══════════════════════════════════════════════════════════════╝

    Hardware                           Backend
       │                                  │
  (Network down)                          │
  Local: snoozeCount = 1                  │
       │                                  │
  (Network restored)                      │
       │                                  │
       │────── GET /upcoming ─────────────>│
       │                                  │
       │<──────── Response ───────────────│
       │   {                              │
       │     "id": "1",                   │
       │     "status": "snoozed",         │
       │     "snoozeCount": 2  ← Backend ahead!
       │   }                              │
       │                                  │
   [SYNC]                                 │
   snoozeCount = 2                        │
   (Update local)                         │
       │                                  │


═══════════════════════════════════════════════════════════════

                        KEY FEATURES

🔄 Bidirectional Sync
   - Hardware → Backend: Send snoozeCount in POST
   - Backend → Hardware: Receive snoozeCount in GET

📊 Dual Tracking Options
   Option 1: Hardware tracks (sends snoozeCount in POST)
   Option 2: Backend tracks (omit snoozeCount in POST)

🎯 Auto-Move Logic
   snoozeCount > 2 → Automatically moves to "missed" dataset

⚡ Smart Fallback
   If hardware doesn't send snoozeCount, backend increments

🔙 Backward Compatible
   Old hardware (without snoozeCount) still works perfectly

═══════════════════════════════════════════════════════════════


                     DATA STRUCTURES

╔═══════════════════════════════════════════════════════════════╗
║  GET /api/hardware/upcoming Response                          ║
╚═══════════════════════════════════════════════════════════════╝

{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": "1",
      "medicineName": "Aspirin",
      "dosage": "100mg",
      "slot": 1,
      "scheduledTime": "08:00",
      "status": "pending",
      "snoozeCount": 0  ← Always included
    },
    {
      "id": "2",
      "medicineName": "Vitamin D",
      "dosage": "50mg",
      "slot": 2,
      "scheduledTime": "14:00",
      "status": "snoozed",
      "snoozeCount": 2,  ← Shows current count
      "snoozedUntil": "2025-11-09T14:30:00.000Z"
    }
  ]
}


╔═══════════════════════════════════════════════════════════════╗
║  POST /api/hardware/upcoming Request                          ║
╚═══════════════════════════════════════════════════════════════╝

Option A: Hardware Tracking
{
  "id": "1",
  "status": "snoozed",
  "snoozeCount": 1  ← Hardware sends count
}

Option B: Backend Auto-Increment
{
  "id": "1",
  "status": "snoozed"  ← Backend will increment
}


╔═══════════════════════════════════════════════════════════════╗
║  POST Response                                                ║
╚═══════════════════════════════════════════════════════════════╝

{
  "success": true,
  "message": "Upcoming medicine status received successfully",
  "data": {
    "id": "1",
    "medicineName": "Aspirin",
    "status": "snoozed",
    "snoozeCount": 1,  ← Current count
    "movedTo": "upcoming dataset"
  }
}


═══════════════════════════════════════════════════════════════

                    SERVER CONSOLE LOGS

📥 Received from hardware - Upcoming medicine update: ID=1, Status=snoozed, SnoozeCount=1
⏰ Hardware sent snoozeCount: 1
⏰ Medicine "Aspirin" snoozed (count: 1)

📥 Received from hardware - Upcoming medicine update: ID=1, Status=snoozed, SnoozeCount=2
⏰ Hardware sent snoozeCount: 2
⏰ Medicine "Aspirin" snoozed (count: 2)

📥 Received from hardware - Upcoming medicine update: ID=1, Status=snoozed, SnoozeCount=3
⏰ Hardware sent snoozeCount: 3
❌ Medicine "Aspirin" snoozed 3 times - moved to MISSED

═══════════════════════════════════════════════════════════════
```

## Quick Reference

| Feature | Status |
|---------|--------|
| GET includes snoozeCount | ✅ Yes |
| POST accepts snoozeCount | ✅ Optional |
| Backend auto-increment | ✅ Yes (if not sent) |
| Hardware can track | ✅ Yes |
| Auto-move to missed | ✅ After >2 snoozes |
| Backward compatible | ✅ Yes |

---

**Perfect synchronization between hardware and backend!** 🎉
