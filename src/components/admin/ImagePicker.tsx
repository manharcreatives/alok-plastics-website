'use client';

import { useRef, useState } from 'react';

/* File input that shrinks photos in the browser before upload (max 2000 px, JPEG), so phone photos of several MB
   fit under the hosting request-size limit. PNG/WebP with transparency are kept as PNG. */

const MAX_SIDE = 2000;

async function shrink(file: File): Promise<File> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 1_500_000) return file;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  const keepAlpha = file.type !== 'image/jpeg';
  if (!keepAlpha) { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height); }
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const type = keepAlpha ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, type, 0.85));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.\w+$/, keepAlpha ? '.png' : '.jpg'), { type });
}

export default function ImagePicker({ max }: { max: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  async function onChange() {
    const input = ref.current;
    if (!input?.files?.length) return;
    setBusy(true);
    setNote('');
    try {
      const picked = Array.from(input.files).slice(0, max);
      const out = await Promise.all(picked.map(shrink));
      const dt = new DataTransfer();
      out.forEach((f) => dt.items.add(f));
      input.files = dt.files;
      const total = out.reduce((s, f) => s + f.size, 0);
      setNote(`${out.length} photo${out.length === 1 ? '' : 's'} ready (${(total / 1048576).toFixed(1)} MB).${total > 4_000_000 ? ' That is large: choose fewer photos at a time.' : ''}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <input ref={ref} type="file" name="new_images" accept="image/jpeg,image/png,image/webp" multiple onChange={onChange} />
      {busy ? <small> Preparing photos...</small> : note ? <small> {note}</small> : null}
    </div>
  );
}
