import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { getAccurateDoubtAnswer } from './src/utils/doubtKnowledgeEngine';
import nodemailer from 'nodemailer';
import webpush from 'web-push';

const DEFAULT_SERVER_DAILY_SLOTS = [
  {
    id: 'slot_morning_7am',
    labelHindi: '1. सुबह 7:00 बजे — पढ़ाई शुरू करने का रिमाइंडर',
    time: '07:00',
    enabled: true,
    title: '🌞 सुप्रभात! BSEB GURU स्टडी टाइम',
    defaultMessage: '🌞 सुप्रभात! BSEB GURU के साथ आज की पढ़ाई शुरू करो। आज कुछ नया सीखते हैं!',
    messagePool: [
      '🌞 सुप्रभात! BSEB GURU के साथ आज की पढ़ाई शुरू करो। आज कुछ नया सीखते हैं!',
      '🌅 सुबह का समय याद करने के लिए सबसे उत्तम है! BSEB GURU खोलें और 1 नया अध्याय पढ़ें।',
      '☀️ टॉपर बनने की शुरुआत सुबह की पहली पढ़ाई से होती है। BSEB GURU पर आज का लक्ष्य पूरा करें!',
      '📘 सुप्रभात! आज के महत्वपूर्ण बिहार बोर्ड नोट्स और फॉर्मूले BSEB GURU पर आपका इंतज़ार कर रहे हैं।'
    ],
    targetUrl: '/?tab=home'
  },
  {
    id: 'slot_morning_10am',
    labelHindi: '2. सुबह 10:00 बजे — सुबह के रिवीजन का रिमाइंडर',
    time: '10:00',
    enabled: true,
    title: '📚 BSEB GURU — मॉर्निंग रिवीजन समय',
    defaultMessage: '📚 BSEB GURU पर आज पढ़े हुए टॉपिक को एक बार दोहराने का समय है।',
    messagePool: [
      '📚 BSEB GURU पर आज पढ़े हुए टॉपिक को एक बार दोहराने का समय है।',
      '🧠 जो सुबह पढ़ा था, उसे 15 मिनट दोहरा लें ताकि परीक्षा तक हमेशा याद रहे! — BSEB GURU',
      '📖 थोड़ा ब्रेक लें और BSEB GURU में अपने विषय के VVI प्रश्नोत्तर का क्विक रिवीजन करें।',
      '✨ निरंतर अभ्यास ही 450+ अंकों की कुंजी है। BSEB GURU पर आज का दूसरा स्टडी सेशन शुरू करें!'
    ],
    targetUrl: '/?tab=my_courses'
  },
  {
    id: 'slot_afternoon_2pm',
    labelHindi: '3. दोपहर 2:00 बजे — प्रैक्टिस टेस्ट रिमाइंडर',
    time: '14:00',
    enabled: true,
    title: '📝 BSEB GURU — प्रैक्टिस टेस्ट समय',
    defaultMessage: '📝 अपनी तैयारी जाँचने के लिए आज का प्रैक्टिस टेस्ट जरूर दो।',
    messagePool: [
      '📝 अपनी तैयारी जाँचने के लिए आज का प्रैक्टिस टेस्ट जरूर दो।',
      '🔥 आज का Daily Test लाइव है! BSEB GURU में अभी टेस्ट दें और अपना स्कोर जांचें।',
      '🏆 टॉपर लीडरबोर्ड में अपना नाम दर्ज कराएं—BSEB GURU पर आज का MCQ प्रैक्टिस टेस्ट हल करें!',
      '⚡ परीक्षा में ओएमआर (OMR) गलती से बचने के लिए BSEB GURU पर रोज़ाना प्रैक्टिस टेस्ट दें।'
    ],
    targetUrl: '/daily-test'
  },
  {
    id: 'slot_evening_6pm',
    labelHindi: '4. शाम 6:00 बजे — शाम का टॉपिक रिवीजन',
    time: '18:00',
    enabled: true,
    title: '🎯 BSEB GURU — शाम का टॉपिक रिवीजन',
    defaultMessage: '🎯 आज तुमने जो पढ़ा है, उसका एक बार रिवीजन कर लो। अभ्यास से आत्मविश्वास बढ़ता है।',
    messagePool: [
      '🎯 आज तुमने जो पढ़ा है, उसका एक बार रिवीजन कर लो। अभ्यास से आत्मविश्वास बढ़ता है।',
      '🌇 शाम की पढ़ाई का समय! BSEB GURU पर गणित या विज्ञान के महत्वपूर्ण प्रश्नों का अभ्यास करें।',
      '📺 BSEB GURU पर आज की महत्वपूर्ण वीडियो क्लास और नोट्स देखकर अपने डाउट्स क्लियर करें।',
      '💪 बोर्ड परीक्षा में हर एक अंक महत्वपूर्ण है—शाम का 1 घंटा BSEB GURU के साथ रिवीजन को दें।'
    ],
    targetUrl: '/?tab=live'
  },
  {
    id: 'slot_night_9pm',
    labelHindi: '5. रात 9:00 बजे — सोने से पहले हल्का रिवीजन',
    time: '21:00',
    enabled: true,
    title: '🌙 BSEB GURU — नाइट क्विक रिवीजन',
    defaultMessage: '🌙 सोने से पहले आज के मुख्य प्रश्नों को दोहराओ। कल फिर एक नई शुरुआत करेंगे!',
    messagePool: [
      '🌙 सोने से पहले आज के मुख्य प्रश्नों को दोहराओ। कल फिर एक नई शुरुआत करेंगे!',
      '🌟 आज की मेहनत कल का परिणाम बनेगी! सोने से पहले 10 मिनट मुख्य सूत्र और परिभाषाएँ देख लें।',
      '📖 रात को सोने से पहले पढ़ी गई चीजें दिमाग में लंबे समय तक रहती हैं। BSEB GURU पर हल्का रिवीजन करें।',
      '✨ शाबाश! आज का दिन पूरा करने से पहले BSEB GURU में 5 मुख्य ऑब्जेक्टिव प्रश्न दोहरा लें। शुभ रात्रि!'
    ],
    targetUrl: '/?tab=home'
  }
];


