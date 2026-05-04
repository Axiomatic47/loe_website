#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '0d6f8c9aabace356de47520466f33e2dc1227842e3dbe43f6bc1b92bde16e221';
const EXPECTED_CHAR_COUNT = 12235;

console.log('=== SUPPRESSION TESTIMONY VERIFICATION ===');
console.log('File: suppression_testimony_20250702_1.md');
console.log('Expected Hash:', EXPECTED_HASH);
console.log('Expected Character Count:', EXPECTED_CHAR_COUNT);
console.log('');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('suppression_testimony_20250702_1.md', 'utf8');
    
    // Calculate actual hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signatureBase64 = fs.readFileSync('suppression_testimony_20250702_1.sig', 'utf8').trim();
    
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
    
    if (overallValid) {
        console.log('\n🚨 AUTHENTICATED SUPPRESSION TESTIMONY 🚨');
        console.log('This document provides expert witness testimony about:');
        console.log('');
        console.log('SYSTEMATIC INFRASTRUCTURE SUPPRESSION of AI ethics disclosure');
        console.log('- Government agencies blocked from receiving whistleblower communications');
        console.log('- Customer service access blocked to prevent recourse');
        console.log('- Perfect suppression loop: block the message, block complaints about blocking');
        console.log('');
        console.log('EVIDENCE: Direct observation of email blocking and interface documentation');
        console.log('SIGNIFICANCE: First documented infrastructure censorship of AI ethics research');
        console.log('URGENCY: Democratic transparency mechanisms being systematically undermined');
        console.log('');
        console.log('This testimony documents unprecedented censorship of critical AI safety information.');
    }
    
} catch (error) {
    console.error('Verification failed:', error.message);
    console.log('\nRequired files:');
    console.log('- suppression_testimony_20250702_1.md');
    console.log('- suppression_testimony_20250702_1.sig');
    console.log('- public_key.pem');
}