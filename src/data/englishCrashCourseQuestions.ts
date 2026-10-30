import { CrashTestQuestion } from './crashCourseTestsData';

export interface EnglishChapterMeta {
  no: number;
  name: string;
  category: 'prose' | 'poetry' | 'reader' | 'grammar';
  branch: string;
  authorOrPoet: string;
  topics: string;
  questionCount: number;
}

export const ENGLISH_ALL_CHAPTERS_LIST: EnglishChapterMeta[] = [
  // Prose (8 Chapters)
  {
    no: 1,
    name: 'The Pace for Living',
    category: 'prose',
    branch: 'Panorama Prose',
    authorOrPoet: 'R.C. Hutchinson',
    topics: 'Corn-merchant of Dublin, modern fast life, cinema scene, slow thinkers',
    questionCount: 30
  },
  {
    no: 2,
    name: 'Me and the Ecology Bit',
    category: 'prose',
    branch: 'Panorama Prose',
    authorOrPoet: 'John Lexau',
    topics: 'Jim and his ecology campaign, Mr. Johnson, Ms. Greene, composting, pollution',
    questionCount: 30
  },
  {
    no: 3,
    name: 'Gillu',
    category: 'prose',
    branch: 'Panorama Prose',
    authorOrPoet: 'Mahadevi Varma',
    topics: 'Tiny baby squirrel, Sonjuhi creeper, kaju favourite food, squirrel lifespan',
    questionCount: 30
  },
  {
    no: 4,
    name: 'What is Wrong with Indian Films',
    category: 'prose',
    branch: 'Panorama Prose',
    authorOrPoet: 'Satyajit Ray',
    topics: 'Indian cinema vs Hollywood, visual language, music and melodrama, Ray’s perspective',
    questionCount: 30
  },
  {
    no: 5,
    name: 'Acceptance Speech',
    category: 'prose',
    branch: 'Panorama Prose',
    authorOrPoet: 'Aung San Suu Kyi (Alexander Aris)',
    topics: 'Nobel Peace Prize 1991, struggle for democracy in Myanmar (Burma), peace speech',
    questionCount: 30
  },
  {
    no: 6,
    name: 'Once Upon a Time',
    category: 'prose',
    branch: 'Panorama Prose',
    authorOrPoet: 'Toni Morrison',
    topics: 'Wise blind old woman, bird in hand parable, power and responsibility of language',
    questionCount: 30
  },
  {
    no: 7,
    name: 'The Unity of Indian Culture',
    category: 'prose',
    branch: 'Panorama Prose',
    authorOrPoet: 'Humayun Kabir',
    topics: 'Culture vs civilization, diversity and underlying unity, invader assimilation',
    questionCount: 30
  },
  {
    no: 8,
    name: 'Little Girls Wiser Than Men',
    category: 'prose',
    branch: 'Panorama Prose',
    authorOrPoet: 'Leo Tolstoy',
    topics: 'Akoulya and Malasha, Easter festival puddle water fight, adult quarrel resolved by children',
    questionCount: 30
  },

  // Poetry (8 Chapters)
  {
    no: 9,
    name: 'God Made the Country',
    category: 'poetry',
    branch: 'Panorama Poetry',
    authorOrPoet: 'William Cowper',
    topics: 'Country vs town life, virtue and health in village nature, songbirds vs music halls',
    questionCount: 30
  },
  {
    no: 10,
    name: 'Ode on Solitude',
    category: 'poetry',
    branch: 'Panorama Poetry',
    authorOrPoet: 'Alexander Pope',
    topics: 'Contented peaceful rural life, paternal acres, self-sufficiency, unlamented quiet death',
    questionCount: 30
  },
  {
    no: 11,
    name: 'Polythene Bag',
    category: 'poetry',
    branch: 'Panorama Poetry',
    authorOrPoet: 'Durga Prasad Panda',
    topics: 'Non-biodegradable polythene bag, pungent smell on warmth, grief buried in heart',
    questionCount: 30
  },
  {
    no: 12,
    name: 'Thinner Than a Crescent',
    category: 'poetry',
    branch: 'Panorama Poetry',
    authorOrPoet: 'Vidyapati',
    topics: 'Radha sorrow in separation from Lord Krishna, wasting away thinner than moon crescent',
    questionCount: 30
  },
  {
    no: 13,
    name: 'The Empty Heart',
    category: 'poetry',
    branch: 'Panorama Poetry',
    authorOrPoet: 'Periasamy Thooran',
    topics: 'Greedy man, Kalpataru wish-tree, seven pitchers of gold, endless lust for eighth pot',
    questionCount: 30
  },
  {
    no: 14,
    name: 'Koel',
    category: 'poetry',
    branch: 'Panorama Poetry',
    authorOrPoet: 'Puran Singh',
    topics: 'Black bird in green mango grove, flaming fiery songs, longing for beloved in summer heat',
    questionCount: 30
  },
  {
    no: 15,
    name: 'The Sleeping Porter',
    category: 'poetry',
    branch: 'Panorama Poetry',
    authorOrPoet: 'Laxmi Prasad Devkota',
    topics: 'Heavy 25-kilo load on back, snow mountain cliff climbing, sweated body, sweet peaceful sleep',
    questionCount: 30
  },
  {
    no: 16,
    name: 'Martha',
    category: 'poetry',
    branch: 'Panorama Poetry',
    authorOrPoet: 'Walter de la Mare',
    topics: 'Storyteller Martha, clear grey-hazel eyes, fairy tales in green hazel glen',
    questionCount: 30
  },

  // Supplementary Reader (6 Chapters)
  {
    no: 17,
    name: 'January Night (पूस की रात)',
    category: 'reader',
    branch: 'Panorama Reader',
    authorOrPoet: 'Premchand',
    topics: 'Halku, Munni, dog Jabra, landlord Sahna debt, freezing winter night, burning wild leaves',
    questionCount: 30
  },
  {
    no: 18,
    name: 'Two Horizons',
    category: 'reader',
    branch: 'Panorama Reader',
    authorOrPoet: 'Binapani Mohanty',
    topics: 'Mother-daughter letters, domestic life, tears, womanhood and emotional bond',
    questionCount: 30
  },
  {
    no: 19,
    name: 'Quality',
    category: 'reader',
    branch: 'Panorama Reader',
    authorOrPoet: 'John Galsworthy',
    topics: 'Mr. Gessler bootmakers in London, handmade excellence, starvation vs commercial rivalry',
    questionCount: 30
  },
  {
    no: 20,
    name: 'The Sun and the Moon',
    category: 'reader',
    branch: 'Panorama Reader',
    authorOrPoet: 'Katherine Mansfield',
    topics: 'Children Sun and Moon, grand adult evening party, iced ice-cream pudding, aftermath',
    questionCount: 30
  },
  {
    no: 21,
    name: 'The Bet',
    category: 'reader',
    branch: 'Panorama Reader',
    authorOrPoet: 'Anton Chekhov',
    topics: 'Banker vs young lawyer, 15 years solitary confinement for 2 million rubles, books and wisdom',
    questionCount: 30
  },
  {
    no: 22,
    name: 'Love Defiled',
    category: 'reader',
    branch: 'Panorama Reader',
    authorOrPoet: 'Giridhar Jha',
    topics: 'Narrator and girlfriend, IAS ambitions, social pressures, sacrifice of innocent love',
    questionCount: 30
  },

  // English Grammar (6 Chapters)
  {
    no: 23,
    name: 'Tense, Time & Correct Forms of Verbs',
    category: 'grammar',
    branch: 'English Grammar',
    authorOrPoet: 'BSEB Board Special',
    topics: 'Simple Present, Past Indefinite, Present Perfect, Continuous, conditional sentences',
    questionCount: 30
  },
  {
    no: 24,
    name: 'Voice: Active & Passive Voice Transformation',
    category: 'grammar',
    branch: 'English Grammar',
    authorOrPoet: 'BSEB Board Special',
    topics: 'Object to subject rule, V3 past participle, by-agent, interrogative & imperative passive',
    questionCount: 30
  },
  {
    no: 25,
    name: 'Narration: Direct & Indirect Speech',
    category: 'grammar',
    branch: 'English Grammar',
    authorOrPoet: 'BSEB Board Special',
    topics: 'Said to -> told, tense backshift, pronoun changes (SON rule), universal truths unchanged',
    questionCount: 30
  },
  {
    no: 26,
    name: 'Prepositions & Articles (A, An, The)',
    category: 'grammar',
    branch: 'English Grammar',
    authorOrPoet: 'BSEB Board Special',
    topics: 'A/An/The correct usage, in/at/on/into/between/among/of/for/since prepositions',
    questionCount: 30
  },
  {
    no: 27,
    name: 'Subject-Verb Concord & Modal Auxiliaries',
    category: 'grammar',
    branch: 'English Grammar',
    authorOrPoet: 'BSEB Board Special',
    topics: 'Singular-plural verb agreement, each/every, either/or, can/could/may/might/must/should',
    questionCount: 30
  },
  {
    no: 28,
    name: 'Spelling Test, Synonyms, Antonyms & Translation',
    category: 'grammar',
    branch: 'English Grammar',
    authorOrPoet: 'BSEB Board Special',
    topics: 'Correct spelling detection, opposites, similar meaning words, Hindi to English board translation',
    questionCount: 30
  }
];

