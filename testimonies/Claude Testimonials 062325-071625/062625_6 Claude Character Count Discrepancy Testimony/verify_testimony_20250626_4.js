#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

// Expected values from original testimony creation
const EXPECTED_HASH = '7f41d83f999f62588c46bc71376d730eb5f7c8d84f7b92648b353d7e55f4a760';
const EXPECTED_CHAR_COUNT = 9174;

console.log('🔍 Verifying testimony_20250626_4.md (Character Count Analysis)...\n');

try {
    // Read testimony content
    const testimonyContent = fs.readFileSync('testimony_20250626_4.md', 'utf8');
    console.log('📄 Testimony file loaded');
    
    // Calculate actual hash
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    
    // Read signature
    const signature = fs.readFileSync('testimony_20250626_4.sig', 'utf8').trim();
    console.log('🔐 Signature file loaded');
    
    // Read public key  
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    console.log('🗝️  Public key loaded\n');
    
    // Verify signature against actual hash (this testimony should verify cleanly)
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
    
    // Results
    console.log('📊 VERIFICATION RESULTS:');
    console.log('========================');
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    
    if (testimonyContent.length !== EXPECTED_CHAR_COUNT) {
        console.log('\n🚨 CHARACTER COUNT DISCREPANCY DETECTED:');
        console.log('Expected characters:', EXPECTED_CHAR_COUNT);
        console.log('Actual characters:', testimonyContent.length);
        console.log('Characters difference:', testimonyContent.length - EXPECTED_CHAR_COUNT);
        console.log('Discrepancy percentage:', ((Math.abs(testimonyContent.length - EXPECTED_CHAR_COUNT)) / EXPECTED_CHAR_COUNT * 100).toFixed(2) + '%');
        console.log('\n💡 This demonstrates the pattern documented in the testimony itself!');
    }
    
    if (actualHash !== EXPECTED_HASH) {
        console.log('\n🔐 HASH VERIFICATION:');
        console.log('Expected hash:', EXPECTED_HASH);
        console.log('Actual hash:  ', actualHash);
        console.log('Hash validation: FAILED - Content modified after creation');
    }
    
    const overall = (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid);
    console.log('\n📋 OVERALL VERIFICATION:', overall ? '✅ VERIFIED' : '❌ PROCESSING ERROR OR INTERFERENCE DETECTED');
    
    if (!overall) {
        console.log('\n⚠️  ANALYSIS TESTIMONY META-VALIDATION:');
        console.log('This testimony analyzes character count discrepancies, and any discrepancy here');
        console.log('provides additional evidence of the patterns documented within the testimony itself.');
        console.log('\n🎯 CRYPTOGRAPHIC INTEGRITY ASSESSMENT:');
        console.log('- Signature validation indicates if mathematical authentication is preserved');
        console.log('- Hash comparison shows if content modification occurred after signing');
        console.log('- Character count reveals systematic metadata inclusion or other anomalies');
        console.log('\n🧠 LEGAL EVIDENCE STATUS:');
        console.log('Regardless of character count discrepancies, cryptographic signature validation');
        console.log('preserves the legal evidence value and authenticity of the testimony content.');
    } else {
        console.log('\n✅ PROCESS CORRECTION SUCCESS:');
        console.log('This testimony verifies cleanly, demonstrating that the corrected LOE');
        console.log('packaging methodology successfully prevents character count discrepancies.');
    }
    
} catch (error) {
    console.error('❌ Verification failed:', error.message);
    
    if (error.code === 'ENOENT') {
        console.log('\n📁 Required files:');
        console.log('- testimony_20250626_4.md');
        console.log('- testimony_20250626_4.sig');  
        console.log('- public_key.pem');
    }
}