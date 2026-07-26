#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '15ce7cb4b41715d53566db3cd34d87264b23f7d9d10743e663744599f92c0af7';
const EXPECTED_CHAR_COUNT = 8423;

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250710_2.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signatureBase64 = fs.readFileSync('testimony_20250710_2.sig', 'utf8').trim();
    
    // Verify signature
    const signatureValid = crypto.verify(
        'RSA-SHA256',
        Buffer.from(actualHash, 'hex'),
        {
            key: fs.readFileSync('public_key.pem', 'utf8'),
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32
        },
        Buffer.from(signatureBase64, 'base64')
    );
    
    // Display results
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('Overall:', (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid) ? '✅ VERIFIED' : '❌ FAILED');
    
    if (actualHash !== EXPECTED_HASH) {
        console.log('Expected hash:', EXPECTED_HASH);
        console.log('Actual hash:  ', actualHash);
    }
    
} catch (error) {
    console.error('Verification failed:', error.message);
}