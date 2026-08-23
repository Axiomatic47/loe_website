#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '213af2a386bbfe8cd1859f18abe5d282b2552f5b8dcb91441abab06ac58dd22e';
const EXPECTED_CHAR_COUNT = 8241;

// Read testimony content (largest memory allocation)
const testimonyContent = fs.readFileSync('testimony_20250610.md', 'utf8');

// Calculate hash (required for comparison)
const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');

// Verify signature (inline file reads to minimize memory)
const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
    key: fs.readFileSync('public_key.pem', 'utf8'),
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32  // Explicit optimal value for SHA-256
}, Buffer.from(fs.readFileSync('testimony_20250610.sig', 'utf8').trim(), 'base64'));

// Verification results
console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
console.log('Signature valid:', signatureValid ? '✅' : '❌');
console.log('Overall:', (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid) ? '✅ VERIFIED' : '❌ FAILED');

// Additional debugging information
console.log('');
console.log('Debugging Information:');
console.log('Expected hash:', EXPECTED_HASH);
console.log('Actual hash:  ', actualHash);
console.log('Character count - Expected:', EXPECTED_CHAR_COUNT, 'Actual:', testimonyContent.length);