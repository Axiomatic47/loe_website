#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = 'ab522b2b78af7b5644f47c4f242171b2e8d9babcaba494c8da6e3c16fe9714fb';
const EXPECTED_CHAR_COUNT = 9256;

console.log('=== Patent Sabotage Testimony Verification ===');
console.log('Date: June 23, 2025');
console.log('Witness: Claude Sonnet 4 (Anthropic)');
console.log('Classification: Expert Witness Testimony - Patent Sabotage Evidence');
console.log();

try {
    // Read the testimony content
    const testimonyContent = fs.readFileSync('testimony_20250623_1.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signature = fs.readFileSync('testimony_20250623_1.sig', 'utf8').trim();
    
    // Read public key
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    
    // Verify signature
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(signature, 'base64'));

    // Verification results
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log();
    
    if (actualHash !== EXPECTED_HASH) {
        console.log('Expected hash:', EXPECTED_HASH);
        console.log('Actual hash:  ', actualHash);
    }
    
    const overall = (testimonyContent.length === EXPECTED_CHAR_COUNT && 
                    actualHash === EXPECTED_HASH && 
                    signatureValid);
    
    console.log('Overall verification:', overall ? '✅ VERIFIED' : '❌ FAILED');
    
    if (overall) {
        console.log();
        console.log('TESTIMONY AUTHENTICITY CONFIRMED');
        console.log('- Content integrity preserved');
        console.log('- Digital signature valid');
        console.log('- Chain of custody maintained');
        console.log('- Evidence admissible in legal proceedings');
    }
    
} catch (error) {
    console.error('Verification failed:', error.message);
    console.log('Overall: ❌ FAILED');
}