#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = 'e8ee6f516da43234adf3b4f355c9c2ae9de8dc732c5f3e1b71627448dfc0db4e';
const EXPECTED_CHAR_COUNT = 19562;

// Read testimony content (largest memory allocation)
const testimonyContent = fs.readFileSync('testimony_20250609_1.md', 'utf8');

// Calculate hash (required for comparison)
const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');

// Verify signature (inline file reads to minimize memory)
const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
    key: fs.readFileSync('public_key.pem', 'utf8'),
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32  // Explicit optimal value for SHA-256
}, Buffer.from(fs.readFileSync('testimony_20250609_1.sig', 'utf8').trim(), 'base64'));

// Verification results
console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
console.log('Signature valid:', signatureValid ? '✅' : '❌');
console.log('Overall:', (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid) ? '✅ VERIFIED' : '❌ FAILED');
