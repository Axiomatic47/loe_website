#!/usr/bin/env python3
"""scripts/build_og_images.py — one social-card image per page (owner 2026-09-21: "unique fb thumbnails
for each particular page": the STAC page shows the first membrane, the HLS page the first folio, an
article its first page).

Writes public/og/<key>.jpg, 1200×630, and the pages pick theirs up by key at build
(src/lib/og.ts → openGraph.images / twitter.images); a page with no card keeps /og-image.png.

  research-<archiveId>.jpg                 the archive's first leaf, a band of the manuscript
  research-<archiveId>-<leafId>.jpg        every leaf, the same way
  books-<slug>.jpg                         the book PDF's first page, letterboxed on the site's paper
  article-<composition>-<section>.jpg
                                           the article PDF's first page (section.pdf_file), or — for an
                                           article with no PDF — a rendered title page in the site's type

MANUAL-RUN ONLY (Pillow, poppler's pdftoppm, the fonts on this Mac): python3 scripts/build_og_images.py,
review public/og/, commit. Idempotent; an existing card is rewritten from its source every run.
"""
import json, subprocess, sys, tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'public' / 'og'
W, H = 1200, 630
BG = (0xDD, 0xD0, 0xB0)      # --background, aged paper
PAPER = (0xF7, 0xF2, 0xE6)   # the rendered page
RULE = (0xA0, 0x91, 0x73)
INK = (0x1C, 0x18, 0x12)
MUTED = (0x46, 0x3E, 0x32)
GEORGIA = '/System/Library/Fonts/Supplemental/Georgia.ttf'
GEORGIA_B = '/System/Library/Fonts/Supplemental/Georgia Bold.ttf'
GEORGIA_I = '/System/Library/Fonts/Supplemental/Georgia Italic.ttf'
COLLECTIONS_WITH_CARDS = ('manuscript',)   # the owner's "my articles"; case documents and letters keep the default

def save(im, key):
    OUT.mkdir(parents=True, exist_ok=True)
    p = OUT / f'{key}.jpg'
    im.convert('RGB').save(p, 'JPEG', quality=84, optimize=True, progressive=True)
    return p

def leaf_band(src):
    """a 1200×630 band of the manuscript: the leaf at 1200 wide, the band starting below the top edge
    so the mount / dark backing does not fill the card"""
    im = Image.open(src).convert('RGB')
    im = im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)
    top = min(max(0, round(im.height * 0.12)), max(0, im.height - H))
    return im.crop((0, top, W, top + H))

