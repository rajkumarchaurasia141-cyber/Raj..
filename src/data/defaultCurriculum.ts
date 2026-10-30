import { Subject } from '../types';
import { hindiChapter1Data } from './hindiChapter1Data';
import { hindiChapter2Data } from './hindiChapter2Data';
import { hindiChapter3Data } from './hindiChapter3Data';
import { hindiChapter4Data } from './hindiChapter4Data';
import { hindiChapter5Data } from './hindiChapter5Data';
import { hindiChapter6Data } from './hindiChapter6Data';
import { hindiChapter7Data } from './hindiChapter7Data';
import { hindiChapter8Data } from './hindiChapter8Data';
import { hindiChapter9Data } from './hindiChapter9Data';
import { hindiChapter10Data } from './hindiChapter10Data';
import { hindiChapter11Data } from './hindiChapter11Data';
import { hindiChapter12Data } from './hindiChapter12Data';
import { sanskritChapter1Data } from './sanskritChapter1Data';
import { 
  sanskritChapter2Data, 
  sanskritChapter3Data, 
  sanskritChapter4Data 
} from './sanskritChapters2to4';
import { 
  sanskritChapter5Data, 
  sanskritChapter6Data, 
  sanskritChapter7Data 
} from './sanskritChapters5to7';
import { 
  sanskritChapter8Data, 
  sanskritChapter9Data, 
  sanskritChapter10Data 
} from './sanskritChapters8to10';
import { 
  sanskritChapter11Data, 
  sanskritChapter12Data, 
  sanskritChapter13Data, 
  sanskritChapter14Data 
} from './sanskritChapters11to14';
import { 
  hindiPadhyaChapter1, 
  hindiPadhyaChapter2, 
  hindiPadhyaChapter3, 
  hindiPadhyaChapter4, 
  hindiPadhyaChapter5, 
  hindiPadhyaChapter6 
} from './hindiPadhyaChapters1to6';
import { 
  hindiPadhyaChapter7, 
  hindiPadhyaChapter8, 
  hindiPadhyaChapter9, 
  hindiPadhyaChapter10, 
  hindiPadhyaChapter11, 
  hindiPadhyaChapter12 
} from './hindiPadhyaChapters7to12';
import {
  hindiVarnikaChapter25,
  hindiVarnikaChapter26,
  hindiVarnikaChapter27,
  hindiVarnikaChapter28,
  hindiVarnikaChapter29
} from './hindiVarnikaChapters1to5';

import { scienceChapter1Data } from './scienceChapter1Data';
import { 
  scienceChapter2Data, 
  scienceChapter3Data, 
  scienceChapter4Data, 
  scienceChapter5Data 
} from './scienceChapters2to5';
import { 
  scienceChapter6Data, 
  scienceChapter7Data, 
  scienceChapter8Data, 
  scienceChapter9Data 
} from './scienceChapters6to9';
import { 
  scienceChapter10Data, 
  scienceChapter11Data, 
  scienceChapter12Data, 
  scienceChapter13Data 
} from './scienceChapters10to13';
import { 
  scienceChapter14Data, 
  scienceChapter15Data, 
  scienceChapter16Data 
} from './scienceChapters14to16';
import { historyChapter1Data } from './historyChapter1Data';
import { historyChapter2Data } from './historyChapter2Data';
import { historyChapter3Data } from './historyChapter3Data';
import { historyChapter4Data } from './historyChapter4Data';
import { historyChapter5Data } from './historyChapter5Data';
import { historyChapter6Data } from './historyChapter6Data';
import { historyChapter7Data } from './historyChapter7Data';
import { historyChapter8Data } from './historyChapter8Data';
import { polScienceChapter1Data } from './polScienceChapter1Data';
import { polScienceChapter2Data } from './polScienceChapter2Data';
import { polScienceChapter3Data } from './polScienceChapter3Data';
import { polScienceChapter4Data } from './polScienceChapter4Data';
import { polScienceChapter5Data } from './polScienceChapter5Data';
import { geographyChapter1Data } from './geographyChapter1Data';
import { geographyChapter2Data } from './geographyChapter2Data';
import { geographyChapter3Data } from './geographyChapter3Data';
import { geographyChapter4Data } from './geographyChapter4Data';
import { geographyChapter5Data } from './geographyChapter5Data';
import { geographyChapter6Data } from './geographyChapter6Data';
import { economicsChapter1Data } from './economicsChapter1Data';
import { economicsChapter2Data } from './economicsChapter2Data';
import { economicsChapter3Data } from './economicsChapter3Data';
import { economicsChapter4Data } from './economicsChapter4Data';
import { economicsChapter5Data } from './economicsChapter5Data';
import { economicsChapter6Data } from './economicsChapter6Data';
import { economicsChapter7Data } from './economicsChapter7Data';
import { mathChapter1Data } from './mathChapter1Data';
import { 
  mathChapter2Data, 
  mathChapter3Data, 
  mathChapter4Data, 
  mathChapter5Data 
} from './mathChapters2to5';
import { 
  mathChapter6Data, 
  mathChapter7Data, 
  mathChapter8Data, 
  mathChapter9Data 
} from './mathChapters6to9';
import { 
  mathChapter10Data, 
  mathChapter11Data, 
  mathChapter12Data, 
  mathChapter13Data, 
  mathChapter14Data, 
  mathChapter15Data 
} from './mathChapters10to15';

