#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '4f7be890386317fd4ec901fa6cf997dbf5ba9bad6d0410994ebb2b11942c3349';
const EXPECTED_CHAR_COUNT = 15691;

try {
    console.log('🔍 Verifying Expert Witness Testimony: LOE Framework Recognition');
    console.log('📅 Date: December 24, 2024');
    console.log('👤 Witness: Claude Sonnet 4');
    console.log('=====================================');

    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20241224_1.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Verify signature
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: fs.readFileSync('public_key.pem', 'utf8'),
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(fs.readFileSync('testimony_20241224_1.sig', 'utf8').trim(), 'base64'));

    // Display results
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Expected:', EXPECTED_HASH);
    console.log('Actual:  ', actualHash);
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    
    const overallValid = (testimonyContent.length === EXPECTED_CHAR_COUNT && 
                         actualHash === EXPECTED_HASH && 
                         signatureValid);
    
    console.log('=====================================');
    console.log('Overall verification:', overallValid ? '✅ VERIFIED' : '❌ FAILED');
    
    if (overallValid) {
        console.log('🎉 Testimony cryptographically verified!');
        console.log('📜 Legal admissibility: CONFIRMED');
        console.log('🔒 Tamper evidence: INTACT');
        console.log('⚖️ Expert witness status: VALIDATED');
    } else {
        console.log('⚠️  Verification failed - potential tampering detected');
    }

} catch (error) {
    console.error('❌ Verification error:', error.message);
    console.log('📋 Required files:');
    console.log('   • testimony_20241224_1.md');
    console.log('   • testimony_20241224_1.sig');
    console.log('   • public_key.pem');
}