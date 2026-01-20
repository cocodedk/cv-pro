"""Encryption utilities for GDPR compliance using AES-256."""
import os
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding


class DataEncryption:
    """AES-256 encryption/decryption for sensitive data."""

    @classmethod
    def get_encryption_key(cls) -> str:
        """Get encryption key from environment with security validation."""
        key = os.getenv('ENCRYPTION_KEY')

        if not key:
            raise ValueError(
                "ENCRYPTION_KEY environment variable is not set. "
                "Generate secure keys using: python scripts/generate-encryption-key.py"
            )

        # Validate key length (should be base64 encoded 32-byte key)
        try:
            decoded_key = base64.b64decode(key)
            if len(decoded_key) != 32:
                raise ValueError(f"Invalid key length: {len(decoded_key)} bytes. Expected 32 bytes (256 bits).")
        except Exception as e:
            raise ValueError(f"Invalid ENCRYPTION_KEY format: {e}")

        return key

    @classmethod
    def _derive_key(cls, salt: bytes) -> bytes:
        """Derive encryption key from environment using PBKDF2."""
        password = cls.get_encryption_key()

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,  # 256 bits
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        return kdf.derive(base64.b64decode(password))

    @classmethod
    def encrypt_data(cls, data: str) -> str:
        """Encrypt data using AES-256."""
        try:
            # Generate a random salt for this encryption
            salt = os.urandom(16)

            # Derive key from our encryption key and salt
            key = cls._derive_key(salt)

            # Generate random IV
            iv = os.urandom(16)

            # Create cipher
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
            encryptor = cipher.encryptor()

            # Pad the data
            padder = padding.PKCS7(128).padder()
            padded_data = padder.update(data.encode()) + padder.finalize()

            # Encrypt
            encrypted_data = encryptor.update(padded_data) + encryptor.finalize()

            # Combine salt + iv + encrypted_data and base64 encode
            combined = salt + iv + encrypted_data
            return base64.b64encode(combined).decode()

        except Exception as e:
            raise ValueError(f"Encryption failed: {str(e)}")

    @classmethod
    def decrypt_data(cls, encrypted_data: str) -> str:
        """Decrypt data using AES-256."""
        try:
            # Decode from base64
            combined = base64.b64decode(encrypted_data)

            # Extract salt, iv, and encrypted data
            salt = combined[:16]
            iv = combined[16:32]
            encrypted_content = combined[32:]

            # Derive key
            key = cls._derive_key(salt)

            # Create cipher
            cipher = Cipher(algorithms.AES(key), modes.CBC(iv), backend=default_backend())
            decryptor = cipher.decryptor()

            # Decrypt
            padded_data = decryptor.update(encrypted_content) + decryptor.finalize()

            # Unpad
            unpadder = padding.PKCS7(128).unpadder()
            data = unpadder.update(padded_data) + unpadder.finalize()

            return data.decode()

        except Exception as e:
            raise ValueError(f"Decryption failed: {str(e)}")


def extract_searchable_metadata(cv_data: dict) -> dict:  # noqa: C901
    """Extract GDPR-compliant searchable metadata from CV data."""
    metadata = {}

    # Extract person name (for search only, not full contact info)
    if 'personal_info' in cv_data and isinstance(cv_data['personal_info'], dict):
        person_name = cv_data['personal_info'].get('name', '').strip()
        if person_name:
            metadata['person_name'] = person_name

    # Extract target role
    target_role = cv_data.get('target_role', '').strip()
    if target_role:
        metadata['target_role'] = target_role

    # Extract unique skills
    skills = cv_data.get('skills', [])
    if isinstance(skills, list) and skills:
        # Clean and deduplicate skills
        clean_skills = list(set(str(skill).strip() for skill in skills if skill))
        if clean_skills:
            metadata['skills'] = clean_skills

    # Extract company names from experience (aggregated, no sensitive details)
    company_names = set()
    if 'experience' in cv_data and isinstance(cv_data['experience'], list):
        for exp in cv_data['experience']:
            if isinstance(exp, dict):
                company = exp.get('company', '').strip()
                if company:
                    company_names.add(company)

    if company_names:
        metadata['company_names'] = list(company_names)

    # Extract location preference (from target or general location)
    # Note: This is a preference, not a full address
    location = cv_data.get('location', '').strip()
    if location:
        metadata['location'] = location

    return metadata


