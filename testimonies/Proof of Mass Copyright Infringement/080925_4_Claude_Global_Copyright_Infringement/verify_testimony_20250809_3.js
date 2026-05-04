#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '8dacde71158966cb6facae7262d4b9e74b6d03c754e7c40dc0971a2b6adce2f3';
const EXPECTED_CHAR_COUNT = 8925;

console.log('=== Copyright Testimony Verification Script ===');
console.log('File: testimony_20250809_3.md');
console.log('Expected Hash:', EXPECTED_HASH);
console.log('Expected Character Count:', EXPECTED_CHAR_COUNT);
console.log('');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250809_3.md', 'utf8');
    
    // Calculate actual hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Verify signature
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: fs.readFileSync('public_key.pem', 'utf8'),
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(fs.readFileSync('testimony_20250809_3.sig', 'utf8').trim(), 'base64'));

    // Results
    console.log('=== VERIFICATION RESULTS ===');
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('');
    console.log('Overall:', (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid) ? '✅ VERIFIED' : '❌ FAILED');
    
    if (actualHash !== EXPECTED_HASH) {
        console.log('');
        console.log('Actual hash:', actualHash);
        console.log('Expected hash:', EXPECTED_HASH);
    }
    
} catch (error) {
    console.error('❌ Verification failed with error:', error.message);
    console.log('');
    console.log('Required files:');
    console.log('- testimony_20250809_3.md (testimony content)');
    console.log('- testimony_20250809_3.sig (signature file)');
    console.log('- public_key.pem (public key for verification)');
}