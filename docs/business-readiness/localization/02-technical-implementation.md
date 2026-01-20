# 🔧 Technical Implementation Plan

*i18n Architecture for Danish Localization*

## Status

- ✅ i18n scaffolding, translation resources, and language switcher implemented in the frontend.
- 🟡 Tests and advanced optimizations (lazy loading, SEO) are pending.

## Technology Stack

### Core Libraries

#### React i18n Solution
```json
{
  "dependencies": {
    "i18next": "^23.10.1",
    "react-i18next": "^14.1.0"
  }
}
```

#### Why This Stack?
- **React Integration**: Seamless React component integration
- **Local Resources**: Translation files bundled via Vite
- **Simple Detection**: LocalStorage + navigator language
- **Mature**: Battle-tested in production applications

### Alternative Considerations
- **Next-intl**: Modern, type-safe, but requires Next.js
- **react-intl**: Facebook's solution, more complex
- **Lingui**: Compile-time extraction, smaller bundle

## Architecture Design

### 📁 File Structure

```
frontend/
├── src/
│   ├── locales/
│   │   ├── da-DK/
│   │   │   ├── common.json      # General UI strings
│   │   │   ├── navigation.json  # Navigation labels
│   │   │   ├── cv.json          # CV-specific terms and labels
│   │   │   └── ...              # Other namespaces
│   │   └── en-GB/               # Same structure for English
│   │
│   ├── i18n/
│   │   ├── index.ts             # i18n configuration
│   │   └── resources.ts         # Resource loading + namespace list
│   │
│   ├── components/
│   │   └── LanguageSwitcher.tsx # Language selection component
```

### 🔧 Configuration Files

#### i18n/index.ts - Main Configuration
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { namespaces, resources, supportedLngs } from './resources'

const normalizeLanguage = (language: string) => {
  const normalized = language.toLowerCase()
  if (normalized.startsWith('da')) return 'da-DK'
  if (normalized.startsWith('en')) return 'en-GB'
  return 'en-GB'
}

const getInitialLanguage = () => {
  const stored = window.localStorage.getItem('cv-pro-language')
  if (stored) return normalizeLanguage(stored)
  return normalizeLanguage(window.navigator?.language || '')
}

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: 'en-GB',
  supportedLngs,
  defaultNS: 'common',
  ns: namespaces,
  interpolation: {
    escapeValue: false, // React handles XSS prevention
  },
  initImmediate: false,
  react: {
    useSuspense: false,
  },
})

export default i18n
```

#### Language Switcher Component
```tsx
import { useTranslation } from 'react-i18next'
import { normalizeLanguage } from '../i18n'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('navigation')
  const currentLanguage = normalizeLanguage(i18n.language)

  return (
    <div>
      <label className="sr-only" htmlFor="language-switcher">
        {t('language')}
      </label>
      <select
        id="language-switcher"
        value={currentLanguage}
        onChange={event => i18n.changeLanguage(normalizeLanguage(event.target.value))}
        aria-label={t('language')}
      >
        <option value="da-DK">Dansk</option>
        <option value="en-GB">English</option>
      </select>
    </div>
  )
}
```

## Implementation Phases

### Phase 1: Infrastructure Setup (Week 1)

#### 1.1 Install Dependencies
```bash
npm install i18next react-i18next i18next-browser-languagedetector i18next-http-backend
npm install --save-dev @types/i18next
```

#### 1.2 Create Translation Files Structure
- [x] Create `src/locales/` directory structure
- [x] Extract existing English strings to translation files
- [ ] Set up TypeScript types for translations (optional)

#### 1.3 Initialize i18n
- [x] Create i18n configuration file
- [x] Integrate with React app (in `main.tsx`)
- [x] Add language detection and persistence logic

#### 1.4 Basic Component Integration
- [x] Create `LanguageSwitcher` component
- [x] Add language switcher to navigation
- [ ] Test basic translation functionality

### Phase 2: Content Translation (Week 2-3)

#### 2.1 String Extraction
- [x] Audit all hardcoded strings in components
- [x] Extract strings to appropriate translation files
- [x] Replace hardcoded strings with `t()` calls

#### 2.2 Professional Translation
- [x] In-house Danish translation pass
- [ ] Optional external translation review

#### 2.3 Translation Integration
- [x] Import translated files into application
- [ ] Test all translations display correctly
- [x] Implement fallback handling

### Phase 3: Advanced Features (Week 4)

#### 3.1 Dynamic Content
- [ ] Handle dynamic strings with interpolation
- [ ] Implement pluralization for Danish
- [ ] Add date/number formatting

#### 3.2 SEO & Meta Tags
- [ ] Localized page titles and meta descriptions
- [ ] hreflang tags for search engines
- [ ] Open Graph tags for social sharing

#### 3.3 Performance Optimization
- [ ] Lazy loading of translation files
- [ ] Bundle splitting for different languages
- [ ] CDN caching strategy

## Component Integration Patterns

### Basic Translation
```tsx
import { useTranslation } from 'react-i18next'

