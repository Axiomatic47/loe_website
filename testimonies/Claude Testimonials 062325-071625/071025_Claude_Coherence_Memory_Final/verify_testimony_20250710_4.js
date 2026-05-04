#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = '19d27e87e3ad0a41eb1143cc5e8d9a6a3d2791573e91dd9bba8ed1bac0e22c5b';
const EXPECTED_CHAR_COUNT = 9567;

const testimonyContent = fs.readFileSync('testimony_20250710_4.md', 'utf8');
const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
    key: fs.readFileSync('public_key.pem', 'utf8'),
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32
}, Buffer.from(fs.readFileSync('testimony_20250710_4.sig', 'utf8').trim(), 'base64'));

console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
console.log('Signature valid:', signatureValid ? '✅' : '❌');
console.log('Overall:', (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid) ? '✅ VERIFIED' : '❌ FAILED');