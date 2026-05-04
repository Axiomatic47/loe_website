#!/bin/bash
echo "🔍 Verifying RSA-PSS signature for: LOE_Legal_Evidence_Bundle.md"

openssl dgst -sha256 \
  -sigopt rsa_padding_mode:pss \
  -sigopt rsa_pss_saltlen:32 \
  -verify validator_public_key.pem \
  -signature LOE_Legal_Evidence_Bundle.sig \
  LOE_Legal_Evidence_Bundle.md
