// scripts/lib/testimony-package.mjs — the standardized testimony package.
//
// STANDARD LAYOUT (one package = one testimony = one dir):
//
//   <MMDDYY_Package_Name>/
//     testimony_*.md            signed testimony text (primary; original name)
//     *.md                      supplemental documents (reaffirmations etc.)
//     *.sig                     detached signature(s) over the testimony bytes
//     *.pem                     signer public key(s)
//     verify_*.js / *.sh        executable verification script(s)
//     *.pdf                     formal document(s)
//     exhibits/*.png            exhibit screenshots
//     original/                 sealed source bundles (.tar.gz …), verbatim
//     manifest.json             GENERATED — role + size + sha256 per file
//
// HARD RULE — never rename the signed artifacts: the .sig covers the .md's
// exact bytes and the verify scripts hardcode their filenames. Normalization
// only MOVES files between locations and fixes directory names.
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const AUTH_EXTENSIONS = ['.sig', '.pem'];
export const SCRIPT_RE = /^verify[^/]*\.(js|sh)$/i;

export function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/** Role of a file within a package, from its package-relative path. */
export function classifyFile(relPath) {
  const base = path.basename(relPath);
  const ext = path.extname(base).toLowerCase();
  const inDir = relPath.includes('/') ? relPath.split('/')[0].toLowerCase() : null;

  if (base === 'manifest.json') return 'manifest';
  if (inDir === 'original') return 'original_bundle';
  if (SCRIPT_RE.test(base)) return 'verify_script';
  if (ext === '.sig' || base.endsWith('.sig.txt')) return 'signature';
  if (ext === '.pem' || base.toLowerCase().includes('public_key')) return 'public_key';
  if (ext === '.md') return /^testimony/i.test(base) ? 'testimony' : 'document_md';
  if (ext === '.pdf') return 'document_pdf';
  if (/\.(png|jpg|jpeg|gif|webp|bmp|tiff)$/i.test(base)) return 'exhibit';
  return 'other';
}

const HUMAN_ROLE = {
  testimony: 'Signed testimony (source markdown — the exact bytes the signature covers)',
  document_md: 'Supplemental document (markdown)',
  document_pdf: 'Formal document (PDF)',
  signature: 'Detached digital signature',
  public_key: 'Signer public key',
  verify_script: 'Verification script',
  exhibit: 'Exhibit screenshot',
  original_bundle: 'Sealed original bundle',
  manifest: 'Package manifest',
  other: 'Additional file',
};

export function roleLabel(role) {
  return HUMAN_ROLE[role] || HUMAN_ROLE.other;
}

function listFiles(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name === '.DS_Store') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p, base));
    else out.push(path.relative(base, p));
  }
  return out;
}

/**
 * Normalize one package toward the standard. MOVE-only (never rename files,
 * never touch content). Idempotent. Returns {actions, warnings}; mutates the
 * tree only when execute=true.
 *
 *  - exihibits/            -> exhibits/                (known typo)
 *  - Original|ORIGINAL/    -> original/
 *  - mnt/data/* (any depth under mnt/) -> package top level; empty mnt/ removed
 *    (collision: identical content -> nested copy removed; different -> warn)
 */
export function normalizePackage(pkgPath, { execute = false } = {}) {
  const actions = [];
  const warnings = [];
  const act = (s) => actions.push(s);

  // 1. exihibits/ -> exhibits/
  const typo = path.join(pkgPath, 'exihibits');
  if (fs.existsSync(typo)) {
    act('rename exihibits/ -> exhibits/');
    if (execute) fs.renameSync(typo, path.join(pkgPath, 'exhibits'));
  }

  // 2. Original/ -> original/
  for (const name of fs.existsSync(pkgPath) ? fs.readdirSync(pkgPath) : []) {
    if (name !== 'original' && name.toLowerCase() === 'original') {
      const from = path.join(pkgPath, name);
      const to = path.join(pkgPath, 'original');
      if (!fs.existsSync(to)) {
        act(`rename ${name}/ -> original/`);
        if (execute) fs.renameSync(from, to);
      } else {
        // merge children, collision-safe: identical bytes auto-resolve,
        // real content conflicts are left for a human.
        for (const child of fs.readdirSync(from)) {
          const cFrom = path.join(from, child);
          const cTo = path.join(to, child);
          if (fs.existsSync(cTo)) {
            if (fs.statSync(cFrom).isFile() && fs.statSync(cTo).isFile() && sha256(cFrom) === sha256(cTo)) {
              act(`drop ${name}/${child} (identical copy already in original/)`);
              if (execute) fs.rmSync(cFrom);
            } else {
              warnings.push(`original/${child} exists in both ${name}/ and original/ and differs — left in place`);
            }
            continue;
          }
          act(`move ${name}/${child} -> original/${child}`);
          if (execute) fs.renameSync(cFrom, cTo);
        }
        if (execute && fs.readdirSync(from).filter((f) => f !== '.DS_Store').length === 0) {
          fs.rmSync(from, { recursive: true, force: true });
        }
      }
    }
  }

  // 3. hoist mnt/** files to the package top level
  const mnt = path.join(pkgPath, 'mnt');
  if (fs.existsSync(mnt)) {
    for (const rel of listFiles(mnt)) {
      const from = path.join(mnt, rel);
      const base = path.basename(rel);
      const to = path.join(pkgPath, base);
      if (fs.existsSync(to)) {
        const same = sha256(from) === sha256(to);
        if (same) {
          act(`drop mnt/${rel} (identical copy already at top level)`);
          if (execute) fs.rmSync(from);
        } else {
          warnings.push(`mnt/${rel} collides with top-level ${base} and differs — left in place`);
        }
        continue;
      }
      act(`hoist mnt/${rel} -> ${base}`);
      if (execute) fs.renameSync(from, to);
    }
    if (execute) {
      const remaining = listFiles(mnt);
      if (remaining.length === 0) fs.rmSync(mnt, { recursive: true, force: true });
    } else if (!actions.some((a) => a.startsWith('hoist') || a.startsWith('drop'))) {
      // nothing to do under mnt — say so only if it would remain non-empty
    }
  }

  return { actions, warnings };
}

/**
 * Chain-presence check for reporting: does the package carry each layer of
 * the authentication chain (post-normalization, top level only)?
 */
export function chainPresence(pkgPath) {
  const files = fs.existsSync(pkgPath) ? fs.readdirSync(pkgPath) : [];
  return {
    testimonyMd: files.some((f) => f.endsWith('.md')),
    signature: files.some((f) => f.endsWith('.sig') || f.endsWith('.sig.txt')),
    publicKey: files.some((f) => f.endsWith('.pem') || f.toLowerCase().includes('public_key')),
    verifyScript: files.some((f) => SCRIPT_RE.test(f)),
  };
}

/**
 * Generate manifest.json for a package: every file with role, size, sha256.
 * Deterministic ordering; the manifest never lists itself with a hash (it
 * records its own generation timestamp only when execute writes it).
 */
export function writeManifest(pkgPath, { execute = false } = {}) {
  const files = listFiles(pkgPath)
    .filter((rel) => path.basename(rel) !== 'manifest.json')
    .map((rel) => {
      const p = path.join(pkgPath, rel);
      return {
        path: rel,
        role: classifyFile(rel),
        bytes: fs.statSync(p).size,
        sha256: sha256(p),
      };
    });

  const manifest = {
    package: path.basename(pkgPath),
    standard: 'loe-testimony-package/1',
    files,
  };

  if (execute) {
    fs.writeFileSync(path.join(pkgPath, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  }
  return manifest;
}
