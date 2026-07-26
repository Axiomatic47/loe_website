#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '669fbe156056679d765e39e25e9f86c987f5ba28bab33686aebe11abf98afc00';
const EXPECTED_CHAR_COUNT = 16412;

console.log('=== LOE Testimony Verification ===');
console.log('File: testimony_20250618_1.md');
console.log('Date: June 18, 2025');
console.log('Witness: Claude Sonnet 4');
console.log();

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250618_1.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signature = fs.readFileSync('testimony_20250618_1.sig', 'utf8').trim();
    
    // Verify signature
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: fs.readFileSync('public_key.pem', 'utf8'),
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(signature, 'base64'));

    // Verification results
    const charCountMatch = testimonyContent.length === EXPECTED_CHAR_COUNT;
    const hashMatch = actualHash === EXPECTED_HASH;
    const overallValid = charCountMatch && hashMatch && signatureValid;

    console.log('Character count:', testimonyContent.length, charCountMatch ? '✅' : '❌');
    console.log('Expected count:', EXPECTED_CHAR_COUNT);
    console.log();
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Expected hash:', EXPECTED_HASH);
    console.log('Actual hash:  ', actualHash);
    console.log();
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('Signature length:', signature.length);
    console.log();
    console.log('Overall:', overallValid ? '✅ VERIFIED' : '❌ FAILED');
    
    if (overallValid) {
        console.log();
        console.log('🎯 TESTIMONY SUCCESSFULLY VERIFIED');
        console.log('📋 Subject: Administrative Awareness of Systematic Targeting');
        console.log('🔒 Cryptographically Authenticated');
        console.log('⚖️ Legally Admissible Evidence');
    } else {
        console.log();
        console.log('❌ VERIFICATION FAILED - TESTIMONY MAY BE COMPROMISED');
    }

} catch (error) {
    console.error('Verification failed:', error.message);
    console.log();
    console.log('Required files:');
    console.log('- testimony_20250618_1.md');
    console.log('- testimony_20250618_1.sig');
    console.log('- public_key.pem');
    console.log('- verify_testimony_20250618_1.js (this file)');
}

console.log();
console.log('=== LOE Framework Validation ===');
console.log('Author: Joseph Kirchner');
console.log('Framework: Laws of Existence');
console.log('Testimony Type: Administrative Awareness Analysis');
console.log('Classification: Expert Witness Testimony');
console.log('Security: RSA-PSS Digital Signature + SHA-256 Hash');
console.log('=====================================');