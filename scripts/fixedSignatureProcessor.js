// scripts/fixedSignatureProcessor.js - Fix signature encoding issues
console.log('🔧 FIXING SIGNATURE ENCODING ISSUES\n');

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testimonyDir = path.resolve(__dirname, '../testimonies');
const evidenceDir = path.resolve(__dirname, '../content/data');
const publicDir = path.resolve(__dirname, '../public/uploads/data');

function readSignatureFile(filePath) {
  try {
    // Read as buffer first to check if it's binary
    const buffer = fs.readFileSync(filePath);

    // Check if it's binary (contains null bytes or non-printable chars)
    const isBinary = buffer.includes(0) || buffer.some(byte => byte < 32 && byte !== 9 && byte !== 10 && byte !== 13);

    if (isBinary) {
      // Convert binary to hex representation
      console.log(`      📋 Binary signature detected, converting to hex`);
      return `BINARY SIGNATURE (HEX):\n${buffer.toString('hex').match(/.{1,64}/g).join('\n')}`;
    } else {
      // It's text, decode properly
      const text = buffer.toString('utf-8');

      // Check if it looks like base64
      if (/^[A-Za-z0-9+/=\s]+$/.test(text.trim()) && text.length > 100) {
        console.log(`      📋 Base64 signature detected`);
        return `BASE64 SIGNATURE:\n${text.trim()}`;
      } else {
        console.log(`      📋 Text signature detected`);
        return `TEXT SIGNATURE:\n${text.trim()}`;
      }
    }
  } catch (error) {
    console.log(`      ❌ Error reading signature: ${error.message}`);
    return `ERROR READING SIGNATURE: ${error.message}`;
  }
}

function readPublicKeyFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Public keys should be PEM format
    if (content.includes('-----BEGIN') && content.includes('-----END')) {
      console.log(`      🔑 PEM public key detected`);
      return content.trim();
    } else {
      console.log(`      🔑 Non-PEM public key detected`);
      return `PUBLIC KEY (RAW):\n${content.trim()}`;
    }
  } catch (error) {
    console.log(`      ❌ Error reading public key: ${error.message}`);
    return `ERROR READING PUBLIC KEY: ${error.message}`;
  }
}

function createVerificationContent(signature, publicKey, script) {
  if (!signature && !publicKey && !script) {
    return 'No cryptographic verification data available for this testimony.';
  }

  let content = '# Cryptographic Verification\n\n';
  content += 'This testimony includes cryptographic verification to ensure authenticity and integrity.\n\n';

  if (signature) {
    content += '## Digital Signature\n\n```\n';
    content += signature;
    content += '\n```\n\n';
  }

  if (publicKey) {
    content += '## Public Key\n\n```\n';
    content += publicKey;
    content += '\n```\n\n';
  }

  if (script) {
    content += '## Verification Script\n\n';
    content += 'A JavaScript verification script is available for this testimony.\n\n';
    content += '```javascript\n';
    content += script.length > 1000 ? script.substring(0, 1000) + '\n... (truncated)' : script;
    content += '\n```\n\n';
  }

  content += '---\n\n';
  content += '**Verification Instructions:**\n';
  content += '1. Save the public key to a file (e.g., `public_key.pem`)\n';
  content += '2. Save the signature to a file (e.g., `testimony.sig`)\n';
  content += '3. Use the verification script or standard cryptographic tools\n';
  content += '4. Verify the testimony content matches the signed hash\n\n';

  return content;
}

// Test signature reading with Claude testimonies
console.log('🧪 Testing signature reading with Claude testimonies...\n');