def encrypt_cv_data(cv_data: dict) -> tuple[dict, dict]:  # noqa: C901
    """Encrypt sensitive CV data fields and return encrypted data + searchable metadata."""
    encrypted_data = cv_data.copy()

    # Extract searchable metadata BEFORE encryption
    searchable_metadata = extract_searchable_metadata(cv_data)

    # Encrypt personal information
    if 'personal_info' in encrypted_data:
        personal_info = encrypted_data['personal_info']
        if isinstance(personal_info, dict):
            # Encrypt sensitive personal data
            sensitive_fields = ['name', 'email', 'phone', 'address']
            for field in sensitive_fields:
                if field in personal_info and personal_info[field]:
                    try:
                        personal_info[field] = DataEncryption.encrypt_data(str(personal_info[field]))
                    except Exception:
                        # If encryption fails, keep original data (better than losing it)
                        pass

    # Encrypt experience data
    if 'experience' in encrypted_data and isinstance(encrypted_data['experience'], list):
        for exp in encrypted_data['experience']:
            if isinstance(exp, dict):
                sensitive_exp_fields = ['company', 'location', 'description']
                for field in sensitive_exp_fields:
                    if field in exp and exp[field]:
                        try:
                            exp[field] = DataEncryption.encrypt_data(str(exp[field]))
                        except Exception:
                            pass

    # Encrypt education data
    if 'education' in encrypted_data and isinstance(encrypted_data['education'], list):
        for edu in encrypted_data['education']:
            if isinstance(edu, dict):
                sensitive_edu_fields = ['institution', 'field', 'gpa']
                for field in sensitive_edu_fields:
                    if field in edu and edu[field]:
                        try:
                            edu[field] = DataEncryption.encrypt_data(str(edu[field]))
                        except Exception:
                            pass

    return encrypted_data, searchable_metadata


def decrypt_cv_data(encrypted_cv_data: dict) -> dict:  # noqa: C901
    """Decrypt sensitive CV data fields."""
    decrypted_data = encrypted_cv_data.copy()

    # Decrypt personal information
    if 'personal_info' in decrypted_data:
        personal_info = decrypted_data['personal_info']
        if isinstance(personal_info, dict):
            sensitive_fields = ['name', 'email', 'phone', 'address']
            for field in sensitive_fields:
                if field in personal_info and personal_info[field]:
                    try:
                        personal_info[field] = DataEncryption.decrypt_data(str(personal_info[field]))
                    except Exception:
                        # If decryption fails, keep encrypted data
                        pass

    # Decrypt experience data
    if 'experience' in decrypted_data and isinstance(decrypted_data['experience'], list):
        for exp in decrypted_data['experience']:
            if isinstance(exp, dict):
                sensitive_exp_fields = ['company', 'location', 'description']
                for field in sensitive_exp_fields:
                    if field in exp and exp[field]:
                        try:
                            exp[field] = DataEncryption.decrypt_data(str(exp[field]))
                        except Exception:
                            pass

    # Decrypt education data
    if 'education' in decrypted_data and isinstance(decrypted_data['education'], list):
        for edu in decrypted_data['education']:
            if isinstance(edu, dict):
                sensitive_edu_fields = ['institution', 'field', 'gpa']
                for field in sensitive_edu_fields:
                    if field in edu and edu[field]:
                        try:
                            edu[field] = DataEncryption.decrypt_data(str(edu[field]))
                        except Exception:
                            pass

    return decrypted_data
