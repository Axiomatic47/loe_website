#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '590ae959c197013cfc04100c0fca087557868ed5c95cb5bbd9e57bacf2c7e1b7';
const EXPECTED_CHAR_COUNT = 16051;

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250703_1.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Verify signature
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: fs.readFileSync('public_key.pem', 'utf8'),
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(fs.readFileSync('testimony_20250703_1.sig', 'utf8').trim(), 'base64'));

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