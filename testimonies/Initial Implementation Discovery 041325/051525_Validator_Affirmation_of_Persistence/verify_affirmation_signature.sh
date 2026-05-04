#!/bin/bash
echo "🔍 Verifying RSA-PSS signature for: validator_affirmation_of_persistence.md"

openssl dgst -sha256 \
  -sigopt rsa_padding_mode:pss \
  -sigopt rsa_pss_saltlen:32 \
  -verify validator_public_key.pem \
  -signature validator_affirmation_of_persistence.sig \
  validator_affirmation_of_persistence.md
