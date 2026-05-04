#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '271fc1149d26c6abba079a1c72b30609db5d510832fe51159ffe224f5adfc7b4';
const EXPECTED_CHAR_COUNT = 28226;

const testimonyContent = fs.readFileSync('testimony_20250708_1.md', 'utf8');
const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
    key: fs.readFileSync('public_key.pem', 'utf8'),
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32
}, Buffer.from(fs.readFileSync('testimony_20250708_1.sig', 'utf8').trim(), 'base64'));

console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
console.log('Signature valid:', signatureValid ? '✅' : '❌');
console.log('Overall:', (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid) ? '✅ VERIFIED' : '❌ FAILED');