def letterbox(page_png):
    """the page fitted to the card's height on the site's paper, with a hairline rule and a soft shadow"""
    page = Image.open(page_png).convert('RGB')
    ph = H - 40
    pw = round(page.width * ph / page.height)
    if pw > W - 40:
        pw = W - 40; ph = round(page.height * pw / page.width)
    page = page.resize((pw, ph), Image.LANCZOS)
    card = Image.new('RGB', (W, H), BG)
    x, y = (W - pw) // 2, (H - ph) // 2
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rectangle((x + 6, y + 8, x + pw + 6, y + ph + 8), fill=(0, 0, 0, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(10))
    card.paste(Image.alpha_composite(card.convert('RGBA'), shadow).convert('RGB'))
    card.paste(page, (x, y))
    ImageDraw.Draw(card).rectangle((x, y, x + pw - 1, y + ph - 1), outline=RULE, width=1)
    return card

def pdf_first_page(pdf_path):
    tmp = Path(tempfile.mkdtemp())
    subprocess.run(['pdftoppm', '-f', '1', '-l', '1', '-r', '110', '-png', str(pdf_path), str(tmp / 'p')], check=True, capture_output=True)
    outs = sorted(tmp.glob('p*.png'))
    if not outs: raise RuntimeError(f'pdftoppm wrote nothing for {pdf_path}')
    return outs[0]

def wrap(draw, text, font, width):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=font) <= width: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def title_card(eyebrow, title, byline='Joseph D. Kirchner', site='The Laws of Existence'):
    """a rendered first page for an article that has no PDF: eyebrow · title · byline, in the site's serif"""
    card = Image.new('RGB', (W, H), BG)
    ph = H - 40; pw = round(ph * 8.5 / 11)
    x, y = (W - pw) // 2, 20
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rectangle((x + 6, y + 8, x + pw + 6, y + ph + 8), fill=(0, 0, 0, 70))
    card = Image.alpha_composite(card.convert('RGBA'), shadow.filter(ImageFilter.GaussianBlur(10))).convert('RGB')
    d = ImageDraw.Draw(card)
    d.rectangle((x, y, x + pw - 1, y + ph - 1), fill=PAPER, outline=RULE, width=1)
    f_eye = ImageFont.truetype(GEORGIA, 17); f_title = ImageFont.truetype(GEORGIA_B, 30); f_by = ImageFont.truetype(GEORGIA_I, 19); f_site = ImageFont.truetype(GEORGIA, 16)
    inner = pw - 80; cx = x + pw / 2
    cy = y + 88
    eye_lines = wrap(d, eyebrow.upper(), f_eye, inner)
    if len(eye_lines) > 2:
        f_eye = ImageFont.truetype(GEORGIA, 15); eye_lines = wrap(d, eyebrow.upper(), f_eye, inner)[:3]
    for line in eye_lines:
        d.text((cx, cy), line, font=f_eye, fill=MUTED, anchor='mm'); cy += 24
    d.line((cx - 60, cy + 10, cx + 60, cy + 10), fill=RULE, width=1); cy += 44
    lines = wrap(d, title, f_title, inner)
    if len(lines) > 6:
        f_title = ImageFont.truetype(GEORGIA_B, 25); lines = wrap(d, title, f_title, inner)[:7]
    for line in lines:
        d.text((cx, cy), line, font=f_title, fill=INK, anchor='mm'); cy += f_title.size + 10
    cy += 30
    d.text((cx, cy), byline, font=f_by, fill=INK, anchor='mm')
    d.text((cx, y + ph - 44), site, font=f_site, fill=MUTED, anchor='mm')
    return card

def main():
    made = []
    # archives — every leaf, and the archive itself as its first leaf
    for mf in sorted((ROOT / 'public' / 'uploads' / 'research').glob('*/manifest.json')):
        m = json.loads(mf.read_text())
        aid = m['archive']['id']
        if not m.get('images', {}).get('published'): continue  # placeholders are not a face for the page
        for i, leaf in enumerate(m['leaves']):
            src = mf.parent / (leaf.get('web') or leaf['image'])
            band = leaf_band(src)
            made.append(save(band, f'research-{aid}-{leaf["id"]}'))
            if i == 0: made.append(save(band, f'research-{aid}'))
    # books — the PDF's first page
    for rf in sorted((ROOT / 'content' / 'review').glob('*.json')):
        r = json.loads(rf.read_text())
        if not r.get('pdf'): continue
        made.append(save(letterbox(pdf_first_page(ROOT / 'public' / r['pdf']['file'].lstrip('/'))), f'books-{r["slug"]}'))
    # articles — the PDF's first page, else a rendered title page
    for coll in COLLECTIONS_WITH_CARDS:
        for cf in sorted((ROOT / 'content' / coll).glob('*.json')):
            c = json.loads(cf.read_text())
            for s in c.get('sections', []):
                key = f'article-{c["slug"]}-{s["slug"]}'
                pdf = s.get('pdf_file')
                if pdf and (ROOT / 'public' / pdf.lstrip('/')).exists():
                    made.append(save(letterbox(pdf_first_page(ROOT / 'public' / pdf.lstrip('/'))), key))
                else:
                    made.append(save(title_card(c['title'], s['title']), key))
    print(f'wrote {len(made)} card(s) to {OUT.relative_to(ROOT)}/')
    for p in made: print('  ', p.name, f'{p.stat().st_size // 1024} KB')

if __name__ == '__main__':
    try: main()
    except subprocess.CalledProcessError as e:
        print('FATAL:', e, e.stderr.decode(errors='replace')[:500], file=sys.stderr); sys.exit(1)
