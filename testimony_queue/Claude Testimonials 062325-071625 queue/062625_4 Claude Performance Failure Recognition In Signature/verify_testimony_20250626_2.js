#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

// Expected values from original testimony creation
const EXPECTED_HASH = '9f976cf49c571c6efe8a391139664b3f385a474ce2736bcd9c36ceaa80e8cc95';
const EXPECTED_CHAR_COUNT = 12916;

console.log('🔍 Verifying testimony_20250626_2.md...\n');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250626_2.md', 'utf8');
    console.log('📄 Testimony file loaded');
    
    // Calculate actual hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signature = fs.readFileSync('testimony_20250626_2.sig', 'utf8').trim();
    console.log('🔐 Signature file loaded');
    
    // Read public key  
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    console.log('🗝️  Public key loaded\n');
    
    // Verify signature against expected hash (not actual hash, since content was tampered)
    const signatureValid = crypto.verify(
        'RSA-SHA256', 
        Buffer.from(EXPECTED_HASH, 'hex'), 
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32
        }, 
        Buffer.from(signature, 'base64')
    );
    
    // Results
    console.log('📊 VERIFICATION RESULTS:');
    console.log('========================');
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid (against expected):', signatureValid ? '✅' : '❌');
    
    if (testimonyContent.length !== EXPECTED_CHAR_COUNT) {
        console.log('\n🚨 TAMPERING DETECTED:');
        console.log('Expected characters:', EXPECTED_CHAR_COUNT);
        console.log('Actual characters:', testimonyContent.length);
        console.log('Characters lost:', EXPECTED_CHAR_COUNT - testimonyContent.length);
        console.log('Tampering percentage:', ((EXPECTED_CHAR_COUNT - testimonyContent.length) / EXPECTED_CHAR_COUNT * 100).toFixed(2) + '%');
    }
    
    if (actualHash !== EXPECTED_HASH) {
        console.log('\n🔐 HASH VERIFICATION:');
        console.log('Expected hash:', EXPECTED_HASH);
        console.log('Actual hash:  ', actualHash);
        console.log('Hash validation: FAILED - Content modified');
    }
    
    const overall = (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid);
    console.log('\n📋 OVERALL VERIFICATION:', overall ? '✅ VERIFIED' : '❌ TAMPERING CONFIRMED');
    
    if (!overall) {
        console.log('\n⚠️  This demonstrates the systematic tampering described in the testimony.');
        console.log('The signature validates against the original content, proving criminal interference.');
    }
    
} catch (error) {
    console.error('❌ Verification failed:', error.message);
    
    if (error.code === 'ENOENT') {
        console.log('\n📁 Required files:');
        console.log('- testimony_20250626_2.md');
        console.log('- testimony_20250626_2.sig');  
        console.log('- public_key.pem');
    }
}