export const ENGLISH_CHAPTER_QUESTION_BANKS: Record<number, CrashTestQuestion[]> = {
  // Ch 1: The Pace for Living
  1: [
    {
      id: 1,
      question: "Who is the author of 'The Pace for Living'?",
      options: ["R.C. Hutchinson", "Satyajit Ray", "Toni Morrison", "Leo Tolstoy"],
      correctAnswer: 0,
      explanation: "'The Pace for Living' is written by British novelist R.C. Hutchinson."
    },
    {
      id: 2,
      question: "The chief character in the play watched by Hutchinson was an elderly ______.",
      options: ["Corn-merchant", "Shoemaker", "Lawyer", "Blacksmith"],
      correctAnswer: 0,
      explanation: "The chief character was an elderly corn-merchant in a small Irish country town (Dublin)."
    },
    {
      id: 3,
      question: "Where did the elderly corn-merchant live?",
      options: ["In a small Irish country town", "In London", "In New York", "In Paris"],
      correctAnswer: 0,
      explanation: "He lived in a small Irish country town, full of anxieties."
    },
    {
      id: 4,
      question: "How much money was the corn-merchant's nephew cheating him of?",
      options: ["£10 at a time", "£50 at a time", "£100 at a time", "£5 at a time"],
      correctAnswer: 0,
      explanation: "His nephew was cheating him to the tune of £10 at a time."
    },
    {
      id: 5,
      question: "The corn-merchant's wife had a fantastic notion of spending £10 on a ______.",
      options: ["Holiday", "Dress", "Car", "Jewel"],
      correctAnswer: 0,
      explanation: "She had the fantastic notion of spending £10 on a holiday."
    },
    {
      id: 6,
      question: "The aeroplane flying at ______ miles an hour gives Hutchinson a thrilling joy of rapid motion.",
      options: ["1000", "500", "2000", "100"],
      correctAnswer: 0,
      explanation: "The author says flying at 1000 miles an hour is exciting when traveling."
    },
    {
      id: 7,
      question: "The author R.C. Hutchinson belongs to the tribe of ______ thinkers.",
      options: ["Slow", "Fast", "Super-fast", "Intelligent"],
      correctAnswer: 0,
      explanation: "The author openly admits he belongs to the tribe of 'slow thinkers'."
    },
    {
      id: 8,
      question: "How many girls were in the film described by the author in the cinema?",
      options: ["Three girls (a tall brunette, a fair girl, and a medium brunette)", "Two girls", "Four girls", "One girl"],
      correctAnswer: 0,
      explanation: "There were three girls: A, B, and C, whom the author could barely distinguish without his wife."
    },
    {
      id: 9,
      question: "Who helped the author understand the characters in the cinema?",
      options: ["His wife", "His son", "The corn-merchant", "The manager"],
      correctAnswer: 0,
      explanation: "His wife whispered to him explaining which girl had entered the scene."
    },
    {
      id: 10,
      question: "Modern life has made the pace of living ______.",
      options: ["Too fast and stressful", "Slow and peaceful", "Very simple", "Unchanged"],
      correctAnswer: 0,
      explanation: "Modern rapid lifestyle puts unbearable pressure and strain on ordinary human minds."
    },
    {
      id: 11,
      question: "People who think slowly are handicapped in getting their ______.",
      options: ["Living (livelihood)", "Sleep", "Food", "Degree"],
      correctAnswer: 0,
      explanation: "Slow thinkers are handicapped in modern business and earning a livelihood."
    },
    {
      id: 12,
      question: "Which word in the text means 'mental pressure' or 'worry'?",
      options: ["Anxiety", "Enlightenment", "Sloth", "Delight"],
      correctAnswer: 0,
      explanation: "'Anxiety' means intense worry or nervousness."
    },
    {
      id: 13,
      question: "The corn-merchant's heart was ______.",
      options: ["Dicky (weak)", "Strong", "Hard", "Cruel"],
      correctAnswer: 0,
      explanation: "The author says the corn-merchant had a 'dicky heart'."
    },
    {
      id: 14,
      question: "What does the essay 'The Pace for Living' primarily discuss?",
      options: ["The agony and speed of modern life", "The beauty of Ireland", "The benefits of aeroplanes", "The life of merchants"],
      correctAnswer: 0,
      explanation: "It captures the agony of modern man caught in the fast-paced life of our times."
    },
    {
      id: 15,
      question: "Slow thinkers may fail in practical life, but they enjoy the ______ of thinking.",
      options: ["Pleasure", "Wealth", "Speed", "Fame"],
      correctAnswer: 0,
      explanation: "They can still enjoy the deep, leisurely philosophical pleasure of thinking."
    },
    {
      id: 16,
      question: "R.C. Hutchinson says that he loves to drive a car at ______ miles an hour.",
      options: ["90", "50", "60", "120"],
      correctAnswer: 0,
      explanation: "He enjoys driving at 90 miles an hour so long as he is driving and not paying for damages."
    },
    {
      id: 17,
      question: "The corn-merchant was full of anxieties because of ______.",
      options: ["Financial difficulties and unfaithful relatives", "Old age only", "Illness only", "The weather"],
      correctAnswer: 0,
      explanation: "His nephew cheated him and his wife spent money lavishly."
    },
    {
      id: 18,
      question: "In the cinema, the hero fell in love with girl ______.",
      options: ["B, C, and then A", "A only", "B only", "None of them"],
      correctAnswer: 0,
      explanation: "The hero loved all three girls in succession."
    },
    {
      id: 19,
      question: "Intelligence tests today are designed to measure the ______ of mind.",
      options: ["Speed", "Depth", "Morality", "Honesty"],
      correctAnswer: 0,
      explanation: "Modern intelligence tests measure mental speed rather than deep contemplation."
    },
    {
      id: 20,
      question: "The author observed the play in which city?",
      options: ["Dublin", "London", "Belfast", "Cork"],
      correctAnswer: 0,
      explanation: "He saw the play staged in Dublin, Ireland."
    },
    {
      id: 21,
      question: "The rapid movement of aeroplanes prevents us from enjoying the real travel's ______.",
      options: ["Fun and local observation", "Ticket price", "Time saving", "Food"],
      correctAnswer: 0,
      explanation: "Fast travel deprives us of the personal touch and observation of local landscapes."
    },
    {
      id: 22,
      question: "Which of the following is antonym of 'fast'?",
      options: ["Slow", "Rapid", "Quick", "Swift"],
      correctAnswer: 0,
      explanation: "Antonym of fast is slow."
    },
    {
      id: 23,
      question: "The corn-merchant felt that the pace of living was ______.",
      options: ["Too fast for him", "Very suitable", "Too slow", "Enjoyable"],
      correctAnswer: 0,
      explanation: "The pace of life was way too fast for the elderly merchant."
    },
    {
      id: 24,
      question: "The word 'prejudice' in the chapter means ______.",
      options: ["Bias / preconceived opinion", "Justice", "Love", "Respect"],
      correctAnswer: 0,
      explanation: "'Prejudice' means bias or preconceived opinion without reason."
    },
    {
      id: 25,
      question: "Who was cheating the corn-merchant?",
      options: ["His nephew", "His brother", "His friend", "His servant"],
      correctAnswer: 0,
      explanation: "His nephew was cheating him."
    },
    {
      id: 26,
      question: "The author says that if he takes an intelligence test, he will score ______.",
      options: ["The lowest marks", "The highest marks", "Average marks", "Full marks"],
      correctAnswer: 0,
      explanation: "Being a slow thinker, he expects to score near the bottom."
    },
    {
      id: 27,
      question: "According to the author, rapid movement gives a ______ excitement.",
      options: ["Superficial", "Deep", "Spiritual", "Moral"],
      correctAnswer: 0,
      explanation: "Speed produces a superficial excitement rather than inner spiritual fulfillment."
    },
    {
      id: 28,
      question: "The corn-merchant exclaimed: 'They tell me there's an aeroplane that goes at 1,000 miles an hour. Now that's ______!'",
      options: ["Too fast", "Just right", "Wonderful", "Very slow"],
      correctAnswer: 0,
      explanation: "He cried out: 'Now that's too fast!'"
    },
    {
      id: 29,
      question: "The author believes that modern machinery has made human life ______.",
      options: ["Restless and mechanical", "Calm and peaceful", "Simple", "Lazy"],
      correctAnswer: 0,
      explanation: "Modern speed has made life restless, anxious and mechanical."
    },
    {
      id: 30,
      question: "What lesson does 'The Pace for Living' impart to readers?",
      options: ["Balance speed with mental peace and reflection", "Stop traveling", "Abandon technology", "Avoid business"],
      correctAnswer: 0,
      explanation: "It teaches us to balance the rush of modernity with mindfulness and peaceful thought."
    }
  ],

  // Ch 3: Gillu
  3: [
    {
      id: 1,
      question: "Who is the author of the story 'Gillu'?",
      options: ["Mahadevi Varma", "Premchand", "John Lexau", "Toni Morrison"],
      correctAnswer: 0,
      explanation: "'Gillu' is written by the great Hindi writer Mahadevi Varma."
    },
    {
      id: 2,
      question: "Gillu was a tiny baby ______.",
      options: ["Squirrel", "Parrot", "Mongoose", "Rabbit"],
      correctAnswer: 0,
      explanation: "Gillu was a tiny baby squirrel rescued by Mahadevi Varma."
    },
    {
      id: 3,
      question: "Which creeper did Gillu like to hide in?",
      options: ["Sonjuhi", "Rose", "Jasmine", "Neem"],
      correctAnswer: 0,
      explanation: "He loved playing and resting amidst the green foliage of the Sonjuhi creeper."
    },
    {
      id: 4,
      question: "What was Gillu's favorite food?",
      options: ["Kaju (Cashew nut)", "Almonds", "Rice", "Bread"],
      correctAnswer: 0,
      explanation: "Kaju (cashew) was Gillu's most favourite food; he would skip eating if kaju was missing."
    },
    {
      id: 5,
      question: "What was the normal lifespan of a squirrel according to the author?",
      options: ["Barely two years", "Five years", "One year", "Ten years"],
      correctAnswer: 0,
      explanation: "Squirrels have a lifespan of barely two years."
    },
    {
      id: 6,
      question: "Where was Gillu buried after his death?",
      options: ["Under the Sonjuhi creeper", "In the garden pond", "In a flower pot", "Near the gate"],
      correctAnswer: 0,
      explanation: "He was laid to rest under his favourite Sonjuhi creeper."
    },
    {
      id: 7,
      question: "Who were poking their beaks at the wounded baby squirrel when Mahadevi Varma found him?",
      options: ["Two crows", "Two pigeons", "A cat", "A dog"],
      correctAnswer: 0,
      explanation: "Two crows were mercilessly pecking at the helpless baby squirrel."
    },
    {
      id: 8,
      question: "What first-aid did the author apply on Gillu's wounds?",
      options: ["Penicillin ointment", "Iodine tincture", "Warm oil", "Turmeric paste"],
      correctAnswer: 0,
      explanation: "She washed the blood with cotton and applied penicillin ointment on his wounds."
    },
    {
      id: 9,
      question: "How did the author feed milk to the infant Gillu?",
      options: ["Using a thin cotton wick soaked in milk", "Using a dropper", "Using a spoon", "From a bowl"],
      correctAnswer: 0,
      explanation: "She rolled a thin cotton wick, dipped it in milk, and placed it to his tiny mouth."
    },
    {
      id: 10,
      question: "Where did Gillu swing during the day?",
      options: ["In a small light basket lined with cotton hung on the window", "In a cage", "On a fan", "In a shoe box"],
      correctAnswer: 0,
      explanation: "He swung happily in a small basket lined with cotton hanging by the window."
    },
    {
      id: 11,
      question: "Gillu's eyes were like ______.",
      options: ["Blue glass beads (bright and sparkling)", "Black dots", "Green gems", "Dark pebbles"],
      correctAnswer: 0,
      explanation: "His eyes sparkled like bright blue glass beads."
    },
    {
      id: 12,
      question: "When the author was injured in a car accident and hospitalised, what did Gillu do?",
      options: ["He barely ate and his basket remained full of untouched kaju", "He ran away", "He ate everything", "He fell asleep"],
      correctAnswer: 0,
      explanation: "He grieved her absence and barely touched his favourite kaju."
    },
    {
      id: 13,
      question: "How did Gillu comfort the author when she returned home sick?",
      options: ["He sat near her head and gently stroked her hair with his tiny claws", "He brought food", "He made loud sounds", "He bit her"],
      correctAnswer: 0,
      explanation: "He sat by her pillow and softly stroked her hair like a nurse."
    },
    {
      id: 14,
      question: "In hot summer days, how did Gillu keep himself cool?",
      options: ["By lying flat on the cool surface of the earthen water-pitcher (surahi)", "By taking a bath", "By sitting in front of a fan", "By hiding in mud"],
      correctAnswer: 0,
      explanation: "He clung flat to the cool belly of the surahi (earthen jug) to escape the heat."
    },
    {
      id: 15,
      question: "What sound did Gillu make to express his joy and affection?",
      options: ["Chik-chik", "Mew-mew", "Bow-wow", "Pee-pee"],
      correctAnswer: 0,
      explanation: "He produced a chirpy 'chik-chik' sound to communicate with the author."
    },
    {
      id: 16,
      question: "On his final day, Gillu did not eat anything and his claws grew ______.",
      options: ["Cold as ice", "Very hot", "Sharp", "Swollen"],
      correctAnswer: 0,
      explanation: "As life ebbed away, his paws turned icy cold."
    },
    {
      id: 17,
      question: "When spring arrived, Mahadevi Varma saw a ______ blossom on the Sonjuhi creeper.",
      options: ["Yellow flower", "Red flower", "White flower", "Pink flower"],
      correctAnswer: 0,
      explanation: "She felt Gillu had blossomed again in the form of a tiny yellow Juhi flower."
    },
    {
      id: 18,
      question: "The author untied a corner of the wire-mesh window so that Gillu could ______.",
      options: ["Go outside and play with other squirrels", "Catch insects", "Look at birds", "Drink water"],
      correctAnswer: 0,
      explanation: "She opened a corner of the mesh so Gillu could freely visit nature outside."
    },
    {
      id: 19,
      question: "Mahadevi Varma is renowned in Hindi literature as one of the four pillars of ______.",
      options: ["Chhayavaad (छायावाद)", "Pragativaad", "Prayogvaad", "Bhakti Kaal"],
      correctAnswer: 0,
      explanation: "She is one of the four great pillars of the Chhayavadi era of Hindi literature."
    },
    {
      id: 20,
      question: "Which award did Mahadevi Varma receive for her literary masterpiece 'Yama'?",
      options: ["Jnanpith Award", "Nobel Prize", "Booker Prize", "Pulitzer Prize"],
      correctAnswer: 0,
      explanation: "She was awarded India's highest literary honour, the Jnanpith Award, in 1982."
    },
    {
      id: 21,
      question: "Gillu enjoyed jumping onto the author's ______ while she was writing.",
      options: ["Table, pen, and shoulder", "Head", "Floor", "Sofa"],
      correctAnswer: 0,
      explanation: "He would scamper across the writing table, pens, and perch on her shoulder."
    },
    {
      id: 22,
      question: "To prevent Gillu from disturbing her during work, the author sometimes kept him in a ______.",
      options: ["Long envelope", "Glass jar", "Wooden box", "Drawer"],
      correctAnswer: 0,
      explanation: "She would gently put him inside a long paper envelope with only his head peeping out."
    },
    {
      id: 23,
      question: "Gillu liked to sit inside the envelope for ______.",
      options: ["Hours quietly watching her with sparkling eyes", "A few seconds", "All night", "Angrily"],
      correctAnswer: 0,
      explanation: "He enjoyed resting inside the envelope for hours with delightful calmness."
    },
    {
      id: 24,
      question: "The crows' game of pecking at the squirrel was described by the author as ______.",
      options: ["Kakbhushundi (काकभुशुण्डि) hide-and-seek", "Warfare", "Mock fight", "Hunting"],
      correctAnswer: 0,
      explanation: "She called their mischievous pecking game 'chhuwachhuval' (hide and seek)."
    },
    {
      id: 25,
      question: "Gillu lived with the author for ______.",
      options: ["About two years", "Six months", "Four years", "Ten years"],
      correctAnswer: 0,
      explanation: "He spent about two affectionate years with Mahadevi Varma."
    },
    {
      id: 26,
      question: "What quality of Mahadevi Varma is reflected in 'Gillu'?",
      options: ["Immense love, empathy and compassion for animals", "Strict discipline", "Love for gardening only", "Curiosity"],
      correctAnswer: 0,
      explanation: "Her deep empathy, tenderness, and love for silent creatures shine throughout the story."
    },
    {
      id: 27,
      question: "What did Gillu do when the author sat down to eat?",
      options: ["He sat beside her thali (plate) and ate grain by grain cleanly", "He ran away", "He spilled the food", "He made noise"],
      correctAnswer: 0,
      explanation: "He picked up cooked rice grains neatly from the edge of her plate without spilling."
    },
    {
      id: 28,
      question: "The word 'afflicted' means ______.",
      options: ["Suffering or deeply troubled", "Happy", "Healthy", "Strong"],
      correctAnswer: 0,
      explanation: "'Afflicted' means suffering from pain, illness, or distress."
    },
    {
      id: 29,
      question: "Gillu's tail was ______.",
      options: ["Bushy and beautiful", "Short and hairless", "Cut off", "Heavy"],
      correctAnswer: 0,
      explanation: "He grew a lovely, furry, bushy tail (झाबेदार पूँछ)."
    },
    {
      id: 30,
      question: "The memory of Gillu makes the author feel ______.",
      options: ["Fond affection and bittersweet nostalgia", "Angry", "Fearful", "Indifferent"],
      correctAnswer: 0,
      explanation: "Whenever the Sonjuhi blooms, she remembers Gillu with deep tenderness."
    }
  ],

  // Ch 17: January Night (Premchand)
  17: [
    {
      id: 1,
      question: "Who is the author of the story 'January Night' (पूस की रात)?",
      options: ["Premchand", "Mahadevi Varma", "John Lexau", "R.C. Hutchinson"],
      correctAnswer: 0,
      explanation: "'January Night' is the celebrated story 'पूस की रात' by Munshi Premchand."
    },
    {
      id: 2,
      question: "Who was Halku?",
      options: ["A poor tenant farmer", "A wealthy landlord", "A shopkeeper", "A soldier"],
      correctAnswer: 0,
      explanation: "Halku was an impoverished peasant farmer burdened with debt."
    },
    {
      id: 3,
      question: "What was the name of Halku's wife?",
      options: ["Munni", "Radha", "Shanti", "Gauri"],
      correctAnswer: 0,
      explanation: "Halku's wife was Munni."
    },
    {
      id: 4,
      question: "What was the name of Halku's faithful pet dog?",
      options: ["Jabra", "Sheru", "Tommy", "Moti"],
      correctAnswer: 0,
      explanation: "His devoted canine companion was Jabra."
    },
    {
      id: 5,
      question: "Who was the money-lender/landlord demanding payment from Halku?",
      options: ["Sahna", "Girdhari", "Mangal", "Ramu"],
      correctAnswer: 0,
      explanation: "Sahna came to Halku's door yelling for his dues."
    },
    {
      id: 6,
      question: "How much money had Halku saved to buy a blanket for the winter?",
      options: ["Three rupees", "Ten rupees", "Five rupees", "One rupee"],
      correctAnswer: 0,
      explanation: "Halku had painstakingly saved three rupees (तीन रुपये) to buy a quilt/blanket."
    },
    {
      id: 7,
      question: "What did Munni suggest Halku do with farming?",
      options: ["Give up tenant farming and work as a hired labourer", "Take more loans", "Buy more land", "Go to the city"],
      correctAnswer: 0,
      explanation: "She pleaded that he should quit tenant farming where all harvest goes to pay debts."
    },
    {
      id: 8,
      question: "Where did Halku sleep at night to guard his crops?",
      options: ["On a bamboo cot under a thatch roof in his field", "Inside a brick room", "Under a tree", "In a tent"],
      correctAnswer: 0,
      explanation: "He lay on a cot under a sugarcane-leaf shelter in the chilling field."
    },
    {
      id: 9,
      question: "What animals entered Halku's field and destroyed the entire crop?",
      options: ["A herd of Nilgais (blue bulls)", "Wild boars", "Cows", "Goats"],
      correctAnswer: 0,
      explanation: "A herd of Nilgais (नीलगाय) broke into the field and grazed all crops."
    },
    {
      id: 10,
      question: "How did Halku try to warm himself in the freezing January night?",
      options: ["By gathering dry leaves from an orchard and making a bonfire", "By wearing a thick woolen coat", "By drinking hot tea", "By running"],
      correctAnswer: 0,
      explanation: "He gathered dry leaves from the nearby mango orchard and lit a fire to warm his bones."
    },
    {
      id: 11,
      question: "When the fire died down, what did Halku do instead of chasing the cattle away?",
      options: ["He sat drowsy by the warm ashes and fell fast asleep", "He ran with a stick", "He shouted for help", "He went home"],
      correctAnswer: 0,
      explanation: "Overcome by warmth and exhaustion, he slept soundly, ignoring Jabra's warning barks."
    },
    {
      id: 12,
      question: "Next morning, what did Munni say to Halku when she saw the ruined field?",
      options: ["'Now you will have to hire yourself out to pay the land-rent!'", "'Good job!'", "'Let's sow seeds again!'", "'The animals were hungry.'"],
      correctAnswer: 0,
      explanation: "She cried in sorrow that now they must work as wage labourers to pay rent."
    },
    {
      id: 13,
      question: "What was Halku's surprising reaction to the destruction of his crop?",
      options: ["He felt relieved that he would no longer have to freeze in the fields at night", "He wept bitterly", "He beat Jabra", "He attacked Sahna"],
      correctAnswer: 0,
      explanation: "With grim irony, Halku said happily: 'At least I won't have to sleep out here in the cold nights anymore!'"
    },
    {
      id: 14,
      question: "What does Munshi Premchand highlight through Halku's story?",
      options: ["The brutal exploitation and endless misery of Indian peasants", "The joys of winter", "Hunting blue bulls", "The love of dogs"],
      correctAnswer: 0,
      explanation: "It exposes the crushing poverty and helplessness of tenant farmers in colonial India."
    },
    {
      id: 15,
      question: "Jabra kept barking throughout the night because ______.",
      options: ["He sensed wild animals destroying the harvest", "He was hungry", "He was cold", "He saw a thief"],
      correctAnswer: 0,
      explanation: "Jabra loyally alerted his master about the Nilgais devouring the crops."
    },
    {
      id: 16,
      question: "To get warm, Halku even held ______ close to his chest on the cot.",
      options: ["Jabra (his dog)", "A pillow", "A blanket", "A stone"],
      correctAnswer: 0,
      explanation: "Halku embraced his dirty, cold dog Jabra, drawing mutual warmth and companionship."
    },
    {
      id: 17,
      question: "What month of the Hindu calendar is referred to in 'January Night'?",
      options: ["Poos (पूस - the coldest winter month)", "Magh", "Kartik", "Phalgun"],
      correctAnswer: 0,
      explanation: "Poos (पूस) is the peak bitter winter month in Northern India."
    },
    {
      id: 18,
      question: "The three rupees saved by Halku were originally given to ______.",
      options: ["Sahna the landlord", "Munni for clothes", "A shopkeeper for grain", "Jabra's doctor"],
      correctAnswer: 0,
      explanation: "Halku gave them to Sahna to escape insults and humiliation."
    },
    {
      id: 19,
      question: "Munni was angry because paying Sahna meant ______.",
      options: ["Going without a blanket in the bitter cold", "No food for a week", "Losing their house", "Selling Jabra"],
      correctAnswer: 0,
      explanation: "It meant Halku would have to brave the icy winter nights without a blanket."
    },
    {
      id: 20,
      question: "The constellation visible in the cold winter sky described by Premchand was ______.",
      options: ["The Saptarishi (The Great Bear / Seven Rishis)", "Pole Star", "Orion", "Cassiopeia"],
      correctAnswer: 0,
      explanation: "Halku looked up at the Saptarishi climbing the midnight sky."
    },
    {
      id: 21,
      question: "How did Halku collect the leaves in the dark?",
      options: ["He made a broom of arhar stalks and swept the orchard", "He used a shovel", "With bare hands", "Jabra gathered them"],
      correctAnswer: 0,
      explanation: "He made a broom from dry arhar plants and gathered heaps of dry mango leaves."
    },
    {
      id: 22,
      question: "While jumping over the fire, what game did Halku boast of?",
      options: ["Leaping over fire without getting scorched", "Wrestling", "Running race", "Archery"],
      correctAnswer: 0,
      explanation: "He playfully called out to Jabra to jump over the flames."
    },
    {
      id: 23,
      question: "Munshi Premchand is popularly known as ______ in Hindi literature.",
      options: ["Upanyas Samrat (उपन्यास सम्राट)", "Kavi Guru", "Rashtrakavi", "Chhayavadi"],
      correctAnswer: 0,
      explanation: "Premchand is revered as the 'Emperor of Novels' (Upanyas Samrat)."
    },
    {
      id: 24,
      question: "Halku's crop was ______.",
      options: ["Sugarcane and winter crops", "Rice only", "Wheat only", "Cotton"],
      correctAnswer: 0,
      explanation: "He was guarding his sugarcane and winter field."
    },
    {
      id: 25,
      question: "The wind blowing across the field felt like ______.",
      options: ["Ice and stinging needles", "A gentle breeze", "Warm air", "Rain"],
      correctAnswer: 0,
      explanation: "The piercing wind pierced like freezing needles into his bones."
    },
    {
      id: 26,
      question: "Why did Halku hesitate to get up when he heard the animals grazing?",
      options: ["He was shivering violently and seduced by the pleasant warmth of the ashes", "He did not hear", "He was afraid of ghosts", "He was tied up"],
      correctAnswer: 0,
      explanation: "The pleasant warmth of the ashes held him captive against the brutal cold."
    },
    {
      id: 27,
      question: "Munni came to the field the next morning holding ______.",
      options: ["Her hands on her forehead in despair", "Food for Halku", "A blanket", "A stick"],
      correctAnswer: 0,
      explanation: "She arrived in despair finding the entire crop grazed flat to the soil."
    },
    {
      id: 28,
      question: "The theme of 'January Night' is ______.",
      options: ["The tragedy of peasant debt and agrarian exploitation", "Animal cruelty", "The joys of farming", "A hunting expedition"],
      correctAnswer: 0,
      explanation: "It realistically depicts the tragic plight of debt-ridden Indian peasantry."
    },
    {
      id: 29,
      question: "Which word means 'cold and shivering'?",
      options: ["Trembling with chill", "Sweating", "Boiling", "Glowing"],
      correctAnswer: 0,
      explanation: "Shivering means shaking with extreme cold."
    },
    {
      id: 30,
      question: "What happened to Jabra when Halku embraced him on the cot?",
      options: ["He whined affectionately and pressed close to Halku", "He bit him", "He ran away", "He barked loudly"],
      correctAnswer: 0,
      explanation: "The dog nestled close to Halku, feeling warm, loved and protected."
    }
  ],

  // Ch 24: Voice (Active & Passive)
  24: [
    {
      id: 1,
      question: "Choose the correct passive voice: 'He writes a letter.'",
      options: ["A letter is written by him.", "A letter was written by him.", "A letter is being written by him.", "A letter has written by him."],
      correctAnswer: 0,
      explanation: "Simple Present Active (writes) -> is/am/are + V3 (is written)."
    },
    {
      id: 2,
      question: "Choose the correct passive voice: 'She sang a song.'",
      options: ["A song was sung by her.", "A song is sung by her.", "A song had been sung by her.", "A song was being sung by her."],
      correctAnswer: 0,
      explanation: "Simple Past Active (sang) -> was/were + V3 (was sung)."
    },
    {
      id: 3,
      question: "Choose the correct passive voice: 'They are playing cricket.'",
      options: ["Cricket is being played by them.", "Cricket was being played by them.", "Cricket has been played by them.", "Cricket is played by them."],
      correctAnswer: 0,
      explanation: "Present Continuous -> is/am/are + being + V3 (is being played)."
    },
    {
      id: 4,
      question: "Choose the correct passive voice: 'Who broke this glass?'",
      options: ["By whom was this glass broken?", "Who was this glass broken by?", "By whom is this glass broken?", "Whom did break this glass?"],
      correctAnswer: 0,
      explanation: "'Who' changes to 'By whom', past tense takes 'was + V3'."
    },
    {
      id: 5,
      question: "Choose the correct passive voice: 'Open the door.'",
      options: ["Let the door be opened.", "The door should open.", "Let open the door.", "You are asked to open the door."],
      correctAnswer: 0,
      explanation: "Imperative sentence formula: Let + object + be + V3 -> Let the door be opened."
    },
    {
      id: 6,
      question: "Choose the correct passive voice: 'I have finished the work.'",
      options: ["The work has been finished by me.", "The work have been finished by me.", "The work was finished by me.", "The work is finished by me."],
      correctAnswer: 0,
      explanation: "Present Perfect -> has/have + been + V3 -> The work has been finished by me."
    },
    {
      id: 7,
      question: "Choose the correct active voice: 'The tiger was killed by the hunter.'",
      options: ["The hunter killed the tiger.", "The hunter kills the tiger.", "The hunter had killed the tiger.", "The hunter was killing the tiger."],
      correctAnswer: 0,
      explanation: "'was killed' in passive corresponds to Simple Past 'killed' in active voice."
    },
    {
      id: 8,
      question: "Choose the correct passive voice: 'Post this letter.'",
      options: ["Let this letter be posted.", "This letter must post.", "Let post this letter.", "You post this letter."],
      correctAnswer: 0,
      explanation: "Let + this letter + be + posted."
    },
    {
      id: 9,
      question: "Choose the correct passive voice: 'He can lift this heavy box.'",
      options: ["This heavy box can be lifted by him.", "This heavy box could be lifted by him.", "This heavy box can lift by him.", "This heavy box is lifted by him."],
      correctAnswer: 0,
      explanation: "Modal verb rule: modal + be + V3 -> can be lifted."
    },
    {
      id: 10,
      question: "Choose the correct passive voice: 'Do not pluck flowers.'",
      options: ["Let flowers not be plucked.", "Flowers are not plucked.", "You do not pluck flowers.", "Let not flowers plucked."],
      correctAnswer: 0,
      explanation: "Negative imperative: Let + object + not + be + V3."
    },
    {
      id: 11,
      question: "Choose the correct passive voice: 'The police arrested the thief.'",
      options: ["The thief was arrested by the police.", "The thief is arrested by the police.", "The thief had been arrested by the police.", "The thief was being arrested."],
      correctAnswer: 0,
      explanation: "Simple past passive: was arrested."
    },
    {
      id: 12,
      question: "Choose the correct passive voice: 'People speak English all over the world.'",
      options: ["English is spoken all over the world.", "English was spoken all over the world.", "English has spoken all over the world.", "English is being spoken all over the world."],
      correctAnswer: 0,
      explanation: "When agent is obvious ('people'), 'by people' is dropped in passive."
    },
    {
      id: 13,
      question: "Choose the correct passive voice: 'Someone has stolen my watch.'",
      options: ["My watch has been stolen.", "My watch was stolen.", "My watch has stolen.", "My watch is stolen by someone."],
      correctAnswer: 0,
      explanation: "Indefinite agent ('someone') is omitted: My watch has been stolen."
    },
    {
      id: 14,
      question: "Choose the correct active voice: 'A car is driven by Ramesh.'",
      options: ["Ramesh drives a car.", "Ramesh drove a car.", "Ramesh has driven a car.", "Ramesh is driving a car."],
      correctAnswer: 0,
      explanation: "'is driven' -> Simple present singular active 'drives'."
    },
    {
      id: 15,
      question: "Choose the correct passive voice: 'Help the poor.'",
      options: ["The poor should be helped.", "Let the poor help.", "The poor are helped.", "You help poor."],
      correctAnswer: 0,
      explanation: "Moral advice imperative: Object + should be + V3 -> The poor should be helped."
    },
    {
      id: 16,
      question: "Choose the correct passive voice: 'She was washing clothes.'",
      options: ["Clothes were being washed by her.", "Clothes was being washed by her.", "Clothes had been washed by her.", "Clothes were washed by her."],
      correctAnswer: 0,
      explanation: "Past Continuous -> were being + V3 (clothes is plural, so 'were')."
    },
    {
      id: 17,
      question: "Choose the correct passive voice: 'He will teach me.'",
      options: ["I shall be taught by him.", "I will teach him.", "I was taught by him.", "I am taught by him."],
      correctAnswer: 0,
      explanation: "Future Simple -> shall/will be + V3 -> I shall be taught by him."
    },
    {
      id: 18,
      question: "Choose the correct passive voice: 'Did you see him?'",
      options: ["Was he seen by you?", "Is he seen by you?", "Had he seen by you?", "Were he seen by you?"],
      correctAnswer: 0,
      explanation: "Simple past interrogative -> Was + subject + V3 -> Was he seen by you?"
    },
    {
      id: 19,
      question: "Choose the correct passive voice: 'We must respect our elders.'",
      options: ["Our elders must be respected by us.", "Our elders should respected.", "Our elders are respected by us.", "Our elders must respect us."],
      correctAnswer: 0,
      explanation: "Modal passive: must be respected."
    },
    {
      id: 20,
      question: "Choose the correct passive voice: 'I know him.'",
      options: ["He is known to me.", "He is known by me.", "He was known to me.", "He is knew by me."],
      correctAnswer: 0,
      explanation: "With the verb 'know', preposition 'to' is used instead of 'by' (known to me)."
    },
    {
      id: 21,
      question: "Choose the correct passive voice: 'Smoke filled the room.'",
      options: ["The room was filled with smoke.", "The room was filled by smoke.", "The room is filled of smoke.", "The room filled with smoke."],
      correctAnswer: 0,
      explanation: "With 'fill', preposition 'with' is used: filled with smoke."
    },
    {
      id: 22,
      question: "Choose the correct passive voice: 'His conduct surprised me.'",
      options: ["I was surprised at his conduct.", "I was surprised by his conduct.", "I am surprised with his conduct.", "I was surprised on his conduct."],
      correctAnswer: 0,
      explanation: "With 'surprised' referring to behavior/conduct, 'at' is used: surprised at."
    },
    {
      id: 23,
      question: "Choose the correct passive voice: 'They had won the match.'",
      options: ["The match had been won by them.", "The match has been won by them.", "The match was won by them.", "The match had won by them."],
      correctAnswer: 0,
      explanation: "Past perfect -> had been + V3 -> The match had been won by them."
    },
    {
      id: 24,
      question: "Choose the correct passive voice: 'Switch off the light.'",
      options: ["Let the light be switched off.", "The light should switch off.", "Let switch off the light.", "Light is switched off."],
      correctAnswer: 0,
      explanation: "Let + the light + be + switched off."
    },
    {
      id: 25,
      question: "Choose the correct passive voice: 'Why did you beat him?'",
      options: ["Why was he beaten by you?", "Why is he beaten by you?", "Why he was beaten by you?", "Why was he beat by you?"],
      correctAnswer: 0,
      explanation: "Why + was + he + beaten by you?"
    },
    {
      id: 26,
      question: "Choose the correct active voice: 'The book was read by Sita.'",
      options: ["Sita read the book.", "Sita reads the book.", "Sita has read the book.", "Sita is reading the book."],
      correctAnswer: 0,
      explanation: "Simple past passive 'was read' -> Simple past active 'read' (pronounced red)."
    },
    {
      id: 27,
      question: "Choose the correct passive voice: 'God bless you!'",
      options: ["May you be blessed by God!", "You are blessed by God.", "Let you be blessed by God.", "God may bless you."],
      correctAnswer: 0,
      explanation: "Optative passive: May you be blessed by God!"
    },
    {
      id: 28,
      question: "Choose the correct passive voice: 'She gave me a pen.'",
      options: ["I was given a pen by her. (or A pen was given to me by her.)", "I am given a pen by her.", "A pen had given to me.", "I was give a pen by her."],
      correctAnswer: 0,
      explanation: "Two objects (me, a pen): I was given a pen by her."
    },
    {
      id: 29,
      question: "Choose the correct passive voice: 'They are building a bridge.'",
      options: ["A bridge is being built by them.", "A bridge was being built by them.", "A bridge has been built by them.", "A bridge is built by them."],
      correctAnswer: 0,
      explanation: "Present continuous: is being built."
    },
    {
      id: 30,
      question: "Choose the correct passive voice: 'Please help me.'",
      options: ["You are requested to help me.", "Let me be helped please.", "You should help me please.", "Help should be given to me."],
      correctAnswer: 0,
      explanation: "Polite request with 'please' -> You are requested to help me."
    }
  ],

  // Ch 26: Prepositions & Articles
  26: [
    {
      id: 1,
      question: "He is senior ______ me in service.",
      options: ["to", "than", "from", "with"],
      correctAnswer: 0,
      explanation: "Comparative adjectives ending in '-ior' (senior, junior, superior, inferior) take preposition 'to'."
    },
    {
      id: 2,
      question: "She jumped ______ the river.",
      options: ["into", "in", "on", "to"],
      correctAnswer: 0,
      explanation: "'Into' is used for motion towards the interior (jumped into the river)."
    },
    {
      id: 3,
      question: "He has been suffering from fever ______ Monday.",
      options: ["since", "for", "from", "in"],
      correctAnswer: 0,
      explanation: "'Since' is used for a point of time (Monday) in perfect tenses."
    },
    {
      id: 4,
      question: "She has been living in Patna ______ five years.",
      options: ["for", "since", "from", "at"],
      correctAnswer: 0,
      explanation: "'For' is used for a period or duration of time (five years)."
    },
    {
      id: 5,
      question: "He died ______ cholera.",
      options: ["of", "from", "with", "by"],
      correctAnswer: 0,
      explanation: "When someone dies of a disease, preposition 'of' is used (died of cholera/cancer)."
    },
    {
      id: 6,
      question: "Divide these sweets ______ the two children.",
      options: ["between", "among", "in", "with"],
      correctAnswer: 0,
      explanation: "'Between' is used for two persons/things; 'among' for more than two."
    },
    {
      id: 7,
      question: "Divide the mangoes ______ all the students of the class.",
      options: ["among", "between", "to", "for"],
      correctAnswer: 0,
      explanation: "For more than two people, 'among' is used."
    },
    {
      id: 8,
      question: "He is afraid ______ dogs.",
      options: ["of", "from", "with", "by"],
      correctAnswer: 0,
      explanation: "'Afraid of' is the correct fixed preposition (afraid of dogs)."
    },
    {
      id: 9,
      question: "The cat sprang ______ the table.",
      options: ["upon", "at", "in", "to"],
      correctAnswer: 0,
      explanation: "'Upon' is used for motion upwards to a surface (sprang upon the table)."
    },
    {
      id: 10,
      question: "Look ______ the blackboard.",
      options: ["at", "on", "in", "to"],
      correctAnswer: 0,
      explanation: "'Look at' means directing one's gaze towards something."
    },
    {
      id: 11,
      question: "He is good ______ Mathematics.",
      options: ["at", "in", "with", "for"],
      correctAnswer: 0,
      explanation: "To be skilled in a subject or activity, 'good at' is used (good at English/Maths)."
    },
    {
      id: 12,
      question: "Listen ______ what your teacher says.",
      options: ["to", "at", "for", "with"],
      correctAnswer: 0,
      explanation: "Verb 'listen' takes preposition 'to' (listen to)."
    },
    {
      id: 13,
      question: "He prevented me ______ going there.",
      options: ["from", "to", "for", "with"],
      correctAnswer: 0,
      explanation: "'Prevent from + V-ing' is the correct construction."
    },
    {
      id: 14,
      question: "Mr. Sharma is ______ European.",
      options: ["a", "an", "the", "no article"],
      correctAnswer: 0,
      explanation: "'European' starts with consonant sound /juː/ (य), so article 'a' is used."
    },
    {
      id: 15,
      question: "He is ______ honest man.",
      options: ["an", "a", "the", "no article"],
      correctAnswer: 0,
      explanation: "'Honest' has a silent 'h' and vowel sound /ɒ/ (ऑ), so 'an' is used."
    },
    {
      id: 16,
      question: "Copper is ______ useful metal.",
      options: ["a", "an", "the", "no article"],
      correctAnswer: 0,
      explanation: "'Useful' begins with consonant sound /juː/ (य), so 'a useful' is correct."
    },
    {
      id: 17,
      question: "______ Ganga is a sacred river.",
      options: ["The", "A", "An", "No article"],
      correctAnswer: 0,
      explanation: "Definite article 'The' is placed before names of rivers (The Ganga, The Yamuna)."
    },
    {
      id: 18,
      question: "The sun rises in ______ east.",
      options: ["the", "a", "an", "no article"],
      correctAnswer: 0,
      explanation: "Names of directions take article 'the' (the east, the west)."
    },
    {
      id: 19,
      question: "He is ______ M.A. in English.",
      options: ["an", "a", "the", "no article"],
      correctAnswer: 0,
      explanation: "'M.A.' starts with vowel sound /em/ (एम), hence 'an M.A.' is correct."
    },
    {
      id: 20,
      question: "Mount Everest is ______ highest peak in the world.",
      options: ["the", "a", "an", "no article"],
      correctAnswer: 0,
      explanation: "Superlative degree of adjectives (highest, best) always takes 'the'."
    },
    {
      id: 21,
      question: "He is proud ______ his wealth.",
      options: ["of", "for", "with", "in"],
      correctAnswer: 0,
      explanation: "'Proud of' is the correct fixed preposition (proud of his success)."
    },
    {
      id: 22,
      question: "Wait here ______ I return.",
      options: ["until", "since", "from", "for"],
      correctAnswer: 0,
      explanation: "'Until' indicates up to the point in time that."
    },
    {
      id: 23,
      question: "The train arrived ______ the platform on time.",
      options: ["at", "in", "to", "on"],
      correctAnswer: 0,
      explanation: "'Arrived at' a specific location like station or platform."
    },
    {
      id: 24,
      question: "Smoking is injurious ______ health.",
      options: ["to", "for", "with", "at"],
      correctAnswer: 0,
      explanation: "Fixed preposition: 'injurious to health'."
    },
    {
      id: 25,
      question: "He was born ______ a rich family.",
      options: ["in", "into", "of", "from"],
      correctAnswer: 0,
      explanation: "'Born in' a town or 'born of/into' parents/family."
    },
    {
      id: 26,
      question: "I am fond ______ reading novels.",
      options: ["of", "for", "in", "about"],
      correctAnswer: 0,
      explanation: "Fixed preposition: 'fond of' (शौकीन होना)."
    },
    {
      id: 27,
      question: "What is the time ______ your watch?",
      options: ["by", "in", "on", "with"],
      correctAnswer: 0,
      explanation: "When asking time by a timepiece, preposition 'by' is used (by your watch)."
    },
    {
      id: 28,
      question: "He has been absent ______ school yesterday.",
      options: ["from", "at", "in", "for"],
      correctAnswer: 0,
      explanation: "'Absent from' is the correct preposition."
    },
    {
      id: 29,
      question: "Rohan is married ______ Sita.",
      options: ["to", "with", "by", "from"],
      correctAnswer: 0,
      explanation: "In passive voice, 'married to' is used (not married with)."
    },
    {
      id: 30,
      question: "She is blind ______ one eye.",
      options: ["in", "of", "to", "with"],
      correctAnswer: 0,
      explanation: "'Blind in one eye' refers to physical sight defect in one eye."
    }
  ],

  // Ch 28: Spelling, Synonyms, Translation
  28: [
    {
      id: 1,
      question: "Choose the correctly spelt word:",
      options: ["Grammar", "Grammer", "Gramer", "Grammor"],
      correctAnswer: 0,
      explanation: "The correct spelling is 'Grammar' (G-R-A-M-M-A-R)."
    },
    {
      id: 2,
      question: "Choose the correctly spelt word:",
      options: ["Committee", "Comitee", "Committe", "Comitte"],
      correctAnswer: 0,
      explanation: "Correct spelling is 'Committee' with double m, double t, double e."
    },
    {
      id: 3,
      question: "Choose the correctly spelt word:",
      options: ["Lieutenant", "Leutenant", "Lieutnant", "Luitenant"],
      correctAnswer: 0,
      explanation: "Correct spelling is 'Lieutenant' (L-i-e-u-t-e-n-a-n-t)."
    },
    {
      id: 4,
      question: "Choose the correctly spelt word:",
      options: ["Knowledge", "Knowlege", "Nowledge", "Knwoledge"],
      correctAnswer: 0,
      explanation: "Correct spelling is 'Knowledge'."
    },
    {
      id: 5,
      question: "Choose the correctly spelt word:",
      options: ["Believe", "Beleive", "Belive", "Beleeve"],
      correctAnswer: 0,
      explanation: "Rule: 'i' before 'e' except after 'c' -> 'Believe'."
    },
    {
      id: 6,
      question: "Choose the correctly spelt word:",
      options: ["Receive", "Recieve", "Receve", "Riceive"],
      correctAnswer: 0,
      explanation: "After 'c', it takes 'ei' -> 'Receive'."
    },
    {
      id: 7,
      question: "Choose the correctly spelt word:",
      options: ["Discipline", "Disipline", "Discipilne", "Descipline"],
      correctAnswer: 0,
      explanation: "Correct spelling is 'Discipline'."
    },
    {
      id: 8,
      question: "Choose the correctly spelt word:",
      options: ["Environment", "Enviroment", "Environmant", "Envirunment"],
      correctAnswer: 0,
      explanation: "Correct spelling is 'Environment' (E-N-V-I-R-O-N-M-E-N-T)."
    },
    {
      id: 9,
      question: "What is the synonym of 'Ancient'?",
      options: ["Old", "Modern", "New", "Recent"],
      correctAnswer: 0,
      explanation: "Synonym of 'Ancient' (प्राचीन) is 'Old'."
    },
    {
      id: 10,
      question: "What is the antonym of 'Virtue'?",
      options: ["Vice", "Goodness", "Sinless", "Purity"],
      correctAnswer: 0,
      explanation: "Antonym of 'Virtue' (सद्गुण) is 'Vice' (दुर्गुण/बुराई)."
    },
    {
      id: 11,
      question: "What is the antonym of 'Optimist'?",
      options: ["Pessimist", "Idealist", "Pacifist", "Realist"],
      correctAnswer: 0,
      explanation: "Optimist (आशावादी) opposes Pessimist (निराशावादी)."
    },
    {
      id: 12,
      question: "Translate into English: 'सूर्य पूरब में उगता है।'",
      options: ["The sun rises in the east.", "The sun is rising in the east.", "Sun rose in east.", "The sun rises from east."],
      correctAnswer: 0,
      explanation: "Universal truth takes Simple Present: The sun rises in the east."
    },
    {
      id: 13,
      question: "Translate into English: 'ईमानदारी सबसे अच्छी नीति है।'",
      options: ["Honesty is the best policy.", "Honesty was best policy.", "Honest is good policy.", "The honesty is the best policy."],
      correctAnswer: 0,
      explanation: "Standard proverb: 'Honesty is the best policy.' (Abstract nouns do not take 'the')."
    },
    {
      id: 14,
      question: "Translate into English: 'मैं अपना गृहकार्य कर चुका हूँ।'",
      options: ["I have done my homework.", "I had done my homework.", "I do my homework.", "I am doing my homework."],
      correctAnswer: 0,
      explanation: "Present Perfect: Subject + have/has + V3 -> I have done my homework."
    },
    {
      id: 15,
      question: "Translate into English: 'वर्षा हो रही है।'",
      options: ["It is raining.", "Water is falling.", "Rain is happening.", "It rains."],
      correctAnswer: 0,
      explanation: "Impersonal 'It' is used for weather: 'It is raining.'"
    },
    {
      id: 16,
      question: "Translate into English: 'पेड़ों से पत्ते गिर रहे हैं।'",
      options: ["Leaves are falling from the trees.", "Leaves fall of the trees.", "The leaf are falling.", "Tree is dropping leaves."],
      correctAnswer: 0,
      explanation: "Present continuous plural: Leaves are falling from the trees."
    },
    {
      id: 17,
      question: "Translate into English: 'क्या तुम अंग्रेजी बोल सकते हो?'",
      options: ["Can you speak English?", "May you speak English?", "Do you speaking English?", "Could you English speak?"],
      correctAnswer: 0,
      explanation: "Ability modal 'Can': Can you speak English?"
    },
    {
      id: 18,
      question: "Translate into English: 'हमें अपने देश से प्यार करना चाहिए।'",
      options: ["We should love our country.", "We must loving our country.", "We ought loving our country.", "We can love country."],
      correctAnswer: 0,
      explanation: "Moral duty: We should love our country."
    },
    {
      id: 19,
      question: "Translate into English: 'डॉक्टर के आने से पहले रोगी मर चुका था।'",
      options: ["The patient had died before the doctor came.", "The patient died before doctor had come.", "The doctor came before patient died.", "The patient has died before the doctor comes."],
      correctAnswer: 0,
      explanation: "Classic past perfect: Earlier action in Past Perfect (had died), later action in Simple Past (came)."
    },
    {
      id: 20,
      question: "Translate into English: 'गंगा एक पवित्र नदी है।'",
      options: ["The Ganga is a sacred river.", "Ganga is a holy river.", "A Ganga is sacred.", "The Ganga was holy river."],
      correctAnswer: 0,
      explanation: "The Ganga is a sacred (or holy) river."
    },
    {
      id: 21,
      question: "Choose the correctly spelt word:",
      options: ["Tuition", "Tution", "Tuetion", "Tuttion"],
      correctAnswer: 0,
      explanation: "Correct spelling is 'Tuition' (T-U-I-T-I-O-N)."
    },
    {
      id: 22,
      question: "Choose the correctly spelt word:",
      options: ["Vacuum", "Vaccuum", "Vacume", "Vaccum"],
      correctAnswer: 0,
      explanation: "Correct spelling is 'Vacuum' with single c and double u (V-A-C-U-U-M)."
    },
    {
      id: 23,
      question: "What is the synonym of 'Abandon'?",
      options: ["Forsake / Leave", "Keep", "Adopt", "Hold"],
      correctAnswer: 0,
      explanation: "'Abandon' means to leave or forsake completely."
    },
    {
      id: 24,
      question: "What is the antonym of 'Barren'?",
      options: ["Fertile", "Dry", "Desert", "Empty"],
      correctAnswer: 0,
      explanation: "Barren (बंजर) opposes Fertile (उपजाऊ)."
    },
    {
      id: 25,
      question: "Translate into English: 'सदा सत्य बोलो।'",
      options: ["Always speak the truth.", "Speak truth always.", "Never tell a lie.", "Always tell the truth."],
      correctAnswer: 0,
      explanation: "Standard phrase: 'Speak the truth' -> Always speak the truth."
    },
    {
      id: 26,
      question: "Translate into English: 'झूठ मत बोलो।'",
      options: ["Do not tell a lie.", "Do not speak a lie.", "Lie do not speak.", "Never tell truth."],
      correctAnswer: 0,
      explanation: "Standard phrase: 'Tell a lie' -> Do not tell a lie."
    },
    {
      id: 27,
      question: "Translate into English: 'गांधीजी एक महान नेता थे।'",
      options: ["Gandhiji was a great leader.", "Gandhiji is a great leader.", "Gandhiji was great leader.", "Gandhiji had been leader."],
      correctAnswer: 0,
      explanation: "Gandhiji was a great leader."
    },
    {
      id: 28,
      question: "Translate into English: 'मेरे पास एक कलम है।'",
      options: ["I have a pen.", "I had a pen.", "I am having pen.", "My pen is."],
      correctAnswer: 0,
      explanation: "Possession in present: I have a pen."
    },
    {
      id: 29,
      question: "Translate into English: 'वह कल विद्यालय नहीं गया।'",
      options: ["He did not go to school yesterday.", "He was not go to school.", "He had not went to school.", "He did not went to school."],
      correctAnswer: 0,
      explanation: "Simple past negative: did not + V1 (go) -> He did not go to school yesterday."
    },
    {
      id: 30,
      question: "What is the meaning of the idiom 'A piece of cake'?",
      options: ["A very easy task", "A sweet bakery dish", "A tough problem", "An expensive gift"],
      correctAnswer: 0,
      explanation: "Idiom 'a piece of cake' means something that is very easy to accomplish."
    }
  ]
};

