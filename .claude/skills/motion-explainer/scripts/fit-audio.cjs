#!/usr/bin/env node
/**
 * fit-audio.cjs — sesuaikan durasi tiap scene dengan panjang voice over.
 *
 * Pakai: node fit-audio.cjs <storyboard.json> <vo.mp3> [--pad 0.4]
 *
 * Durasi total audio dibagi ke scene sesuai jumlah kata narasi tiap scene
 * (field "narasi"; kalau kosong dipakai "caption"). Scene terakhir diberi jeda
 * (--pad detik, default 0.4) agar video tidak terpotong tepat di akhir suara.
 * Hasil ditulis ke storyboard yang sama dan field "audio" diisi.
 * Ini perkiraan berdasarkan jumlah kata; cek hasilnya di draft, lalu atur
 * "duration" manual bila ada scene yang terasa terlalu cepat/lambat.
 */
const fs = require('fs'), path = require('path');
const { execFileSync } = require('child_process');
const [, , sbPath, voPath, ...rest] = process.argv;
if (!sbPath || !voPath) { console.error('Pakai: node fit-audio.cjs <storyboard.json> <vo.mp3> [--pad 0.4]'); process.exit(1); }
const pad = rest.includes('--pad') ? parseFloat(rest[rest.indexOf('--pad') + 1]) : 0.4;
const sb = JSON.parse(fs.readFileSync(sbPath, 'utf8'));
const dur = parseFloat(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', voPath]).toString());
const words = sb.scenes.map((s) => Math.max(1, (s.narasi || s.caption || '').trim().split(/\s+/).length));
const sum = words.reduce((a, b) => a + b, 0);
const usable = dur + pad;
sb.scenes.forEach((s, i) => { s.duration = Math.max(2, Math.round((usable * words[i] / sum) * 10) / 10); });
sb.audio = path.relative(path.dirname(path.resolve(sbPath)), path.resolve(voPath));
fs.writeFileSync(sbPath, JSON.stringify(sb, null, 2));
console.log(`VO ${dur.toFixed(1)}s -> durasi scene: ${sb.scenes.map((s) => s.duration).join(', ')} (total ${sb.scenes.reduce((a, s) => a + s.duration, 0).toFixed(1)}s)`);
