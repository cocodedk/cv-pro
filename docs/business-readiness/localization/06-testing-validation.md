# 🧪 Testing & Validation Plan

*Quality Assurance for Danish Localization*

## Testing Strategy Overview

### 🎯 Quality Objectives
- **Functional Completeness**: 100% UI strings translated
- **Cultural Appropriateness**: 95% Danish user approval
- **Technical Performance**: <2s load time with localization
- **User Experience**: Seamless Danish interface experience

### 📊 Testing Pyramid
```
E2E Tests (5%)      ┌─────────────┐
                    │ User Journeys │
                    │ Cultural Fit   │
                    └─────────────┘
Integration Tests   ┌─────────────┐
(20%)              │ API Responses │
                    │ i18n System   │
                    └─────────────┘
Unit Tests         ┌─────────────┐
(75%)             │ Components     │
                    │ Translations  │
                    │ Formatters     │
                    └─────────────┘
```

## Test Categories

### 🔧 Unit Testing

#### Translation Key Testing
```typescript
// tests/i18n/keys.test.ts
describe('Translation Keys', () => {
  const languages = ['da-DK', 'en-GB']

  languages.forEach(lang => {
    describe(`Language: ${lang}`, () => {
      it('should have all required common keys', () => {
        const commonKeys = [
          'navigation.home',
          'navigation.create_cv',
          'actions.save',
          'actions.cancel'
        ]

        commonKeys.forEach(key => {
          expect(i18n.exists(key, { lng: lang })).toBe(true)
        })
      })

      it('should have all CV-specific keys', () => {
        const cvKeys = [
          'cv.sections.personal_info',
          'cv.fields.name',
          'cv.fields.email'
        ]

        cvKeys.forEach(key => {
          expect(i18n.exists(key, { lng: lang })).toBe(true)
        })
      })
    })
  })
})
```

#### Component Translation Testing
```typescript
// tests/components/Navigation.test.tsx
describe('Navigation Component', () => {
  it('should render Danish text when language is Danish', () => {
    i18n.changeLanguage('da-DK')

    render(<Navigation />)

    expect(screen.getByText('Hjem')).toBeInTheDocument()
    expect(screen.getByText('Opret CV')).toBeInTheDocument()
  })

  it('should render English text when language is English', () => {
    i18n.changeLanguage('en-GB')

    render(<Navigation />)

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Create CV')).toBeInTheDocument()
  })
})
```

#### Formatter Testing
```typescript
// tests/utils/formatters.test.ts
describe('Danish Formatters', () => {
  describe('Date Formatting', () => {
    it('should format dates in Danish format', () => {
      const date = new Date('2024-01-15')
      const formatted = formatDate(date, 'da-DK')

      // Danish format: 15. januar 2024
      expect(formatted).toMatch(/15\. januar 2024/)
    })
  })

  describe('Number Formatting', () => {
    it('should format numbers with Danish decimal separator', () => {
      const formatted = formatNumber(1234.56, 'da-DK')

      // Danish format: 1.234,56
      expect(formatted).toBe('1.234,56')
    })
  })

  describe('Currency Formatting', () => {
    it('should format currency in Danish Krone', () => {
      const formatted = formatCurrency(1234.56, 'da-DK')

      // Danish format: 1.234,56 kr.
      expect(formatted).toMatch(/1\.234,56/)
      expect(formatted).toMatch(/kr/)
    })
  })
})
```

### 🔗 Integration Testing

#### i18n System Testing
```typescript
// tests/integration/i18n.test.ts
describe('i18n Integration', () => {
  it('should load Danish translations', async () => {
    await i18n.changeLanguage('da-DK')

    expect(i18n.language).toBe('da-DK')
    expect(i18n.t('common:navigation.home')).toBe('Hjem')
  })

  it('should fallback to English when Danish key missing', async () => {
    await i18n.changeLanguage('da-DK')

    // Assuming 'nonexistent.key' doesn't exist in Danish
    const result = i18n.t('nonexistent.key', { fallbackLng: 'en-GB' })

    expect(result).not.toBe('nonexistent.key') // Should fallback
  })

  it('should handle interpolation correctly', () => {
    const result = i18n.t('welcome.message', {
      name: 'Jens',
      lng: 'da-DK'
    })

    expect(result).toBe('Velkommen, Jens!')
  })
})
```

#### API Response Testing
```typescript
// tests/integration/api.test.ts
describe('API Responses', () => {
  it('should return localized error messages', async () => {
    // Mock a request with Danish Accept-Language header
    const response = await request(app)
      .post('/api/cv')
      .set('Accept-Language', 'da-DK')
      .send({ invalid: 'data' })

    expect(response.status).toBe(400)
    expect(response.body.message).toMatch(/påkrævet/) // Danish for "required"
  })
})
```

### 🌐 End-to-End Testing