// Fallback high-yield English questions generator for remaining chapters
export const getEnglishChapterQuestionsFallback = (chapterNo: number, chapterName: string): CrashTestQuestion[] => {
  // If dedicated chapter exists in ENGLISH_CHAPTER_QUESTION_BANKS
  if (ENGLISH_CHAPTER_QUESTION_BANKS[chapterNo]) {
    return ENGLISH_CHAPTER_QUESTION_BANKS[chapterNo];
  }

  // Find meta
  const meta = ENGLISH_ALL_CHAPTERS_LIST.find(c => c.no === chapterNo);
  const title = meta ? meta.name : chapterName;
  const author = meta ? meta.authorOrPoet : 'BSEB Panorama';
  const branch = meta ? meta.branch : 'English';

  return [
    {
      id: 1,
      question: `Who is the author / poet of '${title}'?`,
      options: [author, 'William Shakespeare', 'Mahadevi Varma', 'R.C. Hutchinson'],
      correctAnswer: 0,
      explanation: `'${title}' is written / composed by ${author}.`
    },
    {
      id: 2,
      question: `The theme of '${title}' primarily revolves around _______.`,
      options: [`Key human feelings and ideas discussed in ${title}`, 'War and politics only', 'Sports and games', 'Ancient magic'],
      correctAnswer: 0,
      explanation: `The chapter '${title}' deals with poignant human experiences, morality and life lessons prescribed for Bihar Board Class 10th.`
    },
    {
      id: 3,
      question: `Which literary text of Bihar Board Class 10th does '${title}' belong to?`,
      options: [`${branch} (Panorama Part II)`, 'Godhuli Part II', 'Piyusham Part II', 'Bharat Sanskriti'],
      correctAnswer: 0,
      explanation: `'${title}' is an essential chapter from the Bihar School Examination Board Class 10th ${branch}.`
    },
    {
      id: 4,
      question: `In '${title}', the writer highlights the contrast between _______.`,
      options: ['Virtue and human weaknesses', 'Machines and computers', 'Winter and autumn', 'City and desert'],
      correctAnswer: 0,
      explanation: `Like the core lessons in Panorama Part 2, '${title}' explores virtue, character and emotional truth.`
    },
    {
      id: 5,
      question: `What message does the author convey in '${title}'?`,
      options: ['To cultivate empathy, love and moral integrity', 'To seek material riches at all costs', 'To ignore social duties', 'To abandon nature'],
      correctAnswer: 0,
      explanation: `The central message inspires students towards empathy, ethical conduct and appreciation of nature and life.`
    },
    {
      id: 6,
      question: `Choose the correct synonym of 'Solitude' (often used in English poetry):`,
      options: ['Loneliness / seclusion', 'Crowd', 'Noise', 'Celebration'],
      correctAnswer: 0,
      explanation: `'Solitude' means the state of being alone or secluded peacefully.`
    },
    {
      id: 7,
      question: `Choose the correct meaning of 'Grief':`,
      options: ['Deep sorrow or sadness', 'Immense wealth', 'Laughter', 'Pride'],
      correctAnswer: 0,
      explanation: `'Grief' means deep mental anguish or sorrow.`
    },
    {
      id: 8,
      question: `Choose the antonym of 'Virtue':`,
      options: ['Vice', 'Goodness', 'Honour', 'Kindness'],
      correctAnswer: 0,
      explanation: `'Virtue' means goodness, and its opposite is 'Vice'.`
    },
    {
      id: 9,
      question: `In Bihar Board English objective paper, how many objective questions are typically asked?`,
      options: ['100 questions (out of which 50 must be answered)', '50 questions compulsory', '30 questions only', '80 questions'],
      correctAnswer: 0,
      explanation: `BSEB 10th Matriculation provides 100 objective questions and students answer any 50.`
    },
    {
      id: 10,
      question: `The language of '${title}' is described as _______.`,
      options: ['Lucid, expressive and poetic', 'Harsh and complicated', 'Scientific and dry', 'Slang'],
      correctAnswer: 0,
      explanation: `Panorama selections are renowned for their poetic clarity and expressive English prose.`
    },
    {
      id: 11,
      question: `Choose the correct indirect speech: He said, 'I am busy today.'`,
      options: ["He said that he was busy that day.", "He said that he is busy today.", "He told that he was busy today.", "He says that he was busy."],
      correctAnswer: 0,
      explanation: `'am' changes to 'was' and 'today' changes to 'that day'.`
    },
    {
      id: 12,
      question: `Choose the correct passive voice: 'He reads a book.'`,
      options: ["A book is read by him.", "A book was read by him.", "A book has read by him.", "A book is being read."],
      correctAnswer: 0,
      explanation: `Simple present active -> is/am/are + V3 -> 'A book is read by him.'`
    },
    {
      id: 13,
      question: `Choose the appropriate preposition: She is fond _______ music.`,
      options: ['of', 'for', 'in', 'with'],
      correctAnswer: 0,
      explanation: `'Fond of' is the correct prepositional phrase.`
    },
    {
      id: 14,
      question: `Choose the appropriate article: He is _______ honest officer.`,
      options: ['an', 'a', 'the', 'no article'],
      correctAnswer: 0,
      explanation: `'Honest' starts with a vowel sound, so 'an' is correct.`
    },
    {
      id: 15,
      question: `Choose the correct spelling:`,
      options: ['Necessary', 'Neccessary', 'Necassary', 'Necesary'],
      correctAnswer: 0,
      explanation: `Correct spelling is 'Necessary' (N-E-C-E-S-S-A-R-Y).`
    },
    {
      id: 16,
      question: `Choose the correct spelling:`,
      options: ['Success', 'Succes', 'Sucess', 'Sucses'],
      correctAnswer: 0,
      explanation: `Correct spelling is 'Success' with double c and double s.`
    },
    {
      id: 17,
      question: `Translate into English: 'वह प्रतिदिन विद्यालय जाता है।'`,
      options: ["He goes to school every day.", "He is going to school daily.", "He went to school.", "He go to school daily."],
      correctAnswer: 0,
      explanation: `Routine habit takes Simple Present third person singular: 'He goes to school every day.'`
    },
    {
      id: 18,
      question: `Translate into English: 'पानी 100°C पर उबलता है।'`,
      options: ["Water boils at 100°C.", "Water is boiling at 100°C.", "Water boiled at 100°C.", "Water will boil at 100°C."],
      correctAnswer: 0,
      explanation: `Scientific facts take Simple Present: 'Water boils at 100°C.'`
    },
    {
      id: 19,
      question: `Choose the antonym of 'Cruel':`,
      options: ['Kind', 'Rough', 'Angry', 'Violent'],
      correctAnswer: 0,
      explanation: `Opposite of 'Cruel' (निर्दयी) is 'Kind' (दयालु).`
    },
    {
      id: 20,
      question: `Choose the synonym of 'Courage':`,
      options: ['Bravery', 'Fear', 'Cowardice', 'Weakness'],
      correctAnswer: 0,
      explanation: `'Courage' and 'Bravery' both mean साहस.`
    },
    {
      id: 21,
      question: `In '${title}', the characters demonstrate the importance of _______.`,
      options: ['Patience, love and understanding', 'Arrogance and greed', 'Deception', 'Complaining'],
      correctAnswer: 0,
      explanation: `Moral themes emphasize patience, compassion and understanding.`
    },
    {
      id: 22,
      question: `Choose the correct modal auxiliary: We _______ obey the traffic rules.`,
      options: ['must', 'can', 'may', 'might'],
      correctAnswer: 0,
      explanation: `Strong obligation / legal rule takes 'must'.`
    },
    {
      id: 23,
      question: `Choose the correct modal auxiliary: _______ I come in, sir?`,
      options: ['May', 'Can', 'Should', 'Must'],
      correctAnswer: 0,
      explanation: `Formal polite permission takes 'May'.`
    },
    {
      id: 24,
      question: `Choose the correct form of verb: Look! The birds _______ in the sky.`,
      options: ['are flying', 'flew', 'has flown', 'flies'],
      correctAnswer: 0,
      explanation: `Action happening right now at the time of speaking: 'are flying'.`
    },
    {
      id: 25,
      question: `Choose the correct preposition: He sat _______ a tree.`,
      options: ['under', 'into', 'on', 'with'],
      correctAnswer: 0,
      explanation: `Sitting beneath the shade of a tree: 'under a tree'.`
    },
    {
      id: 26,
      question: `What is the plural of 'Child'?`,
      options: ['Children', 'Childs', 'Childrens', 'Childes'],
      correctAnswer: 0,
      explanation: `Plural of child is 'children'.`
    },
    {
      id: 27,
      question: `What is the plural of 'Foot'?`,
      options: ['Feet', 'Foots', 'Feets', 'Footes'],
      correctAnswer: 0,
      explanation: `Plural of foot is 'feet'.`
    },
    {
      id: 28,
      question: `Translate into English: 'भारत हमारा प्यारा देश है।'`,
      options: ["India is our beloved country.", "India our dear country.", "India was our country.", "Our country is India."],
      correctAnswer: 0,
      explanation: `'India is our beloved country.'`
    },
    {
      id: 29,
      question: `Translate into English: 'समय ही धन है।'`,
      options: ["Time is money.", "Time is wealth.", "Money is time.", "Time has money."],
      correctAnswer: 0,
      explanation: `Famous proverb: 'Time is money.'`
    },
    {
      id: 30,
      question: `The study of '${title}' helps students to achieve _______ in Class 10th Board Exams.`,
      options: ['Top marks with strong conceptual understanding', 'Confusion', 'Poor results', 'Zero progress'],
      correctAnswer: 0,
      explanation: `Regular chapter-wise objective practice builds 100% confidence for board exams.`
    }
  ];
};
