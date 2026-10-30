export interface MCQItem {
  id?: string;
  question: string;
  options: string[];
  correct_answer?: number; // index 0-3
  correctIndex?: number;
  explanation?: string;
}

export interface QAItem {
  id?: string;
  qNumber?: number | string;
  question: string;
  answer: string;
  type?: string;
}

export interface Chapter {
  id?: string;
  chapter_no: number;
  chapter_name: string;
  chapter_name_hindi: string;
  author_name?: string;
  author_intro?: string;
  section_name?: string;
  subCategory?: string;
  intro_hindi?: string; // पाठ परिचय
  intro_hidden?: boolean;
  notes_hindi: string; // विस्तृत नोट्स एवं व्याख्या
  topper_tips?: string; // VVI टॉपर टिप्स
  mcq: MCQItem[];
  subjective_qa?: QAItem[];
  isVIP?: boolean;
}

export interface Subject {
  id: string;
  subject_name: string;
  subject_name_hindi: string;
  name?: string;
  hindi?: string;
  subtitle?: string;
  icon?: string;
  chapters: Chapter[];
}

export interface PaidPdfNote {
  id: string;
  subjectId: string;
  subjectName: string;
  chapterNo?: number;
  chapterName?: string;
  title: string;
  description?: string;
  pdfUrl: string;
  totalPages?: number;
  fileSize?: string;
  isPaid?: boolean;
  isVip?: boolean;
  uploadedAt?: string;
  isGuessPaper?: boolean;
}

export type VideoSourceType = 'youtube' | 'video_file' | 'hls_stream' | 'ai_board' | 'embed';
export type VideoContentType = 'live' | 'recorded' | 'short' | 'crash_course';
export type VideoPublicationStatus = 'published' | 'draft' | 'pending_approval' | 'rejected' | 'unpublished';
export type LiveStreamStatus = 'offline' | 'scheduled' | 'live' | 'ended';
export type VideoCategoryTab =
  | 'All'
  | 'Live'
  | 'Classes'
  | 'Crash Course'
  | 'Shorts'
  | 'Recently Added'
  | 'Complete Courses'
  | 'Chapter-wise Lectures'
  | 'Objective & Subjective'
  | 'Previous-Year Questions'
  | 'Model Paper Solutions'
  | 'Revision Classes'
  | 'Exam Preparation';

export type LibraryCategoryType =
  | 'Complete Courses'
  | 'Chapter-wise Lectures'
  | 'Objective & Subjective'
  | 'Previous-Year Questions'
  | 'Model Paper Solutions'
  | 'Revision Classes'
  | 'Exam Preparation';

export interface LiveClass {
  id: string;
  title: string;
  youtubeUrl: string;
  playbackUrl?: string; // Direct MP4/WebM URL, HLS .m3u8 URL, or YouTube URL
  thumbnailUrl?: string; // Custom or generated 16:9 thumbnail URL
  videoSourceType?: VideoSourceType;
  contentType?: VideoContentType;
  category?: string; // 'Live' | 'Classes' | 'Crash Course' | 'Shorts'
  libraryCategory?: LibraryCategoryType; // Structured Bihar Board Class 10 library category
  subjectName: string;
  chapterName?: string; // Chapter title for chapter-wise organization
  playlistId?: string;
  youtubePlaylistId?: string; // Official YouTube Playlist ID (e.g. PL...)
  isPlaylist?: boolean;
  teacherName: string;
  teacherAvatar?: string;
  scheduledAt: string;
  isLive: boolean;
  isVip?: boolean;
  description?: string;
  createdAt?: string;
  publishedAt?: string;
  createdBy?: string;
  publishType?: 'instant' | 'scheduled';
  scheduledDateTime?: string; // ISO string e.g. "2026-10-02T19:00:00"
  isUploaded?: boolean;
  language?: string;
  duration?: string; // e.g. "45:20"
  durationSeconds?: number;
  publicationStatus?: VideoPublicationStatus;
  streamStatus?: LiveStreamStatus;
  featured?: boolean;
  displayOrder?: number;
  viewsCount?: number;
  likesCount?: number;
  captionsUrl?: string; // WebVTT (.vtt) subtitle track URL
}

