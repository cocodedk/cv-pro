# 📱 MobilePay Integration Plan

*Danish Payment System Integration for CV Pro*

## MobilePay Overview

### 📊 Market Context
- **Market Leader**: 60% of Danish mobile payments
- **User Base**: 4.2M active users (80% of Danish adults)
- **Trust Level**: Extremely high - preferred over credit cards
- **Business Impact**: Essential for Danish B2B SaaS adoption

### 🎯 Why MobilePay Matters
- **User Expectation**: Danish users expect MobilePay integration
- **Conversion Boost**: 3x higher conversion vs international payments
- **Trust Signal**: Shows understanding of Danish market
- **Competitive Edge**: Most international tools don't support it

## Integration Strategy

### Phase 1: Foundation (Month 1)
- Research MobilePay APIs and requirements
- Set up developer accounts and sandbox
- Design payment flow for CV Pro
- Legal compliance review

### Phase 2: Implementation (Month 2)
- Backend payment processing integration
- Frontend payment UI/UX design
- Testing in sandbox environment
- Error handling and edge cases

### Phase 3: Launch & Optimization (Month 3)
- Production deployment
- User acceptance testing
- Performance monitoring
- Conversion optimization

## Technical Architecture

### 📋 API Integration

#### MobilePay API Overview
```typescript
// MobilePay API endpoints we'll use
const mobilePayAPI = {
  // Create payment request
  createPayment: 'POST /v1/payments',

  // Check payment status
  getPaymentStatus: 'GET /v1/payments/{paymentId}',

  // Refund payment
  refundPayment: 'POST /v1/payments/{paymentId}/refunds',

  // Webhooks for status updates
  webhooks: 'POST /webhooks/payment-updates'
}
```

#### Payment Flow Architecture
```
User clicks "Subscribe" → Create MobilePay payment → Redirect to MobilePay app →
User approves payment → Webhook notification → Activate subscription → Success page
```

### 🔧 Backend Implementation

#### Payment Service
```python
# backend/services/mobile_pay.py
class MobilePayService:
    def __init__(self):
        self.api_key = os.getenv('MOBILEPAY_API_KEY')
        self.merchant_id = os.getenv('MOBILEPAY_MERCHANT_ID')
        self.base_url = 'https://api.mobilepay.dk/v1'

    async def create_payment(
        self,
        amount: int,  # In øre (100 = 1 DKK)
        description: str,
        user_id: str,
        plan_id: str
    ) -> dict:
        """Create MobilePay payment request."""

        payment_data = {
            "amount": amount,
            "currency": "DKK",
            "description": description,
            "merchantId": self.merchant_id,
            "notificationUrl": f"{os.getenv('BASE_URL')}/webhooks/mobilepay",
            "reference": f"user_{user_id}_plan_{plan_id}",
            "paymentpointId": os.getenv('MOBILEPAY_PAYMENT_POINT_ID')
        }

        # API call to MobilePay
        response = await self._make_request('POST', '/payments', payment_data)

        # Store payment intent in database
        await self._store_payment_intent(
            payment_id=response['paymentId'],
            user_id=user_id,
            amount=amount,
            plan_id=plan_id,
            status='pending'
        )

        return {
            "payment_id": response['paymentId'],
            "mobilepay_url": response['mobilePayAppRedirectUri']
        }

    async def handle_webhook(self, webhook_data: dict):
        """Process MobilePay webhook notifications."""
        payment_id = webhook_data['paymentId']
        status = webhook_data['status']

        # Update payment status
        await self._update_payment_status(payment_id, status)

        if status == 'captured':
            # Activate user subscription
            user_id = await self._get_user_from_payment(payment_id)
            await self._activate_subscription(user_id)
        elif status == 'failed':
            # Handle failed payment
            await self._handle_failed_payment(payment_id)
```

