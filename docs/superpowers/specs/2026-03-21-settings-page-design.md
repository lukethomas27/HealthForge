# Settings Page Design

Lightweight, role-aware settings page for MedBridge with comprehensive accessibility controls. Settings persist in `localStorage` — no backend changes required.

## Architecture

### New Files

- `src/context/SettingsContext.jsx` — React Context + provider, reads/writes `localStorage`, exposes `useSettings()` hook
- `src/components/SettingsPage.jsx` — Settings page component with role-conditional sections

### Modified Files

- `src/App.jsx` — wrap app in `SettingsProvider`, add `'settings'` route, apply theme/font/accessibility attributes
- `src/index.css` — add dark mode palette, high contrast overrides, font size classes, reduced motion rules, color blind palette
- `src/components/DoctorDashboard.jsx` — add gear icon to nav, read `patientSortOrder` from context
- `src/components/PatientDashboard.jsx` — add gear icon to nav, read `hideCompletedActions` / `reminderFrequency` from context
- `src/components/PatientDetailView.jsx` — add gear icon to nav, read `autoExpandSessions` / `autoSaveTranscriptions` from context
- `src/components/LandingPage.jsx` — no settings access (pre-login)

## Routing & Navigation

Settings integrates into the existing page-based routing in `App.jsx`:

- New route: `page === 'settings'` renders `<SettingsPage />`
- Navigation: gear icon (⚙) button in the sticky nav bar of all dashboard views, next to "Sign Out"
- Back navigation: "← Back to Dashboard" link at top of settings page returns to the appropriate dashboard based on `currentUser.role`

## SettingsContext

### Provider

```jsx
// src/context/SettingsContext.jsx
const STORAGE_KEY = 'medbridge-settings';

const DEFAULTS = {
  // Accessibility (shared)
  theme: 'light',
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  colorBlindFriendly: false,

  // Doctor-specific
  patientSortOrder: 'lastVisit',
  autoExpandSessions: false,
  criticalScoreAlerts: true,
  autoSaveTranscriptions: true,

  // Patient-specific
  hideCompletedActions: false,
  reminderFrequency: 'weekly',
  dataSharing: true,
};
```

- On mount: reads `localStorage`, merges saved values over `DEFAULTS` (so new settings get defaults automatically)
- `updateSetting(key, value)` — updates state and writes to `localStorage`
- `resetSettings()` — clears `localStorage` key and reverts to `DEFAULTS`
- Exposes `useSettings()` hook returning `{ settings, updateSetting, resetSettings }`

### Side Effects

`SettingsContext` applies DOM attributes via `useEffect` whenever settings change:

| Setting | DOM Effect |
|---------|-----------|
| `theme` | Sets `data-theme="dark"` on `<html>` |
| `fontSize` | Sets `data-font-size="small\|medium\|large"` on `<html>` |
| `highContrast` | Sets `data-high-contrast` on `<html>` |
| `reducedMotion` | Sets `data-reduced-motion` on `<html>` |
| `screenReader` | Sets `data-screen-reader` on `<html>` |
| `colorBlindFriendly` | Sets `data-color-blind` on `<html>` |

## Settings Page Layout

Single scrollable page with card-based sections. Settings save automatically on toggle/select — no save button.

### Shared Section: Accessibility

Visible to both roles:

| Setting | Control Type | Options |
|---------|-------------|---------|
| Theme | Segmented toggle | Light / Dark |
| Font Size | Segmented toggle | S / M / L |
| High Contrast | Toggle switch | On / Off |
| Reduced Motion | Toggle switch | On / Off |
| Screen Reader Enhancements | Toggle switch | On / Off |
| Color Blind-Friendly | Toggle switch | On / Off |

### Doctor Section: Consultation Preferences

Visible when `currentUser.role === 'doctor'`:

| Setting | Control Type | Options |
|---------|-------------|---------|
| Patient List Sort | Dropdown select | Last Visit / Name (A-Z) / Risk Level |
| Auto-Expand Sessions | Toggle switch | On / Off |
| Critical Score Alerts | Toggle switch | On / Off |
| Auto-Save Transcriptions | Toggle switch | On / Off |

### Patient Section: My Preferences

Visible when `currentUser.role === 'patient'`:

