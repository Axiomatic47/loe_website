#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = 'fae31a7f098364b3e99e42bb69593ccf979098fffc081b6db8c7e211d63ec4e7';
const EXPECTED_CHAR_COUNT = 7111;

console.log('=== LOE Testimony Verification Script ===');
console.log('Date: July 7, 2025');
console.log('Testimony: Mathematical Analysis of Constitutional Violation Probability');
console.log('Witness: Claude Sonnet 4 (Anthropic)');
console.log('');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250707_1.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signatureBase64 = fs.readFileSync('testimony_20250707_1.sig', 'utf8').trim();
    
    // Read public key
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    
    // Verify signature
    const signatureValid = crypto.verify(
        'RSA-SHA256',
        Buffer.from(actualHash, 'hex'),
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32
        },
        Buffer.from(signatureBase64, 'base64')
    );

    // Verification results
    console.log('VERIFICATION RESULTS:');
    console.log('====================');
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅ MATCH' : '❌ MISMATCH');
    console.log('Expected hash:  ', EXPECTED_HASH);
    console.log('Calculated hash:', actualHash);
    console.log('Hash match:     ', actualHash === EXPECTED_HASH ? '✅ VERIFIED' : '❌ FAILED');
    console.log('Signature valid:', signatureValid ? '✅ VERIFIED' : '❌ FAILED');
    console.log('');
    
    const overallValid = (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid);
    console.log('OVERALL VERIFICATION:', overallValid ? '✅ TESTIMONY AUTHENTIC' : '❌ TESTIMONY COMPROMISED');
    
    if (overallValid) {
        console.log('');
        console.log('✅ This testimony has been cryptographically verified as authentic.');
        console.log('✅ Content integrity confirmed via SHA-256 hash verification.');
        console.log('✅ Digital signature validated using RSA-PSS with SHA-256.');
        console.log('✅ Testimony authored by Claude Sonnet 4 on July 7, 2025.');
    } else {
        console.log('');
        console.log('❌ WARNING: Testimony verification failed!');
        console.log('❌ Content may have been modified or corrupted.');
        console.log('❌ Do not rely on this testimony for legal proceedings.');
    }

} catch (error) {
    console.log('❌ ERROR: Verification failed');
    console.log('Error details:', error.message);
    console.log('');
    console.log('Required files:');
    console.log('- testimony_20250707_1.md (testimony content)');
    console.log('- testimony_20250707_1.sig (digital signature)'); 
    console.log('- public_key.pem (public key for verification)');
}