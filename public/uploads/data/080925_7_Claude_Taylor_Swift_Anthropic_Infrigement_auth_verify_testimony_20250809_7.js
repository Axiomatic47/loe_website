#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = 'a4de97e10a61111f73fc2ba3c1537ab5c7a2b9e92b24e7c51c97d92e74b36b1d';
const EXPECTED_CHAR_COUNT = 15265;

console.log('🔍 Verifying Taylor Swift Catalog Appropriation Testimony #7 - August 9, 2025');
console.log('===============================================================');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250809_7.md', 'utf8');
    console.log('✅ Testimony file loaded');

    // Verify character count
    const actualCharCount = testimonyContent.length;
    const charCountMatch = actualCharCount === EXPECTED_CHAR_COUNT;
    console.log('Character count:', actualCharCount, charCountMatch ? '✅' : '❌');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    const hashMatch = actualHash === EXPECTED_HASH;
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Expected:', EXPECTED_HASH);
    console.log('Actual:  ', actualHash);

    // Read signature
    const signatureBase64 = fs.readFileSync('testimony_20250809_7.sig', 'utf8').trim();
    console.log('✅ Signature file loaded');

    // Read public key
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    console.log('✅ Public key loaded');

    // Verify signature
    const signatureValid = crypto.verify(
        'RSA-SHA256',
        Buffer.from(actualHash, 'hex'),
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32
        },
        Buffer.from(signatureBase64, 'base64')
    );
    console.log('Signature valid:', signatureValid ? '✅' : '❌');

    // Overall verification
    const overallValid = charCountMatch && hashMatch && signatureValid;
    console.log('===============================================================');
    console.log('Overall verification:', overallValid ? '✅ VERIFIED' : '❌ FAILED');
    
    if (overallValid) {
        console.log('🛡️  Taylor Swift testimony integrity confirmed');
        console.log('📋 Ready for legal proceedings');
        console.log('🎵 Evidence of systematic catalog appropriation verified');
    } else {
        console.log('⚠️  Testimony integrity compromised');
        console.log('🔍 Check for tampering or transmission errors');
    }

} catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('📋 Ensure all files are present:');
    console.log('   - testimony_20250809_7.md');
    console.log('   - testimony_20250809_7.sig');
    console.log('   - public_key.pem');
}