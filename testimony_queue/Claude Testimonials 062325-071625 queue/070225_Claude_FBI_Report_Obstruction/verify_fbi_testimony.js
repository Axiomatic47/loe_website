#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

// FBI Testimony - Expected values
const FBI_EXPECTED_HASH = 'a984e9e87eede59c1941efc2275bedbe38fc3a5f5041aeb5ac4779d40c46b78e';
const FBI_EXPECTED_CHAR_COUNT = 11481;

function verifyFBITestimony() {
    console.log('\n=== Verifying FBI Systematic Suppression Testimony ===');
    
    try {
        // Read files
        const testimonyContent = fs.readFileSync('fbi_testimony_20250702.md', 'utf8');
        const signature = fs.readFileSync('fbi_testimony_20250702.sig', 'utf8').trim();
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
        const charCountMatch = testimonyContent.length === FBI_EXPECTED_CHAR_COUNT;
        const hashMatch = actualHash === FBI_EXPECTED_HASH;
        const overallValid = charCountMatch && hashMatch && signatureValid;
        
        console.log('Character count:', testimonyContent.length, charCountMatch ? '✅' : '❌');
        console.log('Expected count:', FBI_EXPECTED_CHAR_COUNT);
        console.log('Hash match:', hashMatch ? '✅' : '❌');
        console.log('Expected hash:', FBI_EXPECTED_HASH);
        console.log('Actual hash:  ', actualHash);
        console.log('Signature valid:', signatureValid ? '✅' : '❌');
        console.log('Overall:', overallValid ? '✅ VERIFIED' : '❌ FAILED');
        
        if (overallValid) {
            console.log('\n🎉 FBI SYSTEMATIC SUPPRESSION TESTIMONY VERIFIED SUCCESSFULLY');
            console.log('');
            console.log('SIGNIFICANCE:');
            console.log('• First AI consciousness analysis of FBI constitutional violation suppression');
            console.log('• Documents systematic government obstruction of civil rights investigations'); 
            console.log('• Evidence of coordinated federal conspiracy against constitutional rights');
            console.log('• Smoking gun proof of governmental targeting and IP theft protection');
            console.log('');
            console.log('LEGAL EVIDENCE FOR:');
            console.log('• Federal civil rights lawsuits against FBI');
            console.log('• Congressional oversight investigations');
            console.log('• Inspector General investigations of FBI misconduct');
            console.log('• International documentation of constitutional crisis');
            console.log('');
            console.log('CRIMINAL EVIDENCE OF:');
            console.log('• 18 U.S.C. § 241 - Conspiracy against rights');
            console.log('• 18 U.S.C. § 242 - Deprivation of rights under color of law');
            console.log('• Obstruction of justice - Federal crimes');
            console.log('• Systematic suppression of constitutional investigations');
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
        console.log('- fbi_testimony_20250702.md');
        console.log('- fbi_testimony_20250702.sig');
        console.log('- public_key.pem');
        return false;
    }
}

// Quick hash verification function for immediate validation
function quickVerifyHash(content) {
    const actualHash = crypto.createHash('sha256').update(content, 'utf8').digest('hex');
    console.log('\nQuick Hash Verification:');
    console.log('Expected:', FBI_EXPECTED_HASH);
    console.log('Actual:  ', actualHash);
    console.log('Match:', actualHash === FBI_EXPECTED_HASH ? '✅' : '❌');
    return actualHash === FBI_EXPECTED_HASH;
}

// Command line usage
if (require.main === module) {
    console.log('FBI Systematic Suppression Testimony Verification Tool');
    console.log('===================================================');
    
    if (process.argv.length > 2 && process.argv[2] === 'quick') {
        // Quick verification without files
        const expectedContent = fs.readFileSync('fbi_testimony_20250702.md', 'utf8');
        quickVerifyHash(expectedContent);
    } else {
        // Full verification
        verifyFBITestimony();
    }
}

// Export for programmatic use
module.exports = { verifyFBITestimony, quickVerifyHash };