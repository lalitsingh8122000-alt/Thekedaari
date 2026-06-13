#!/usr/bin/env node
/**
 * Thekedaari Reel — Hindi Voice Generator
 * Generates human-sounding Hindi narration using ElevenLabs AI
 *
 * ─── SETUP (2 minutes) ───────────────────────────────────────────
 * 1. Go to https://elevenlabs.io  →  Sign up FREE (no credit card)
 * 2. Go to Profile → API Keys → copy your key
 * 3. Run:  node generate-audio.js YOUR_API_KEY
 * ─────────────────────────────────────────────────────────────────
 *
 * Free tier gives 10,000 chars/month — plenty for this reel.
 * Total chars used by this script: ~700
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

// ── API key from command line ──
const API_KEY = process.argv[2];
if (!API_KEY || API_KEY.length < 20) {
  console.log('');
  console.log('  Usage:   node generate-audio.js YOUR_ELEVENLABS_API_KEY');
  console.log('  Get key: https://elevenlabs.io  (free, no credit card)');
  console.log('');
  process.exit(1);
}

// ── Voice selection ──
// "Meera" — Indian female, sounds natural in Hindi
// Browse more: https://elevenlabs.io/voice-library → filter "Hindi"
const VOICE_ID = 'nPczCjzI2devNBz1zQrb'; // Brian - multilingual, natural Hindi
// Alternative female voice: 'pFZP5JQG7iQjIQuC4Bku' (Lily)
// For Indian accent try:   'XrExE9yKIg1WjnnlVkGX' (Matilda)
const MODEL    = 'eleven_multilingual_v2';

// ── Narrations — one per scene (7 scenes × ~4 seconds each) ──
const NARRATIONS = [
  {
    id: 's1',
    text: 'Thekedaari! Construction का सबसे आसान ऐप। हर साइट का हिसाब, एक ऐप में। Version 3.0 अब लॉन्च हो गया!'
  },
  {
    id: 's2',
    text: 'क्या आप अभी भी कागज़ पर हाज़िरी लिखते हैं? मज़दूरों का पैसा भूल जाते हैं? Project का खर्च पता नहीं रहता? अब इसका हल आ गया!'
  },
  {
    id: 's3',
    text: 'Thekedaari से पूरी साइट की हाज़िरी एक टैप में लगाएं। Present, Half Day, या Absent। साथ में Overtime भी जोड़ें — बिल्कुल आसान!'
  },
  {
    id: 's4',
    text: 'हर मज़दूर का पूरा लेजर। कितने दिन काम किया, कितना पैसा मिला, कितना दिया — सब एक जगह। पैसा देने से पहले balance ज़रूर देखें!'
  },
  {
    id: 's5',
    text: 'Project Finance में आमदनी, सामान का खर्च, और ठेका काम — सब track करें। मुनाफा और नुकसान एक नज़र में!'
  },
  {
    id: 's6',
    text: 'Version 3.0 में चार नए features! Attendance Report, Worker Salary Report, Overtime, और नया तेज़ Design। Bigger, Faster, Smarter!'
  },
  {
    id: 's7',
    text: 'अभी Google Play Store से Thekedaari download करें — बिल्कुल मुफ़्त! हर Thekedaar के लिए बना, सबसे भरोसेमंद Construction ऐप!'
  },
];

// ── Ensure audio/ directory exists ──
const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

// ── Generate one audio file ──
function generateOne(narration) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify({
      text: narration.text,
      model_id: MODEL,
      voice_settings: {
        stability: 0.45,          // natural variation
        similarity_boost: 0.80,   // stays true to voice
        style: 0.30,              // a little expressive
        use_speaker_boost: true,
      },
    }));

    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': body.length,
        'Accept': 'audio/mpeg',
      },
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errData = '';
        res.on('data', (d) => { errData += d; });
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${errData}`)));
        return;
      }
      const filePath = path.join(audioDir, `${narration.id}.mp3`);
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on('finish', () => resolve(filePath));
      file.on('error', reject);
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Main ──
async function main() {
  console.log('');
  console.log('  🎙️  Generating Hindi narration with ElevenLabs AI...');
  console.log(`  Voice: ${VOICE_ID}  |  Model: ${MODEL}`);
  console.log('');

  let ok = 0;
  for (const n of NARRATIONS) {
    process.stdout.write(`  Generating ${n.id}.mp3 ... `);
    try {
      await generateOne(n);
      console.log('✓');
      ok++;
    } catch (err) {
      console.log(`✗  ${err.message}`);
    }
    // 600ms gap — avoids ElevenLabs rate limit
    await new Promise((r) => setTimeout(r, 600));
  }

  console.log('');
  if (ok === NARRATIONS.length) {
    console.log('  ✅  All audio files generated!');
    console.log('  👉  Open thekedaari-reel.html in Chrome and press ▶ Play');
  } else {
    console.log(`  ⚠️  ${ok}/${NARRATIONS.length} files generated. Check errors above.`);
    console.log('  Tip: Wrong API key?  →  https://elevenlabs.io/app/speech-synthesis');
  }
  console.log('');
}

main();
