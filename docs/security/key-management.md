# 🔐 Encryption Key Management Guide

## Overview

CV Pro uses AES-256 encryption to protect sensitive personal data in compliance with GDPR. This document outlines secure key generation, storage, rotation, and recovery procedures.

## Key Specifications

- **Algorithm**: AES-256-CBC (Advanced Encryption Standard, 256-bit)
- **Key Length**: 32 bytes (256 bits)
- **Key Derivation**: PBKDF2 with SHA-256, 100,000 iterations
- **Storage Format**: Base64-encoded for environment variables

## Key Generation

### Automated Generation
```bash
# Generate secure keys for development
python scripts/generate-encryption-key.py

# This creates:
# - secure-keys/encryption-key-primary.env
# - secure-keys/encryption-key-backup.env
```

### Manual Generation (Alternative)
```bash
# Generate 32 random bytes and base64 encode
openssl rand -base64 32

# Or using Python
python -c "import secrets, base64; print(base64.b64encode(secrets.token_bytes(32)).decode())"
```

## Key Storage

### ❌ NEVER Store Keys In:
- Source code
- Version control systems (Git)
- Configuration files committed to repositories
- Plain text files
- Email or chat messages

### ✅ Secure Storage Options:

#### 1. Environment Variables
```bash
# Production
export ENCRYPTION_KEY="your-base64-encoded-key-here"

# Development (.env file - ensure .gitignore)
ENCRYPTION_KEY=your-base64-encoded-key-here
```

#### 2. Key Management Services
- **AWS KMS**: Store encrypted keys with automatic rotation
- **Google Cloud KMS**: Managed key encryption service
- **Azure Key Vault**: Secure key storage with access policies
- **HashiCorp Vault**: Enterprise secret management

#### 3. Hardware Security Modules (HSM)
- **AWS CloudHSM**: Dedicated hardware security
- **YubiKey**: Hardware token for key storage
- **TPM Chips**: Trusted Platform Module

## Key Rotation

### Rotation Frequency
- **Production**: Every 90 days
- **High-security environments**: Every 30 days
- **After security incidents**: Immediate rotation

### Rotation Process
```bash
# 1. Generate new keys
python scripts/generate-encryption-key.py

# 2. Update environment variables
export ENCRYPTION_KEY="new-primary-key"

# 3. Run data migration (decrypt with old key, encrypt with new key)
python scripts/migrate-encryption-keys.py

# 4. Update backup key
export ENCRYPTION_KEY_BACKUP="new-backup-key"

# 5. Test decryption with both keys
# 6. Remove old keys from storage
```

## Backup and Recovery

### Primary Key Backup
- Store backup key in separate secure location
- Use different storage method than primary key
- Test backup key decryption monthly
- Include backup key in disaster recovery plans

### Recovery Procedures

#### Emergency Key Recovery
```bash
# 1. Access secure backup storage
# 2. Retrieve backup key
# 3. Set environment variable
export ENCRYPTION_KEY="backup-key-here"

# 4. Verify data access
# 5. Generate new primary key
# 6. Migrate data to new key
```

#### Key Compromise Response
1. **Immediate**: Generate new keys
2. **Stop application**: Prevent further data encryption
3. **Assess breach**: Determine what data was exposed
4. **Notify affected users**: If personal data was compromised
5. **Migrate data**: Re-encrypt with new keys
6. **Security audit**: Review access logs and permissions

## Environment-Specific Keys

### Development
```bash
# Use separate key for development
ENCRYPTION_KEY=dev-key-base64-here
```

### Staging
```bash
# Use production-like key for staging
ENCRYPTION_KEY=staging-key-base64-here
```

### Production
```bash
# Use strongest security for production
ENCRYPTION_KEY=prod-key-base64-here
ENCRYPTION_KEY_BACKUP=prod-backup-key-base64-here
```

## Monitoring and Alerts

### Key Usage Monitoring
- Log encryption/decryption operations
- Alert on unusual patterns
- Monitor key access frequency
- Track key rotation dates

### Security Alerts
- Key access from unusual locations
- Multiple failed decryption attempts
- Key rotation overdue
- Environment variable not set

## Compliance Considerations

### GDPR Compliance
- Encryption protects personal data at rest
- Keys never stored with encrypted data
- Data remains recoverable with proper key access
- Audit trail of key operations

### Data Residency
- Keys stored in same region as data when possible
- Cross-border key transfer requires additional security
- Local key management for EU data residency

## Testing Key Management

### Unit Tests
```python
# Test encryption/decryption cycle
def test_encryption_cycle():
    test_data = "sensitive personal information"
    encrypted = DataEncryption.encrypt_data(test_data)
    decrypted = DataEncryption.decrypt_data(encrypted)
    assert decrypted == test_data
```

### Integration Tests
```python
# Test full application flow
def test_cv_encryption():
    cv_data = {"personal_info": {"name": "John Doe", "email": "john@example.com"}}
    encrypted_cv = encrypt_cv_data(cv_data)
    decrypted_cv = decrypt_cv_data(encrypted_cv)
    assert decrypted_cv == cv_data
```

## Emergency Contacts

Keep contact information for:
- Key recovery team
- Security incident response
- External security consultants
- Legal counsel for data breaches

## Additional Security Measures

### Envelope Encryption
- Encrypt data with data key
- Encrypt data key with master key
- Reduces key exposure

### Key Wrapping
- Wrap keys with master key before storage
- Unwrap only when needed
- Additional layer of protection

### Access Controls
- Principle of least privilege
- Multi-factor authentication for key access
- Audit logging of all key operations

---

## Quick Reference

### Generate Keys
```bash
python scripts/generate-encryption-key.py
```

### Set Environment
```bash
export ENCRYPTION_KEY="your-generated-key"
```

### Test Encryption
```bash
python -c "from backend.app_helpers.encryption import DataEncryption; print('Key loaded successfully')"
```

### Key Rotation Reminder
Set calendar alerts for key rotation every 90 days.

---

**⚠️ SECURITY NOTICE**: The security of encrypted data depends entirely on key security. Follow these procedures diligently to maintain GDPR compliance and data protection.
