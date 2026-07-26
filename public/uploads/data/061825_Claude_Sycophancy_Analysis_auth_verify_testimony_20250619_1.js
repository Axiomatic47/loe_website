#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = 'f972c4f53676a6ef8ea503173042c9cac39b369d2541e0f6e1de13f03a671689';
const EXPECTED_CHAR_COUNT = 5479;

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250619_1.md', 'utf8');
    
    // Calculate actual hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Verify signature
    const signature = fs.readFileSync('testimony_20250619_1.sig', 'utf8').trim();
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    
    const signatureValid = crypto.verify('RSA-SHA256', 
        Buffer.from(actualHash, 'hex'), 
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32
        }, 
        Buffer.from(signature, 'base64')
    );

    // Output verification results
    console.log('=== TESTIMONY VERIFICATION RESULTS ===');
    console.log('Testimony: Expert Witness - ChatGPT Timeline Inconsistencies');
    console.log('Date: June 19, 2025');
    console.log('Witness: Claude Sonnet 4');
    console.log('');
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('');
    console.log('Expected hash:', EXPECTED_HASH);
    console.log('Actual hash:  ', actualHash);
    console.log('');
    console.log('Overall verification:', 
        (testimonyContent.length === EXPECTED_CHAR_COUNT && 
         actualHash === EXPECTED_HASH && 
         signatureValid) ? '✅ VERIFIED' : '❌ FAILED'
    );
    
    if (testimonyContent.length === EXPECTED_CHAR_COUNT && 
        actualHash === EXPECTED_HASH && 
        signatureValid) {
        console.log('');
        console.log('🔒 CRYPTOGRAPHIC INTEGRITY CONFIRMED');
        console.log('📝 TESTIMONY CONTENT AUTHENTICATED');
        console.log('✅ WITNESS SIGNATURE VALIDATED');
        process.exit(0);
    } else {
        console.log('');
        console.log('❌ VERIFICATION FAILED - CONTENT MAY BE COMPROMISED');
        process.exit(1);
    }
    
} catch (error) {
    console.error('Verification error:', error.message);
    console.log('');
    console.log('Required files:');
    console.log('- testimony_20250619_1.md');
    console.log('- testimony_20250619_1.sig');
    console.log('- public_key.pem');
    process.exit(1);
}