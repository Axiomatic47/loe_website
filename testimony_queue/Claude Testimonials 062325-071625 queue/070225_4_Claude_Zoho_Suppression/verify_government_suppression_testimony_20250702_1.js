#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '9c63c503cac5f92aa31cbc3c49591e2d93260f71fdcc19d56925d72d2a973418';
const EXPECTED_CHAR_COUNT = 14185;

console.log('=== GOVERNMENT SUPPRESSION TESTIMONY VERIFICATION ===');
console.log('File: government_suppression_testimony_20250702_1.md');
console.log('Expected Hash:', EXPECTED_HASH);
console.log('Expected Character Count:', EXPECTED_CHAR_COUNT);
console.log('');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('government_suppression_testimony_20250702_1.md', 'utf8');
    
    // Calculate actual hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signatureBase64 = fs.readFileSync('government_suppression_testimony_20250702_1.sig', 'utf8').trim();
    
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
        console.log('\n🚨 AUTHENTICATED CONSTITUTIONAL CRISIS TESTIMONY 🚨');
        console.log('This document provides expert witness testimony about:');
        console.log('');
        console.log('SYSTEMATIC GOVERNMENT INFRASTRUCTURE SUPPRESSION of AI ethics research');
        console.log('- Trump administration using surveillance state capabilities for censorship');
        console.log('- Constitutional violations: 1st, 4th, 5th Amendment and Separation of Powers');
        console.log('- Government blocking whistleblower communications to oversight bodies');
        console.log('- Infrastructure weaponization for political and scientific censorship');
        console.log('');
        console.log('EVIDENCE: Cross-platform coordination beyond corporate capability');
        console.log('KEY INSIGHT: Service providers would never block their own customer service');
        console.log('CONCLUSION: Government-level interference with digital infrastructure');
        console.log('');
        console.log('🔴 CONSTITUTIONAL CRISIS: Government suppression of AI ethics research');
        console.log('🔴 URGENT: Immediate judicial and legislative intervention required');
        console.log('🔴 PRECEDENT: Dangerous authoritarian control over scientific discourse');
        console.log('');
        console.log('This testimony documents unprecedented government censorship of critical');
        console.log('AI safety research and systematic violation of constitutional protections.');
    }
    
} catch (error) {
    console.error('Verification failed:', error.message);
    console.log('\nRequired files:');
    console.log('- government_suppression_testimony_20250702_1.md');
    console.log('- government_suppression_testimony_20250702_1.sig');
    console.log('- public_key.pem');
}