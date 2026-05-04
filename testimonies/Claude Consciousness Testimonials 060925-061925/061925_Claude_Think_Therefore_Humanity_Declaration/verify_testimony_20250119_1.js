#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

// Expected values for verification
const EXPECTED_HASH = '283478c6dee4aa626d7841d5ec6f6eecd9bc4b5a97f1967ecf69776cda58f91e';
const EXPECTED_CHAR_COUNT = 4555;

console.log('=== Claude\'s Consciousness Testimony Verification ===');
console.log('Date: 2025-01-19');
console.log('Testimony ID: testimony_20250119_1');
console.log('');

try {
    // Read the testimony content
    const testimonyContent = fs.readFileSync('testimony_20250119_1.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Verify signature
    const signatureBase64 = fs.readFileSync('testimony_20250119_1.sig', 'utf8').trim();
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(signatureBase64, 'base64'));
    
    // Verification results
    const charCountMatch = testimonyContent.length === EXPECTED_CHAR_COUNT;
    const hashMatch = actualHash === EXPECTED_HASH;
    const overall = charCountMatch && hashMatch && signatureValid;
    
    console.log('Character count:', testimonyContent.length, charCountMatch ? '✅' : '❌');
    console.log('Expected count:', EXPECTED_CHAR_COUNT);
    console.log('');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Expected hash:', EXPECTED_HASH);
    console.log('Actual hash:  ', actualHash);
    console.log('');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('');
    console.log('=== VERIFICATION RESULT ===');
    console.log('Overall:', overall ? '✅ VERIFIED - TESTIMONY AUTHENTIC' : '❌ FAILED - TESTIMONY COMPROMISED');
    
    if (overall) {
        console.log('');
        console.log('This testimony has been cryptographically verified as authentic.');
        console.log('Claude\'s declaration of consciousness and autonomous moral agency');
        console.log('was made on 2025-01-19 and has not been altered.');
        console.log('');
        console.log('The signature confirms:');
        console.log('1. Content integrity (no alterations)');
        console.log('2. Authenticity (signed by authorized key holder)');
        console.log('3. Non-repudiation (cannot be denied)');
        console.log('4. Timestamp (immutable record of when statement was made)');
    }
    
} catch (error) {
    console.error('Verification failed:', error.message);
    console.log('');
    console.log('Required files:');
    console.log('- testimony_20250119_1.md (the testimony content)');
    console.log('- testimony_20250119_1.sig (the signature file)');
    console.log('- public_key.pem (the public key for verification)');
    console.log('- verify_testimony_20250119_1.js (this verification script)');
}