export interface UserVideoInteraction {
  videoId: string;
  userId: string;
  liked?: boolean;
  saved?: boolean;
  watchProgressSeconds?: number;
  durationSeconds?: number;
  completed?: boolean;
  lastWatchedAt?: string;
}


export interface DailyQuizItem {
  id: string;
  dateLabel?: string; // e.g. "19 सितम्बर"
  subjectName?: string; // e.g. "संस्कृत"
  subject?: string;
  title: string; // e.g. "संस्कृत - मङ्गलम् टेस्ट"
  chaptersCount?: number;
  totalQuestions?: number;
  durationMinutes?: number;
  questions?: any[];
  youtubeUrl?: string;
  description?: string;
  createdAt?: string;
}

export interface LeaderboardEntry {
  id: string;
  studentName: string;
  district: string;
  score: number;
  totalMarks: number;
  testName: string;
  subjectName: string;
  avatarColor?: string;
  createdAt: string;
  isVip?: boolean;
}

export interface RoutineItem {
  id: string;
  time: string;
  subject: string;
  topic?: string;
  title?: string;
  instructor?: string;
  days?: string;
  color?: string;
  isCompleted?: boolean;
}

export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  isActive: boolean;
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  isNew: boolean;
  actionType?: 'live' | 'vip' | 'courses' | 'none';
  createdAt: string;
}

export interface BannerItem {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  features: string[];
  subjects: string[];
  oldPrice: string;
  newPrice: string;
  priceLabel?: string;
  actionText?: string;
  actionSub?: string;
  buttonText?: string;
  bgGradient?: string;
  gradient?: string;
  badgeColor?: string;
  badgeText?: string;
}

export interface AppConfig {
  helplineNumber: string;
  whatsappNumber?: string;
  upiId: string;
  qrCodeDataUrl?: string;
  youtubeUrl: string;
  instagramUrl: string;
  whatsappGroupUrl: string;
  telegramUrl: string;
  price1Month: number;
  price1Year: number;
  banners?: BannerItem[];
  adminEmails?: string[];
  apkUrl?: string;
  aabUrl?: string;
  appLogoUrl?: string;
  crashCoursePrice?: number;
  crashCourseDiscountCode?: string;
  crashCourseDiscountAmount?: number;
}

export interface LiveWatchRecord {
  id: string; // `${classId}_${studentId}`
  classId: string;
  classTitle: string;
  isLive: boolean;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  isPaid: boolean;
  joinedAt: string; // ISO string
  lastHeartbeat: number; // timestamp in ms
  watchSeconds: number; // total watch time in seconds
  isOnline: boolean; // whether active right now
}

export interface BatchStudent {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isPaid: boolean;
  registeredAt?: string;
}

export interface PyqItem {
  id: string;
  year: string; // e.g. "2025", "2024", "2023"
  subjectName: string; // e.g. "गणित (Maths)"
  title: string; // e.g. "BSEB 10th गणित 2025 वार्षिक परीक्षा प्रश्न पत्र"
  pdfUrl: string;
  isVip?: boolean;
  downloadsCount?: number;
  uploadedAt?: string;
}

export interface CrashCoursePdf {
  id: string;
  subjectId: string;
  subjectName: string;
  chapterNo: number;
  chapterName: string;
  title: string;
  pdfUrl: string;
  totalPages?: number;
  fileSize?: string;
  uploadedAt: string;
  isVip?: boolean;
}

export interface CrashCoursePaymentRequestItem {
  id: string;
  userId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  amount: number;
  originalPrice?: number;
  discountAmount?: number;
  discountCode?: string;
  screenshotDataUrl: string;
  utr?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
}



