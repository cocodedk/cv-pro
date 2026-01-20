# 🔧 Technical Implementation Plan

*i18n Architecture for Danish Localization*

## Technology Stack

### Core Libraries

#### React i18n Solution
```json
{
  "dependencies": {
    "i18next": "^23.0.0",
    "react-i18next": "^13.0.0",
    "i18next-browser-languagedetector": "^7.0.0",
    "i18next-http-backend": "^2.0.0"
  }
}
```

#### Why This Stack?
- **React Integration**: Seamless React component integration
- **Browser Detection**: Automatic language detection
- **HTTP Backend**: Dynamic translation loading
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
│   │   │   ├── common.json      # Navigation, buttons, general UI
│   │   │   ├── cv.json          # CV-specific terms and labels
│   │   │   ├── auth.json        # Authentication messages
│   │   │   ├── errors.json      # Error messages and validation
│   │   │   ├── help.json        # Help text and tooltips
│   │   │   └── marketing.json   # Landing page content
│   │   └── en-GB/               # Same structure for English
│   │
│   ├── i18n/
│   │   ├── index.ts             # i18n configuration
│   │   ├── config.ts            # Language detection and settings
│   │   └── types.ts             # TypeScript types for translations
│   │
│   ├── components/
│   │   ├── LanguageSwitcher.tsx # Language selection component
│   │   └── LocalizedText.tsx    # Wrapper for translated content
│   │
│   └── utils/
│       └── formatters.ts        # Localized number/date formatting
```

### 🔧 Configuration Files

#### i18n/index.ts - Main Configuration
```typescript
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import HttpBackend from 'i18next-http-backend'

import daCommon from '../locales/da-DK/common.json'
import enCommon from '../locales/en-GB/common.json'
// ... other imports

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    // Language detection
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng'
    },

    // Language configuration
    lng: 'da-DK',           // Default to Danish
    fallbackLng: 'en-GB',   // Fallback to English
    supportedLngs: ['da-DK', 'en-GB'],

    // Namespaces
    defaultNS: 'common',
    ns: ['common', 'cv', 'auth', 'errors', 'help'],

    // Resources (fallback for critical strings)
    resources: {
      'da-DK': {
        common: daCommon,
        // ... other namespaces
      },
      'en-GB': {
        common: enCommon,
        // ... other namespaces
      }
    },

    // Technical settings
    interpolation: {
      escapeValue: false, // React handles XSS prevention
    },

    // Debug (disable in production)
    debug: process.env.NODE_ENV === 'development',

    // React integration
    react: {
      useSuspense: false,
    }
  })

export default i18n
```

#### Language Switcher Component
```tsx
import { useTranslation } from 'react-i18next'

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()

  const languages = [
    { code: 'da-DK', name: 'Dansk', flag: '🇩🇰' },
    { code: 'en-GB', name: 'English', flag: '🇬🇧' }
  ]

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode)
  }

  return (
    <div className="language-switcher">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code)}
          className={`language-option ${
            i18n.language === lang.code ? 'active' : ''
          }`}
        >
          <span className="flag">{lang.flag}</span>
          <span className="name">{lang.name}</span>
        </button>
      ))}
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
- [ ] Create `src/locales/` directory structure
- [ ] Extract existing English strings to translation files
- [ ] Set up TypeScript types for translations

#### 1.3 Initialize i18n
- [ ] Create i18n configuration file
- [ ] Integrate with React app (in `main.tsx`)
- [ ] Add language detection logic

#### 1.4 Basic Component Integration
- [ ] Create `LanguageSwitcher` component
- [ ] Add language switcher to navigation
- [ ] Test basic translation functionality

### Phase 2: Content Translation (Week 2-3)

#### 2.1 String Extraction
- [ ] Audit all hardcoded strings in components
- [ ] Extract strings to appropriate translation files
- [ ] Replace hardcoded strings with `t()` calls

#### 2.2 Professional Translation
- [ ] Send translation files to Danish translators
- [ ] Include context and screenshots
- [ ] Review and approve translations

#### 2.3 Translation Integration
- [ ] Import translated files into application
- [ ] Test all translations display correctly
- [ ] Implement fallback handling

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