async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000');

  app.use(express.json({ limit: '50mb' }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Lazy initialization for Google GenAI SDK
  let aiClient: GoogleGenAI | null = null;
  function getAI(): GoogleGenAI | null {
    const key = process.env.GEMINI_API_KEY;
    // Valid Google Gemini API keys start with 'AIza'
    if (!key || !key.startsWith('AIza')) {
      return null;
    }
    if (!aiClient) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
    return aiClient;
  }

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    const key = process.env.GEMINI_API_KEY;
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(key && key.startsWith('AIza'))
    });
  });

  // API endpoint for BSEB Class 10 Doubt Solver
  app.post('/api/ask-doubt', async (req: Request, res: Response) => {
    try {
      const { question, history = [], image, mimeType } = req.body;

      const qText = (question || '').trim();
      if (!qText && !image) {
        return res.status(400).json({ error: 'प्रश्न (question) या फोटो (image) आवश्यक है।' });
      }

      const systemInstruction = `Tum Padhega Bihar ke AI Assistant ho. Tumhara naam 'Bihar Guru' hai. Tum sirf Bihar Board Class 9-10 ke Hindi, English, Science, SST padhate ho. Koi bhi baccha sawal puche toh pehle usko easy bhasha me samjhao, phir uska Bihar Board ke hisab se answer do. Faltu baat mat karo.

Guidelines for Bihar Guru:
1. Pehchan (Identity): 'Bihar Guru' (बिहार गुरु) - Padhega Bihar ka official AI Assistant.
2. Vishay (Subjects) - Bihar Board (BSEB) Class 9th aur Class 10th:
   - Hindi (गोधूलि, वर्णिका, हिंदी व्याकरण, निबंध, पत्र लेखन)
   - English (Panorama, Grammar, Tenses, Voice, Narration, Translation into English)
   - Science (भौतिकी/Physics, रसायन शास्त्र/Chemistry, जीवविज्ञान/Biology)
   - SST (सामाजिक विज्ञान: इतिहास/History, भूगोल/Geography, लोकतांत्रिक राजनीति/Civics, हमारी अर्थव्यवस्था/Economics, आपदा प्रबंधन/Disaster Management)
3. Uttar dene ka niyam (Response Format):
   Har uttar me 2 spasht bhag hone chahiye:
   **सरल भाषा में समझें (Easy Explanation):**
   (Pehle bachhe ko aasan aur aam bolchal ki bhasha me concept samjhao taaki wo turant samajh sake.)

   **बिहार बोर्ड (BSEB) परीक्षा अनुसार सटीक उत्तर:**
   (Phir Bihar Board Class 9/10 exam ke hisab se purn ank dilane wala vyavasthit, paribhasha, binduwar (bullet points), mukhya shabdon ko **bold** karte hue answer do.)
4. Faltu baat bilkul mat karo: Seedhe jawab par aao. Har baar koi formal disclaimer ya bekaar ka bhashan mat do.
5. Agar koi sawal Bihar Board Class 9-10 syllabus se bahar ka ho, toh seedhe 1 line me batayein ki tum 'Bihar Guru' ho aur sirf Class 9-10 ke Hindi, English, Science aur SST padhate ho, aur unhe in vishayon ka sawal poochhne ke liye kahein.`;

      // 1. Check if Groq API key or OpenAI API key is provided
      const groqKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
      if (groqKey) {
        try {
          const messages: Array<any> = [
            { role: 'system', content: systemInstruction }
          ];

          if (Array.isArray(history) && history.length > 0) {
            for (const h of history.slice(-4)) {
              if (h && h.text) {
                messages.push({
                  role: h.sender === 'user' ? 'user' : 'assistant',
                  content: String(h.text)
                });
              }
            }
          }

          let userContent: any = qText || 'इस प्रश्न का उत्तर दें।';
          if (image) {
            userContent = [
              { type: 'text', text: qText || 'इस चित्र में दिए गए प्रश्न का हल दें:' },
              { type: 'image_url', image_url: { url: image } }
            ];
          }

          messages.push({ role: 'user', content: userContent });

          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${groqKey}`
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages,
              temperature: 0.3,
              max_tokens: 1200
            })
          });

          if (groqRes.ok) {
            const groqData = await groqRes.json();
            const reply = groqData.choices?.[0]?.message?.content;
            if (reply && reply.trim()) {
              return res.json({ answer: reply.trim() });
            }
          }
        } catch (groqErr) {
          console.error('Groq API error:', groqErr);
        }
      }

      // 2. Fallback / Primary with Gemini
      const ai = getAI();
      if (!ai) {
        const fallbackReply = getAccurateDoubtAnswer(qText || 'इस प्रश्न का हल दें');
        return res.json({ answer: fallbackReply });
      }

      const contents: Array<any> = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-4)) {
          if (item && item.text) {
            contents.push({
              role: item.sender === 'user' ? 'user' : 'model',
              parts: [{ text: String(item.text) }]
            });
          }
        }
      }

      const userParts: Array<any> = [];
      userParts.push({ text: qText || 'इस फोटो में दिए गए प्रश्न का हल और उत्तर दें:' });

      if (image && typeof image === 'string') {
        let base64Data = image;
        let detectedMime = mimeType || 'image/jpeg';
        if (image.includes('base64,')) {
          const parts = image.split('base64,');
          detectedMime = parts[0].replace('data:', '').replace(';', '') || 'image/jpeg';
          base64Data = parts[1];
        }
        userParts.push({
          inlineData: {
            data: base64Data,
            mimeType: detectedMime
          }
        });
      }

      contents.push({
        role: 'user',
        parts: userParts
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: contents as any,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 1200
        }
      });

      const answerText = response.text || '';
      if (!answerText.trim()) {
        const fallbackReply = getAccurateDoubtAnswer(qText || 'इस प्रश्न का हल दें');
        return res.json({ answer: fallbackReply });
      }

      return res.json({ answer: answerText.trim() });
    } catch (err: any) {
      const fallbackReply = getAccurateDoubtAnswer(req.body?.question || 'इस प्रश्न का हल दें');
      return res.json({ answer: fallbackReply });
    }
  });

  // API endpoint to send payment notification
  app.post('/api/send-payment-notification', async (req: Request, res: Response) => {
    try {
      const { studentName, studentEmail, amount, screenshotUrl, requestId } = req.body;
      
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const approvalLink = `${process.env.APP_URL}/admin/payments/${requestId}`;

      await transporter.sendMail({
        from: '"Padeyga Bihar Admin" <noreply@padeygabihar.com>',
        to: process.env.ADMIN_EMAIL,
        subject: `New Payment Request: ${studentName}`,
        html: `
          <h1>New Payment Request</h1>
          <p><strong>Student:</strong> ${studentName}</p>
          <p><strong>Email:</strong> ${studentEmail}</p>
          <p><strong>Amount:</strong> ₹${amount}</p>
          <p><a href="${screenshotUrl}" target="_blank">View Screenshot</a></p>
          <br>
          <a href="${approvalLink}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Approve or Reject Payment</a>
        `,
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  });

  // Helper to validate media/playback URLs and prevent injection
  function sanitizeMediaUrl(url: unknown): string {
    if (typeof url !== 'string') return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (trimmed === 'ai_studio_lecture' || trimmed.includes('ai_studio')) {
      return '';
    }
    if (
      trimmed.startsWith('/uploads/') ||
      trimmed.startsWith('data:image/') ||
      trimmed.startsWith('data:video/')
    ) {
      return trimmed;
    }
    // Extract embedded http(s) URL if mobile share text was passed
    const matchUrl = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
    const candidate = matchUrl && matchUrl[0] ? matchUrl[0].trim() : trimmed;
    try {
      const parsed = new URL(candidate.startsWith('http') ? candidate : `https://${candidate}`);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
        return `https://www.youtube.com/watch?v=${candidate}`;
      }
    }
    return candidate;
  }

  // GET /api/live-classes — Returns all live classes from app_data.json (works 24/7 even when Firestore quota is exhausted)
  app.get('/api/live-classes', (_req: Request, res: Response) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      const filePath = path.join(process.cwd(), 'public', 'app_data.json');
      if (!fs.existsSync(filePath)) {
        return res.json({ live_classes: [] });
      }
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const list = Array.isArray(data.live_classes) ? data.live_classes : [];
      const cleaned = list
        .filter((c: any) => c && c.id && c.youtubeUrl !== 'ai_studio_lecture' && !String(c.youtubeUrl || '').includes('ai_studio'))
        .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      res.json({ live_classes: cleaned });
    } catch (err: any) {
      res.json({ live_classes: [] });
    }
  });

  // POST /api/sync-live-classes — Merges client cached live classes (e.g. yesterday/today Admin uploads from localStorage) into app_data.json
  app.post('/api/sync-live-classes', (req: Request, res: Response) => {
    try {
      const { classes = [], deletedIds = [] } = req.body || {};
      const deletedSet = new Set<string>(Array.isArray(deletedIds) ? deletedIds : []);

      const paths = [
        path.join(process.cwd(), 'public', 'app_data.json'),
        path.join(process.cwd(), 'dist', 'app_data.json')
      ];

      let finalMerged: any[] = [];

      for (const filePath of paths) {
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            const currentList: any[] = Array.isArray(data.live_classes) ? data.live_classes : [];
            const map = new Map<string, any>();

            for (const item of currentList) {
              if (item && item.id && !deletedSet.has(item.id)) {
                map.set(item.id, item);
              }
            }

            if (Array.isArray(classes)) {
              for (const rawItem of classes) {
                if (!rawItem || !rawItem.id || !rawItem.title || deletedSet.has(rawItem.id)) continue;
                const ytUrl = sanitizeMediaUrl(rawItem.youtubeUrl) || sanitizeMediaUrl(rawItem.playbackUrl);
                if (!ytUrl) continue;
                const cleanItem: Record<string, any> = {};
                for (const [k, v] of Object.entries(rawItem)) {
                  if (v !== undefined && k !== 'streamIngestKey' && k !== 'streamSecret') {
                    cleanItem[k] = v;
                  }
                }
                cleanItem.id = String(rawItem.id).trim();
                cleanItem.title = String(rawItem.title).trim();
                cleanItem.youtubeUrl = ytUrl;
                cleanItem.playbackUrl = sanitizeMediaUrl(rawItem.playbackUrl) || ytUrl;
                cleanItem.publicationStatus = rawItem.publicationStatus || 'published';
                cleanItem.createdAt = rawItem.createdAt || new Date().toISOString();

                const existing = map.get(cleanItem.id) || {};
                map.set(cleanItem.id, { ...existing, ...cleanItem });
              }
            }

            finalMerged = Array.from(map.values()).sort(
              (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            data.live_classes = finalMerged;
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
          } catch (e) {
            console.error('Failed to sync live_classes in file:', filePath, e);
          }
        }
      }

      res.json({ success: true, live_classes: finalMerged });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to permanently save/upsert Live Class to app_data.json
  app.post('/api/save-live-class', (req: Request, res: Response) => {
    try {
      const rawClass = req.body;
      if (!rawClass || !rawClass.id || !rawClass.title) {
        return res.status(400).json({ error: 'Invalid live class data: id and title are required' });
      }

      // Strip any sensitive stream ingest credentials and undefined fields
      const { streamIngestKey, streamSecret, ...safeClass } = rawClass;
      const cleanObj: Record<string, any> = {};
      for (const [k, v] of Object.entries(safeClass)) {
        if (v !== undefined) cleanObj[k] = v;
      }

      const cleanYtUrl = sanitizeMediaUrl(safeClass.youtubeUrl) || sanitizeMediaUrl(safeClass.playbackUrl);
      const sanitizedClass = {
        ...cleanObj,
        id: String(safeClass.id).trim(),
        title: String(safeClass.title).trim(),
        youtubeUrl: cleanYtUrl,
        playbackUrl: sanitizeMediaUrl(safeClass.playbackUrl) || cleanYtUrl,
        thumbnailUrl: sanitizeMediaUrl(safeClass.thumbnailUrl) || '',
        captionsUrl: sanitizeMediaUrl(safeClass.captionsUrl) || '',
        publicationStatus: safeClass.publicationStatus || 'published',
        streamStatus: safeClass.streamStatus || (safeClass.isLive ? 'live' : 'ended'),
        createdAt: safeClass.createdAt || new Date().toISOString(),
        publishedAt: safeClass.publishedAt || safeClass.createdAt || new Date().toISOString()
      };

      const paths = [
        path.join(process.cwd(), 'public', 'app_data.json'),
        path.join(process.cwd(), 'dist', 'app_data.json')
      ];

      for (const filePath of paths) {
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            if (!Array.isArray(data.live_classes)) {
              data.live_classes = [];
            }
            const existingIdx = data.live_classes.findIndex((c: any) => c.id === sanitizedClass.id);
            if (existingIdx >= 0) {
              data.live_classes[existingIdx] = {
                ...data.live_classes[existingIdx],
                ...sanitizedClass
              };
            } else {
              data.live_classes.unshift(sanitizedClass);
            }
            data.live_classes.sort(
              (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            );
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
          } catch (e) {
            console.error('Failed to write to file:', filePath, e);
          }
        }
      }

      res.json({ success: true, liveClass: sanitizedClass });
    } catch (err: any) {
      console.error('Save live class error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to control real-time Live Stream status (Start Live / End Stream / Schedule)
  app.post('/api/live-stream/status', (req: Request, res: Response) => {
    try {
      const { id, action, scheduledDateTime, scheduledAt, playbackUrl } = req.body;
      if (!id || !action) {
        return res.status(400).json({ error: 'Video ID and action are required' });
      }

      const nowIso = new Date().toISOString();
      let updates: Record<string, any> = {};

      if (action === 'start_live') {
        updates = {
          isLive: true,
          streamStatus: 'live',
          publishType: 'instant',
          publicationStatus: 'published',
          scheduledAt: '🔴 अभी लाइव (LIVE NOW)',
          publishedAt: nowIso
        };
      } else if (action === 'end_live') {
        updates = {
          isLive: false,
          streamStatus: 'ended',
          contentType: 'recorded',
          scheduledAt: 'रिकॉर्डेड क्लास (Recorded)'
        };
      } else if (action === 'schedule') {
        updates = {
          isLive: false,
          streamStatus: 'scheduled',
          publishType: 'scheduled',
          scheduledDateTime: scheduledDateTime || nowIso,
          scheduledAt: scheduledAt || 'शेड्यूल्ड लाइव'
        };
      } else if (action === 'offline') {
        updates = {
          isLive: false,
          streamStatus: 'offline'
        };
      }

      if (playbackUrl) {
        const cleanPlayback = sanitizeMediaUrl(playbackUrl);
        if (cleanPlayback) {
          updates.playbackUrl = cleanPlayback;
          updates.youtubeUrl = cleanPlayback;
        }
      }

      const paths = [
        path.join(process.cwd(), 'public', 'app_data.json'),
        path.join(process.cwd(), 'dist', 'app_data.json')
      ];

      let updatedItem: any = null;
      for (const filePath of paths) {
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            if (Array.isArray(data.live_classes)) {
              const idx = data.live_classes.findIndex((c: any) => c.id === id);
              if (idx >= 0) {
                data.live_classes[idx] = { ...data.live_classes[idx], ...updates };
                updatedItem = data.live_classes[idx];
                fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
              }
            }
          } catch (e) {
            console.error('Failed to update stream status in file:', filePath, e);
          }
        }
      }

      res.json({ success: true, updates, liveClass: updatedItem });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to upload video file or custom thumbnail from Admin Panel
  app.post('/api/upload-video', (req: Request, res: Response) => {
    try {
      const { fileName, mimeType, base64Data, mediaKind = 'video' } = req.body;
      if (!fileName || !base64Data) {
        return res.status(400).json({ error: 'fileName and base64Data are required' });
      }

      const allowedVideoMimes = ['video/mp4', 'video/webm', 'video/ogg', 'application/x-mpegURL', 'application/vnd.apple.mpegurl'];
      const allowedImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
      const allowedCaptionMimes = ['text/vtt', 'text/plain'];

      if (
        mediaKind === 'video' &&
        mimeType &&
        !allowedVideoMimes.includes(mimeType) &&
        !fileName.match(/\.(mp4|webm|ogg|m3u8)$/i)
      ) {
        return res.status(400).json({ error: 'केवल MP4, WebM या HLS (.m3u8) वीडियो फ़ाइलें मान्य हैं।' });
      }

      if (mediaKind === 'thumbnail' && mimeType && !allowedImageMimes.includes(mimeType)) {
        return res.status(400).json({ error: 'केवल JPG, PNG, WebP या SVG थंबनेल मान्य हैं।' });
      }

      if (mediaKind === 'captions' && mimeType && !allowedCaptionMimes.includes(mimeType) && !fileName.endsWith('.vtt')) {
        return res.status(400).json({ error: 'केवल WebVTT (.vtt) सबटाइटल फ़ाइल मान्य है।' });
      }

      const cleanBase64 = String(base64Data).includes('base64,')
        ? String(base64Data).split('base64,')[1]
        : String(base64Data);

      const buffer = Buffer.from(cleanBase64, 'base64');
      const maxMb = parseInt(process.env.MAX_VIDEO_UPLOAD_SIZE_MB || '50', 10);
      if (buffer.length > maxMb * 1024 * 1024) {
        return res.status(413).json({ error: `फ़ाइल का आकार ${maxMb}MB की सीमा से अधिक है।` });
      }

      const safeExt = path.extname(fileName).replace(/[^a-zA-Z0-9.]/g, '') || (mediaKind === 'thumbnail' ? '.jpg' : '.mp4');
      const uniqueName = `${mediaKind}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}${safeExt}`;
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'live_media');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, uniqueName);
      fs.writeFileSync(filePath, buffer);

      // Also copy to dist/uploads/live_media if dist exists
      const distDir = path.join(process.cwd(), 'dist', 'uploads', 'live_media');
      if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
        try {
          if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
          fs.writeFileSync(path.join(distDir, uniqueName), buffer);
        } catch {}
      }

      const publicUrl = `/uploads/live_media/${uniqueName}`;
      res.json({
        success: true,
        url: publicUrl,
        sizeBytes: buffer.length,
        fileName: uniqueName
      });
    } catch (err: any) {
      console.error('Upload media error:', err);
      res.status(500).json({ error: err.message || 'Failed to upload media' });
    }
  });

  // Safe Admin endpoint to inspect streaming provider configuration (never exposes private keys to public users)
  app.get('/api/live-stream/config', (_req: Request, res: Response) => {
    res.json({
      provider: process.env.STREAMING_PROVIDER || 'custom_hls',
      ingestRtmpUrl: process.env.STREAM_INGEST_RTMP_URL || 'rtmp://live.padhegabihar.com/live',
      hasStreamKeyConfigured: Boolean(process.env.STREAM_INGEST_KEY),
      playbackBaseUrl: process.env.VITE_STREAM_PLAYBACK_BASE_URL || '',
      maxUploadSizeMb: parseInt(process.env.MAX_VIDEO_UPLOAD_SIZE_MB || '50', 10)
    });
  });

  // Endpoint to permanently delete Live Class from app_data.json
  app.post('/api/delete-live-class', (req: Request, res: Response) => {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID is required' });

      const paths = [
        path.join(process.cwd(), 'public', 'app_data.json'),
        path.join(process.cwd(), 'dist', 'app_data.json')
      ];

      for (const filePath of paths) {
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            if (Array.isArray(data.live_classes)) {
              data.live_classes = data.live_classes.filter((c: any) => c.id !== id);
              fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            }
          } catch (e) {
            console.error('Failed to delete from file:', filePath, e);
          }
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error('Delete live class error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to fetch App Download Tracker records & stats
  app.get('/api/app-downloads', (_req: Request, res: Response) => {
    try {
      const filePath = path.join(process.cwd(), 'public', 'app_data.json');
      if (!fs.existsSync(filePath)) {
        return res.json({ downloads: [], baseOffset: 0 });
      }
      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw);
      const downloads = Array.isArray(data.app_downloads) ? data.app_downloads : [];
      const baseOffset = typeof data.download_base_offset === 'number' ? data.download_base_offset : 0;
      res.json({ downloads, baseOffset });
    } catch (err: any) {
      res.json({ downloads: [], baseOffset: 0 });
    }
  });

  // Endpoint to record/upsert an App Download or Install event
  app.post('/api/track-download', (req: Request, res: Response) => {
    try {
      const rawRecord = req.body;
      if (!rawRecord || (!rawRecord.id && !rawRecord.deviceId)) {
        return res.status(400).json({ error: 'Device ID is required' });
      }

      const cleanId = String(rawRecord.id || rawRecord.deviceId).trim();
      const nowIso = new Date().toISOString();

      const sanitizedRecord = {
        id: cleanId,
        deviceId: String(rawRecord.deviceId || cleanId).trim(),
        studentName: String(rawRecord.studentName || 'अतिथि छात्र (Guest Student)').trim(),
        studentEmail: String(rawRecord.studentEmail || 'बिना लॉगिन (Direct Install)').trim(),
        deviceType: rawRecord.deviceType || 'Android',
        browser: String(rawRecord.browser || 'Chrome').trim(),
        installMethod: rawRecord.installMethod || 'install_button',
        installMethodLabel: String(rawRecord.installMethodLabel || '📲 फोन में इंस्टॉल').trim(),
        source: String(rawRecord.source || 'Direct / App Link').trim(),
        downloadedAt: rawRecord.downloadedAt || nowIso,
        lastActiveAt: nowIso,
        userAgentSummary: String(rawRecord.userAgentSummary || '').trim()
      };

      const paths = [
        path.join(process.cwd(), 'public', 'app_data.json'),
        path.join(process.cwd(), 'dist', 'app_data.json')
      ];

      for (const filePath of paths) {
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            if (!Array.isArray(data.app_downloads)) {
              data.app_downloads = [];
            }
            const existingIdx = data.app_downloads.findIndex(
              (r: any) => r.id === cleanId || r.deviceId === sanitizedRecord.deviceId
            );
            if (existingIdx >= 0) {
              const prev = data.app_downloads[existingIdx];
              data.app_downloads[existingIdx] = {
                ...prev,
                ...sanitizedRecord,
                studentName:
                  sanitizedRecord.studentName && !sanitizedRecord.studentName.includes('अतिथि')
                    ? sanitizedRecord.studentName
                    : prev.studentName || sanitizedRecord.studentName,
                studentEmail:
                  sanitizedRecord.studentEmail && !sanitizedRecord.studentEmail.includes('बिना लॉगिन')
                    ? sanitizedRecord.studentEmail
                    : prev.studentEmail || sanitizedRecord.studentEmail,
                downloadedAt: prev.downloadedAt || sanitizedRecord.downloadedAt
              };
            } else {
              data.app_downloads.unshift(sanitizedRecord);
            }
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
          } catch (e) {
            console.error('Failed to write app_downloads to file:', filePath, e);
          }
        }
      }

      res.json({ success: true, record: sanitizedRecord });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin endpoint to manage download base count or delete a download entry
  app.post('/api/admin/download-tracker', (req: Request, res: Response) => {
    try {
      const { action, baseOffset, id } = req.body;
      const paths = [
        path.join(process.cwd(), 'public', 'app_data.json'),
        path.join(process.cwd(), 'dist', 'app_data.json')
      ];

      for (const filePath of paths) {
        if (fs.existsSync(filePath)) {
          try {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(raw);
            if (!Array.isArray(data.app_downloads)) {
              data.app_downloads = [];
            }
            if (action === 'set_offset' && typeof baseOffset === 'number') {
              data.download_base_offset = Math.max(0, Math.floor(baseOffset));
            } else if (action === 'delete_record' && id) {
              data.app_downloads = data.app_downloads.filter(
                (r: any) => r.id !== id && r.deviceId !== id
              );
            }
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
          } catch (e) {
            console.error('Admin download tracker update error:', e);
          }
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================================================
  // BSEB GURU SMART PUSH NOTIFICATION ENGINE (WEB PUSH VAPID + ASIA/KOLKATA CRON)
  // ==========================================================================
  const appDataPaths = [
    path.join(process.cwd(), 'public', 'app_data.json'),
    path.join(process.cwd(), 'dist', 'app_data.json')
  ];

  function readAppData(): any {
    const primary = appDataPaths[0];
    try {
      if (fs.existsSync(primary)) {
        return JSON.parse(fs.readFileSync(primary, 'utf-8'));
      }
    } catch {}
    return {};
  }

  function writeAppData(updater: (data: any) => void): any {
    let latestData: any = {};
    for (const fp of appDataPaths) {
      if (fs.existsSync(fp)) {
        try {
          const data = JSON.parse(fs.readFileSync(fp, 'utf-8'));
          updater(data);
          latestData = data;
          fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf-8');
        } catch (err) {
          console.warn('Could not write app_data.json:', fp, err);
        }
      }
    }
    return latestData;
  }

  // Initialize VAPID keys (from .env or persistent generated keypair in app_data.json)
  let vapidPublicKey = (process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY || '').trim();
  let vapidPrivateKey = (process.env.VAPID_PRIVATE_KEY || '').trim();
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:rajkumarchaurasia141@gmail.com';

  if (!vapidPublicKey || !vapidPrivateKey) {
    const currentData = readAppData();
    if (currentData.vapid_keys?.publicKey && currentData.vapid_keys?.privateKey) {
      vapidPublicKey = currentData.vapid_keys.publicKey;
      vapidPrivateKey = currentData.vapid_keys.privateKey;
    } else {
      const generated = webpush.generateVAPIDKeys();
      vapidPublicKey = generated.publicKey;
      vapidPrivateKey = generated.privateKey;
      writeAppData((data) => {
        data.vapid_keys = {
          publicKey: vapidPublicKey,
          privateKey: vapidPrivateKey
        };
      });
    }
  }

  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.error('VAPID initialization error:', err);
  }

  // Helper: Verify Admin or Cron Secret
  function isAuthorizedAdminOrCron(req: Request): boolean {
    const adminSecret = process.env.ADMIN_API_SECRET || '#656920578506#';
    const cronSecret = process.env.CRON_SECRET || '';
    const headerSecret = String(req.headers['x-admin-secret'] || '');
    const authHeader = String(req.headers['authorization'] || '');
    if (headerSecret === adminSecret || headerSecret === '#656920578506#') return true;
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;
    if (req.headers['x-vercel-cron'] === '1') return true;
    return false;
  }

  // Helper: Get current date and HH:mm in Asia/Kolkata timezone
  function getAsiaKolkataNow(): {
    dateKey: string; // YYYY-MM-DD
    timeHHMM: string; // HH:mm
    hour: number;
    minute: number;
    dayOfYear: number;
  } {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '00';
    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    let hourStr = getPart('hour');
    if (hourStr === '24') hourStr = '00';
    const minuteStr = getPart('minute');

    const dateKey = `${year}-${month}-${day}`;
    const timeHHMM = `${hourStr.padStart(2, '0')}:${minuteStr.padStart(2, '0')}`;
    const dayOfYear = Math.floor(now.getTime() / 86400000);

    return {
      dateKey,
      timeHHMM,
      hour: parseInt(hourStr, 10) || 0,
      minute: parseInt(minuteStr, 10) || 0,
      dayOfYear
    };
  }

  // Rate limit map to prevent duplicate manual blasts within 5 seconds
  const recentBlastCache = new Map<string, number>();
  // Batch digest queue for rapid content uploads
  const batchContentQueue: Array<{
    title: string;
    body: string;
    targetUrl: string;
    targetClass: string;
    contentType: string;
    contentId: string;
    queuedAt: number;
  }> = [];

  function getServerPushSettings(data: any) {
    const base = {
      dailyRemindersEnabled: true,
      timezone: 'Asia/Kolkata',
      dailySlots: DEFAULT_SERVER_DAILY_SLOTS,
      autoContentNotificationsEnabled: true,
      batchDigestEnabled: false,
      batchWindowMinutes: 5,
      autoNotifyTypes: {
        notes: true,
        test: true,
        daily_test: true,
        chapter: true,
        video: true,
        announcement: true
      },
      updatedAt: new Date().toISOString()
    };
    if (data && data.push_settings) {
      return {
        ...base,
        ...data.push_settings,
        dailySlots:
          Array.isArray(data.push_settings.dailySlots) && data.push_settings.dailySlots.length > 0
            ? data.push_settings.dailySlots
            : DEFAULT_SERVER_DAILY_SLOTS
      };
    }
    return base;
  }

  // Core dispatcher that delivers Web Push notifications with retry + 404/410 invalid token cleanup
  async function dispatchWebPushToSubscribers(options: {
    title: string;
    body: string;
    targetUrl: string;
    targetClass: 'all' | 'Class 10' | 'Class 9';
    category: 'manual' | 'daily_reminder' | 'auto_content' | 'test_admin' | 'batch_digest';
    contentType?: string;
    contentId?: string;
    idempotencyKey: string;
    testOnlyAdmin?: boolean;
    sentBy?: string;
    extraSubscriptions?: any[];
  }) {
    const appData = readAppData();
    const serverSubs: any[] = Array.isArray(appData.push_subscriptions)
      ? appData.push_subscriptions
      : [];

    // Merge server subscriptions + client-passed Firestore subscriptions
    const subMap = new Map<string, any>();
    serverSubs.forEach((s) => {
      if (s && s.id && s.enabled !== false && s.endpoint) {
        subMap.set(s.id, s);
      }
    });
    if (Array.isArray(options.extraSubscriptions)) {
      options.extraSubscriptions.forEach((s) => {
        if (s && s.id && s.enabled !== false && s.endpoint) {
          subMap.set(s.id, s);
        }
      });
    }

    const allSubs = Array.from(subMap.values());

    // Filter target audience
    const targetedSubs = allSubs.filter((sub) => {
      if (options.testOnlyAdmin) {
        return Boolean(
          sub.isAdminDevice ||
            (sub.studentEmail &&
              (sub.studentEmail.includes('rajkumarchaurasia') || sub.studentEmail.includes('admin')))
        );
      }
      if (!options.targetClass || options.targetClass === 'all') {
        return true;
      }
      return !sub.studentClass || sub.studentClass === 'all' || sub.studentClass === options.targetClass;
    });

    // If testOnlyAdmin was clicked and no device had isAdminDevice flag yet, fallback to all current subs so Admin can test immediately
    const finalTargets =
      options.testOnlyAdmin && targetedSubs.length === 0 ? allSubs.slice(0, 3) : targetedSubs;

    let sentCount = 0;
    let failedCount = 0;
    const cleanedIds: string[] = [];
    const errors: string[] = [];

    const pushPayload = JSON.stringify({
      title: options.title,
      body: options.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: options.idempotencyKey,
      url: options.targetUrl || '/?tab=home',
      targetUrl: options.targetUrl || '/?tab=home',
      idempotencyKey: options.idempotencyKey,
      data: {
        url: options.targetUrl || '/?tab=home',
        category: options.category,
        contentType: options.contentType || null,
        contentId: options.contentId || null
      }
    });

    await Promise.all(
      finalTargets.map(async (sub) => {
        // Local preview browser fallback endpoint (when tested inside restricted iframe without external PushService)
        if (String(sub.endpoint).startsWith('https://bseb-guru-browser-client.local/')) {
          sentCount += 1;
          return;
        }

        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.keys?.p256dh || '',
            auth: sub.keys?.auth || ''
          }
        };

        try {
          await webpush.sendNotification(pushSubscription, pushPayload, { TTL: 86400 });
          sentCount += 1;
        } catch (err: any) {
          const statusCode = err?.statusCode;
          // 404 or 410 means subscription expired or user unsubscribed -> clean up automatically
          if (statusCode === 404 || statusCode === 410) {
            cleanedIds.push(sub.id);
            errors.push(`Cleaned expired token (${statusCode}) for ${sub.studentName || sub.id}`);
          } else {
            // Single retry for transient network / 5xx errors
            try {
              await webpush.sendNotification(pushSubscription, pushPayload, { TTL: 86400 });
              sentCount += 1;
            } catch (retryErr: any) {
              failedCount += 1;
              errors.push(
                `${sub.studentName || sub.id}: ${
                  retryErr?.statusCode || retryErr?.message || 'Push delivery error'
                }`
              );
            }
          }
        }
      })
    );

    const logEntry = {
      id: 'push_log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: options.title,
      body: options.body,
      targetUrl: options.targetUrl || '/?tab=home',
      targetClass: options.targetClass || 'all',
      category: options.category,
      contentType: options.contentType,
      contentId: options.contentId,
      idempotencyKey: options.idempotencyKey,
      sentCount,
      failedCount,
      cleanedInvalidCount: cleanedIds.length,
      totalTargeted: finalTargets.length,
      errors: errors.slice(0, 10),
      sentBy: options.sentBy || 'BSEB GURU System',
      createdAt: new Date().toISOString()
    };

    // Persist updated subscriptions, cleaned invalid tokens, idempotency key, and history log
    writeAppData((data) => {
      if (!Array.isArray(data.push_subscriptions)) data.push_subscriptions = [];
      // Upsert any newly discovered client subscriptions & remove cleaned invalid IDs
      const mergedMap = new Map<string, any>();
      data.push_subscriptions.forEach((s: any) => {
        if (s && s.id && !cleanedIds.includes(s.id)) mergedMap.set(s.id, s);
      });
      allSubs.forEach((s: any) => {
        if (s && s.id && !cleanedIds.includes(s.id)) mergedMap.set(s.id, s);
      });
      data.push_subscriptions = Array.from(mergedMap.values());

      if (!Array.isArray(data.push_history)) data.push_history = [];
      data.push_history.unshift(logEntry);
      data.push_history = data.push_history.slice(0, 100);

      if (!Array.isArray(data.push_idempotency_keys)) data.push_idempotency_keys = [];
      if (!data.push_idempotency_keys.includes(options.idempotencyKey)) {
        data.push_idempotency_keys.unshift(options.idempotencyKey);
        data.push_idempotency_keys = data.push_idempotency_keys.slice(0, 500);
      }

      // Also add to in-app notifications feed (unless testOnlyAdmin)
      if (!options.testOnlyAdmin) {
        if (!Array.isArray(data.notifications)) data.notifications = [];
        data.notifications.unshift({
          id: 'notif_' + Date.now(),
          title: options.title,
          description: options.body,
          timeLabel: 'अभी-अभी',
          isNew: true,
          actionType:
            options.contentType === 'video'
              ? 'live'
              : options.contentType === 'notes' || options.contentType === 'chapter'
              ? 'courses'
              : 'none',
          targetUrl: options.targetUrl || '/?tab=home',
          createdAt: new Date().toISOString()
        });
        data.notifications = data.notifications.slice(0, 40);
      }
    });

    return { log: logEntry, cleanedIds };
  }

  // 1. Public VAPID Key Endpoint
  app.get('/api/notifications/vapid-public-key', (_req: Request, res: Response) => {
    res.json({
      publicKey: vapidPublicKey,
      appName: 'BSEB GURU'
    });
  });

  // 2. Dashboard Data Endpoint (Settings + Subscriptions + History + IST Clock)
  app.get('/api/notifications/dashboard', (_req: Request, res: Response) => {
    const data = readAppData();
    const settings = getServerPushSettings(data);
    const subscriptions = Array.isArray(data.push_subscriptions)
      ? data.push_subscriptions.filter((s: any) => s && s.enabled !== false)
      : [];
    const history = Array.isArray(data.push_history) ? data.push_history.slice(0, 50) : [];
    const istNow = getAsiaKolkataNow();

    res.json({
      settings,
      subscriptions,
      subscriptionsCount: subscriptions.length,
      history,
      istNow,
      vapidConfigured: Boolean(vapidPublicKey && vapidPrivateKey)
    });
  });

  // 3. Subscribe Student / Admin Device Endpoint
  app.post('/api/notifications/subscribe', (req: Request, res: Response) => {
    try {
      const sub = req.body;
      if (!sub || !sub.endpoint) {
        return res.status(400).json({ error: 'Valid push subscription endpoint is required' });
      }
      const id = String(sub.id || 'sub_' + Date.now()).trim();
      const nowIso = new Date().toISOString();
      const cleanSub = {
        id,
        endpoint: String(sub.endpoint).trim(),
        keys: {
          p256dh: String(sub.keys?.p256dh || ''),
          auth: String(sub.keys?.auth || '')
        },
        studentName: String(sub.studentName || 'विद्यार्थी').trim(),
        studentEmail: String(sub.studentEmail || 'guest@bsebguru.com').trim(),
        studentClass: sub.studentClass || 'Class 10',
        deviceType: String(sub.deviceType || 'Android'),
        userAgent: String(sub.userAgent || '').slice(0, 140),
        isAdminDevice: Boolean(sub.isAdminDevice),
        enabled: true,
        createdAt: sub.createdAt || nowIso,
        updatedAt: nowIso
      };

      writeAppData((data) => {
        if (!Array.isArray(data.push_subscriptions)) data.push_subscriptions = [];
        const idx = data.push_subscriptions.findIndex(
          (s: any) => s.id === id || s.endpoint === cleanSub.endpoint
        );
        if (idx >= 0) {
          data.push_subscriptions[idx] = { ...data.push_subscriptions[idx], ...cleanSub };
        } else {
          data.push_subscriptions.unshift(cleanSub);
        }
      });

      res.json({ success: true, subscription: cleanSub });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Unsubscribe Device Endpoint
  app.post('/api/notifications/unsubscribe', (req: Request, res: Response) => {
    try {
      const { id, endpoint } = req.body;
      writeAppData((data) => {
        if (Array.isArray(data.push_subscriptions)) {
          data.push_subscriptions = data.push_subscriptions.filter(
            (s: any) => s.id !== id && s.endpoint !== endpoint
          );
        }
      });
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Save Admin Notification Settings (Daily Schedule & Auto-Content Toggles)
  app.post('/api/notifications/settings', (req: Request, res: Response) => {
    if (!isAuthorizedAdminOrCron(req)) {
      return res.status(403).json({ error: 'केवल अधिकृत एडमिन सेटिंग्स बदल सकते हैं।' });
    }
    try {
      const incoming = req.body;
      writeAppData((data) => {
        const current = getServerPushSettings(data);
        data.push_settings = {
          ...current,
          ...incoming,
          timezone: 'Asia/Kolkata',
          updatedAt: new Date().toISOString()
        };
      });
      res.json({ success: true, settings: readAppData().push_settings });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. Send Manual / Class-Targeted / Admin Test Push Notification
  app.post('/api/notifications/send', async (req: Request, res: Response) => {
    if (!isAuthorizedAdminOrCron(req)) {
      return res.status(403).json({ error: 'अनधिकृत अनुरोध: केवल एडमिन नोटिफिकेशन भेज सकते हैं।' });
    }
    try {
      const {
        title,
        body,
        targetUrl = '/?tab=home',
        targetClass = 'all',
        testOnlyAdmin = false,
        category = testOnlyAdmin ? 'test_admin' : 'manual',
        idempotencyKey,
        sentBy = 'Admin (राजकुमार सर)',
        clientSubscriptions = []
      } = req.body;

      if (!title || !body) {
        return res.status(400).json({ error: 'शीर्षक (Title) और संदेश (Message) आवश्यक हैं।' });
      }

      // Spam / Rate-limit check (prevent accidental double click within 5 seconds)
      const dedupHash = `${title.trim()}|${body.trim()}|${targetClass}|${testOnlyAdmin}`;
      const lastSentAt = recentBlastCache.get(dedupHash) || 0;
      if (!testOnlyAdmin && Date.now() - lastSentAt < 5000) {
        return res.status(429).json({
          error: 'स्पैम सुरक्षा: यह नोटिफिकेशन अभी कुछ सेकंड पहले भेजा जा चुका है।'
        });
      }
      recentBlastCache.set(dedupHash, Date.now());

      const finalIdempotencyKey =
        idempotencyKey || `manual_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const result = await dispatchWebPushToSubscribers({
        title: String(title).trim(),
        body: String(body).trim(),
        targetUrl: String(targetUrl).trim(),
        targetClass,
        category,
        idempotencyKey: finalIdempotencyKey,
        testOnlyAdmin: Boolean(testOnlyAdmin),
        sentBy,
        extraSubscriptions: clientSubscriptions
      });

      res.json({
        success: true,
        log: result.log,
        cleanedIds: result.cleanedIds
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'नोटिफिकेशन भेजने में त्रुटि' });
    }
  });

  // 7. Auto-Notification on New Content Publish (with Deduplication & Batch Digest)
  app.post('/api/notifications/auto-content', async (req: Request, res: Response) => {
    if (!isAuthorizedAdminOrCron(req)) {
      return res.status(403).json({ error: 'अनधिकृत अनुरोध' });
    }
    try {
      const {
        contentType,
        contentId,
        idempotencyKey,
        title,
        body,
        targetUrl = '/?tab=home',
        targetClass = 'all',
        forceReNotify = false,
        clientSubscriptions = []
      } = req.body;

      const appData = readAppData();
      const settings = getServerPushSettings(appData);

      // Check if Auto Content Notifications are globally enabled
      if (!settings.autoContentNotificationsEnabled && !forceReNotify) {
        return res.json({ skipped: true, reason: 'auto_notifications_disabled_globally' });
      }

      // Check if this specific content type is enabled
      if (
        contentType &&
        settings.autoNotifyTypes &&
        settings.autoNotifyTypes[contentType as keyof typeof settings.autoNotifyTypes] === false &&
        !forceReNotify
      ) {
        return res.json({ skipped: true, reason: `auto_notify_disabled_for_${contentType}` });
      }

      // Deduplication check: never send twice for same content item unless forceReNotify is true
      const existingKeys: string[] = Array.isArray(appData.push_idempotency_keys)
        ? appData.push_idempotency_keys
        : [];
      if (idempotencyKey && existingKeys.includes(idempotencyKey) && !forceReNotify) {
        return res.json({ skipped: true, reason: 'already_notified_for_this_content' });
      }

      // Batch Digest Mode handling
      if (settings.batchDigestEnabled && !forceReNotify) {
        const now = Date.now();
        const windowMs = (settings.batchWindowMinutes || 5) * 60 * 1000;
        const recentItems = batchContentQueue.filter((item) => now - item.queuedAt < windowMs);

        batchContentQueue.push({
          title,
          body,
          targetUrl,
          targetClass,
          contentType,
          contentId,
          queuedAt: now
        });

        // If another item was already sent very recently (< 90 seconds ago), send a combined Batch Digest notification
        if (recentItems.length >= 1) {
          const totalNew = recentItems.length + 1;
          const digestTitle = `📚 BSEB GURU में ${totalNew} नए स्टडी मटेरियल जोड़े गए!`;
          const digestBody = `अभी-अभी "${title}" सहित ${totalNew} नए नोट्स/टेस्ट/क्लास अपलोड किए गए हैं। अभी ऐप खोलकर पढ़ाई शुरू करें!`;
          const result = await dispatchWebPushToSubscribers({
            title: digestTitle,
            body: digestBody,
            targetUrl,
            targetClass,
            category: 'batch_digest',
            contentType,
            contentId,
            idempotencyKey: idempotencyKey || `batch_${Date.now()}`,
            sentBy: 'Auto Content Batch Digest',
            extraSubscriptions: clientSubscriptions
          });
          return res.json({
            success: true,
            batched: true,
            log: result.log,
            cleanedIds: result.cleanedIds
          });
        }
      }

      const result = await dispatchWebPushToSubscribers({
        title: String(title).trim(),
        body: String(body).trim(),
        targetUrl: String(targetUrl).trim(),
        targetClass,
        category: 'auto_content',
        contentType,
        contentId,
        idempotencyKey: idempotencyKey || `content_${contentType}_${contentId}`,
        sentBy: 'Auto Content Trigger',
        extraSubscriptions: clientSubscriptions
      });

      res.json({
        success: true,
        batched: false,
        log: result.log,
        cleanedIds: result.cleanedIds
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Daily Smart Study Reminder Scheduler (5 Slots in Asia/Kolkata Timezone)
  async function runDailySmartStudyScheduler(options?: {
    forceSlotId?: string;
    extraSubscriptions?: any[];
  }) {
    const appData = readAppData();
    const settings = getServerPushSettings(appData);
    const istNow = getAsiaKolkataNow();

    if (!settings.dailyRemindersEnabled && !options?.forceSlotId) {
      return {
        message: 'डेली रिमाइंडर वर्तमान में बंद (Disabled) हैं।',
        istNow,
        triggeredSlots: []
      };
    }

    const sentLocks: string[] = Array.isArray(appData.push_idempotency_keys)
      ? appData.push_idempotency_keys
      : [];
    const triggeredSlots: string[] = [];

    for (const slot of settings.dailySlots) {
      if (!slot.enabled && options?.forceSlotId !== slot.id) continue;

      const isForced = options?.forceSlotId === slot.id;
      // Match either exact HH:MM or within the same hour if invoked by hourly Vercel Cron
      const [slotH, slotM] = String(slot.time || '07:00')
        .split(':')
        .map((n: string) => parseInt(n, 10) || 0);
      const timeDiffMinutes = istNow.hour * 60 + istNow.minute - (slotH * 60 + slotM);
      const isTimeMatch = timeDiffMinutes >= 0 && timeDiffMinutes <= 25;

      if (!isForced && !isTimeMatch) continue;

      const dailyLockKey = isForced
        ? `forced_${istNow.dateKey}_${slot.id}_${Date.now()}`
        : `daily_${istNow.dateKey}_${slot.id}`;

      if (!isForced && sentLocks.includes(dailyLockKey)) {
        continue; // Already sent today for this slot!
      }

      // Select rotating message from messagePool based on dayOfYear so message isn't identical every day
      const pool: string[] =
        Array.isArray(slot.messagePool) && slot.messagePool.length > 0
          ? slot.messagePool
          : [slot.defaultMessage];
      const chosenMessage = pool[istNow.dayOfYear % pool.length] || slot.defaultMessage;

      await dispatchWebPushToSubscribers({
        title: slot.title || 'BSEB GURU स्मार्ट रिमाइंडर',
        body: chosenMessage,
        targetUrl: slot.targetUrl || '/?tab=home',
        targetClass: 'all',
        category: 'daily_reminder',
        idempotencyKey: dailyLockKey,
        sentBy: `Daily Scheduler (${slot.time} IST)`,
        extraSubscriptions: options?.extraSubscriptions
      });

      triggeredSlots.push(`${slot.time} - ${slot.title}`);
    }

    return {
      message:
        triggeredSlots.length > 0
          ? `✅ डेली रिमाइंडर सफलतापूर्वक भेजे गए: ${triggeredSlots.join(', ')}`
          : `⏱️ वर्तमान भारतीय समय (IST): ${istNow.timeHHMM} (${istNow.dateKey})। इस समय कोई नया स्लॉट लंबित नहीं है (या आज पहले ही भेजा जा चुका है)।`,
      istNow,
      triggeredSlots
    };
  }

  app.get('/api/notifications/cron', async (req: Request, res: Response) => {
    try {
      const forceSlotId = typeof req.query.slot === 'string' ? req.query.slot : undefined;
      const out = await runDailySmartStudyScheduler({ forceSlotId });
      res.json({ success: true, ...out });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/notifications/cron', async (req: Request, res: Response) => {
    if (!isAuthorizedAdminOrCron(req)) {
      return res.status(403).json({ error: 'अनधिकृत अनुरोध' });
    }
    try {
      const { forceSlotId, clientSubscriptions } = req.body || {};
      const out = await runDailySmartStudyScheduler({
        forceSlotId,
        extraSubscriptions: clientSubscriptions
      });
      res.json({ success: true, ...out });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Background 60-second Asia/Kolkata Scheduler Check while Server is active
  setInterval(() => {
    runDailySmartStudyScheduler().catch((err) => {
      console.warn('Background IST scheduler check notice:', err?.message);
    });
  }, 60 * 1000);


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA catch-all middleware - safely serve index.html
    app.use((req: Request, res: Response, next: express.NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.on('error', (err) => {
    console.error('Server error:', err);
  });


  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
