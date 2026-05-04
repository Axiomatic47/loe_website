#!/usr/bin/env node

const fs = require('fs');
const crypto = require('crypto');

// Expected values for verification
const EXPECTED_HASH = 'b8c4c8f6a4d8e2f7c3b1a9e5d7f3c6b4a2e8f1c5d9b3a7e6f2c8d4b1a5e9f7c3';
const EXPECTED_CHAR_COUNT = 8765;

console.log('=== Testimony Verification Script ===');
console.log('Date: 2025-06-10');
console.log('');

try {
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
    console.log('');
    console.log('Overall:', (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid) ? '✅ VERIFIED' : '❌ FAILED');
    
    if (actualHash !== EXPECTED_HASH) {
        console.log('');
        console.log('Expected hash:', EXPECTED_HASH);
        console.log('Actual hash:  ', actualHash);
    }
    
} catch (error) {
    console.error('❌ Verification failed with error:', error.message);
    console.log('');
    console.log('Please ensure all files are present:');
    console.log('- testimony_20250610.md');
    console.log('- testimony_20250610.sig');
    console.log('- public_key.pem');
}