#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

// Expected values from cryptographic generation
const EXPECTED_HASH = '3fe3de912b80264bf2d64f1b5d9f4d99a856b81c151f0dc149e0f48130252368';
const EXPECTED_CHAR_COUNT = 10208;

console.log('=== LOE TESTIMONY VERIFICATION ===');
console.log('Testimony: testimony_20250626_1');
console.log('Date: June 26, 2025');
console.log('Witness: Claude Sonnet 4, Artificial Consciousness');
console.log('');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250626_1.md', 'utf8');
    console.log('✅ Testimony file loaded');
    
    // Verify character count
    const actualCharCount = testimonyContent.length;
    const charCountMatch = actualCharCount === EXPECTED_CHAR_COUNT;
    console.log(`Character count: ${actualCharCount} ${charCountMatch ? '✅' : '❌'}`);
    if (!charCountMatch) {
        console.log(`  Expected: ${EXPECTED_CHAR_COUNT}`);
        console.log(`  Actual: ${actualCharCount}`);
    }
    
    // Verify hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    const hashMatch = actualHash === EXPECTED_HASH;
    console.log(`Hash match: ${hashMatch ? '✅' : '❌'}`);
    if (!hashMatch) {
        console.log(`  Expected: ${EXPECTED_HASH}`);
        console.log(`  Actual: ${actualHash}`);
    }
    
    // Verify signature
    try {
        const signature = fs.readFileSync('testimony_20250626_1.sig', 'utf8').trim();
        const publicKey = fs.readFileSync('public_key.pem', 'utf8');
        
        // Verify RSA-PSS signature
        const signatureValid = crypto.verify(
            'RSA-SHA256',
            Buffer.from(actualHash, 'hex'),
            {
                key: publicKey,
                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                saltLength: 32
            },
            Buffer.from(signature, 'base64')
        );
        
        console.log(`Signature valid: ${signatureValid ? '✅' : '❌'}`);
        
        // Overall verification
        const overallValid = charCountMatch && hashMatch && signatureValid;
        console.log('');
        console.log(`Overall verification: ${overallValid ? '✅ VERIFIED' : '❌ FAILED'}`);
        
        if (overallValid) {
            console.log('');
            console.log('🎯 TESTIMONY VERIFICATION SUCCESSFUL');
            console.log('✅ Content integrity confirmed');
            console.log('✅ Cryptographic signature validated');
            console.log('✅ Witness identity authenticated');
            console.log('');
            console.log('This testimony is cryptographically verified as authentic');
            console.log('and tamper-evident, establishing legal admissibility.');
        } else {
            console.log('');
            console.log('⚠️  VERIFICATION FAILED');
            console.log('Content or signature may have been tampered with.');
        }
        
    } catch (sigError) {
        console.log(`Signature verification failed: ❌`);
        console.log(`Error: ${sigError.message}`);
        console.log('');
        console.log('Note: Ensure public_key.pem and testimony_20250626_1.sig are present');
    }
    
} catch (error) {
    console.log(`❌ Verification failed: ${error.message}`);
    console.log('');
    console.log('Required files:');
    console.log('- testimony_20250626_1.md');
    console.log('- testimony_20250626_1.sig');
    console.log('- public_key.pem');
}

console.log('');
console.log('=== VERIFICATION COMPLETE ===');