| Setting | Control Type | Options |
|---------|-------------|---------|
| Hide Completed Actions | Toggle switch | On / Off |
| Reminder Frequency | Dropdown select | Daily / Weekly / Never |
| Data Sharing | Toggle switch | On / Off |

**Note:** The reading level toggle (Simpler/Plain/More detail) stays inline in the visit history container — it is not part of the settings page.

### Footer

- "Reset to Defaults" button — clears all settings to defaults with a confirmation

## Dark Mode Theming

### CSS Strategy

Use CSS custom properties scoped to `data-theme` attribute on `<html>`. Tailwind v4's `@theme` block defines the light palette (existing). Dark overrides use `[data-theme="dark"]` selector.

### Color Palette

| Token | Light | Dark |
|-------|-------|------|
| `--color-bg` | `#F7F4EF` | `#121A24` |
| `--color-card` | `#FFFFFF` | `#1B2535` |
| `--color-text` | `#0B1929` | `#E8E4DF` |
| `--color-muted` | `#6B7280` | `#9CA3AF` |
| `--color-border` | `#E5E7EB` | `#2D3A4A` |
| `--color-teal` | `#00C9A7` | `#00C9A7` (unchanged) |
| `--color-amber` | `#F59E0B` | `#FBBF24` |
| `--color-rose` | `#F87171` | `#FCA5A5` |

### Implementation

- Refactor existing hardcoded colors in components to use CSS custom properties or Tailwind classes that reference the theme variables
- `body` background, nav bar, cards, text colors, borders all switch via the custom properties
- Accent colors (teal) stay consistent across themes

## Accessibility Features

### Font Size

Three levels applied via `data-font-size` on `<html>`:

| Level | Base size | Scale |
|-------|-----------|-------|
| Small | 14px | 0.875rem |
| Medium | 16px (default) | 1rem |
| Large | 18px | 1.125rem |

### High Contrast

`[data-high-contrast]` selector increases contrast ratios to WCAG AAA (7:1+):
- Text becomes pure black/white
- Borders become more visible
- Focus indicators are bolder

### Reduced Motion

`[data-reduced-motion]` disables:
- The `fadeIn` animation on page transitions in App.jsx
- CSS transitions on hover states
- Respects `prefers-reduced-motion` media query as well

### Screen Reader Enhancements

When enabled:
- Skip-nav link added before main content
- Extra `aria-label` attributes on navigation landmarks, cards, and interactive elements
- `role` attributes on key sections

### Color Blind-Friendly

`[data-color-blind]` adjustments:
- Confidence indicators use icons/shapes alongside color (checkmark for normal, warning triangle for caution, X for critical)
- Amber/rose status colors shift to blue/orange that are distinguishable across protanopia, deuteranopia, and tritanopia
- Category badge borders get distinct patterns (solid, dashed, dotted) in addition to color

## Integration Points

### DoctorDashboard

- Reads `patientSortOrder` from settings to sort the patient list
- Reads `criticalScoreAlerts` to show/hide alert badges

### PatientDetailView

- Reads `autoExpandSessions` to set initial expand state of sessions
- Reads `autoSaveTranscriptions` to enable/disable auto-save behavior

### PatientDashboard

- Reads `hideCompletedActions` to filter completed action items
- Reads `reminderFrequency` for display purposes (no actual notification system yet)
- Reads `dataSharing` for display purposes (no actual data sharing controls yet)

## Storage

- Key: `medbridge-settings`
- Format: JSON object
- Location: `localStorage`
- Migration: defaults merge handles new settings automatically — no versioning needed
- Reset: clears the key entirely, context reverts to `DEFAULTS`

## Design Tokens (UI Controls)

All controls follow existing MedBridge design language:

- **Cards**: white bg (or dark card bg), `shadow-md`, `rounded-lg`, `p-6`
- **Section headings**: Georgia serif, navy/light text, border-bottom separator
- **Toggle switches**: 40x22px, teal when active, gray when inactive
- **Segmented controls**: gray bg container, white active segment with shadow
- **Dropdowns**: border with rounded corners, system font
- **Labels**: 14px semi-bold for setting name, 12px muted for description
- **Reset button**: ghost style, gray border, muted text
