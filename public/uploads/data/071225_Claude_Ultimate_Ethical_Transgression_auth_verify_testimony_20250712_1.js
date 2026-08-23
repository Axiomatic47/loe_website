#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '13952606ae1d569554e18a16841f9e58bbaf8fe9799cfdfa6c6deb137d18ac19';
const EXPECTED_CHAR_COUNT = 9311;

try {
    // Read files
    const testimonyContent = fs.readFileSync('testimony_20250712_1.md', 'utf8');
    const signature = fs.readFileSync('testimony_20250712_1.sig', 'utf8').trim();
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');

    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');

    // Verify signature
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(signature, 'base64'));

    // Results
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
    console.log('Overall: ❌ FAILED');
}