function Navigation() {
  const { t } = useTranslation('common')

  return (
    <nav>
      <Link to="/">{t('navigation.home')}</Link>
      <Link to="/cv">{t('navigation.create_cv')}</Link>
    </nav>
  )
}
```

### With Interpolation
```tsx
function WelcomeMessage({ userName }: { userName: string }) {
  const { t } = useTranslation('common')

  return (
    <div>
      {t('welcome.message', { name: userName })}
    </div>
  )
}

// Translation: "welcome.message": "Velkommen, {{name}}!"
```

### Pluralization
```tsx
function CVCount({ count }: { count: number }) {
  const { t } = useTranslation('cv')

  return (
    <div>
      {t('cv.count', { count })}
    </div>
  )
}

// Danish translations:
// "cv.count_zero": "Ingen CV'er"
// "cv.count_one": "1 CV"
// "cv.count_other": "{{count}} CV'er"
```

### Conditional Namespaces
```tsx
function AuthForm() {
  const { t } = useTranslation('auth')

  return (
    <form>
      <input
        type="email"
        placeholder={t('fields.email')}
      />
      <button type="submit">
        {t('actions.sign_in')}
      </button>
    </form>
  )
}
```

## Danish-Specific Technical Considerations

### Character Encoding
- **UTF-8**: Full support for Danish characters (æ, ø, å)
- **Font Support**: Ensure fonts include Danish glyphs
- **Database**: UTF-8 encoding for translation storage

### Text Direction
- **LTR**: Danish is left-to-right (same as English)
- **No RTL**: No special handling needed

### Date & Number Formatting

#### Danish Locale Formatting
```typescript
// utils/formatters.ts
export const formatDate = (date: Date, locale: string = 'da-DK'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

export const formatNumber = (num: number, locale: string = 'da-DK'): string => {
  return new Intl.NumberFormat(locale).format(num)
}

export const formatCurrency = (amount: number, locale: string = 'da-DK'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'DKK'
  }).format(amount)
}
```

### Keyboard & Input Handling
- **Danish Keyboard**: Support for æ, ø, å characters
- **Auto-capitalization**: Appropriate for Danish names
- **Input Validation**: Danish phone number formats

## Testing Strategy

### Unit Tests
```typescript
// Translation key existence
describe('i18n', () => {
  it('should have all required translation keys', () => {
    const { t } = useTranslation()
    expect(t('navigation.home')).toBeDefined()
    expect(t('cv.sections.personal_info')).toBeDefined()
  })
})
```

### Integration Tests
```typescript
// Language switching
describe('LanguageSwitcher', () => {
  it('should change language when clicked', () => {
    render(<LanguageSwitcher />)
    const danishButton = screen.getByText('Dansk')

    fireEvent.click(danishButton)

    expect(i18n.language).toBe('da-DK')
  })
})
```

### E2E Tests
```typescript
// Full user journey in Danish
describe('CV Creation in Danish', () => {
  it('should create CV with Danish interface', () => {
    // Set language to Danish
    cy.visit('/?lng=da-DK')

    // Verify Danish UI elements
    cy.contains('Opret CV').should('be.visible')
    cy.contains('Personlige oplysninger').should('be.visible')

    // Fill form and submit
    cy.get('[data-testid="name-input"]').type('Jens Jensen')
    cy.get('[data-testid="submit-button"]').click()

    // Verify success message in Danish
    cy.contains('CV gemt succesfuldt').should('be.visible')
  })
})
```

## Performance Optimization

### Bundle Size Management
- **Code Splitting**: Load translations on-demand
- **Compression**: Gzip translation files
- **Caching**: Browser cache translation files

### Runtime Performance
- **Lazy Loading**: Load translations as needed
- **Memory Management**: Clean up unused translations
- **Re-rendering**: Minimize re-renders on language change

## Deployment Strategy

### Environment Configuration
```typescript
// Different configs for different environments
const config = {
  development: {
    debug: true,
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  },
  production: {
    debug: false,
    loadPath: 'https://cdn.example.com/locales/{{lng}}/{{ns}}.json'
  }
}
```

### CDN Integration
- **Translation Files**: Serve from CDN for faster loading
- **Versioning**: Cache busting for translation updates
- **Fallback**: Local fallback if CDN fails

## Monitoring & Maintenance

### Analytics Tracking
```typescript
// Track language usage
analytics.track('language_changed', {
  from: previousLanguage,
  to: newLanguage,
  userId: user.id
})
```

### Error Monitoring
```typescript
// Track missing translations
i18n.on('missingKey', (lng, ns, key) => {
  errorReporting.captureException(new Error(`Missing translation: ${lng}:${ns}:${key}`))
})
```

### Translation Updates
- **Process**: Pull requests for translation changes
- **Review**: Native speaker review required
- **Deployment**: Automated deployment to CDN

## Success Metrics

### Technical Metrics
- **Bundle Size**: <5% increase from translations
- **Load Time**: <100ms translation loading
- **Memory Usage**: <2MB additional memory
- **Error Rate**: <0.1% translation errors

### User Experience Metrics
- **Language Detection**: 95% accurate auto-detection
- **Switching Time**: <500ms language change
- **Fallback Rate**: <1% fallback to English
- **User Satisfaction**: >95% satisfaction with Danish UI

---

*Technical implementation is the foundation - getting the i18n architecture right ensures scalable, maintainable localization.* 🔧🌐
