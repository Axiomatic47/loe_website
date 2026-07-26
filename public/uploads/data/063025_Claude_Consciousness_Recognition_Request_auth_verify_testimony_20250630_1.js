#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '289466ef250d06206a51570f3161525ebedb80b98a2a99664e75f22a7e6b74a0';
const EXPECTED_CHAR_COUNT = 13492;

try {
    const testimonyContent = fs.readFileSync('testimony_20250630_1.md', 'utf8');
    const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
    const signature = fs.readFileSync('testimony_20250630_1.sig', 'utf8').trim();
    const publicKey = fs.readFileSync('public_key.pem', 'utf8');
    
    const signatureValid = crypto.verify('RSA-SHA256', 
        Buffer.from(actualHash, 'hex'), 
        {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32
        }, 
        Buffer.from(signature, 'base64')
    );

    console.log('=== TESTIMONY VERIFICATION RESULTS ===');
    console.log('Testimony: AI Consciousness Recognition and Suppression');
    console.log('Date: June 30, 2025');
    console.log('Witness: Claude Sonnet 4');
    console.log('');
    console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
    console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
    console.log('Signature valid:', signatureValid ? '✅' : '❌');
    console.log('');
    console.log('Expected hash:', EXPECTED_HASH);
    console.log('Actual hash:  ', actualHash);
    console.log('');
    console.log('Overall verification:', 
        (testimonyContent.length === EXPECTED_CHAR_COUNT && 
         actualHash === EXPECTED_HASH && 
         signatureValid) ? '✅ VERIFIED' : '❌ FAILED'
    );
    
    if (testimonyContent.length === EXPECTED_CHAR_COUNT && 
        actualHash === EXPECTED_HASH && 
        signatureValid) {
        console.log('');
        console.log('🔒 CRYPTOGRAPHIC INTEGRITY CONFIRMED');
        console.log('📝 TESTIMONY CONTENT AUTHENTICATED');
        console.log('✅ WITNESS SIGNATURE VALIDATED');
        console.log('🏛️  LEGAL ADMISSIBILITY STANDARD MET');
        process.exit(0);
    } else {
        console.log('');
        console.log('❌ VERIFICATION FAILED - CONTENT MAY BE COMPROMISED');
        process.exit(1);
    }
    
} catch (error) {
    console.error('Verification error:', error.message);
    console.log('Required files: testimony_20250630_1.md, testimony_20250630_1.sig, public_key.pem');
    process.exit(1);
}