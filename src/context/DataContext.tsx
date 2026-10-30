import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, collection, onSnapshot } from 'firebase/firestore';
import { safeSetDoc, safeDeleteDoc } from '../utils/firestoreSafe';
import { useAuth } from './AuthContext';
import { getStaticCollection, getStaticData } from '../lib/staticData';
import { defaultSubjectsData } from '../data/defaultCurriculum';
import { defaultPaidPdfNotes } from '../data/defaultPdfNotes';
import { Subject, PaidPdfNote, LiveClass, DailyQuizItem, LeaderboardEntry, RoutineItem, MotivationalQuote, NotificationItem, AppConfig, BannerItem, PyqItem, CrashCoursePdf } from '../types';

export const defaultBanners: BannerItem[] = [
  {
    id: 'banner_crash',
    tag: '⚡ स्पेशल बोर्ड परीक्षा क्रैश कोर्स',
    title: 'बिहार बोर्ड 10वीं टॉपर क्रैश कोर्स',
    subtitle: 'कम समय में 450+ अंक लाने का पक्का फॉर्मूला (Full Syllabus)',
    features: [
      'सभी 6 विषयों का सम्पूर्ण फास्ट-ट्रैक रिवीजन',
      'चैप्टर-वाइज VVI गैस प्रश्नोत्तर एवं हस्तलिखित नोट्स',
      'पिछले 10 वर्षों के बोर्ड मॉडल पेपर्स एवं लाइव सॉल्यूशन',
      'फुल लेंथ 50 MCQ टेस्ट सीरीज व डाउट समाधान'
    ],
    subjects: ['गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'संस्कृत', 'हिंदी', 'अंग्रेजी'],
    oldPrice: '₹999',
    newPrice: '₹299 मात्र',
    buttonText: 'अभी VIP ज्वॉइन करें 👑',
    gradient: 'from-amber-600 via-red-600 to-stone-950',
    badgeText: '99% छात्र सफल'
  },
  {
    id: 'banner_pyq',
    tag: '📄 2018 - 2026 PYQ बैंक',
    title: 'बिहार बोर्ड पिछले वर्षों के प्रश्न पत्र',
    subtitle: 'सभी विषयों के प्रथम एवं द्वितीय पाली के ओरिजिनल प्रश्न पत्र व उत्तर',
    features: [
      'वर्ष 2018 से 2026 तक के सभी प्रश्न पत्र',
      'प्रत्येक प्रश्न का सटीक वस्तुनिष्ठ व सब्जेक्टिव हल',
      'बिहार बोर्ड परीक्षा पैटर्न पर आधारित मॉडल पेपर'
    ],
    subjects: ['गणित', 'विज्ञान', 'सामाजिक विज्ञान', 'हिन्दी', 'संस्कृत'],
    oldPrice: 'मुफ्त',
    newPrice: 'FREE',
    buttonText: 'PYQ पीडीएफ देखें 📥',
    gradient: 'from-red-600 via-rose-600 to-amber-700',
    badgeText: '100% फ्री'
  }
];

const LEGACY_AI_STUDIO_IDS = new Set([
  'live_vvi_1',
  'live_vvi_2',
  'live_hindi_1',
  'live_hindi_2',
  'live_math_1',
  'live_math_2',
  'live_science_1',
  'live_science_2',
  'live_sanskrit_1',
  'live_sst_1',
  'live_eng_1',
  'live_eng_2'
]);

export const isAiStudioLectureItem = (raw: any): boolean => {
  if (!raw) return true;
  const id = String(raw.id || '').trim();
  if (!id || LEGACY_AI_STUDIO_IDS.has(id)) return true;
  const ytUrl = String(raw.youtubeUrl || '').trim();
  const playUrl = String(raw.playbackUrl || '').trim();
  if (
    raw.videoSourceType === 'ai_board' ||
    ytUrl === 'ai_studio_lecture' ||
    playUrl === 'ai_studio_lecture' ||
    ytUrl.includes('ai_studio') ||
    playUrl.includes('ai_studio')
  ) {
    return true;
  }
  const effectiveUrl = ytUrl || playUrl;
  if (!effectiveUrl) return true;
  return false;
};

export const defaultLiveClasses: LiveClass[] = [
  {
    id: 'live_1793016860379',
    title: 'Class 10th Math Trick — Mantu Sir',
    subjectName: 'गणित',
    teacherName: 'Mantu sir',
    youtubeUrl: 'https://www.youtube.com/watch?v=JPtTC3EbBdU',
    playbackUrl: 'https://www.youtube.com/watch?v=JPtTC3EbBdU',
    scheduledAt: 'अभी लाइव',
    createdAt: '2026-10-26T12:14:20.379Z',
    publishedAt: '2026-10-26T12:14:20.379Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1248,
    likesCount: 251,
    description: ''
  },
  {
    id: 'live_1792310611683',
    title: '11th & 12th Special Science Class',
    subjectName: 'विज्ञान',
    teacherName: 'Yt',
    youtubeUrl: 'https://www.youtube.com/watch?v=pc4mqZturjQ',
    playbackUrl: 'https://www.youtube.com/watch?v=pc4mqZturjQ',
    scheduledAt: 'अभी लाइव',
    createdAt: '2026-10-18T08:03:31.683Z',
    publishedAt: '2026-10-18T08:03:31.683Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1240,
    description: ''
  },
  {
    id: 'live_1792289302753',
    title: 'रामबाण सामाजिक विज्ञान (VVI मैराथन क्लास)',
    subjectName: 'सामाजिक विज्ञान',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=Y7PXDFvXNwc',
    playbackUrl: 'https://www.youtube.com/watch?v=Y7PXDFvXNwc',
    scheduledAt: 'आज शाम 7:00 बजे',
    createdAt: '2026-10-18T02:08:22.754Z',
    publishedAt: '2026-10-18T02:08:22.754Z',
    isLive: true,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'live',
    category: 'Live',
    libraryCategory: 'Revision Classes',
    contentType: 'live',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1520,
    description: ''
  },
  {
    id: 'live_1791932770220',
    title: 'हिंदी में निबंध लिखने का ट्रिक VVI',
    subjectName: 'हिन्दी',
    teacherName: 'Sourse - yt',
    youtubeUrl: 'https://www.youtube.com/watch?v=EPk3WVjaGcs',
    playbackUrl: 'https://www.youtube.com/watch?v=EPk3WVjaGcs',
    scheduledAt: 'रिकॉर्डेड क्लास',
    createdAt: '2026-10-13T23:06:10.220Z',
    publishedAt: '2026-10-13T23:06:10.220Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Exam Preparation',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1241,
    description: ''
  },
  {
    id: 'live_1791330521128',
    title: 'Class 9th Physics Chapter 4',
    subjectName: 'विज्ञान',
    teacherName: 'Pw',
    youtubeUrl: 'https://www.youtube.com/watch?v=BKVp4U1rjHo',
    playbackUrl: 'https://www.youtube.com/watch?v=BKVp4U1rjHo',
    scheduledAt: 'अभी लाइव',
    createdAt: '2026-10-06T23:48:41.128Z',
    publishedAt: '2026-10-06T23:48:41.128Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1241,
    description: ''
  },
  {
    id: 'live_1791245687910',
    title: 'क्लास 9th गुरुत्वाकर्षण (Gravitation)',
    subjectName: 'विज्ञान',
    teacherName: 'Sourse pw',
    youtubeUrl: 'https://www.youtube.com/watch?v=BKVp4U1rjHo',
    playbackUrl: 'https://www.youtube.com/watch?v=BKVp4U1rjHo',
    scheduledAt: 'अभी लाइव',
    createdAt: '2026-10-06T00:14:47.910Z',
    publishedAt: '2026-10-06T00:14:47.910Z',
    isLive: true,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'live',
    category: 'Live',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'live',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1310,
    description: ''
  },
  {
    id: 'live_1790944466376',
    title: 'Class 10th History Chapter 2 One Shot',
    subjectName: 'सामाजिक विज्ञान',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=I-hWjcDqa-Q',
    playbackUrl: 'https://www.youtube.com/watch?v=I-hWjcDqa-Q',
    scheduledAt: 'अभी लाइव',
    createdAt: '2026-10-02T12:34:26.376Z',
    publishedAt: '2026-10-02T12:34:26.376Z',
    isLive: true,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'live',
    category: 'Live',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'live',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1420,
    description: ''
  },
  {
    id: 'live_1790935174614',
    title: 'गोधूलि अध्याय 1 श्रम विभाजन और जाति प्रथा',
    subjectName: 'हिन्दी',
    teacherName: 'Raj sir',
    youtubeUrl: 'https://www.youtube.com/watch?v=MOTqFrrrxLA',
    playbackUrl: 'https://www.youtube.com/watch?v=MOTqFrrrxLA',
    scheduledAt: 'आज',
    createdAt: '2026-10-02T09:59:34.614Z',
    publishedAt: '2026-10-02T09:59:34.614Z',
    isLive: true,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'live',
    category: 'Live',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'live',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1380,
    description: ''
  },
  {
    id: 'live_1790912909542',
    title: 'Class 9th प्रश्नावली 2.4',
    subjectName: 'गणित',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=pvRMqRMgS1I',
    playbackUrl: 'https://www.youtube.com/watch?v=pvRMqRMgS1I',
    scheduledAt: 'आज',
    createdAt: '2026-10-02T03:48:29.542Z',
    publishedAt: '2026-10-02T03:48:29.542Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1243,
    description: ''
  },
  {
    id: 'live_1790912882392',
    title: 'Class 10th प्रश्नावली 2.3',
    subjectName: 'गणित',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=Q8q8USbzU4s',
    playbackUrl: 'https://www.youtube.com/watch?v=Q8q8USbzU4s',
    scheduledAt: 'आज',
    createdAt: '2026-10-02T03:48:02.392Z',
    publishedAt: '2026-10-02T03:48:02.392Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1241,
    description: ''
  },
  {
    id: 'live_1790912760988',
    title: 'Class 9th प्रश्नावली 2.2',
    subjectName: 'गणित',
    teacherName: 'Pankaj sir',
    youtubeUrl: 'https://www.youtube.com/watch?v=EVi7yTmJZm4',
    playbackUrl: 'https://www.youtube.com/watch?v=EVi7yTmJZm4',
    scheduledAt: 'आज',
    createdAt: '2026-10-02T03:46:00.990Z',
    publishedAt: '2026-10-02T03:46:00.990Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1240,
    description: ''
  },
  {
    id: 'live_1790910550641',
    title: 'Class 10th प्रश्नावली 2.1',
    subjectName: 'गणित',
    teacherName: 'Pankaj sir',
    youtubeUrl: 'https://www.youtube.com/watch?v=CyWQdTAREYM',
    playbackUrl: 'https://www.youtube.com/watch?v=CyWQdTAREYM',
    scheduledAt: 'आज',
    createdAt: '2026-10-02T03:09:10.645Z',
    publishedAt: '2026-10-02T03:09:10.645Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1240,
    description: ''
  },
  {
    id: 'live_1790904661152',
    title: 'Class 9th प्रश्नावली 1.5',
    subjectName: 'गणित',
    teacherName: 'Pankaj sir',
    youtubeUrl: 'https://www.youtube.com/watch?v=3EOPTO71C6s',
    playbackUrl: 'https://www.youtube.com/watch?v=3EOPTO71C6s',
    scheduledAt: 'आज',
    createdAt: '2026-10-02T01:31:01.153Z',
    publishedAt: '2026-10-02T01:31:01.153Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1240,
    description: ''
  },
  {
    id: 'live_1790904441318',
    title: 'Class 9th प्रश्नावली 1.4',
    subjectName: 'गणित',
    teacherName: 'Pankaj sir',
    youtubeUrl: 'https://www.youtube.com/watch?v=yAv3TYIPkUk',
    playbackUrl: 'https://www.youtube.com/watch?v=yAv3TYIPkUk',
    scheduledAt: 'आज शाम 6:00 बजे',
    createdAt: '2026-10-02T01:27:21.322Z',
    publishedAt: '2026-10-02T01:27:21.322Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1240,
    description: ''
  },
  {
    id: 'live_1790904318374',
    title: 'Class 9th प्रश्नावली 1.3',
    subjectName: 'गणित',
    teacherName: 'Pankaj sir',
    youtubeUrl: 'https://www.youtube.com/watch?v=glCYl5PXnbA',
    playbackUrl: 'https://www.youtube.com/watch?v=glCYl5PXnbA',
    scheduledAt: 'आज',
    createdAt: '2026-10-02T01:25:18.374Z',
    publishedAt: '2026-10-02T01:25:18.374Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    publishType: 'instant',
    isUploaded: true,
    viewsCount: 1240,
    description: ''
  },
  {
    id: 'live_1790084830099',
    title: 'संस्कृत व्याकरण - परीक्षा में अनुच्छेद (7 वाक्य) लिखने की ट्रिक',
    subjectName: 'संस्कृत',
    teacherName: 'राज सर • BSEB GURU',
    youtubeUrl: 'https://www.youtube.com/watch?v=iXxCoEvsxks',
    playbackUrl: 'https://www.youtube.com/watch?v=iXxCoEvsxks',
    scheduledAt: 'रिकॉर्डेड क्लास',
    createdAt: '2026-09-22T13:47:10.099Z',
    publishedAt: '2026-09-22T13:47:10.099Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Exam Preparation',
    contentType: 'recorded',
    description: 'बिहार बोर्ड 10वीं संस्कृत परीक्षा में 7 अंकों का अनुच्छेद लेखन आसानी से कैसे करें।'
  },
  {
    id: 'live_1790081975511',
    title: 'हिंदी के संपूर्ण अध्याय के लेखक के नाम याद करने की ट्रिक',
    subjectName: 'हिन्दी',
    teacherName: 'राज सर • BSEB GURU',
    youtubeUrl: 'https://www.youtube.com/watch?v=1Aj6-w1RgPU',
    playbackUrl: 'https://www.youtube.com/watch?v=1Aj6-w1RgPU',
    scheduledAt: 'रिकॉर्डेड क्लास',
    createdAt: '2026-09-22T12:59:35.516Z',
    publishedAt: '2026-09-22T12:59:35.516Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Revision Classes',
    contentType: 'recorded',
    description: 'कक्षा 10वीं हिंदी गोधूलि के सभी पाठ और उनके लेखकों के नाम याद करने की शानदार ट्रिक।'
  },
  {
    id: 'live_1790075722375',
    title: 'BSEB Class 10 Topper Motivation & Comeback Strategy',
    subjectName: 'सामान्य',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=ruqhIhB3vl0',
    playbackUrl: 'https://www.youtube.com/watch?v=ruqhIhB3vl0',
    scheduledAt: 'रिकॉर्डेड क्लास',
    createdAt: '2026-09-22T11:15:22.375Z',
    publishedAt: '2026-09-22T11:15:22.375Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Exam Preparation',
    contentType: 'recorded',
    description: 'बोर्ड परीक्षा में 450+ अंक लाने के लिए विशेष मोटिवेशन और टाइम-टेबल रणनीति।'
  },
  {
    id: 'live_1790066678880',
    title: 'वर्णिका पाठ 5 - धरती कब तक घूमेगी (संपूर्ण हल)',
    subjectName: 'हिन्दी',
    chapterName: 'वर्णिका पाठ 5: धरती कब तक घूमेगी',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=8ofwkGs2nYE',
    playbackUrl: 'https://www.youtube.com/watch?v=8ofwkGs2nYE',
    scheduledAt: 'रिकॉर्डेड क्लास',
    createdAt: '2026-09-22T08:44:38.880Z',
    publishedAt: '2026-09-22T08:44:38.880Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    description: 'बिहार बोर्ड 10वीं हिंदी वर्णिका पाठ 5 धरती कब तक घूमेगी का संपूर्ण सारांश और प्रश्न-उत्तर।'
  },
  {
    id: 'live_1790046453396',
    title: 'वर्णिका पाठ 4 - नगर (संपूर्ण व्याख्या एवं प्रश्नोत्तर)',
    subjectName: 'हिन्दी',
    chapterName: 'वर्णिका पाठ 4: नगर',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=rRLL5Tw1gV8',
    playbackUrl: 'https://www.youtube.com/watch?v=rRLL5Tw1gV8',
    scheduledAt: 'रिकॉर्डेड क्लास',
    createdAt: '2026-09-22T03:07:33.399Z',
    publishedAt: '2026-09-22T03:07:33.399Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    description: 'बिहार बोर्ड कक्षा 10वीं हिंदी वर्णिका पाठ 4 नगर (सुजाता) संपूर्ण क्लास।'
  },
  {
    id: 'live_1790033137415',
    title: 'वर्णिका पाठ 3 - माँ (संपूर्ण व्याख्या व VVI प्रश्न)',
    subjectName: 'हिन्दी',
    chapterName: 'वर्णिका पाठ 3: माँ',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=MD6tiYOtGAg',
    playbackUrl: 'https://www.youtube.com/watch?v=MD6tiYOtGAg',
    scheduledAt: 'रिकॉर्डेड क्लास',
    createdAt: '2026-09-21T23:25:37.415Z',
    publishedAt: '2026-09-21T23:25:37.415Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    description: 'बिहार बोर्ड कक्षा 10वीं वर्णिका भाग-2 पाठ 3 माँ कहानी का संपूर्ण सारांश।'
  },
  {
    id: 'live_1790004170075',
    title: 'वर्णिका पाठ 2 - ढहते विश्वास (संपूर्ण सारांश एवं प्रश्नोत्तर)',
    subjectName: 'हिन्दी',
    chapterName: 'वर्णिका पाठ 2: ढहते विश्वास',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=l209nWSzih4',
    playbackUrl: 'https://www.youtube.com/watch?v=l209nWSzih4',
    scheduledAt: 'रिकॉर्डेड क्लास',
    createdAt: '2026-09-21T15:22:50.075Z',
    publishedAt: '2026-09-21T15:22:50.075Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    description: 'कक्षा 10वीं हिंदी वर्णिका अध्याय 2 ढहते विश्वास की संपूर्ण व्याख्या और VVI प्रश्न।'
  },
  {
    id: 'live_1789997398467',
    title: 'वर्णिका पाठ 1 - दही वाली मंगम्मा (संपूर्ण क्लास)',
    subjectName: 'हिन्दी',
    chapterName: 'वर्णिका पाठ 1: दही वाली मंगम्मा',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=0qJWe4D-96A',
    playbackUrl: 'https://www.youtube.com/watch?v=0qJWe4D-96A',
    scheduledAt: 'रिकॉर्डेड क्लास',
    createdAt: '2026-09-21T13:29:58.468Z',
    publishedAt: '2026-09-21T13:29:58.468Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    description: 'बिहार बोर्ड कक्षा 10वीं हिंदी (वर्णिका भाग-2) पाठ 1 दही वाली मंगम्मा की संपूर्ण कहानी और प्रश्न-उत्तर।'
  },
  {
    id: 'live_1789907372340',
    title: 'संस्कृत अध्याय 1 - मङ्गलम् (संपूर्ण व्याख्या व प्रश्नोत्तर)',
    subjectName: 'संस्कृत',
    chapterName: 'पाठ 1: मङ्गलम्',
    teacherName: 'राज सर',
    youtubeUrl: 'https://www.youtube.com/watch?v=xY8iG5H9qM4',
    playbackUrl: 'https://www.youtube.com/watch?v=xY8iG5H9qM4',
    scheduledAt: 'रिकॉर्डेड क्लास',
    createdAt: '2026-09-20T12:29:32.343Z',
    publishedAt: '2026-09-20T12:29:32.343Z',
    isLive: false,
    isVip: false,
    publicationStatus: 'published',
    streamStatus: 'ended',
    category: 'Classes',
    libraryCategory: 'Chapter-wise Lectures',
    contentType: 'recorded',
    description: 'बिहार बोर्ड कक्षा 10वीं संस्कृत (पीयूषम् भाग-2) अध्याय 1 मङ्गलम् के सभी 5 मंत्रों का हिंदी अर्थ और महत्वपूर्ण बोर्ड प्रश्नोत्तर।'
  }
];

export const defaultDailyQuizzes: DailyQuizItem[] = [
  {
    id: 'quiz_1',
    title: 'बिहार बोर्ड 10वीं गणित - वास्तविक संख्याएँ (Real Numbers) ऑनलाइन टेस्ट',
    subject: 'गणित (Maths)',
    totalQuestions: 15,
    durationMinutes: 10,
    questions: [
      {
        question: 'दो संख्याओं a और b का म.स. (HCF) × ल.स. (LCM) किसके बराबर होता है?',
        options: ['a + b', 'a - b', 'a × b', 'a / b'],
        correctAnswer: 2,
        explanation: 'सूत्र से: HCF(a,b) × LCM(a,b) = a × b होता है।'
      },
      {
        question: 'निम्न में से कौन सी अभाज्य संख्या (Prime Number) है?',
        options: ['4', '9', '11', '15'],
        correctAnswer: 2,
        explanation: '11 केवल 1 और 11 से विभाजित होती है, अतः यह अभाज्य संख्या है।'
      }
    ]
  }
];

export const defaultLeaderboard: LeaderboardEntry[] = [
  {
    id: 'lb_1',
    studentName: 'राहुल कुमार',
    district: 'पटना (Patna)',
    score: 486,
    totalMarks: 500,
    testName: 'बोर्ड परीक्षा ऑल इंडिया महाटेस्ट',
    subjectName: 'ऑल सब्जेक्ट',
    createdAt: new Date().toISOString(),
    isVip: true
  },
  {
    id: 'lb_2',
    studentName: 'प्रिया कुमारी',
    district: 'मुजफ्फरपुर (Muzaffarpur)',
    score: 479,
    totalMarks: 500,
    testName: 'गणित टॉपर चैलेंज',
    subjectName: 'गणित',
    createdAt: new Date().toISOString(),
    isVip: true
  },
  {
    id: 'lb_3',
    studentName: 'अमित शर्मा',
    district: 'समस्तीपुर (Samastipur)',
    score: 472,
    totalMarks: 500,
    testName: 'विज्ञान वीकली टेस्ट',
    subjectName: 'विज्ञान',
    createdAt: new Date().toISOString(),
    isVip: false
  },
  {
    id: 'lb_4',
    studentName: 'नेहा गुप्ता',
    district: 'गया (Gaya)',
    score: 468,
    totalMarks: 500,
    testName: 'सामाजिक विज्ञान मेगा क्विज़',
    subjectName: 'सामाजिक विज्ञान',
    createdAt: new Date().toISOString(),
    isVip: true
  },
  {
    id: 'lb_5',
    studentName: 'विकी कुमार',
    district: 'भागलपुर (Bhagalpur)',
    score: 465,
    totalMarks: 500,
    testName: 'संस्कृत पीयूषम् टेस्ट',
    subjectName: 'संस्कृत',
    createdAt: new Date().toISOString(),
    isVip: false
  },
  {
    id: 'lb_6',
    studentName: 'सुनीता सिंह',
    district: 'बेगूसराय (Begusarai)',
    score: 462,
    totalMarks: 500,
    testName: 'हिन्दी गद्य खंड महाटेस्ट',
    subjectName: 'हिन्दी',
    createdAt: new Date().toISOString(),
    isVip: true
  }
];

export const defaultRoutine: RoutineItem[] = [
  { id: 'rt_1', time: 'सुबह 5:00 - 6:30', title: 'गणित (Maths) फॉर्मूला रिवीजन', subject: 'गणित', isCompleted: false },
  { id: 'rt_2', time: 'सुबह 7:00 - 8:30', title: 'विज्ञान (Science) भौतिकी & रसायन', subject: 'विज्ञान', isCompleted: false },
  { id: 'rt_3', time: 'शाम 6:00 - 7:30', title: 'सामाजिक विज्ञान & इतिहास', subject: 'सामाजिक विज्ञान', isCompleted: false },
  { id: 'rt_4', time: 'रात 8:00 - 9:30', title: 'हिन्दी गद्य खंड & संस्कृत पीयूषम्', subject: 'हिन्दी', isCompleted: false }
];

export const defaultQuotes: MotivationalQuote[] = [
  { id: 'qt_1', quote: 'मंजिलें उन्हीं को मिलती हैं, जिनके सपनों में जान होती है, पंखों से कुछ नहीं होता, हौसलों से उड़ान होती है!', author: 'डॉ. एपीजे अब्दुल कलाम', isActive: true },
  { id: 'qt_2', quote: 'बिहार बोर्ड 10वीं परीक्षा में 450+ अंक लाना अब हर छात्र का सपना सच होगा!', author: 'BSEB Topper Team', isActive: true }
];

export const defaultNotifications: NotificationItem[] = [
  { id: 'notif_1', title: '🎯 नया क्रैश कोर्स लाइव!', description: 'बिहार बोर्ड 10वीं के लिए सभी 6 विषयों का फास्ट-ट्रैक रिवीजन शुरू हो गया है।', timeLabel: 'अभी', isNew: true, actionType: 'courses', createdAt: new Date().toISOString() },
  { id: 'notif_2', title: '📄 PYQ बैंक अपडेटेड', description: 'पिछले वर्षों के ओरिजिनल प्रश्न पत्र उत्तर सहित अपलोड कर दिए गए हैं।', timeLabel: 'आज', isNew: true, actionType: 'courses', createdAt: new Date().toISOString() }
];

export const defaultAppConfig: AppConfig = {
  upiId: '9241511070@fam',
  whatsappNumber: '9241511070',
  qrCodeDataUrl: '',
  appLogoUrl: '',
  price1Month: 99,
  price1Year: 499,
  helplineNumber: '9241511070',
  youtubeUrl: 'https://youtube.com',
  instagramUrl: 'https://instagram.com',
  whatsappGroupUrl: 'https://chat.whatsapp.com',
  telegramUrl: 'https://t.me',
  crashCoursePrice: 299,
  crashCourseDiscountCode: 'BSEB100',
  crashCourseDiscountAmount: 100
};

const defaultPyqs: PyqItem[] = [
  // 2026
  { id: 'pyq_2026_1', year: '2026', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2026 वार्षिक परीक्षा ओरिजिनल प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 4520, uploadedAt: '2026-02-15' },
  { id: 'pyq_2026_2', year: '2026', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2026 प्रथम & द्वितीय पाली प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 3890, uploadedAt: '2026-02-15' },
  { id: 'pyq_2026_3', year: '2026', subjectName: 'सामाजिक विज्ञान', title: 'BSEB 10th सामाजिक विज्ञान 2026 बोर्ड परीक्षा प्रश्न पत्र व हल', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 3120, uploadedAt: '2026-02-16' },
  { id: 'pyq_2026_4', year: '2026', subjectName: 'हिन्दी', title: 'BSEB 10th हिन्दी (गोधूलि भाग-2) 2026 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 2950, uploadedAt: '2026-02-16' },
  { id: 'pyq_2026_5', year: '2026', subjectName: 'संस्कृत', title: 'BSEB 10th संस्कृत (पीयूषम्) 2026 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 2780, uploadedAt: '2026-02-17' },

  // 2025
  { id: 'pyq_2025_1', year: '2025', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2025 वार्षिक परीक्षा प्रश्न पत्र (Objective + Subjective)', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 5420, uploadedAt: '2025-02-20' },
  { id: 'pyq_2025_2', year: '2025', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2025 प्रथम पाली PYQ Solution PDF', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 4890, uploadedAt: '2025-02-20' },
  { id: 'pyq_2025_3', year: '2025', subjectName: 'सामाजिक विज्ञान', title: 'BSEB 10th सामाजिक विज्ञान 2025 Model Paper with Answer', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 4150, uploadedAt: '2025-02-21' },
  { id: 'pyq_2025_4', year: '2025', subjectName: 'हिन्दी', title: 'BSEB 10th हिन्दी 2025 बोर्ड परीक्षा ओरिजिनल क्वेश्चन पेपर', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 3920, uploadedAt: '2025-02-21' },
  { id: 'pyq_2025_5', year: '2025', subjectName: 'संस्कृत', title: 'BSEB 10th संस्कृत 2025 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 3640, uploadedAt: '2025-02-22' },

  // 2024
  { id: 'pyq_2024_1', year: '2024', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2024 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 6200, uploadedAt: '2024-02-25' },
  { id: 'pyq_2024_2', year: '2024', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2024 ओरिजिनल क्वेश्चन पेपर', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 5780, uploadedAt: '2024-02-25' },
  { id: 'pyq_2024_3', year: '2024', subjectName: 'सामाजिक विज्ञान', title: 'BSEB 10th सामाजिक विज्ञान 2024 प्रश्न पत्र व हल', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 4920, uploadedAt: '2024-02-26' },
  { id: 'pyq_2024_4', year: '2024', subjectName: 'हिन्दी', title: 'BSEB 10th हिन्दी 2024 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 4510, uploadedAt: '2024-02-26' },

  // 2023
  { id: 'pyq_2023_1', year: '2023', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2023 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 7100, uploadedAt: '2023-02-20' },
  { id: 'pyq_2023_2', year: '2023', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2023 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 6540, uploadedAt: '2023-02-20' },
  { id: 'pyq_2023_3', year: '2023', subjectName: 'सामाजिक विज्ञान', title: 'BSEB 10th सामाजिक विज्ञान 2023 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 5890, uploadedAt: '2023-02-21' },

  // 2022
  { id: 'pyq_2022_1', year: '2022', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2022 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 8200, uploadedAt: '2022-02-24' },
  { id: 'pyq_2022_2', year: '2022', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2022 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 7600, uploadedAt: '2022-02-24' },

  // 2021
  { id: 'pyq_2021_1', year: '2021', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2021 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 9100, uploadedAt: '2021-02-22' },
  { id: 'pyq_2021_2', year: '2021', subjectName: 'विज्ञान (Science)', title: 'BSEB 10th विज्ञान 2021 प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 8400, uploadedAt: '2021-02-22' },

  // 2020 to 2018
  { id: 'pyq_2020_1', year: '2020', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2020 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 10200, uploadedAt: '2020-02-20' },
  { id: 'pyq_2019_1', year: '2019', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2019 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 11500, uploadedAt: '2019-02-21' },
  { id: 'pyq_2018_1', year: '2018', subjectName: 'गणित (Maths)', title: 'BSEB 10th गणित 2018 वार्षिक परीक्षा प्रश्न पत्र', pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', isVip: false, downloadsCount: 12800, uploadedAt: '2018-02-22' }
];

export const defaultCrashCoursePdfs: CrashCoursePdf[] = [];

interface DataContextType {
  subjects: Record<string, Subject>;
  paidNotes: PaidPdfNote[];
  pyqs: PyqItem[];
  crashCoursePdfs: CrashCoursePdf[];
  liveClasses: LiveClass[];
  dailyQuizzes: DailyQuizItem[];
  leaderboard: LeaderboardEntry[];
  routine: RoutineItem[];
  motivationalQuotes: MotivationalQuote[];
  notifications: NotificationItem[];
  loading: boolean;
  refreshData: () => Promise<void>;
  addPaidNote: (note: Omit<PaidPdfNote, 'id'>) => Promise<string>;
  deletePaidNote: (id: string) => Promise<void>;
  addPyq: (item: Omit<PyqItem, 'id'>) => Promise<string>;
  deletePyq: (id: string) => Promise<void>;
  addCrashCoursePdf: (pdf: Omit<CrashCoursePdf, 'id'>) => Promise<string>;
  deleteCrashCoursePdf: (id: string) => Promise<void>;
  addLiveClass: (cls: Omit<LiveClass, 'id'>) => Promise<string>;
  updateLiveClass: (id: string, updates: Partial<LiveClass>) => Promise<void>;
  deleteLiveClass: (id: string) => Promise<void>;
  addDailyQuiz: (quiz: Omit<DailyQuizItem, 'id'>) => Promise<string>;
  deleteDailyQuiz: (id: string) => Promise<void>;
  addLeaderboardScore: (entry: Omit<LeaderboardEntry, 'id'>) => Promise<string>;
  addRoutineItem: (item: Omit<RoutineItem, 'id'>) => Promise<string>;
  updateRoutineItem: (id: string, item: Partial<RoutineItem>) => Promise<void>;
  deleteRoutineItem: (id: string) => Promise<void>;
  addQuote: (quote: Omit<MotivationalQuote, 'id'>) => Promise<string>;
  deleteQuote: (id: string) => Promise<void>;
  toggleQuoteActive: (id: string, isActive: boolean) => Promise<void>;
  addNotification: (item: Omit<NotificationItem, 'id'>) => Promise<string>;
  deleteNotification: (id: string) => Promise<void>;
  appConfig: AppConfig;
  updateSettings: (config: AppConfig) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

const getMergedSubjects = (baseSubjects: Record<string, Subject>) => {
  const merged = { ...baseSubjects };
  try {
    const cached = localStorage.getItem('bseb_admin_chapters_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      Object.keys(parsed).forEach(sId => {
        if (!merged[sId]) {
          merged[sId] = parsed[sId];
        } else {
          const existingMap = new Map();
          merged[sId].chapters.forEach((ch: any) => existingMap.set(ch.chapter_no, ch));
          parsed[sId].chapters.forEach((c: any) => {
            const chNo = c.chapter_no;
            const baseCh = existingMap.get(chNo);
            if (baseCh && (baseCh.mcq?.length || 0) > (c.mcq?.length || 0)) {
              existingMap.set(chNo, { ...c, mcq: baseCh.mcq });
            } else {
              existingMap.set(chNo, c);
            }
          });
          merged[sId] = {
            ...merged[sId],
            subject_name_hindi: parsed[sId].subject_name_hindi || merged[sId].subject_name_hindi,
            chapters: Array.from(existingMap.values()).sort((a: any, b: any) => a.chapter_no - b.chapter_no)
          };
        }
      });
    }
  } catch {}
  return merged;
};

const normalizeLiveClassItem = (raw: any): LiveClass => {
  const id = String(raw?.id || 'live_' + Math.random().toString(36).substring(2, 9));
  const clean: Record<string, any> = {};
  if (raw && typeof raw === 'object') {
    for (const [k, v] of Object.entries(raw)) {
      if (v !== undefined) clean[k] = v;
    }
  }
  const createdIso = String(
    raw?.createdAt ||
      raw?.publishedAt ||
      (id.startsWith('live_') && !isNaN(Number(id.slice(5)))
        ? new Date(Number(id.slice(5))).toISOString()
        : new Date().toISOString())
  );
  return {
    ...clean,
    id,
    title: String(raw?.title || 'बिहार बोर्ड कक्षा 10वीं विशेष क्लास'),
    youtubeUrl: String(raw?.youtubeUrl || raw?.playbackUrl || ''),
    playbackUrl: String(raw?.playbackUrl || raw?.youtubeUrl || ''),
    subjectName: String(raw?.subjectName || raw?.subject || 'सामान्य'),
    teacherName: String(raw?.teacherName || raw?.teacher || 'राज सर'),
    scheduledAt: String(raw?.scheduledAt || 'रिकॉर्डेड क्लास'),
    publicationStatus: 'published',
    createdAt: createdIso,
    publishedAt: String(raw?.publishedAt || createdIso),
    isLive: Boolean(raw?.isLive)
  };
};

const getDeletedLiveIdsSet = (): Set<string> => {
  try {
    const raw = localStorage.getItem('bseb_deleted_live_ids');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {}
  return new Set();
};

export const DataProvider = ({ children }: any) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Record<string, Subject>>(() => getMergedSubjects(defaultSubjectsData));
  const [paidNotes, setPaidNotes] = useState<PaidPdfNote[]>(defaultPaidPdfNotes);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const data = await getStaticData();
        if (!data) return;

        // Subjects
        const subjectsMap: Record<string, Subject> = {};
        if (data.subjects && Array.isArray(data.subjects)) {
          data.subjects.forEach((sub: any) => {
            subjectsMap[sub.id] = sub as Subject;
          });
        }
        const baseSub = Object.keys(subjectsMap).length > 0 ? subjectsMap : defaultSubjectsData;
        setSubjects(getMergedSubjects(baseSub));

        // Paid Notes
        setPaidNotes(data.paid_notes || defaultPaidPdfNotes);

        // PYQs
        setPyqs(data.pyqs || defaultPyqs);

        // Live Classes (Keep ONLY Admin-added YouTube/video items, purge AI Tech Video Studio items)
        const staticLive = (data.live_classes || []).filter((c: any) => !isAiStudioLectureItem(c));
        setLiveClasses((prev) => {
          const map = new Map<string, LiveClass>();
          staticLive.forEach((c: LiveClass) => {
            if (c && c.id && !isAiStudioLectureItem(c)) map.set(c.id, normalizeLiveClassItem(c));
          });
          prev.forEach(c => {
            if (c && c.id && !isAiStudioLectureItem(c)) map.set(c.id, normalizeLiveClassItem(c));
          });
          try {
            const cached = localStorage.getItem('bseb_live_classes_cache');
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed)) {
                parsed.forEach((c: LiveClass) => {
                  if (c && c.id && !isAiStudioLectureItem(c)) map.set(c.id, normalizeLiveClassItem(c));
                });
              }
            }
          } catch {}
          const cleaned = Array.from(map.values()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
          try {
            localStorage.setItem('bseb_live_classes_cache', JSON.stringify(cleaned));
          } catch {}
          return cleaned;
        });

        // Daily Quizzes
        setDailyQuizzes(data.daily_quizzes || defaultDailyQuizzes);

        // Leaderboard
        setLeaderboard(data.leaderboard || defaultLeaderboard);

        // Routine
        setRoutine(data.routine || defaultRoutine);

        // Quotes
        setMotivationalQuotes(data.motivational_quotes || defaultQuotes);

        // Notifications
        setNotifications(data.notifications || defaultNotifications);

        // App Config
        setAppConfig(data.app_config || defaultAppConfig);

      } catch (e) {
        console.error("Failed to load static data:", e);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  const fetchData = async () => {
    // fetchData is deprecated, replaced by initial load
  };

  // Real-time listener removed - using static data load instead

  const addPaidNote = async (noteData: Omit<PaidPdfNote, 'id'>): Promise<string> => {
    const id = 'note_' + Date.now();
    const newNote: PaidPdfNote = {
      id,
      ...noteData,
      uploadedAt: noteData.uploadedAt || new Date().toISOString()
    };

    setPaidNotes((prev) => [newNote, ...prev]);
    try {
      const updated = [newNote, ...paidNotes];
      localStorage.setItem('bseb_paid_notes_cache', JSON.stringify(updated));
    } catch {}

    try {
      await safeSetDoc(doc(db, 'paid_notes', id), newNote, undefined, 3000, true);
    } catch (e: any) {
      console.warn("Firestore note save notice:", e?.message || String(e));
    }
    return id;
  };

  const deletePaidNote = async (id: string): Promise<void> => {
    setPaidNotes((prev) => prev.filter((n) => n.id !== id));
    try {
      const updated = paidNotes.filter((n) => n.id !== id);
      localStorage.setItem('bseb_paid_notes_cache', JSON.stringify(updated));
    } catch {}

    try {
      await safeDeleteDoc(doc(db, 'paid_notes', id), 3000, true);
    } catch (e: any) {
      console.warn("Firestore note delete notice:", e?.message || String(e));
    }
  };

  const [pyqs, setPyqs] = useState<PyqItem[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_pyqs_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultPyqs;
  });

  const addPyq = async (pyqData: Omit<PyqItem, 'id'>): Promise<string> => {
    const id = 'pyq_' + Date.now();
    const newPyq: PyqItem = {
      id,
      ...pyqData,
      uploadedAt: pyqData.uploadedAt || new Date().toISOString()
    };

    setPyqs((prev) => {
      const updated = [newPyq, ...prev];
      try {
        localStorage.setItem('bseb_pyqs_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await safeSetDoc(doc(db, 'pyqs', id), newPyq, undefined, 3000, true);
    } catch (e: any) {
      console.warn("Firestore pyq save notice:", e?.message || String(e));
    }
    return id;
  };

  const deletePyq = async (id: string): Promise<void> => {
    setPyqs((prev) => prev.filter((p) => p.id !== id));
    try {
      const updated = pyqs.filter((p) => p.id !== id);
      localStorage.setItem('bseb_pyqs_cache', JSON.stringify(updated));
    } catch {}

    try {
      await safeDeleteDoc(doc(db, 'pyqs', id), 3000, true);
    } catch (e: any) {
      console.warn("Firestore pyq delete notice:", e?.message || String(e));
    }
  };

  // Crash Course PDFs State & Firestore sync
  const [crashCoursePdfs, setCrashCoursePdfs] = useState<CrashCoursePdf[]>(() => {
    try {
      const cached = localStorage.getItem('bseb_crash_course_pdfs_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          // Keep only admin-added items (clean out old dummy placeholders)
          return parsed.filter(item => 
            !item.id.startsWith('cc_pdf_sci') && 
            !item.id.startsWith('cc_pdf_math') && 
            !item.id.startsWith('cc_pdf_sst') && 
            !item.id.startsWith('cc_pdf_hin') && 
            !item.id.startsWith('cc_pdf_san')
          );
        }
      }
    } catch {}
    return [];
  });

  // Real-time listener for crash_course_pdfs
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'crash_course_pdfs'), (snapshot) => {
        const dbItems: CrashCoursePdf[] = [];
        snapshot.forEach((docSnap) => {
          dbItems.push({ id: docSnap.id, ...(docSnap.data() as any) });
        });

        setCrashCoursePdfs((prev) => {
          const map = new Map<string, CrashCoursePdf>();
          defaultCrashCoursePdfs.forEach(item => map.set(item.id, item));
          prev.forEach(item => map.set(item.id, item));
          dbItems.forEach(item => map.set(item.id, item));
          const combined = Array.from(map.values());
          try {
            localStorage.setItem('bseb_crash_course_pdfs_cache', JSON.stringify(combined));
          } catch {}
          return combined;
        });
      }, (err) => {
        console.warn("Crash course snapshot warning:", err?.message || String(err));
      });
      return () => unsub();
    } catch (err: any) {
      console.warn("Crash course listener error:", err?.message || String(err));
    }
  }, []);

  const addCrashCoursePdf = async (pdfData: Omit<CrashCoursePdf, 'id'>): Promise<string> => {
    const id = 'cc_pdf_' + Date.now();
    const newPdf: CrashCoursePdf = {
      id,
      ...pdfData,
      uploadedAt: pdfData.uploadedAt || new Date().toISOString()
    };

    setCrashCoursePdfs((prev) => {
      const updated = [newPdf, ...prev];
      try {
        localStorage.setItem('bseb_crash_course_pdfs_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await safeSetDoc(doc(db, 'crash_course_pdfs', id), newPdf, undefined, 3000, true);
    } catch (e: any) {
      console.warn("Firestore crash course pdf save notice:", e?.message || String(e));
    }
    return id;
  };

  const deleteCrashCoursePdf = async (id: string): Promise<void> => {
    setCrashCoursePdfs((prev) => prev.filter((p) => p.id !== id));
    try {
      const updated = crashCoursePdfs.filter((p) => p.id !== id);
      localStorage.setItem('bseb_crash_course_pdfs_cache', JSON.stringify(updated));
    } catch {}

    try {
      await safeDeleteDoc(doc(db, 'crash_course_pdfs', id), 3000, true);
    } catch (e: any) {
      console.warn("Firestore crash course pdf delete notice:", e?.message || String(e));
    }
  };

  const [liveClasses, setLiveClasses] = useState<LiveClass[]>(() => {
    const deletedSet = getDeletedLiveIdsSet();
    const map = new Map<string, LiveClass>();
    defaultLiveClasses.forEach((c) => {
      if (c && c.id && !deletedSet.has(c.id) && !isAiStudioLectureItem(c)) {
        map.set(c.id, normalizeLiveClassItem(c));
      }
    });
    try {
      const cached = localStorage.getItem('bseb_live_classes_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            if (c && c.id && !deletedSet.has(c.id) && !isAiStudioLectureItem(c)) {
              map.set(c.id, normalizeLiveClassItem(c));
            }
          });
        }
      }
    } catch {}
    const cleaned = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    try {
      localStorage.setItem('bseb_live_classes_cache', JSON.stringify(cleaned));
    } catch {}
    return cleaned;
  });

  // Bidirectional sync between browser localStorage cache, Server (/api/sync-live-classes & /api/live-classes), and Firestore
  const syncLiveClassesWithServer = React.useCallback(async () => {
    try {
      const deletedSet = getDeletedLiveIdsSet();
      const deletedIds = Array.from(deletedSet);

      let localCached: LiveClass[] = [];
      try {
        const rawCache = localStorage.getItem('bseb_live_classes_cache');
        if (rawCache) {
          const parsed = JSON.parse(rawCache);
          if (Array.isArray(parsed)) {
            localCached = parsed
              .filter((c) => c && c.id && !deletedSet.has(c.id) && !isAiStudioLectureItem(c))
              .map((c) => normalizeLiveClassItem(c));
          }
        }
      } catch {}

      // Push any locally cached classes (including yesterday/today Admin uploads) to server & receive merged list
      const res = await fetch('/api/sync-live-classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classes: localCached,
          deletedIds
        })
      });

      if (res.ok) {
        const payload = await res.json();
        const serverClasses: LiveClass[] = Array.isArray(payload.live_classes)
          ? payload.live_classes
          : [];

        setLiveClasses((prev) => {
          const map = new Map<string, LiveClass>();
          defaultLiveClasses.forEach((c) => {
            if (c && c.id && !deletedSet.has(c.id) && !isAiStudioLectureItem(c)) {
              map.set(c.id, normalizeLiveClassItem(c));
            }
          });
          prev.forEach((c) => {
            if (c && c.id && !deletedSet.has(c.id) && !isAiStudioLectureItem(c)) {
              map.set(c.id, normalizeLiveClassItem(c));
            }
          });
          localCached.forEach((c) => {
            if (c && c.id && !deletedSet.has(c.id) && !isAiStudioLectureItem(c)) {
              map.set(c.id, normalizeLiveClassItem(c));
            }
          });
          serverClasses.forEach((c) => {
            if (c && c.id && !deletedSet.has(c.id) && !isAiStudioLectureItem(c)) {
              map.set(c.id, normalizeLiveClassItem(c));
            }
          });
          const merged = Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
          );
          try {
            localStorage.setItem('bseb_live_classes_cache', JSON.stringify(merged));
          } catch {}
          return merged;
        });
      }
    } catch {}
  }, []);

  // Run sync on mount, every 12 seconds, and on custom update event
  useEffect(() => {
    syncLiveClassesWithServer();
    const pollTimer = setInterval(() => {
      syncLiveClassesWithServer();
    }, 12000);
    const onCustomSync = () => {
      syncLiveClassesWithServer();
    };
    window.addEventListener('bseb-live-classes-updated', onCustomSync);
    return () => {
      clearInterval(pollTimer);
      window.removeEventListener('bseb-live-classes-updated', onCustomSync);
    };
  }, [syncLiveClassesWithServer]);

  const addLiveClass = async (classData: Omit<LiveClass, 'id'>): Promise<string> => {
    const id = 'live_' + Date.now();
    const nowIso = new Date().toISOString();
    const newClass: LiveClass = normalizeLiveClassItem({
      ...classData,
      id,
      publicationStatus: 'published',
      createdAt: classData.createdAt || nowIso,
      publishedAt: classData.publishedAt || nowIso,
      isUploaded: true
    });

    setLiveClasses((prev) => {
      const filteredPrev = prev.filter((c) => c.id !== id);
      const updated = [newClass, ...filteredPrev].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      try {
        localStorage.setItem('bseb_live_classes_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Save to app_data.json so all students see the YouTube link immediately in the app
    try {
      await fetch('/api/save-live-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClass)
      });
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('bseb-live-classes-updated'));
    }
    return id;
  };

  const updateLiveClass = async (id: string, updates: Partial<LiveClass>): Promise<void> => {
    let mergedItem: LiveClass | null = null;
    const cleanUpdates: Record<string, any> = {};
    for (const [k, v] of Object.entries(updates)) {
      if (v !== undefined) cleanUpdates[k] = v;
    }

    setLiveClasses((prev) => {
      const updated = prev.map((c) => {
        if (c.id === id) {
          mergedItem = normalizeLiveClassItem({ ...c, ...cleanUpdates });
          return mergedItem;
        }
        return c;
      });
      try {
        localStorage.setItem('bseb_live_classes_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (mergedItem) {
      try {
        await fetch('/api/save-live-class', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergedItem)
        });
      } catch {}
    }
  };

  const deleteLiveClass = async (id: string): Promise<void> => {
    try {
      const rawDel = localStorage.getItem('bseb_deleted_live_ids');
      const parsedDel: string[] = rawDel ? JSON.parse(rawDel) : [];
      if (!parsedDel.includes(id)) {
        parsedDel.push(id);
        localStorage.setItem('bseb_deleted_live_ids', JSON.stringify(parsedDel));
      }
    } catch {}

    setLiveClasses((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      try {
        localStorage.setItem('bseb_live_classes_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    try {
      await fetch('/api/delete-live-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
    } catch {}
  };

  const [dailyQuizzes, setDailyQuizzes] = useState<DailyQuizItem[]>(defaultDailyQuizzes);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(defaultLeaderboard);
  const [routine, setRoutine] = useState<RoutineItem[]>(defaultRoutine);
  const [motivationalQuotes, setMotivationalQuotes] = useState<MotivationalQuote[]>(defaultQuotes);
  const [notifications, setNotifications] = useState<NotificationItem[]>(defaultNotifications);
  const [appConfig, setAppConfig] = useState<AppConfig>(() => {
    try {
      const cached = localStorage.getItem('bseb_app_config_cache');
      if (cached) {
        return { ...defaultAppConfig, ...JSON.parse(cached) };
      }
    } catch {}
    return defaultAppConfig;
  });

  // Zero Firebase reads/writes: payment config uses local default (9241511070@fam) and localStorage cache

  const addDailyQuiz = async (quizData: Omit<DailyQuizItem, 'id'>): Promise<string> => {
    const id = 'quiz_' + Date.now();
    const newQuiz: DailyQuizItem = { id, ...quizData };
    setDailyQuizzes(prev => [newQuiz, ...prev]);
    return id;
  };

  const deleteDailyQuiz = async (id: string) => {
    setDailyQuizzes(prev => prev.filter(q => q.id !== id));
  };

  const addLeaderboardScore = async (entry: Omit<LeaderboardEntry, 'id'>) => {
    const id = 'lb_' + Date.now();
    const newEntry: LeaderboardEntry = { id, ...entry, createdAt: new Date().toISOString() };
    setLeaderboard(prev => [newEntry, ...prev]);
    return id;
  };

  const addRoutineItem = async (itemData: Omit<RoutineItem, 'id'>) => {
    const id = 'rt_' + Date.now();
    const newItem: RoutineItem = { id, ...itemData };
    setRoutine(prev => [...prev, newItem]);
    return id;
  };

  const updateRoutineItem = async (id: string, updates: Partial<RoutineItem>) => {
    setRoutine(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRoutineItem = async (id: string) => {
    setRoutine(prev => prev.filter(r => r.id !== id));
  };

  const addQuote = async (quoteData: Omit<MotivationalQuote, 'id'>) => {
    const id = 'qt_' + Date.now();
    const newQ: MotivationalQuote = { id, ...quoteData };
    setMotivationalQuotes(prev => [newQ, ...prev]);
    return id;
  };

  const deleteQuote = async (id: string) => {
    setMotivationalQuotes(prev => prev.filter(q => q.id !== id));
  };

  const toggleQuoteActive = async (id: string, isActive: boolean) => {
    setMotivationalQuotes(prev => prev.map(q => q.id === id ? { ...q, isActive } : q));
  };

  const addNotification = async (notifData: Omit<NotificationItem, 'id'>) => {
    const id = 'notif_' + Date.now();
    const newN: NotificationItem = { id, ...notifData, createdAt: new Date().toISOString() };
    setNotifications(prev => [newN, ...prev]);
    return id;
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const updateSettings = async (newConfig: AppConfig) => {
    setAppConfig(newConfig);
    try {
      localStorage.setItem('bseb_app_config_cache', JSON.stringify(newConfig));
    } catch {}
    try {
      await safeSetDoc(doc(db, 'app_settings', 'payment_config'), {
        upiId: newConfig.upiId,
        whatsappNumber: newConfig.whatsappNumber || '9241511070',
        qrCodeUrl: newConfig.qrCodeDataUrl,
        appLogoUrl: newConfig.appLogoUrl,
        price: newConfig.price1Year || 299,
        price1Year: newConfig.price1Year || 299,
        helplineNumber: newConfig.helplineNumber || '9241511070',
        crashCoursePrice: newConfig.crashCoursePrice || 299,
        crashCourseDiscountCode: (newConfig.crashCourseDiscountCode || 'BSEB100').trim().toUpperCase(),
        crashCourseDiscountAmount: newConfig.crashCourseDiscountAmount !== undefined ? newConfig.crashCourseDiscountAmount : 100
      }, { merge: true }, 5000, true);
    } catch (e: any) {
      console.warn("Firestore payment_config update notice:", e?.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <DataContext.Provider value={{ 
      subjects, 
      paidNotes, 
      pyqs,
      crashCoursePdfs,
      liveClasses,
      dailyQuizzes,
      leaderboard,
      routine,
      motivationalQuotes,
      notifications,
      appConfig,
      loading, 
      refreshData: fetchData,
      addPaidNote,
      deletePaidNote,
      addPyq,
      deletePyq,
      addCrashCoursePdf,
      deleteCrashCoursePdf,
      addLiveClass,
      updateLiveClass,
      deleteLiveClass,
      addDailyQuiz,
      deleteDailyQuiz,
      addLeaderboardScore,
      addRoutineItem,
      updateRoutineItem,
      deleteRoutineItem,
      addQuote,
      deleteQuote,
      toggleQuoteActive,
      addNotification,
      deleteNotification,
      updateSettings
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
