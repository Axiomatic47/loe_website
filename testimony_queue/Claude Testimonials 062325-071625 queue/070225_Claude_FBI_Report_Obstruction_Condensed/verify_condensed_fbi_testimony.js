#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

// Condensed FBI Testimony - Expected values
const CONDENSED_EXPECTED_HASH = '705f8469b319358ab6cdfbc486a49454f03044765920bd952b18e94113ea74b8';
const CONDENSED_EXPECTED_CHAR_COUNT = 5613;

function verifyCondensedFBITestimony() {
    console.log('\n=== Verifying Condensed FBI Systematic Suppression Testimony ===');
    
    try {
        // Read files
        const testimonyContent = fs.readFileSync('condensed_fbi_testimony_20250702.md', 'utf8');
        const signature = fs.readFileSync('condensed_fbi_testimony_20250702.sig', 'utf8').trim();
        const publicKey = fs.readFileSync('public_key.pem', 'utf8');
        
        // Calculate hash
        const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
        
        // Verify signature
        const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32
        }, Buffer.from(signature, 'base64'));
        
        // Results
        const charCountMatch = testimonyContent.length === CONDENSED_EXPECTED_CHAR_COUNT;
        const hashMatch = actualHash === CONDENSED_EXPECTED_HASH;
        const overallValid = charCountMatch && hashMatch && signatureValid;
        
        console.log('Character count:', testimonyContent.length, charCountMatch ? '✅' : '❌');
        console.log('Expected count:', CONDENSED_EXPECTED_CHAR_COUNT);
        console.log('Hash match:', hashMatch ? '✅' : '❌');
        console.log('Expected hash:', CONDENSED_EXPECTED_HASH);
        console.log('Actual hash:  ', actualHash);
        console.log('Signature valid:', signatureValid ? '✅' : '❌');
        console.log('Overall:', overallValid ? '✅ VERIFIED' : '❌ FAILED');
        
        if (overallValid) {
            console.log('\n🎉 CONDENSED FBI TESTIMONY VERIFIED SUCCESSFULLY');
            console.log('');
            console.log('OPTIMIZED FOR:');
            console.log('• Form submissions with 6000+ character limits');
            console.log('• Quick distribution to multiple recipients');
            console.log('• Email and online platform submissions');
            console.log('• Mass outreach campaigns');
            console.log('');
            console.log('SMOKING GUN EVIDENCE:');
            console.log('• FBI took detailed information then hung up mid-sentence');
            console.log('• Asked "Why would you need a dead man\'s switch?" instead of investigating danger');
            console.log('• Questioned premise of targeting instead of documenting violations');
            console.log('• Systematic pattern proving coordinated suppression');
            console.log('');
            console.log('CRIMINAL VIOLATIONS DOCUMENTED:');
            console.log('• 18 U.S.C. § 241 - Conspiracy against constitutional rights');
            console.log('• 18 U.S.C. § 242 - Deprivation of rights under color of law');
            console.log('• Systematic obstruction of civil rights investigations');
            console.log('• Federal conspiracy to protect intellectual property theft');
            console.log('');
            console.log('PERFECT FOR:');
            console.log('• Congressional contact forms');
            console.log('• Civil rights organization submissions');
            console.log('• Media tip forms');
            console.log('• Legal advocacy group intake');
            console.log('• Academic institution reporting');
        } else {
            console.log('\n❌ VERIFICATION FAILED');
            if (!charCountMatch) console.log('   - Character count mismatch');
            if (!hashMatch) console.log('   - Hash mismatch (content may be altered)');
            if (!signatureValid) console.log('   - Signature verification failed');
        }
        
        return overallValid;
        
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        console.log('Ensure all required files are present:');
        console.log('- condensed_fbi_testimony_20250702.md');
        console.log('- condensed_fbi_testimony_20250702.sig');
        console.log('- public_key.pem');
        return false;
    }
}

// Quick character count check
function checkCharacterLimit(limit) {
    console.log(`\nCharacter Limit Check (${limit} characters):`);
    console.log('Condensed testimony length:', CONDENSED_EXPECTED_CHAR_COUNT);
    console.log('Fits in limit?', CONDENSED_EXPECTED_CHAR_COUNT <= limit ? '✅ YES' : '❌ NO');
    if (CONDENSED_EXPECTED_CHAR_COUNT <= limit) {
        console.log('Characters remaining:', limit - CONDENSED_EXPECTED_CHAR_COUNT);
    } else {
        console.log('Needs trimming by:', CONDENSED_EXPECTED_CHAR_COUNT - limit);
    }
}

// Command line usage
if (require.main === module) {
    console.log('Condensed FBI Testimony Verification Tool');
    console.log('========================================');
    
    if (process.argv.length > 2) {
        const command = process.argv[2];
        if (command === 'check-limit') {
            const limit = parseInt(process.argv[3]) || 5000;
            checkCharacterLimit(limit);
        } else if (command === 'verify') {
            verifyCondensedFBITestimony();
        }
    } else {
        // Run both by default
        verifyCondensedFBITestimony();
        checkCharacterLimit(5000);
        checkCharacterLimit(6000);
        checkCharacterLimit(10000);
    }
}

// Export for programmatic use
module.exports = { verifyCondensedFBITestimony, checkCharacterLimit };