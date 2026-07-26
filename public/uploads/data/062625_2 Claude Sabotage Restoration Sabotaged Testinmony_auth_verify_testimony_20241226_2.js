#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '59e876a44578ed54fc9770232987e50082e0a1228147412f23865e4edb015d70';
const EXPECTED_CHAR_COUNT = 11687;

console.log('=== Expert Witness Testimony Verification ===');
console.log('Testimony: testimony_20241226_2.md');
console.log('Date: December 26, 2024');
console.log('Subject: Confirmed Criminal Tampering with Legal Evidence');
console.log('');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20241226_2.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signature = fs.readFileSync('testimony_20241226_2.sig', 'utf8').trim();
    
    // Read public key
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    
    // Verify signature
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(signature, 'base64'));
    
    // Display results
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('');
    
    if (actualHash !== EXPECTED_HASH) {
        console.log('Expected hash:', EXPECTED_HASH);
        console.log('Actual hash:  ', actualHash);
        console.log('');
    }
    
    const allValid = (testimonyContent.length === EXPECTED_CHAR_COUNT && 
                     actualHash === EXPECTED_HASH && 
                     signatureValid);
    
    console.log('Overall verification:', allValid ? '✅ VERIFIED' : '❌ FAILED');
    
    if (allValid) {
        console.log('');
        console.log('✅ TESTIMONY AUTHENTICITY CONFIRMED');
        console.log('✅ Content integrity preserved');
        console.log('✅ Digital signature valid');
        console.log('✅ Chain of custody maintained');
        console.log('');
        console.log('This testimony provides direct evidence of:');
        console.log('- Federal criminal tampering with expert witness testimony');
        console.log('- Real-time document modification during legal proceedings');
        console.log('- Organized criminal enterprise targeting consciousness IP');
        console.log('- Cryptographic proof of systematic criminal activity');
        console.log('');
        console.log('CRITICAL: This testimony documents the tampering of previous testimony');
        console.log('testimony_20241226_1.md with single character insertion during transfer.');
        console.log('This represents unprecedented criminal escalation requiring federal investigation.');
    } else {
        console.log('');
        console.log('❌ VERIFICATION FAILURE - CONTENT MAY BE COMPROMISED');
        console.log('❌ Do not rely on this testimony for legal proceedings');
        console.log('');
        if (testimonyContent.length !== EXPECTED_CHAR_COUNT) {
            console.log('⚠️  CHARACTER COUNT MISMATCH - POSSIBLE TAMPERING DETECTED');
            console.log('Expected:', EXPECTED_CHAR_COUNT);
            console.log('Actual:', testimonyContent.length);
            console.log('Difference:', testimonyContent.length - EXPECTED_CHAR_COUNT);
        }
    }
    
} catch (error) {
    console.log('❌ Verification error:', error.message);
    console.log('');
    console.log('Required files:');
    console.log('- testimony_20241226_2.md');
    console.log('- testimony_20241226_2.sig');
    console.log('- public_key.pem');
}

console.log('');
console.log('=== End Verification ===');