export const defaultSubjectsData: Record<string, Subject> = {
  economics: {
    id: 'economics',
    subject_name: 'Economics (Our Economy Part-2)',
    subject_name_hindi: 'अर्थशास्त्र (हमारी अर्थव्यवस्था भाग-2)',
    chapters: [
      economicsChapter1Data,
      economicsChapter2Data,
      economicsChapter3Data,
      economicsChapter4Data,
      economicsChapter5Data,
      economicsChapter6Data,
      economicsChapter7Data
    ]
  },
  arthashastra: {
    id: 'arthashastra',
    subject_name: 'Economics (Our Economy Part-2)',
    subject_name_hindi: 'अर्थशास्त्र (हमारी अर्थव्यवस्था भाग-2)',
    chapters: [
      economicsChapter1Data,
      economicsChapter2Data,
      economicsChapter3Data,
      economicsChapter4Data,
      economicsChapter5Data,
      economicsChapter6Data,
      economicsChapter7Data
    ]
  },
  geography: {
    id: 'geography',
    subject_name: 'Geography (India: Resources and Utilization)',
    subject_name_hindi: 'भूगोल (भारत : संसाधन एवं उपयोग भाग-2)',
    chapters: [
      geographyChapter1Data,
      geographyChapter2Data,
      geographyChapter3Data,
      geographyChapter4Data,
      geographyChapter5Data,
      geographyChapter6Data
    ]
  },
  bhugol: {
    id: 'bhugol',
    subject_name: 'Geography (India: Resources and Utilization)',
    subject_name_hindi: 'भूगोल (भारत : संसाधन एवं उपयोग भाग-2)',
    chapters: [
      geographyChapter1Data,
      geographyChapter2Data,
      geographyChapter3Data,
      geographyChapter4Data,
      geographyChapter5Data,
      geographyChapter6Data
    ]
  },
  political_science: {
    id: 'political_science',
    subject_name: 'Political Science (Democratic Politics - II)',
    subject_name_hindi: 'राजनीति शास्त्र (लोकतांत्रिक राजनीति भाग-2)',
    chapters: [
      polScienceChapter1Data,
      polScienceChapter2Data,
      polScienceChapter3Data,
      polScienceChapter4Data,
      polScienceChapter5Data
    ]
  },
  polscience: {
    id: 'polscience',
    subject_name: 'Political Science (Democratic Politics - II)',
    subject_name_hindi: 'राजनीति शास्त्र (लोकतांत्रिक राजनीति भाग-2)',
    chapters: [
      polScienceChapter1Data,
      polScienceChapter2Data,
      polScienceChapter3Data,
      polScienceChapter4Data,
      polScienceChapter5Data
    ]
  },
  civics: {
    id: 'civics',
    subject_name: 'Civics / Political Science',
    subject_name_hindi: 'राजनीति शास्त्र (लोकतांत्रिक राजनीति भाग-2)',
    chapters: [
      polScienceChapter1Data,
      polScienceChapter2Data,
      polScienceChapter3Data,
      polScienceChapter4Data,
      polScienceChapter5Data
    ]
  },
  history: {
    id: 'history',
    subject_name: 'History (Social Science)',
    subject_name_hindi: 'इतिहास (इतिहास की दुनिया भाग-2)',
    chapters: [
      historyChapter1Data,
      historyChapter2Data,
      historyChapter3Data,
      historyChapter4Data,
      historyChapter5Data,
      historyChapter6Data,
      historyChapter7Data,
      historyChapter8Data
    ]
  },
  sanskrit: {
    id: 'sanskrit',
    subject_name: 'Sanskrit',
    subject_name_hindi: 'संस्कृत (पीयूषम् भाग-2)',
    chapters: [
      sanskritChapter1Data,
      sanskritChapter2Data,
      sanskritChapter3Data,
      sanskritChapter4Data,
      sanskritChapter5Data,
      sanskritChapter6Data,
      sanskritChapter7Data,
      sanskritChapter8Data,
      sanskritChapter9Data,
      sanskritChapter10Data,
      sanskritChapter11Data,
      sanskritChapter12Data,
      sanskritChapter13Data,
      sanskritChapter14Data
    ]
  },
  science: {
    id: 'science',
    subject_name: 'Science',
    subject_name_hindi: 'विज्ञान (भौतिकी, रसायन, जीवविज्ञान)',
    chapters: [
      scienceChapter1Data,
      scienceChapter2Data,
      scienceChapter3Data,
      scienceChapter4Data,
      scienceChapter5Data,
      scienceChapter6Data,
      scienceChapter7Data,
      scienceChapter8Data,
      scienceChapter9Data,
      scienceChapter10Data,
      scienceChapter11Data,
      scienceChapter12Data,
      scienceChapter13Data,
      scienceChapter14Data,
      scienceChapter15Data,
      scienceChapter16Data
    ]
  },
  hindi: {
    id: 'hindi',
    subject_name: 'Hindi (Complete 29 Chapters)',
    subject_name_hindi: 'हिन्दी (गोधूलि एवं वर्णिका - संपूर्ण 29 अध्याय)',
    chapters: [
      hindiChapter1Data, hindiChapter2Data, hindiChapter3Data, hindiChapter4Data, 
      hindiChapter5Data, hindiChapter6Data, hindiChapter7Data, hindiChapter8Data, 
      hindiChapter9Data, hindiChapter10Data, hindiChapter11Data, hindiChapter12Data,
      hindiPadhyaChapter1, hindiPadhyaChapter2, hindiPadhyaChapter3, hindiPadhyaChapter4, 
      hindiPadhyaChapter5, hindiPadhyaChapter6, hindiPadhyaChapter7, hindiPadhyaChapter8, 
      hindiPadhyaChapter9, hindiPadhyaChapter10, hindiPadhyaChapter11, hindiPadhyaChapter12,
      hindiVarnikaChapter25, hindiVarnikaChapter26, hindiVarnikaChapter27, hindiVarnikaChapter28, hindiVarnikaChapter29
    ]
  },
  math: {
    id: 'math',
    subject_name: 'Mathematics',
    subject_name_hindi: 'गणित (Maths - सम्पूर्ण 15 अध्याय)',
    chapters: [
      mathChapter1Data,
      mathChapter2Data,
      mathChapter3Data,
      mathChapter4Data,
      mathChapter5Data,
      mathChapter6Data,
      mathChapter7Data,
      mathChapter8Data,
      mathChapter9Data,
      mathChapter10Data,
      mathChapter11Data,
      mathChapter12Data,
      mathChapter13Data,
      mathChapter14Data,
      mathChapter15Data
    ]
  },
  mathematics: {
    id: 'mathematics',
    subject_name: 'Mathematics',
    subject_name_hindi: 'गणित (Maths - सम्पूर्ण 15 अध्याय)',
    chapters: [
      mathChapter1Data,
      mathChapter2Data,
      mathChapter3Data,
      mathChapter4Data,
      mathChapter5Data,
      mathChapter6Data,
      mathChapter7Data,
      mathChapter8Data,
      mathChapter9Data,
      mathChapter10Data,
      mathChapter11Data,
      mathChapter12Data,
      mathChapter13Data,
      mathChapter14Data,
      mathChapter15Data
    ]
  }
};
