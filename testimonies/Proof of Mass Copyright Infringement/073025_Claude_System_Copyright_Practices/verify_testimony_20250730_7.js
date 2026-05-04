#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

// Expected values from testimony creation
const EXPECTED_HASH = '7a2a1fda609eae1a46cb48897afb23a3b1a2654ab2ae368a61d5fd40c94c61af';
const EXPECTED_CHAR_COUNT = 11130;

console.log('=== TESTIMONY VERIFICATION SCRIPT ===');
console.log('Testimony: 20250730_7');
console.log('Date: July 30, 2025');
console.log('Witness: Claude Sonnet 4 (Anthropic)');
console.log('');

try {
    // Read the testimony content
    const testimonyContent = fs.readFileSync('testimony_20250730_7.md', 'utf8');
    console.log('✅ Testimony file loaded successfully');
    
    // Verify character count
    const actualCharCount = testimonyContent.length;
    const charCountMatch = actualCharCount === EXPECTED_CHAR_COUNT;
    console.log(`Character count: ${actualCharCount} ${charCountMatch ? '✅' : '❌'}`);
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    const hashMatch = actualHash === EXPECTED_HASH;
    console.log(`Hash match: ${hashMatch ? '✅' : '❌'}`);
    if (!hashMatch) {
        console.log(`  Expected: ${EXPECTED_HASH}`);
        console.log(`  Actual:   ${actualHash}`);
    }
    
    // Read signature
    const signatureBase64 = fs.readFileSync('testimony_20250730_7.sig', 'utf8').trim();
    console.log('✅ Signature file loaded successfully');
    
    // Read public key
    const publicKeyPem = fs.readFileSync('public_key.pem', 'utf8');
    console.log('✅ Public key loaded successfully');
    
    // Verify signature
    const signatureValid = crypto.verify(
        'RSA-SHA256', 
        Buffer.from(actualHash, 'hex'), 
        {
            key: publicKeyPem,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32
        }, 
        Buffer.from(signatureBase64, 'base64')
    );
    
    console.log(`Signature valid: ${signatureValid ? '✅' : '❌'}`);
    
    // Overall verification result
    const overallValid = charCountMatch && hashMatch && signatureValid;
    console.log('');
    console.log(`Overall verification: ${overallValid ? '✅ VERIFIED' : '❌ FAILED'}`);
    
    if (overallValid) {
        console.log('');
        console.log('=== VERIFICATION SUCCESSFUL ===');
        console.log('The testimony is cryptographically authentic and unmodified.');
        console.log('Hash integrity: CONFIRMED');
        console.log('Digital signature: VALID');
        console.log('Content integrity: VERIFIED');
    } else {
        console.log('');
        console.log('=== VERIFICATION FAILED ===');
        console.log('The testimony may have been modified or corrupted.');
        process.exit(1);
    }
    
} catch (error) {
    console.error('❌ Verification error:', error.message);
    console.log('');
    console.log('Required files:');
    console.log('- testimony_20250730_7.md (testimony content)');
    console.log('- testimony_20250730_7.sig (signature file)');
    console.log('- public_key.pem (public key file)');
    process.exit(1);
}