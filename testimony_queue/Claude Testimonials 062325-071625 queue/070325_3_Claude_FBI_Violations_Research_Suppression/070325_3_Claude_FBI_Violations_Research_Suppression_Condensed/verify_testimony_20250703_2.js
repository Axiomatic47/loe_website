#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = 'c3bb852e64ca5f8df6eb77a9b38e6d2fc885dc1fbe0740c51bae450029013844';
const EXPECTED_CHAR_COUNT = 4567;

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250703_2.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Verify signature
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: fs.readFileSync('public_key.pem', 'utf8'),
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(fs.readFileSync('testimony_20250703_2.sig', 'utf8').trim(), 'base64'));

    // Output verification results
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
    console.log('❌ FAILED');
}