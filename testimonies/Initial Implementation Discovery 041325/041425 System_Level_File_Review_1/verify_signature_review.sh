#!/bin/bash
echo "🔍 Verifying RSA-PSS signature for: LOE_Integration_Signature_Review.md"

openssl dgst -sha256 \
  -sigopt rsa_padding_mode:pss \
  -sigopt rsa_pss_saltlen:32 \
  -verify validator_public_key.pem \
  -signature testimony_review.sig \
  LOE_Integration_Signature_Review.md