#### Database Schema
```sql
-- MobilePay payment tracking
CREATE TABLE mobilepay_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id TEXT UNIQUE NOT NULL,           -- MobilePay payment ID
    user_id UUID NOT NULL REFERENCES auth.users(id),
    plan_id TEXT NOT NULL,                      -- Subscription plan
    amount INTEGER NOT NULL,                    -- Amount in øre
    currency TEXT NOT NULL DEFAULT 'DKK',
    status TEXT NOT NULL,                       -- pending, captured, failed, refunded
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    captured_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ
);

-- Subscription plans
CREATE TABLE subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price_dkk INTEGER NOT NULL,                 -- Price in øre
    features JSONB NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 🎨 Frontend Implementation

#### Payment Component
```tsx
// frontend/src/components/MobilePayButton.tsx
import { useState } from 'react'
import { loadMobilePaySDK } from '../utils/mobilePaySDK'

interface MobilePayButtonProps {
  amount: number          // In DKK
  description: string
  planId: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
}

export default function MobilePayButton({
  amount,
  description,
  planId,
  onSuccess,
  onError
}: MobilePayButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePayment = async () => {
    setLoading(true)

    try {
      // Create payment on backend
      const response = await fetch('/api/payments/mobilepay/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to øre
          description,
          planId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment')
      }

      const { payment_id, mobilepay_url } = await response.json()

      // Redirect to MobilePay
      window.location.href = mobilepay_url

    } catch (error) {
      console.error('Payment creation failed:', error)
      onError('Betaling kunne ikke oprettes')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="mobilepay-button"
    >
      {loading ? (
        'Opretter betaling...'
      ) : (
        <>
          <MobilePayLogo />
          <span>Betaling med MobilePay</span>
        </>
      )}
    </button>
  )
}
```

#### MobilePay Success Page
```tsx
// frontend/src/pages/MobilePaySuccess.tsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

export default function MobilePaySuccess() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading')

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const paymentId = searchParams.get('paymentId')

      if (!paymentId) {
        setStatus('failed')
        return
      }

      try {
        const response = await fetch(`/api/payments/mobilepay/status/${paymentId}`)

        if (response.ok) {
          const { status: paymentStatus } = await response.json()

          if (paymentStatus === 'captured') {
            setStatus('success')
            // Redirect to dashboard or show success message
          } else {
            setStatus('failed')
          }
        } else {
          setStatus('failed')
        }
      } catch (error) {
        console.error('Status check failed:', error)
        setStatus('failed')
      }
    }

    checkPaymentStatus()
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="payment-processing">
        <h2>Behandler betaling...</h2>
        <p>Venligst vent mens vi bekræfter din MobilePay betaling.</p>
        <Spinner />
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="payment-success">
        <CheckIcon />
        <h2>Betaling gennemført!</h2>
        <p>Dit abonnement er nu aktivt. Velkommen til CV Pro Premium!</p>
        <Link to="/dashboard">Fortsæt til dashboard</Link>
      </div>
    )
  }

  return (
    <div className="payment-failed">
      <ErrorIcon />
      <h2>Betaling fejlede</h2>
      <p>Der skete en fejl med din MobilePay betaling. Prøv igen eller kontakt support.</p>
      <Link to="/pricing">Tilbage til priser</Link>
    </div>
  )
}
```

## Subscription Plans

### 📊 Pricing Strategy
- **Freemium**: Basic features free
- **Premium**: 49 DKK/month (4.99 EUR) - AI features, unlimited CVs
- **Pro**: 99 DKK/month (9.99 EUR) - Advanced analytics, priority support

### 🎯 Plan Features
```typescript
const subscriptionPlans = {
  premium: {
    id: 'premium',
    name: 'CV Pro Premium',
    price: 499,  // 49.99 DKK in øre
    currency: 'DKK',
    features: [
      'Unlimited CV creation',
      'AI-powered cover letters',
      'Advanced templates',
      'Priority support',
      'Export to all formats'
    ]
  },
  pro: {
    id: 'pro',
    name: 'CV Pro Professionel',
    price: 999,  // 99.99 DKK in øre
    currency: 'DKK',
    features: [
      'All Premium features',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'White-label options'
    ]
  }
}
```

## Testing Strategy

### 🧪 Sandbox Testing
- Use MobilePay sandbox environment
- Test payment flows with test cards
- Verify webhook handling
- Test error scenarios

### 👥 User Acceptance Testing
- 5-10 Danish users test payment flow
- Verify MobilePay app integration
- Test on different devices
- Validate success/failure scenarios

### 🔒 Security Testing
- Verify payment data encryption
- Test webhook signature validation
- Check PCI compliance
- Audit payment flow security

## Compliance & Legal

### 📋 Regulatory Requirements
- **PSD2 Compliance**: Strong customer authentication
- **PCI DSS**: Payment card industry standards
- **Data Protection**: GDPR compliance for payment data
- **Consumer Rights**: Danish consumer protection laws

### 🔐 Security Measures
- **Encryption**: All payment data encrypted at rest/transit
- **Tokenization**: Never store full payment details
- **Audit Trail**: Complete payment transaction logs
- **Fraud Prevention**: Integration with MobilePay fraud detection

## Success Metrics

### 💰 Conversion Metrics
- **Payment Completion**: >95% successful payments
- **Checkout Abandonment**: <5% abandonment rate
- **Subscription Retention**: >85% monthly retention

### 👥 User Experience
- **Ease of Use**: >4.5/5 user satisfaction
- **Trust Level**: >90% user confidence in payment security
- **Speed**: <30 seconds average payment completion

### 🔧 Technical Performance
- **API Reliability**: >99.9% uptime
- **Webhook Delivery**: >99.5% successful deliveries
- **Error Rate**: <0.1% payment processing errors

## Implementation Timeline

### Week 1-2: Setup & Design
- [ ] MobilePay developer account setup
- [ ] Sandbox environment configuration
- [ ] Payment flow design and UX mockups
- [ ] Backend API endpoint planning

### Week 3-4: Development
- [ ] Backend payment service implementation
- [ ] Frontend payment components
- [ ] Webhook handling for status updates
- [ ] Error handling and edge cases

### Week 5-6: Testing & Launch
- [ ] Sandbox testing with test payments
- [ ] User acceptance testing
- [ ] Production deployment preparation
- [ ] Go-live monitoring and support

## Budget Breakdown

- **MobilePay Integration**: €300 (API setup, development)
- **Security Audit**: €200 (PCI compliance review)
- **UI/UX Design**: €200 (Payment flow design)
- **Testing**: €150 (User testing incentives)
- **Legal Review**: €100 (Payment compliance)
- **Total**: €950

## Risk Mitigation

### Integration Risks
- **API Changes**: MobilePay API updates
- **Mitigation**: Regular API monitoring, flexible architecture

### User Adoption Risks
- **App Switching**: Users leaving to open MobilePay
- **Mitigation**: Clear instructions, seamless flow

### Technical Risks
- **Webhook Failures**: Network issues affecting payments
- **Mitigation**: Retry logic, manual status checking

### Regulatory Risks
- **Compliance Changes**: Payment regulation updates
- **Mitigation**: Legal monitoring, conservative approach

## Monitoring & Analytics

### Payment Analytics
```typescript
// Track payment events
analytics.track('payment_initiated', {
  amount: amount,
  currency: 'DKK',
  plan: planId,
  method: 'mobilepay'
})

analytics.track('payment_completed', {
  paymentId: paymentId,
  duration: completionTime,
  userId: userId
})
```

### Performance Monitoring
- Payment success rates
- Average completion time
- Error rates by type
- User drop-off points

### Business Metrics
- Conversion rate by plan
- Customer acquisition cost
- Lifetime value tracking
- Churn rate analysis

---

*MobilePay integration is the key to unlocking Danish market adoption - it's not just a payment method, it's a cultural expectation.* 🇩🇰💳