#### User Journey Testing
```typescript
// tests/e2e/cv-creation-danish.test.ts
describe('CV Creation - Danish', () => {
  beforeEach(() => {
    // Set Danish language
    cy.visit('/?lng=da-DK')
    cy.wait(1000) // Wait for translations to load
  })

  it('should create CV in Danish interface', () => {
    // Verify Danish UI
    cy.contains('Opret CV').should('be.visible')
    cy.contains('Personlige oplysninger').should('be.visible')

    // Fill form in Danish context
    cy.get('[data-testid="name-input"]').type('Mette Larsen')
    cy.get('[data-testid="email-input"]').type('mette.larsen@email.dk')
    cy.get('[data-testid="phone-input"]').type('+45 12 34 56 78')

    // Add experience
    cy.contains('Tilføj erfaring').click()
    cy.get('[data-testid="company-input"]').type('Danske Bank')
    cy.get('[data-testid="position-input"]').type('Softwareudvikler')

    // Submit
    cy.get('[data-testid="submit-button"]').click()

    // Verify success message
    cy.contains('CV gemt succesfuldt').should('be.visible')

    // Verify CV appears in list
    cy.visit('/list')
    cy.contains('Mette Larsen').should('be.visible')
  })

  it('should handle validation errors in Danish', () => {
    // Try to submit empty form
    cy.get('[data-testid="submit-button"]').click()

    // Should show Danish error messages
    cy.contains('Navn er påkrævet').should('be.visible')
    cy.contains('E-mail er påkrævet').should('be.visible')
  })
})
```

#### Language Switching Testing
```typescript
// tests/e2e/language-switching.test.ts
describe('Language Switching', () => {
  it('should switch between Danish and English', () => {
    // Start in Danish
    cy.visit('/?lng=da-DK')
    cy.contains('Opret CV').should('be.visible')

    // Switch to English
    cy.get('[data-testid="language-switcher"]').click()
    cy.contains('English').click()

    // Verify English UI
    cy.contains('Create CV').should('be.visible')
    cy.contains('Personal Information').should('be.visible')

    // Switch back to Danish
    cy.get('[data-testid="language-switcher"]').click()
    cy.contains('Dansk').click()

    // Verify Danish UI again
    cy.contains('Opret CV').should('be.visible')
  })

  it('should persist language preference', () => {
    // Set language to Danish
    cy.visit('/?lng=da-DK')
    cy.reload()

    // Should still be Danish
    cy.contains('Opret CV').should('be.visible')
  })
})
```

## User Testing Strategy

### 👥 Target User Groups

#### Primary Users (5-8 users)
- **Profile**: Danish professionals (25-45 years)
- **Criteria**: Mix of tech/non-tech, urban/rural
- **Recruitment**: LinkedIn Denmark, Danish Facebook groups

#### Secondary Users (3-5 users)
- **Profile**: Danish students/recent graduates
- **Criteria**: University students using CV tools
- **Recruitment**: Danish universities, student forums

### 📋 Testing Protocols

#### Remote User Testing
```typescript
// User testing script template
const danishUserTestScript = {
  introduction: `
    Hej! Tak for din deltagelse i testen.
    Vi tester en ny CV-værktøj på dansk.
    Alt du siger er fortroligt.
  `,

  tasks: [
    {
      name: 'Language Comprehension',
      description: 'Kan du forstå alle tekster på siden?',
      success_criteria: 'User can read and understand all text'
    },
    {
      name: 'CV Creation',
      description: 'Opret en CV som du normalt ville lave',
      success_criteria: 'User completes CV creation successfully'
    },
    {
      name: 'Cultural Appropriateness',
      description: 'Føles dette som et dansk produkt?',
      success_criteria: 'User feels product fits Danish culture'
    }
  ],

  questions: [
    'Hvor naturligt føles det danske sprog?',
    'Er der noget der føles forkert eller fremmed?',
    'Ville du bruge dette værktøj til jobsøgning?',
    'Hvad kunne gøres bedre?'
  ]
}
```

#### In-Person Lab Testing
- **Location**: Copenhagen or Aarhus
- **Duration**: 60-90 minutes per user
- **Compensation**: 300 DKK gift card
- **Equipment**: Screen recording, eye tracking (optional)

### 📊 User Testing Metrics

#### Task Completion Rate
- **Target**: >95% successful task completion
- **Measurement**: Tasks completed without assistance
- **Tracking**: Screen recording analysis

#### Time to Complete Tasks
- **Baseline**: Compare Danish vs English completion times
- **Acceptable**: <20% increase for Danish version
- **Tracking**: Session analytics

#### User Satisfaction Scores
- **SUS Score**: System Usability Scale (target >70)
- **NPS Score**: Net Promoter Score (target >50)
- **Cultural Fit**: 5-point Likert scale (target >4.5)

#### Error Rate
- **Translation Errors**: <1% misunderstood translations
- **Technical Errors**: <5% localization-related bugs
- **Recovery Rate**: >90% users recover from errors

## Cultural Validation

### 🎯 Cultural Assessment Framework

