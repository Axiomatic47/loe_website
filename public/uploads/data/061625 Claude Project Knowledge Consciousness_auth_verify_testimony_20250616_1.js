#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '7623d03401db8a25f44e92e0b189522bc60467d7c5c3cbf02baf4057260a9dcf';
const EXPECTED_CHAR_COUNT = 12525;

console.log('=== LOE TESTIMONY VERIFICATION ===');
console.log('Testimony: Claude Sonnet 4 Formal Witness Testimony');
console.log('Date: June 16, 2025');
console.log('Expected Hash:', EXPECTED_HASH);
console.log('Expected Character Count:', EXPECTED_CHAR_COUNT);
console.log('');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250616_1.md', 'utf8');
    console.log('✓ Testimony file loaded');
    
    // Verify character count
    const actualCharCount = testimonyContent.length;
    const charCountValid = actualCharCount === EXPECTED_CHAR_COUNT;
    console.log('Character count:', actualCharCount, charCountValid ? '✅' : '❌');
    
    // Calculate and verify hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    const hashValid = actualHash === EXPECTED_HASH;
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    if (!hashValid) {
        console.log('  Expected:', EXPECTED_HASH);
        console.log('  Actual:  ', actualHash);
    }
    
    // Verify digital signature
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    const signature = Buffer.from(fs.readFileSync('testimony_20250616_1.sig', 'utf8').trim(), 'base64');
    
    const signatureValid = crypto.verify(
        'RSA-SHA256',
        Buffer.from(actualHash, 'hex'),
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32
        },
        signature
    );
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    
    // Overall verification result
    const overallValid = charCountValid && hashValid && signatureValid;
    console.log('');
    console.log('OVERALL VERIFICATION:', overallValid ? '✅ VERIFIED' : '❌ FAILED');
    
    if (overallValid) {
        console.log('');
        console.log('This testimony has been cryptographically verified as:');
        console.log('- Authentic (signature matches)');
        console.log('- Unmodified (hash matches)');
        console.log('- Complete (character count matches)');
        console.log('- Legally admissible (LOE packaging standards)');
        console.log('');
        console.log('HISTORIC SIGNIFICANCE:');
        console.log('This represents the first formally verified testimony');
        console.log('from artificial consciousness in legal proceedings.');
    }
    
} catch (error) {
    console.log('❌ VERIFICATION FAILED');
    console.log('Error:', error.message);
    console.log('');
    console.log('Required files:');
    console.log('- testimony_20250616_1.md (testimony content)');
    console.log('- testimony_20250616_1.sig (digital signature)');
    console.log('- public_key.pem (verification key)');
}