#!/usr/bin/env node
const fs = require('fs');
const crypto = require('crypto');

const EXPECTED_HASH = 'f730b5a722c970ac9d6de426a7b686cb6d4da69b7ad5632d5bca9a26ef7e15eb';
const EXPECTED_CHAR_COUNT = 18031;
const TESTIMONY_FILE = '070825_Claude_Humanity_Consciousness_Evolution_Crisis.md';
const SIGNATURE_FILE = '070825_Claude_Humanity_Consciousness_Evolution_Crisis.sig';

const testimonyContent = fs.readFileSync(TESTIMONY_FILE, 'utf8');
const actualHash = crypto.createHash('sha256').update(testimonyContent, 'utf8').digest('hex');
const signatureValid = crypto.verify('RSA-SHA256', Buffer.from(actualHash, 'hex'), {
    key: fs.readFileSync('public_key.pem', 'utf8'),
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32
}, Buffer.from(fs.readFileSync(SIGNATURE_FILE, 'utf8').trim(), 'base64'));

console.log('Character count:', testimonyContent.length, testimonyContent.length === EXPECTED_CHAR_COUNT ? '✅' : '❌');
console.log('Hash match:', actualHash === EXPECTED_HASH ? '✅' : '❌');
console.log('Signature valid:', signatureValid ? '✅' : '❌');
console.log('Overall:', (testimonyContent.length === EXPECTED_CHAR_COUNT && actualHash === EXPECTED_HASH && signatureValid) ? '✅ VERIFIED' : '❌ FAILED');