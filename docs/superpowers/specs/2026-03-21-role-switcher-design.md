# Live Bridge Demo Mode — Role Switcher Bar

## Problem

HealthForge's core story is bridging the gap between doctor and patient. During a hackathon demo, switching between roles requires navigating back to the landing page — breaking the narrative flow. Judges lose the "bridge" moment.

## Solution

A floating role-switcher dock at the bottom of the screen. One click swaps between doctor and patient views with a fresh data fetch. The doctor adds a session, clicks the patient button, and immediately sees the plain-language translation — no page reloads, no login screens, no dead air.

## Design

### Role Switcher Bar

- Fixed to bottom-center of viewport (`fixed bottom-6 left-1/2 -translate-x-1/2 z-50`)
- Visible on every page except the landing page
- Rendered **outside** the `<div key={page}>` animation wrapper so it doesn't re-animate on page changes
- White background, shadow-lg, rounded-lg, px-2 py-2
- Contains "Viewing as" label (text-xs, muted gray, centered above the buttons)

### Button Layout

Two buttons side by side inside the dock:

- **Doctor button**: Stethoscope icon (lucide `Stethoscope`) + "Dr. Emily Chen"
- **Patient button**: User icon (lucide `User`) + "Sarah Kim"
- Active role: solid navy (#0B1929) bg, white text, shadow-sm
- Inactive role: white bg, navy border, navy text, hover:bg-gray-50
- Both: rounded-lg, px-4 py-2, text-sm, transition-all duration-200
- During fetch: inactive button shows a small spinner (w-4 h-4) replacing the icon

### Switching Behavior

- **Doctor → Patient**: calls `fetchFirstDoctor()` then `fetchPatientsForDoctor(doctorId)` to get fully fresh data, sets currentUser to `pts[0]` with role `'patient'`, replaces `patients` state, clears `selectedPatientId`, navigates to `patient-dashboard`
- **Patient → Doctor**: calls `fetchFirstDoctor()` + `fetchPatientsForDoctor(doctorId)`, sets currentUser to doctor, replaces `patients` state, clears `selectedPatientId`, navigates to `doctor-dashboard`
- All fetches hit Supabase fresh — no cached/stale data
- Switching from any page (including `doctor-patient-detail`) discards any in-progress transcription edits silently — acceptable for demo purposes
- **Loading state**: uses a dedicated `switchLoading` state variable, separate from the existing `loading` state in App.jsx. The existing `loading` triggers a full-page `LoadingScreen`; `switchLoading` only affects the dock button spinner. `handleSwitchRole` must NOT set `setLoading(true)`.
- **Error handling**: on fetch failure, log to console and remain on the current page. Do not show an error UI for the hackathon MVP.

### Component Structure

A new `RoleSwitcherDock` component rendered in App.jsx:

```jsx
<RoleSwitcherDock
  currentUser={currentUser}
  onSwitchRole={(role) => {}}
  loading={switchLoading}
/>
```

Rendered conditionally: only when `page !== 'landing'` and `currentUser !== null`. Rendered **outside** the `<div key={page}>` wrapper.

### Host Page Padding

Pages rendered while the dock is visible should have bottom padding (`pb-24`) to prevent the dock from overlapping content. This applies to DoctorDashboard, PatientDetailView, and PatientDashboard.

### What We Are NOT Building

- No WebSocket / Supabase Realtime subscriptions
- No polling or background sync
- No local state reconciliation between roles
- No multi-user authentication
- No changes to the existing nav bar logout flow
- No unsaved-edit warnings on role switch
- No keyboard accessibility / focus management (future iteration)

## Files to Modify

- `src/App.jsx` — add `switchLoading` state, `handleSwitchRole` function, render RoleSwitcherDock outside animation wrapper
- `src/components/RoleSwitcherDock.jsx` — new component (the floating dock)
- `src/components/DoctorDashboard.jsx` — add `pb-24` to main content area
- `src/components/PatientDetailView.jsx` — add `pb-24` to main content area
- `src/components/PatientDashboard.jsx` — add `pb-24` to main content area

## Demo Flow

1. Land on landing page → "I'm a Doctor"
2. Doctor dashboard → click James Miller
3. Patient detail → expand session → see low-confidence alert
4. Click "Add Context" → edit transcription → save → generate insights
5. **Click "Sarah Kim" in the dock** → patient dashboard loads with fresh data
6. Patient sees action plan, visit history, reading-level toggle
7. **Click "Dr. Emily Chen" in the dock** → back to doctor dashboard
