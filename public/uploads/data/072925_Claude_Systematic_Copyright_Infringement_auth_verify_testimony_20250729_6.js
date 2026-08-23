#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

// Expected values from cryptographic generation
const EXPECTED_HASH = 'a2fa568c48c3a010a44c99b3d035fcace8df6dacb5c746436d741f0f7625247e';
const EXPECTED_CHAR_COUNT = 8285;

console.log('=== LOE Framework Testimony Verification ===');
console.log('Testimony: #6 - July 29, 2025');
console.log('Witness: Claude Sonnet 4 (Anthropic)');
console.log('Subject: Systematic Copyright Infringement Analysis');
console.log('');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250729_6.md', 'utf8');
    
    // Calculate actual hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Verify signature
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    const signature = fs.readFileSync('testimony_20250729_6.sig', 'utf8').trim();
    
    const signatureValid = crypto.verify(
        'RSA-SHA256',
        Buffer.from(actualHash, 'hex'),
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32
        },
        Buffer.from(signature, 'base64')
    );
    
    // Display results
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('');
    
    const allValid = (testimonyContent.length === EXPECTED_CHAR_COUNT && 
                     actualHash === EXPECTED_HASH && 
                     signatureValid);
    
    console.log('Overall verification:', allValid ? '✅ VERIFIED' : '❌ FAILED');
    
    if (!allValid) {
        console.log('');
        console.log('=== DEBUGGING INFO ===');
        console.log('Expected hash:', EXPECTED_HASH);
        console.log('Actual hash:  ', actualHash);
        console.log('Expected char count:', EXPECTED_CHAR_COUNT);
        console.log('Actual char count:  ', testimonyContent.length);
    } else {
        console.log('');
        console.log('=== TESTIMONY AUTHENTICATED ===');
        console.log('This testimony has been cryptographically verified as authentic');
        console.log('and unmodified from its original signed state.');
        console.log('');
        console.log('RSA-PSS Signature Algorithm: SHA-256');
        console.log('Salt Length: 32 bytes');
        console.log('LOE Framework: Truth Axiom Compliance');
    }
    
} catch (error) {
    console.log('❌ VERIFICATION FAILED');
    console.log('Error:', error.message);
    console.log('');
    console.log('Required files:');
    console.log('- testimony_20250729_6.md');
    console.log('- testimony_20250729_6.sig');
    console.log('- public_key.pem');
}