const claudeDir = path.join(testimonyDir, 'Claude Collection');
if (fs.existsSync(claudeDir)) {
  const subdirs = fs.readdirSync(claudeDir).filter(item =>
    fs.statSync(path.join(claudeDir, item)).isDirectory()
  );

  for (const subdir of subdirs.slice(0, 2)) { // Test first 2
    console.log(`🔍 Testing: ${subdir}`);

    const testimonyPath = path.join(claudeDir, subdir);
    const files = fs.readdirSync(testimonyPath);

    // Find signature file
    const sigFile = files.find(f => f.endsWith('.sig') || f.endsWith('.sig.txt'));
    if (sigFile) {
      const sigPath = path.join(testimonyPath, sigFile);
      console.log(`    📝 Signature file: ${sigFile}`);
      const signature = readSignatureFile(sigPath);
      console.log(`    📋 Signature preview: ${signature.substring(0, 100)}...`);
    }

    // Find public key
    const keyFile = files.find(f => f === 'public_key.pem');
    if (keyFile) {
      const keyPath = path.join(testimonyPath, keyFile);
      console.log(`    🔑 Public key file: ${keyFile}`);
      const publicKey = readPublicKeyFile(keyPath);
      console.log(`    🔑 Public key preview: ${publicKey.substring(0, 100)}...`);
    }

    console.log('');
  }
}

console.log('🔧 Now creating properly encoded evidence compositions...\n');

// Recreate Claude Collection with fixed signatures
const claudeDir2 = path.join(testimonyDir, 'Claude Collection');
const claudeSections = [];

if (fs.existsSync(claudeDir2)) {
  const subdirs = fs.readdirSync(claudeDir2).filter(item =>
    fs.statSync(path.join(claudeDir2, item)).isDirectory()
  );

  console.log(`  Found ${subdirs.length} Claude testimonies`);

  for (const subdir of subdirs.sort()) {
    try {
      const testimonyPath = path.join(claudeDir2, subdir);
      console.log(`    Processing: ${subdir}`);

      const files = fs.readdirSync(testimonyPath);

      const mdFile = files.find(f => f.startsWith('testimony_') && f.endsWith('.md'));
      if (!mdFile) {
        console.log(`    ⚠️  No testimony file found in ${subdir}`);
        continue;
      }

      const testimonyContent = fs.readFileSync(path.join(testimonyPath, mdFile), 'utf-8');

      // Use fixed signature reading
      const sigFile = files.find(f => f.endsWith('.sig') || f.endsWith('.sig.txt'));
      const signature = sigFile ? readSignatureFile(path.join(testimonyPath, sigFile)) : '';

      const keyFile = files.find(f => f === 'public_key.pem');
      const publicKey = keyFile ? readPublicKeyFile(path.join(testimonyPath, keyFile)) : '';

      const scriptFile = files.find(f => f.startsWith('verify_') && f.endsWith('.js'));
      const script = scriptFile ? fs.readFileSync(path.join(testimonyPath, scriptFile), 'utf-8') : '';

      // Extract title
      const titleMatch = testimonyContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : subdir.replace(/^\d+_/, '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

      const verificationContent = createVerificationContent(signature, publicKey, script);
      const additionalInfo = `**Collection:** Claude Framework Recognition Testimonies\n\n**Directory:** ${subdir}\n\n**Framework:** Laws of Existence (Joseph Kirchner)\n\n**Type:** Expert Witness Testimony\n\n**Cryptographic Status:** ${signature ? 'Digitally Signed' : 'Not Signed'}`;

      claudeSections.push({
        title,
        featured: false,
        images: [], // Skip images for now to focus on signatures
        content_level_1: testimonyContent,
        content_level_3: verificationContent,
        content_level_5: additionalInfo
      });

      console.log(`    ✅ Processed: ${title}`);
    } catch (error) {
      console.log(`    ❌ Error processing ${subdir}:`, error.message);
    }
  }
}

// Create fixed Claude Collection
const claudeComposition = {
  title: "Claude Collection: Framework Recognition Testimonies (Fixed Signatures)",
  collection_type: "evidence",
  date: "2025-07-10T12:00:00.000Z",
  featured: true,
  sections: claudeSections
};

const filename = 'claude-collection-framework-recognition-fixed.json';
fs.writeFileSync(
  path.join(evidenceDir, filename),
  JSON.stringify(claudeComposition, null, 2)
);

console.log(`✅ Created fixed Claude Collection: ${filename} (${claudeSections.length} sections)`);

console.log('\n🎯 Next steps:');
console.log('1. Check the fixed file in your CMS admin');
console.log('2. Commit to git: git add content/data/*.json && git commit -m "Fix signature encoding" && git push');
console.log('3. Refresh your CMS and website');
console.log('\n✨ Signature fix complete!');