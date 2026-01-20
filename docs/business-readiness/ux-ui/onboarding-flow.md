# Onboarding Flow: Smooth First Impressions

*Elon Musk's Onboarding: Instant value – Tesla's test drive hooks users.*

## Overview
Current onboarding is basic. Danes value efficiency; simplify to get users creating CVs fast.

## Detailed Plan

### Week 1-2: Flow Audit
- **Tasks**:
  - Map current journey (auth → intro → form).
  - Identify drop-offs (analytics).
  - Research Danish preferences (quick, guided).
- **Deliverables**: Journey map.
- **Resources**: UX analyst (€1k).
- **Risks**: Too many steps; mitigation: Simplify.

### Week 3-4: Guided Tours
- **Tasks**:
  - Step-by-step walkthrough (tooltips, highlights).
  - Contextual help (AI coach).
  - Progress indicators (CV completion %).
- **Deliverables**: Tour component.
- **Resources**: Tour libraries.
- **Risks**: Annoying popups; mitigation: Optional, dismissible.

### Week 5-6: Smart Defaults
- **Tasks**:
  - Pre-fill Danish fields (location, language).
  - Profile import on signup.
  - Auto-save drafts.
- **Deliverables**: Enhanced signup.
- **Resources**: Backend tweaks.
- **Risks**: Assumptions wrong; mitigation: Editable defaults.

### Week 7-8: Testing & Optimization
- **Tasks**:
  - A/B tests (short vs long onboarding).
  - Danish user trials.
  - Conversion tracking.
- **Deliverables**: Optimized flow.
- **Resources**: Testers (€1k).
- **Success Metric**: 50% faster time-to-first-CV.

## Implementation Steps
1. **Week 1**: Map user journey (use Hotjar for heatmaps).
2. **Week 2**: Design tours (react-joyride library).
3. **Week 3**: Add progress bars (react-progress-bar).
4. **Week 4**: Smart defaults (geolocate Denmark, set language).
5. **Week 5**: Auto-save drafts (localStorage + sync).
6. **Week 6**: Profile import on signup (LinkedIn quick import).
7. **Week 7**: A/B test flows (short vs. detailed).
8. **Week 8**: Optimize based on data (reduce drop-offs).

## Required Tools/Libraries
- Hotjar (journey mapping)
- React Joyride (tours)
- React Progress Bar (indicators)
- LocalForage (auto-save)

## Code Example
```tsx
// Onboarding tour
import Joyride from 'react-joyride'

const steps = [
  {
    target: '.cv-form',
    content: 'Start by filling your basics here!'
  },
  {
    target: '.ai-assist',
    content: 'AI can help generate text.'
  }
]

export default function OnboardingTour() {
  return <Joyride steps={steps} run={true} />
}
```

## Testing Checklist
- [ ] Tours not intrusive (skippable)
- [ ] Progress accurate
- [ ] Defaults correct for Danes
- [ ] Signup < 2 minutes
- [ ] Retention +20%

## Dependencies
- Analytics setup (drop-off tracking)
- Danish location data
- User testing

**Timeline**: 8 weeks. **Budget**: €8k. **Impact**: Higher retention from day one.