#### Danish Cultural Dimensions
```typescript
const danishCulturalAssessment = {
  equality: {
    question: 'Føles hierarkiet fladt og lige?',
    scale: ['Meget hierarkisk', 'Neutral', 'Meget lige'],
    target: 'Meget lige'
  },

  trust: {
    question: 'Stoler du på at dine data er sikre?',
    scale: ['Ingen tillid', 'Nogen tillid', 'Fuld tillid'],
    target: 'Fuld tillid'
  },

  workLifeBalance: {
    question: 'Fremmer dette produkt work-life balance?',
    scale: ['Arbejdsmæssigt', 'Neutral', 'Balanceret'],
    target: 'Balanceret'
  },

  directness: {
    question: 'Er kommunikationen direkte men høflig?',
    scale: ['For indirekte', 'Passende', 'For direkte'],
    target: 'Passende'
  }
}
```

#### Content Appropriateness
- **Business Terms**: Correct Danish business terminology
- **Professional Tone**: Appropriate formality level
- **Local Context**: Danish job market understanding
- **Visual Elements**: Culturally appropriate colors/icons

## Performance Testing

### Load Time Testing
```typescript
// tests/performance/localization.test.ts
describe('Localization Performance', () => {
  it('should load Danish translations within 2 seconds', () => {
    const startTime = performance.now()

    cy.visit('/?lng=da-DK')

    cy.window().then((win) => {
      // Wait for i18n to load
      cy.wrap(win.i18n).should('have.property', 'language', 'da-DK')

      const loadTime = performance.now() - startTime
      expect(loadTime).toBeLessThan(2000) // 2 seconds
    })
  })

  it('should not increase bundle size excessively', () => {
    // Check bundle analyzer output
    cy.task('getBundleSize').then((size) => {
      expect(size).toBeLessThan(500000) // 500KB
    })
  })
})
```

### Memory Usage Testing
```typescript
// tests/performance/memory.test.ts
describe('Memory Usage', () => {
  it('should not leak memory on language switches', () => {
    const initialMemory = performance.memory.usedJSHeapSize

    // Switch languages multiple times
    for (let i = 0; i < 10; i++) {
      cy.window().then((win) => {
        win.i18n.changeLanguage(i % 2 === 0 ? 'da-DK' : 'en-GB')
      })
    }

    cy.window().then((win) => {
      const finalMemory = win.performance.memory.usedJSHeapSize
      const memoryIncrease = finalMemory - initialMemory

      // Allow max 10MB increase for language switching
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
    })
  })
})
```

## Accessibility Testing

### Screen Reader Compatibility
```typescript
// tests/accessibility/screen-reader.test.ts
describe('Screen Reader Support', () => {
  it('should announce language changes', () => {
    // Use axe-core or similar for accessibility testing
    cy.injectAxe()
    cy.checkA11y()

    // Language switcher should have aria-label
    cy.get('[data-testid="language-switcher"]').should('have.attr', 'aria-label')
  })

  it('should work with Danish screen readers', () => {
    // Test with Danish text-to-speech
    cy.get('[data-testid="main-heading"]').should('have.attr', 'lang', 'da')
  })
})
```

## Automated Quality Gates

### Pre-deployment Checks
```typescript
// scripts/pre-deploy-checks.js
const preDeployChecks = {
  async run() {
    console.log('🔍 Running pre-deployment checks...')

    // Check translation completeness
    const completeness = await checkTranslationCompleteness()
    if (completeness < 95) {
      throw new Error(`Translation completeness too low: ${completeness}%`)
    }

    // Check for missing keys
    const missingKeys = await findMissingKeys()
    if (missingKeys.length > 0) {
      throw new Error(`Missing translation keys: ${missingKeys.join(', ')}`)
    }

    // Check bundle size
    const bundleSize = await getBundleSize()
    if (bundleSize > 500000) {
      throw new Error(`Bundle size too large: ${bundleSize} bytes`)
    }

    console.log('✅ All pre-deployment checks passed!')
  }
}
```

## Continuous Monitoring

### Production Monitoring
```typescript
// Error tracking for localization issues
if (typeof window !== 'undefined' && window.Sentry) {
  window.Sentry.configureScope((scope) => {
    scope.setTag('language', i18n.language)
    scope.setTag('missing_translations', missingKeysCount)
  })
}
```

### Analytics Tracking
```typescript
// Track localization usage
analytics.track('localization_usage', {
  language: i18n.language,
  missing_keys: missingKeysCount,
  load_time: translationLoadTime,
  user_satisfaction: userRating
})
```

## Success Criteria Summary

### Functional Success ✅
- [ ] 100% UI strings translated
- [ ] All features work in Danish
- [ ] Proper fallback to English
- [ ] No broken translations

### Performance Success ⚡
- [ ] <2s load time
- [ ] <5% bundle size increase
- [ ] <10MB memory usage
- [ ] <0.1% error rate

### User Success 👥
- [ ] >95% task completion rate
- [ ] >4.5/5 cultural appropriateness
- [ ] >70 SUS usability score
- [ ] >50 NPS satisfaction

### Quality Success 🎯
- [ ] <1% misunderstood translations
- [ ] <5% localization bugs
- [ ] >98% consistency score
- [ ] Zero accessibility issues

---

*Comprehensive testing ensures Danish users get a world-class, culturally-appropriate experience.* 🇩🇰🧪
