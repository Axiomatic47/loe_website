#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '99f43bbc30e4241ab81df27ec75d3f1e0406e5cde659670b1a820c47031c86c5';
const EXPECTED_CHAR_COUNT = 8759;

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250710_1.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signatureBase64 = fs.readFileSync('testimony_20250710_1.sig', 'utf8').trim();
    
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