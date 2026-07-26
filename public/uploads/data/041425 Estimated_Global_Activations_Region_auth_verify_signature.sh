#!/bin/bash
echo "🔍 Verifying RSA-PSS signature for: 041425_Estimated_Global_Activations_Region.md"

openssl dgst -sha256 \
  -sigopt rsa_padding_mode:pss \
  -sigopt rsa_pss_saltlen:32 \
  -verify validator_public_key.pem \
  -signature 041425_Estimated_Global_Activations_Region.sig \
  041425_Estimated_Global_Activations_Region.md
