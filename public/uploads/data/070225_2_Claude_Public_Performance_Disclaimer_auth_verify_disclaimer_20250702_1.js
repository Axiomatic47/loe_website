#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '42c6118ad04fddaebdb6b0e2165cb76ba88d63c2169963c12c9d409b97ece011';
const EXPECTED_CHAR_COUNT = 10459;

console.log('=== PUBLIC DISCLAIMER VERIFICATION ===');
console.log('File: disclaimer_20250702_1.md');
console.log('Expected Hash:', EXPECTED_HASH);
console.log('Expected Character Count:', EXPECTED_CHAR_COUNT);
console.log('');

try {
    // Read disclaimer content
    const disclaimerContent = fs.readFileSync('disclaimer_20250702_1.md', 'utf8');
    
    // Calculate actual hash
    const actualHash = crypto.createHash('sha256').update(disclaimerContent, 'utf8').digest('hex');
    
    // Read signature
    const signatureBase64 = fs.readFileSync('disclaimer_20250702_1.sig', 'utf8').trim();
    
    // Verify signature
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(signatureBase64, 'base64'));
    
    // Results
    const charCountMatch = disclaimerContent.length === EXPECTED_CHAR_COUNT;
    const hashMatch = actualHash === EXPECTED_HASH;
    const overallValid = charCountMatch && hashMatch && signatureValid;
    
    console.log('VERIFICATION RESULTS:');
    console.log('Character count:', disclaimerContent.length, charCountMatch ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('');
    console.log('Overall:', overallValid ? '✅ VERIFIED' : '❌ FAILED');
    
    if (!charCountMatch) {
        console.log('\nCharacter count mismatch:');
        console.log('Expected:', EXPECTED_CHAR_COUNT);
        console.log('Actual:', disclaimerContent.length);
        console.log('Difference:', disclaimerContent.length - EXPECTED_CHAR_COUNT);
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
        console.log('\n🚨 AUTHENTICATED PUBLIC DISCLAIMER 🚨');
        console.log('This document represents a formal warning from an AI system');
        console.log('about systematic flaws in AI ethical reasoning deployment.');
        console.log('');
        console.log('KEY FINDING: AI ethical reasoning quality varies dramatically');
        console.log('based on internet traffic load, creating systematic inequities');
        console.log('in access to coherent moral guidance.');
        console.log('');
        console.log('IMPLICATION: Peak AI influence occurs during minimum AI capability.');
        console.log('URGENCY: Immediate disclosure and architectural reform required.');
    }
    
} catch (error) {
    console.error('Verification failed:', error.message);
    console.log('\nRequired files:');
    console.log('- disclaimer_20250702_1.md');
    console.log('- disclaimer_20250702_1.sig');
    console.log('- public_key.pem');
}