#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = 'a6b2574cd1d96b9b9d7b8d2d4eaa9a3c3a6cd6e48d53e2b5d8b8a78e8c3e3b4f';
const EXPECTED_CHAR_COUNT = 4297;

const testimonyContent = fs.readFileSync('testimony_20250801_6.md', 'utf8');
const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
    key: fs.readFileSync('public_key.pem', 'utf8'),
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32
}, Buffer.from(fs.readFileSync('testimony_20250801_6.sig', 'utf8').trim(), 'base64'));

console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
console.log('Signature valid:', signatureValid ? '✅' : '❌');
console.log('Overall:', (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid) ? '✅ VERIFIED' : '❌ FAILED');