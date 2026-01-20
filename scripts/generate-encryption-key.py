#!/usr/bin/env python3
"""
Encryption Key Generation Script for CV Pro GDPR Compliance

This script generates cryptographically secure encryption keys for AES-256 encryption
and provides secure storage recommendations.

Usage:
    python generate-encryption-key.py

Output:
    - Primary encryption key (32 bytes/256 bits)
    - Backup key (same length, different random data)
    - Key fingerprint for verification
    - Secure storage instructions
"""

import os
import secrets
import base64
import hashlib
from pathlib import Path
from datetime import datetime


def generate_secure_key(length: int = 32) -> bytes:
    """Generate a cryptographically secure random key."""
    return secrets.token_bytes(length)


def generate_key_fingerprint(key: bytes) -> str:
    """Generate a fingerprint for key verification."""
    return hashlib.sha256(key).hexdigest()[:16].upper()


def save_key_securely(key: bytes, filename: str, description: str) -> None:
    """Save key to file with secure permissions."""
    # Encode key as base64 for easier storage
    encoded_key = base64.b64encode(key).decode()

    # Create key file content
    content = f"""# CV Pro {description}
# Generated: {datetime.now().isoformat()}
# Fingerprint: {generate_key_fingerprint(key)}
# WARNING: Keep this file secure and never commit to version control!

ENCRYPTION_KEY="{encoded_key}"
"""

    # Write to file with restrictive permissions
    filepath = Path(filename)
    filepath.parent.mkdir(parents=True, exist_ok=True)

    with open(filepath, 'w') as f:
        f.write(content)

    # Set restrictive permissions (owner read/write only)
    os.chmod(filepath, 0o600)

    print(f"✅ {description} saved to: {filepath}")
    print(f"   Fingerprint: {generate_key_fingerprint(key)}")
    print(f"   Permissions: {oct(os.stat(filepath).st_mode)[-3:]} (owner only)")
    print()


def main():
    print("🔐 CV Pro Encryption Key Generator")
    print("=" * 50)
    print()

    # Generate primary key
    print("Generating primary encryption key...")
    primary_key = generate_secure_key(32)  # 256 bits for AES-256
    primary_b64 = base64.b64encode(primary_key).decode()

    # Generate backup key
    print("Generating backup encryption key...")
    backup_key = generate_secure_key(32)
    backup_b64 = base64.b64encode(backup_key).decode()

    print()
    print("🎯 KEYS GENERATED SUCCESSFULLY")
    print("=" * 50)

    # Display keys
    print(f"Primary Key (Base64): {primary_b64}")
    print(f"Backup Key (Base64):  {backup_b64}")
    print()

    # Security recommendations
    print("🛡️  SECURITY RECOMMENDATIONS")
    print("-" * 30)
    print("1. NEVER store keys in source code or version control")
    print("2. Use different keys for development/production")
    print("3. Store keys in secure key management systems:")
    print("   • AWS KMS, Google Cloud KMS, or Azure Key Vault")
    print("   • HashiCorp Vault or similar secret management")
    print("   • Hardware Security Modules (HSM)")
    print("4. Rotate keys regularly (recommended: every 90 days)")
    print("5. Use envelope encryption for additional security")
    print()

    # Create secure key files
    print("💾 CREATING SECURE KEY FILES")
    print("-" * 30)

    # Create keys directory
    keys_dir = Path("secure-keys")
    keys_dir.mkdir(exist_ok=True)

    # Save primary key
    save_key_securely(primary_key, "secure-keys/encryption-key-primary.env", "Primary Encryption Key")

    # Save backup key
    save_key_securely(backup_key, "secure-keys/encryption-key-backup.env", "Backup Encryption Key")

    # Create .gitignore entry
    gitignore_path = Path(".gitignore")
    gitignore_entry = "\n# Encryption keys - NEVER COMMIT\nsecure-keys/\n*.key\n"

    if gitignore_path.exists():
        content = gitignore_path.read_text()
        if "secure-keys/" not in content:
            with open(gitignore_path, 'a') as f:
                f.write(gitignore_entry)
            print("✅ Added secure-keys/ to .gitignore")
    else:
        gitignore_path.write_text("# CV Pro .gitignore\n" + gitignore_entry)
        print("✅ Created .gitignore with secure-keys/ entry")

    print()
    print("🚨 CRITICAL SECURITY REMINDERS")
    print("-" * 35)
    print("• The keys above are displayed ONCE for your records")
    print("• Delete this output after secure storage")
    print("• Test decryption with backup key regularly")
    print("• Have a key recovery plan for production")
    print("• Monitor key usage and set up alerts")
    print()

    print("📋 NEXT STEPS")
    print("-" * 12)
    print("1. Store keys in your secret management system")
    print("2. Set ENCRYPTION_KEY environment variable")
    print("3. Test encryption/decryption functionality")
    print("4. Create key rotation procedures")
    print("5. Document key recovery processes")
    print()

    print("✨ Key generation complete! Stay secure! 🔐")


if __name__ == "__main__":
    main()
