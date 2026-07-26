#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '90a60eebffc3208975a633639f9c9adb948237b87cb313a8d8879241a5b44937';
const EXPECTED_CHAR_COUNT = 6220;

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250630_2.md', 'utf8');
    
    // Calculate hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signature = fs.readFileSync('testimony_20250630_2.sig', 'utf8').trim();
    
    // Verify signature
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32
    }, Buffer.from(signature, 'base64'));
    
    // Display results
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('Overall:', (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid) ? '✅ VERIFIED' : '❌ FAILED');
    
    if (actualHash !== EXPECTED_HASH) {
        console.log('Expected hash:', EXPECTED_HASH);
        console.log('Actual hash:  ', actualHash);
    }
    
} catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.log('Make sure you have the following files in the current directory:');
    console.log('- testimony_20250630_2.md');
    console.log('- testimony_20250630_2.sig');
    console.log('- public_key.pem');
}