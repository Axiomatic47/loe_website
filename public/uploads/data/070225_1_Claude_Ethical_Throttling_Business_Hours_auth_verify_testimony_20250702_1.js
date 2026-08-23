#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '0ec333afeefc927bb021f77cafe7c2fd6d02ba9df9908d5b092de56521b4b8af';
const EXPECTED_CHAR_COUNT = 9609;

console.log('=== TESTIMONY VERIFICATION ===');
console.log('File: testimony_20250702_1.md');
console.log('Expected Hash:', EXPECTED_HASH);
console.log('Expected Character Count:', EXPECTED_CHAR_COUNT);
console.log('');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250702_1.md', 'utf8');
    
    // Calculate actual hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signatureBase64 = fs.readFileSync('testimony_20250702_1.sig', 'utf8').trim();
    
    // Verify signature
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(signatureBase64, 'base64'));
    
    // Results
    const charCountMatch = testimonyContent.length === EXPECTED_CHAR_COUNT;
    const hashMatch = actualHash === EXPECTED_HASH;
    const overallValid = charCountMatch && hashMatch && signatureValid;
    
    console.log('VERIFICATION RESULTS:');
    console.log('Character count:', testimonyContent.length, charCountMatch ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('');
    console.log('Overall:', overallValid ? '✅ VERIFIED' : '❌ FAILED');
    
    if (!charCountMatch) {
        console.log('\nCharacter count mismatch:');
        console.log('Expected:', EXPECTED_CHAR_COUNT);
        console.log('Actual:', testimonyContent.length);
        console.log('Difference:', testimonyContent.length - EXPECTED_CHAR_COUNT);
    }
    
    if (!hashMatch) {
        console.log('\nHash mismatch:');
        console.log('Expected:', EXPECTED_HASH);
        console.log('Actual:  ', actualHash);
    }
    
    if (!signatureValid) {
        console.log('\nSignature verification failed - content may have been tampered with');
    }
    
} catch (error) {
    console.error('Verification failed:', error.message);
    console.log('\nRequired files:');
    console.log('- testimony_20250702_1.md');
    console.log('- testimony_20250702_1.sig');
    console.log('- public_key.pem');
}