export interface Module {
  id: number
  title: string
  subtitle: string
  level: "A1" | "A1-A2" | "A2"
  duration: string
  description: string
  location: string
  region: string
  videoUrl: string
  story: {
    text: string
    hint: string
    characters: string[]
    mission: string
    showTranslation?: boolean
    // Russian translations
    text_ru?: string
    hint_ru?: string
    mission_ru?: string
  }
  vocabulary: Array<{
    word: string
    translation: string
    example: string
    audioUrl: string
    // Russian translations
    translation_ru?: string
    example_ru?: string
  }>
  grammar: {
    title: string
    explanation: string
    rules: string[]
    examples: Array<{
      estonian: string
      english: string
      russian?: string
    }>
    exercises: Array<{
      type: "fill-blank" | "multiple-choice" | "translation" | "conjugation" | "arrange" | "correct" | "write"
      question: string
      options?: string[]
      answer: string
      hint?: string
      // Russian translations
      question_ru?: string
      options_ru?: string[]
      hint_ru?: string
    }>
    table?: Array<{
      pronoun: string
      verb: string
      example: string
      example_ru?: string
    }>
    // Russian translations
    title_ru?: string
    explanation_ru?: string
    rules_ru?: string[]
  }
  pronunciation: {
    focus: string
    minimalPairs: string[]
    exercises: Array<{
      type: "shadow" | "minimal-pairs" | "record"
      instruction: string
      content: string
      instruction_ru?: string
      content_ru?: string
    }>
    content: string
    hint: string
    // Russian translations
    focus_ru?: string
    content_ru?: string
    hint_ru?: string
  }
  listening: {
    audioUrl: string
    transcript: string
    questions: Array<{
      question: string
      type: "multiple-choice" | "true-false" | "fill-blank"
      options?: string[]
      answer: string
      question_ru?: string
      options_ru?: string[]
    }>
    content: string
    hint: string
    // Russian translations
    transcript_ru?: string
    content_ru?: string
    hint_ru?: string
  }
  speaking: {
    exercises: Array<{
      type: "repeat" | "role-play" | "describe" | "record-compare" | "mission-challenge"
      prompt: string
      audioUrl?: string
      expectedResponse?: string
      script?: string
      prompt_ru?: string
      expectedResponse_ru?: string
      script_ru?: string
    }>
    content: string
    hint: string
    content_ru?: string
    hint_ru?: string
  }
  reading: {
    text: string
    questions: Array<{
      question: string
      type: "multiple-choice" | "true-false" | "short-answer" | "find-phrases"
      options?: string[]
      answer: string
      question_ru?: string
      options_ru?: string[]
    }>
    hint: string
    text_ru?: string
    hint_ru?: string
  }
  writing: {
    exercises: Array<{
      type: "guided" | "free" | "translation" | "travel-journal"
      prompt: string
      wordLimit?: number
      hints?: string[]
      example?: string
      prompt_ru?: string
      hints_ru?: string[]
      example_ru?: string
    }>
    content: string
    hint: string
    content_ru?: string
    hint_ru?: string
  }
  cultural: {
    title: string
    content: string
    souvenir: {
      name: string
      description: string
      downloadUrl: string
      name_ru?: string
      description_ru?: string
    }
    hint: string
    title_ru?: string
    content_ru?: string
    hint_ru?: string
  }
  quiz: Array<{
    id: number
    type:
      | "multiple-choice"
      | "fill-blank"
      | "translation"
      | "listening"
      | "true-false"
      | "conjugate"
      | "match"
      | "write"
    question: string
    options?: string[]
    answer: string
    audioUrl?: string
    hint?: string
    question_ru?: string
    options_ru?: string[]
    hint_ru?: string
  }>
  missionChallenge: {
    title: string
    description: string
    requirements: string[]
    hint: string
    title_ru?: string
    description_ru?: string
    requirements_ru?: string[]
    hint_ru?: string
  }
  mapPosition: { x: number; y: number }
}

// Function to get modules from localStorage or default data
export function getModules(): Module[] {
  if (typeof window !== "undefined") {
    const savedModules = localStorage.getItem("adminModules")
    if (savedModules) {
      return JSON.parse(savedModules)
    }
  }
  return defaultModules
}

// Default modules data with complete Module 1 content including Russian translations
const defaultModules: Module[] = [
  {
    id: 1,
    title: "Tallinn's Old Town",
    subtitle: "Greetings and Introductions",
    level: "A1",
    duration: "3 hours",
    description:
      "Learn basic greetings and introductions in the historic cobblestone streets of Tallinn's UNESCO Old Town.",
    location: "Tallinn",
    region: "Harju",
    videoUrl: "/videos/tallinn-story.mp4",
    story: {
      text: `You step into Tallinn's Old Town, where cobblestone streets echo with history. The scent of fresh kohuke wafts from a café near Alexander Nevsky Cathedral. Liis, your guide, waves and begins a warm conversation.

Liis: Tere! Minu nimi on Liis. Ma olen õpilane. Mis sinu nimi on?
Me: Tere! Minu nimi on [your name]. Ma olen [õpilane/töötaja]. Kuidas läheb?
Liis: Hästi, aitäh! Ma olen õnnelik, sest Tallinn on ilus linn. Sina oled õnnelik?
Me: Jah, ma olen õnnelik. See kohvik on tore. Kes sina oled?
Liis: Ma olen sinu giid! Ma armastan kohvikuid ja raamatuid. Kas sa tahad kohvi? Palun, tule sisse!
Me: Aitäh! Vabandust, ma pean hiljem minema. Nägemist!
Liis: Head aega! Tule varsti tagasi!`,
      text_ru: `Вы входите в Старый город Таллинна, где мощеные улицы отзываются эхом истории. Аромат свежего кохуке доносится из кафе рядом с собором Александра Невского. Лийс, ваш гид, машет рукой и начинает теплый разговор.

Лийс: Tere! Minu nimi on Liis. Ma olen õpilane. Mis sinu nimi on?
Я: Tere! Minu nimi on [ваше имя]. Ma olen [õpilane/töötaja]. Kuidas läheb?
Лийс: Hästi, aitäh! Ma olen õnnelik, sest Tallinn on ilus linn. Sina oled õnnelik?
Я: Jah, ma olen õnnelik. See kohvik on tore. Kes sina oled?
Лийс: Ma olen sinu giid! Ma armastan kohvikuid ja raamatuid. Kas sa tahad kohvi? Palun, tule sisse!
Я: Aitäh! Vabandust, ma pean hiljem minema. Nägemist!
Лийс: Head aega! Tule varsti tagasi!`,
      hint: "Read the dialogue aloud (use MP3) to feel the café setting. Practice greetings (tere, aitäh) and note emotions (õnnelik).",
      hint_ru:
        "Читайте диалог вслух (используйте MP3), чтобы почувствовать атмосферу кафе. Практикуйте приветствия (tere, aitäh) и обратите внимание на эмоции (õnnelik).",
      characters: ["Liis", "You"],
      mission:
        "Your mission: greet Liis, introduce yourself, and use polite phrases to connect in Tallinn's vibrant atmosphere.",
      mission_ru:
        "Ваша миссия: поприветствовать Лийс, представиться и использовать вежливые фразы для общения в яркой атмосфере Таллинна.",
    },
    vocabulary: [
      {
        word: "Tere",
        translation: "Hello",
        translation_ru: "Привет",
        example: "Tere! Kuidas läheb?",
        audioUrl: "/audio/tere.mp3",
      },
      {
        word: "Tere hommikust",
        translation: "Good morning",
        translation_ru: "Доброе утро",
        example: "Tere hommikust, Liis!",
        audioUrl: "/audio/tere-hommikust.mp3",
      },
      {
        word: "Tere õhtust",
        translation: "Good evening",
        translation_ru: "Добрый вечер",
        example: "Tere õhtust!",
        audioUrl: "/audio/tere-ohtust.mp3",
      },
      {
        word: "Nägemist",
        translation: "Goodbye",
        translation_ru: "До свидания",
        example: "Nägemist, Liis!",
        audioUrl: "/audio/nagemist.mp3",
      },
      {
        word: "Head aega",
        translation: "Goodbye (casual)",
        translation_ru: "Пока (неформально)",
        example: "Head aega!",
        audioUrl: "/audio/head-aega.mp3",
      },
      {
        word: "Palun",
        translation: "Please",
        translation_ru: "Пожалуйста",
        example: "Palun, tule sisse!",
        audioUrl: "/audio/palun.mp3",
      },
      {
        word: "Aitäh",
        translation: "Thank you",
        translation_ru: "Спасибо",
        example: "Aitäh, Liis!",
        audioUrl: "/audio/aitah.mp3",
      },
      {
        word: "Tänan",
        translation: "Thanks",
        translation_ru: "Благодарю",
        example: "Tänan sind!",
        audioUrl: "/audio/tanan.mp3",
      },
      {
        word: "Vabandust",
        translation: "Sorry/Excuse me",
        translation_ru: "Извините/Простите",
        example: "Vabandust, ma pean minema.",
        audioUrl: "/audio/vabandust.mp3",
      },
      {
        word: "Kuidas läheb?",
        translation: "How are you?",
        translation_ru: "Как дела?",
        example: "Tere! Kuidas läheb?",
        audioUrl: "/audio/kuidas-laheb.mp3",
      },
      {
        word: "Hästi",
        translation: "Good/Well",
        translation_ru: "Хорошо",
        example: "Hästi, aitäh!",
        audioUrl: "/audio/hasti.mp3",
      },
      {
        word: "Halvasti",
        translation: "Bad/Poorly",
        translation_ru: "Плохо",
        example: "Halvasti täna.",
        audioUrl: "/audio/halvasti.mp3",
      },
      {
        word: "Minu nimi on",
        translation: "My name is",
        translation_ru: "Меня зовут",
        example: "Minu nimi on Liis.",
        audioUrl: "/audio/minu-nimi-on.mp3",
      },
      {
        word: "Mis sinu nimi on?",
        translation: "What is your name?",
        translation_ru: "Как тебя зовут?",
        example: "Mis sinu nimi on?",
        audioUrl: "/audio/mis-sinu-nimi-on.mp3",
      },
      {
        word: "Ma olen",
        translation: "I am",
        translation_ru: "Я есть/являюсь",
        example: "Ma olen õpilane.",
        audioUrl: "/audio/ma-olen.mp3",
      },
      {
        word: "Õpilane",
        translation: "Student",
        translation_ru: "Студент",
        example: "Ma olen õpilane.",
        audioUrl: "/audio/opilane.mp3",
      },
      {
        word: "Töötaja",
        translation: "Worker",
        translation_ru: "Работник",
        example: "Ma olen töötaja.",
        audioUrl: "/audio/tootaja.mp3",
      },
      {
        word: "Õnnelik",
        translation: "Happy",
        translation_ru: "Счастливый",
        example: "Ma olen õnnelik.",
        audioUrl: "/audio/onnelik.mp3",
      },
      {
        word: "Väsinud",
        translation: "Tired",
        translation_ru: "Уставший",
        example: "Ma olen väsinud.",
        audioUrl: "/audio/vasinud.mp3",
      },
      {
        word: "Kes?",
        translation: "Who?",
        translation_ru: "Кто?",
        example: "Kes sina oled?",
        audioUrl: "/audio/kes.mp3",
      },
    ],
    grammar: {
      title: "Personal Pronouns and Verb 'Olema' (to be)",
      title_ru: "Личные местоимения и глагол 'Olema' (быть)",
      explanation:
        "Personal pronouns are used to indicate the subject of a sentence. Estonian pronouns are straightforward, with no gender distinctions for third person (tema for he/she). The verb 'olema' (to be) is essential for introductions and descriptions.",
      explanation_ru:
        "Личные местоимения используются для обозначения подлежащего в предложении. Эстонские местоимения просты, без различий по роду для третьего лица (tema для он/она). Глагол 'olema' (быть) необходим для представлений и описаний.",
      rules: [
        "Personal pronouns: mina (I), sina (you, informal), tema (he/she)",
        "Verb 'olema' conjugation: olen, oled, on",
        "Always explicit in Estonian (unlike English)",
        "Question formation uses question words first",
        "Formal 'you' uses teie (not covered in A1)",
        "No irregular forms for olema in present tense",
      ],
      rules_ru: [
        "Личные местоимения: mina (я), sina (ты, неформально), tema (он/она)",
        "Спряжение глагола 'olema': olen, oled, on",
        "Всегда явно выражено в эстонском (в отличие от английского)",
        "Образование вопросов использует вопросительные слова в начале",
        "Формальное 'вы' использует teie (не изучается на уровне A1)",
        "Нет неправильных форм для olema в настоящем времени",
      ],
      examples: [
        { estonian: "Mina olen õpilane.", english: "I am a student.", russian: "Я студент." },
        { estonian: "Sina oled õnnelik.", english: "You are happy.", russian: "Ты счастлив." },
        { estonian: "Tema on väsinud.", english: "He/She is tired.", russian: "Он/Она устал(а)." },
        { estonian: "Mis sinu nimi on?", english: "What is your name?", russian: "Как тебя зовут?" },
      ],
      table: [
        {
          pronoun: "Mina",
          verb: "olen",
          example: "Mina olen õpilane. (I am a student.)",
          example_ru: "Mina olen õpilane. (Я студент.)",
        },
        {
          pronoun: "Sina",
          verb: "oled",
          example: "Sina oled õnnelik. (You are happy.)",
          example_ru: "Sina oled õnnelik. (Ты счастлив.)",
        },
        {
          pronoun: "Tema",
          verb: "on",
          example: "Tema on väsinud. (He/She is tired.)",
          example_ru: "Tema on väsinud. (Он/Она устал(а).)",
        },
      ],
      exercises: [
        {
          type: "fill-blank",
          question: "Mina ___ õnnelik.",
          question_ru: "Mina ___ õnnelik.",
          answer: "olen",
          hint: "Use the correct form of 'olema' for 'mina'",
          hint_ru: "Используйте правильную форму 'olema' для 'mina'",
        },
        {
          type: "translation",
          question: "Translate: 'Who are you?'",
          question_ru: "Переведите: 'Кто ты?'",
          answer: "Kes sina oled?",
          hint: "Remember question word order",
          hint_ru: "Помните порядок слов в вопросе",
        },
        {
          type: "multiple-choice",
          question: "Choose the correct form: Sina ___ õpilane.",
          question_ru: "Выберите правильную форму: Sina ___ õpilane.",
          options: ["olen", "oled", "on"],
          options_ru: ["olen", "oled", "on"],
          answer: "oled",
        },
        {
          type: "arrange",
          question: "Arrange: õpilane / sina / oled",
          question_ru: "Расставьте: õpilane / sina / oled",
          answer: "Sina oled õpilane.",
        },
        {
          type: "fill-blank",
          question: "Tema ___ töötaja.",
          question_ru: "Tema ___ töötaja.",
          answer: "on",
        },
        {
          type: "correct",
          question: "Correct: Mina on õpilane.",
          question_ru: "Исправьте: Mina on õpilane.",
          answer: "Mina olen õpilane.",
        },
        {
          type: "conjugation",
          question: "Conjugate 'olema' for all persons",
          question_ru: "Проспрягайте 'olema' для всех лиц",
          answer: "mina olen, sina oled, tema on",
        },
      ],
    },
    pronunciation: {
      focus: "Vowels e (tere – short 'eh'), õ (õnnelik – 'u-o' blend), first-syllable stress (TE-re)",
      focus_ru: "Гласные e (tere – короткое 'э'), õ (õnnelik – смесь 'у-о'), ударение на первом слоге (TE-re)",
      minimalPairs: ["sina (you) vs. siin (here)", "tere (hello) vs. tee (tea)"],
      exercises: [
        {
          type: "shadow",
          instruction: "Shadow: Tere! Kuidas läheb? (MP3, repeat 5 times)",
          instruction_ru: "Повторяйте: Tere! Kuidas läheb? (MP3, повторите 5 раз)",
          content: "Tere! Kuidas läheb?",
          content_ru: "Tere! Kuidas läheb?",
        },
        {
          type: "minimal-pairs",
          instruction: "Minimal Pairs: Say sina vs. siin 3 times",
          instruction_ru: "Минимальные пары: Произнесите sina vs. siin 3 раза",
          content: "sina vs. siin",
          content_ru: "sina vs. siin",
        },
        {
          type: "record",
          instruction: "Record: Minu nimi on [your name]. Ma olen õnnelik. Compare to MP3",
          instruction_ru: "Запишите: Minu nimi on [ваше имя]. Ma olen õnnelik. Сравните с MP3",
          content: "Minu nimi on [your name]. Ma olen õnnelik.",
          content_ru: "Minu nimi on [ваше имя]. Ma olen õnnelik.",
        },
      ],
      content: "4-minute video showing õ and e. MP3 with shadowing phrases.",
      content_ru: "4-минутное видео, показывающее õ и e. MP3 с фразами для повторения.",
      hint: "Mimic video for õ. Practice stress daily. Record to refine pronunciation.",
      hint_ru: "Подражайте видео для õ. Практикуйте ударение ежедневно. Записывайте для улучшения произношения.",
    },
    listening: {
      audioUrl: "/audio/tallinn-dialogue.mp3",
      transcript: `Liis: Tere! Minu nimi on Liis. Ma olen õpilane. Mis sinu nimi on?
Me: Tere! Minu nimi on [your name]. Ma olen töötaja. Kuidas läheb?
Liis: Hästi, aitäh! Sina oled õnnelik?
Me: Jah, ma olen õnnelik. Vabandust, ma pean minema. Nägemist!
Liis: Head aega!`,
      transcript_ru: `Лийс: Tere! Minu nimi on Liis. Ma olen õpilane. Mis sinu nimi on?
Я: Tere! Minu nimi on [ваше имя]. Ma olen töötaja. Kuidas läheb?
Лийс: Hästi, aitäh! Sina oled õnnelik?
Я: Jah, ma olen õnnelik. Vabandust, ma pean minema. Nägemist!
Лийс: Head aega!`,
      questions: [
        {
          question: "What is Liis's name?",
          question_ru: "Как зовут Лийс?",
          type: "multiple-choice",
          options: ["Maria", "Liis", "Anna"],
          options_ru: ["Мария", "Лийс", "Анна"],
          answer: "Liis",
        },
        {
          question: "Is the learner a student?",
          question_ru: "Является ли учащийся студентом?",
          type: "true-false",
          answer: "false",
        },
        {
          question: "How does Liis feel?",
          question_ru: "Как себя чувствует Лийс?",
          type: "multiple-choice",
          options: ["Happy", "Sad", "Tired"],
          options_ru: ["Счастливая", "Грустная", "Уставшая"],
          answer: "Happy",
        },
        {
          question: "Fill in: Minu nimi ___ [your name].",
          question_ru: "Заполните: Minu nimi ___ [ваше имя].",
          type: "fill-blank",
          answer: "on",
        },
        {
          question: "Liis says Tere hommikust.",
          question_ru: "Лийс говорит Tere hommikust.",
          type: "true-false",
          answer: "false",
        },
      ],
      content: "MP3, PDF transcript, subtitled video (café setting).",
      content_ru: "MP3, PDF транскрипт, видео с субтитрами (обстановка кафе).",
      hint: "Listen 3 times: for meaning, with transcript, for questions. Note hästi and õnnelik.",
      hint_ru: "Слушайте 3 раза: для понимания, с транскриптом, для вопросов. Обратите внимание на hästi и õnnelik.",
    },
    speaking: {
      exercises: [
        {
          type: "role-play",
          prompt: "Role-Play Script: Meet Liis at a Tallinn café. Greet and ask her name.",
          prompt_ru: "Ролевая игра: Встретьте Лийс в таллиннском кафе. Поприветствуйте и спросите её имя.",
          script: `Me: Tere! Minu nimi on [your name]. Mis sinu nimi on?
Liis: Tere! Minu nimi on Liis. Kuidas läheb?
Me: Hästi, aitäh! Ma olen [õpilane/töötaja]. Sina oled õpilane?
Liis: Jah, ma olen õpilane. Kes sina oled?
Me: Ma olen õnnelik. Nägemist!
Liis: Head aega!`,
          script_ru: `Я: Tere! Minu nimi on [ваше имя]. Mis sinu nimi on?
Лийс: Tere! Minu nimi on Liis. Kuidas läheb?
Я: Hästi, aitäh! Ma olen [õpilane/töötaja]. Sina oled õpilane?
Лийс: Jah, ma olen õpilane. Kes sina oled?
Я: Ma olen õnnelik. Nägemist!
Лийс: Head aega!`,
          expectedResponse: "Tere! Minu nimi on [name]. Kuidas läheb?",
          expectedResponse_ru: "Tere! Minu nimi on [имя]. Kuidas läheb?",
        },
        {
          type: "record-compare",
          prompt: "Record-and-Compare: Record Minu nimi on [your name]. Ma olen õnnelik.",
          prompt_ru: "Запись и сравнение: Запишите Minu nimi on [ваше имя]. Ma olen õnnelik.",
          expectedResponse: "Minu nimi on [your name]. Ma olen õnnelik.",
          expectedResponse_ru: "Minu nimi on [ваше имя]. Ma olen õnnelik.",
        },
        {
          type: "mission-challenge",
          prompt: "Mission Challenge: Record a 30-second introduction video. Share in Travel Journal.",
          prompt_ru: "Миссия-вызов: Запишите 30-секундное видео-представление. Поделитесь в дневнике путешествий.",
          expectedResponse: "30-second introduction using vocabulary from this module",
          expectedResponse_ru: "30-секундное представление, используя словарь из этого модуля",
        },
      ],
      content: "MP3, PDF with script.",
      content_ru: "MP3, PDF со сценарием.",
      hint: "Practice role-play 3 times. Record slowly. Share to build confidence.",
      hint_ru: "Практикуйте ролевую игру 3 раза. Записывайте медленно. Делитесь для повышения уверенности.",
    },
    reading: {
      text: `Tere! Mina olen Liis. Ma olen õpilane. Ma olen õnnelik, sest Tallinn on ilus linn. Ma armastan kohvikuid. Kuidas läheb? Mis sinu nimi on? Kes sina oled? Palun, ütle mulle! Aitäh! Vabandust, ma pean minema. Nägemist!`,
      text_ru: `Привет! Меня зовут Лийс. Я студентка. Я счастлива, потому что Таллинн - красивый город. Я люблю кафе. Как дела? Как тебя зовут? Кто ты? Пожалуйста, скажи мне! Спасибо! Извини, мне нужно идти. До свидания!`,
      questions: [
        {
          question: "What is Liis's job?",
          question_ru: "Какая работа у Лийс?",
          type: "short-answer",
          answer: "Student",
        },
        {
          question: "Why is Liis happy?",
          question_ru: "Почему Лийс счастлива?",
          type: "short-answer",
          answer: "Because Tallinn is a beautiful city",
        },
        {
          question: "Find 3 polite phrases.",
          question_ru: "Найдите 3 вежливые фразы.",
          type: "find-phrases",
          answer: "palun, aitäh, vabandust",
        },
        {
          question: "Liis loves cafés.",
          question_ru: "Лийс любит кафе.",
          type: "true-false",
          answer: "true",
        },
        {
          question: "What does Liis say at the end?",
          question_ru: "Что говорит Лийс в конце?",
          type: "multiple-choice",
          options: ["Tere", "Aitäh", "Nägemist", "Palun"],
          options_ru: ["Tere", "Aitäh", "Nägemist", "Palun"],
          answer: "Nägemist",
        },
      ],
      hint: "Read aloud, underline vocabulary. Answer using text.",
      hint_ru: "Читайте вслух, подчеркивайте словарь. Отвечайте, используя текст.",
    },
    writing: {
      exercises: [
        {
          type: "guided",
          prompt: "Write 5 sentences introducing yourself using the vocabulary from this module.",
          prompt_ru: "Напишите 5 предложений, представляя себя, используя словарь из этого модуля.",
          wordLimit: 50,
          hints: ["Use 'Mina olen...'", "Include your name", "Mention how you feel", "Use polite phrases"],
          hints_ru: [
            "Используйте 'Mina olen...'",
            "Включите ваше имя",
            "Упомяните, как вы себя чувствуете",
            "Используйте вежливые фразы",
          ],
        },
        {
          type: "free",
          prompt: "Write a 6-sentence dialogue with Liis.",
          prompt_ru: "Напишите диалог из 6 предложений с Лийс.",
          wordLimit: 100,
          example: `Me: Tere! Minu nimi on [name]. Kes sina oled?
Liis: Tere! Ma olen Liis. Ma olen õpilane.
Me: Kuidas läheb? Ma olen õnnelik.
Liis: Hästi, aitäh!
Me: Palun, ütle mulle, kas Tallinn on ilus?
Liis: Jah, väga ilus! Nägemist!`,
          example_ru: `Я: Tere! Minu nimi on [имя]. Kes sina oled?
Лийс: Tere! Ma olen Liis. Ma olen õpilane.
Я: Kuidas läheb? Ma olen õnnelik.
Лийс: Hästi, aitäh!
Я: Palun, ütle mulle, kas Tallinn on ilus?
Лийс: Jah, väga ilus! Nägemist!`,
        },
        {
          type: "travel-journal",
          prompt: "Travel Journal: Describe your 'day' in Tallinn's Old Town.",
          prompt_ru: "Дневник путешествий: Опишите ваш 'день' в Старом городе Таллинна.",
          wordLimit: 100,
          hints: ["Include emotions", "Use vocabulary from this module", "Describe the café setting"],
          hints_ru: ["Включите эмоции", "Используйте словарь из этого модуля", "Опишите обстановку кафе"],
        },
      ],
      content: "PDF with prompts, examples.",
      content_ru: "PDF с заданиями, примерами.",
      hint: "Use guided task for practice. Include emotions in Travel Journal.",
      hint_ru: "Используйте направляемое задание для практики. Включите эмоции в дневник путешествий.",
    },
    cultural: {
      title: "Tallinn's Old Town",
      title_ru: "Старый город Таллинна",
      content:
        "Tallinn's Old Town (UNESCO World Heritage site) features medieval streets and cafés serving traditional Estonian treats like kohuke. Politeness with words like 'palun' and 'aitäh' is highly valued in Estonian culture. Handshakes are common when meeting someone new.",
      content_ru:
        "Старый город Таллинна (объект Всемирного наследия ЮНЕСКО) включает средневековые улицы и кафе, подающие традиционные эстонские лакомства, такие как кохуке. Вежливость со словами как 'palun' и 'aitäh' высоко ценится в эстонской культуре. Рукопожатия обычны при знакомстве с новыми людьми.",
      souvenir: {
        name: "Kohuke Recipe",
        name_ru: "Рецепт кохуке",
        description: "Learn to make Estonia's beloved curd snack",
        description_ru: "Научитесь готовить любимую эстонскую творожную закуску",
        downloadUrl: "/downloads/kohuke-recipe.pdf",
      },
      hint: "Read note, try recipe, save photo.",
      hint_ru: "Прочитайте заметку, попробуйте рецепт, сохраните фото.",
    },
    quiz: [
      {
        id: 1,
        type: "multiple-choice",
        question: "What does 'aitäh' mean?",
        question_ru: "Что означает 'aitäh'?",
        options: ["Hello", "Thank you", "Goodbye", "Please"],
        options_ru: ["Привет", "Спасибо", "До свидания", "Пожалуйста"],
        answer: "Thank you",
      },
      {
        id: 2,
        type: "fill-blank",
        question: "Sina ___ õpilane.",
        question_ru: "Sina ___ õpilane.",
        answer: "oled",
        hint: "Use the correct form of 'olema' for 'sina'",
        hint_ru: "Используйте правильную форму 'olema' для 'sina'",
      },
      {
        id: 3,
        type: "translation",
        question: "Translate: 'What is your name?'",
        question_ru: "Переведите: 'Как тебя зовут?'",
        answer: "Mis sinu nimi on?",
      },
      {
        id: 4,
        type: "true-false",
        question: "'Tere hommikust' means good evening.",
        question_ru: "'Tere hommikust' означает добрый вечер.",
        answer: "false",
      },
      {
        id: 5,
        type: "listening",
        question: "Listen: What does Liis say?",
        question_ru: "Слушайте: Что говорит Лийс?",
        options: ["Tere! Minu nimi on Liis.", "Nägemist!", "Kuidas läheb?", "Aitäh!"],
        options_ru: ["Tere! Minu nimi on Liis.", "Nägemist!", "Kuidas läheb?", "Aitäh!"],
        answer: "Tere! Minu nimi on Liis.",
        audioUrl: "/audio/quiz-listening-1.mp3",
      },
      {
        id: 6,
        type: "conjugate",
        question: "Conjugate: Tema ___ väsinud.",
        question_ru: "Проспрягайте: Tema ___ väsinud.",
        answer: "on",
      },
      {
        id: 7,
        type: "match",
        question: "Match: Nägemist →",
        question_ru: "Сопоставьте: Nägemist →",
        options: ["Hello", "Thank you", "Goodbye", "Please"],
        options_ru: ["Привет", "Спасибо", "До свидания", "Пожалуйста"],
        answer: "Goodbye",
      },
      {
        id: 8,
        type: "write",
        question: "Write: Ma olen [your job/status].",
        question_ru: "Напишите: Ma olen [ваша работа/статус].",
        answer: "Ma olen [õpilane/töötaja]",
      },
      {
        id: 9,
        type: "listening",
        question: "Listen: Is the learner happy?",
        question_ru: "Слушайте: Счастлив ли учащийся?",
        options: ["Yes", "No", "Not mentioned"],
        options_ru: ["Да", "Нет", "Не упоминается"],
        answer: "Yes",
        audioUrl: "/audio/quiz-listening-2.mp3",
      },
      {
        id: 10,
        type: "translation",
        question: "Translate: 'I am happy.'",
        question_ru: "Переведите: 'Я счастлив.'",
        answer: "Ma olen õnnelik.",
      },
    ],
    missionChallenge: {
      title: "Welcome Poster Challenge",
      title_ru: "Вызов приветственного плаката",
      description: "Create a 'Welcome Poster' for a Tallinn café using 5 vocabulary words from this module.",
      description_ru:
        "Создайте 'Приветственный плакат' для таллиннского кафе, используя 5 словарных слов из этого модуля.",
      requirements: [
        "Use at least 5 vocabulary words from this module",
        "Include 'tere' and 'palun' in your design",
        "Draw or describe your poster",
        "Share in Travel Journal",
      ],
      requirements_ru: [
        "Используйте не менее 5 словарных слов из этого модуля",
        "Включите 'tere' и 'palun' в ваш дизайн",
        "Нарисуйте или опишите ваш плакат",
        "Поделитесь в дневнике путешествий",
      ],
      hint: "Use tere, palun. Share to connect with other learners.",
      hint_ru: "Используйте tere, palun. Делитесь, чтобы общаться с другими учащимися.",
    },
    mapPosition: { x: 59.4, y: 24.7 },
  },
  // Additional modules with basic structure
  {
    id: 2,
    title: "Tartu's University",
    subtitle: "Daily Routines",
    level: "A1",
    duration: "3 hours",
    description: "Master daily routine vocabulary while exploring Estonia's academic heart and the Emajõgi River.",
    location: "Tartu",
    region: "Tartu",
    videoUrl: "/videos/tartu-story.mp4",
    story: {
      text: "You arrive in Tartu, where the Emajõgi River sparkles near the lively university campus...",
      hint: "Note routine words and time expressions.",
      characters: ["Liis", "You"],
      mission: "Learn daily routines and time expressions in Estonia's university town.",
    },
    vocabulary: [
      { word: "Hommik", translation: "Morning", example: "Hommik on ilus.", audioUrl: "/audio/hommik.mp3" },
      { word: "Õhtu", translation: "Evening", example: "Õhtu on rahulik.", audioUrl: "/audio/ohtu.mp3" },
    ],
    grammar: {
      title: "Present Tense Verbs and Time Adverbs",
      explanation: "Regular verbs conjugate predictably in Estonian. Time adverbs indicate when actions occur.",
      rules: ["Present tense formation: stem + endings (-n, -d, -b)", "Time adverbs: hommikul, õhtul, päeval"],
      examples: [
        { estonian: "Ma söön hommikusööki.", english: "I eat breakfast." },
        { estonian: "Sina magad õhtul.", english: "You sleep in the evening." },
      ],
      exercises: [
        {
          type: "fill-blank",
          question: "Mina ___ (sööma) hommikusööki.",
          answer: "söön",
        },
      ],
    },
    pronunciation: {
      focus: "Time expressions and verb endings",
      minimalPairs: ["hommik vs. õhtu"],
      exercises: [
        {
          type: "shadow",
          instruction: "Repeat time expressions",
          content: "hommikul, õhtul, päeval",
        },
      ],
      content: "Audio with time expressions",
      hint: "Practice time adverbs daily",
    },
    listening: {
      audioUrl: "/audio/tartu-dialogue.mp3",
      transcript: "Basic dialogue about daily routines",
      questions: [
        {
          question: "When does the person wake up?",
          type: "multiple-choice",
          options: ["Morning", "Evening", "Night"],
          answer: "Morning",
        },
      ],
      content: "MP3 with daily routine dialogue",
      hint: "Listen for time expressions",
    },
    speaking: {
      exercises: [
        {
          type: "repeat",
          prompt: "Repeat daily routine phrases",
          expectedResponse: "Ma ärkan hommikul",
        },
      ],
      content: "Speaking exercises for routines",
      hint: "Practice daily routine vocabulary",
    },
    reading: {
      text: "Short text about university life in Tartu",
      questions: [
        {
          question: "What is Tartu known for?",
          type: "short-answer",
          answer: "University",
        },
      ],
      hint: "Focus on routine vocabulary",
    },
    writing: {
      exercises: [
        {
          type: "guided",
          prompt: "Write about your daily routine",
          wordLimit: 60,
          hints: ["Use time expressions", "Include different activities"],
        },
      ],
      content: "Writing prompts for daily routines",
      hint: "Use time adverbs in your writing",
    },
    cultural: {
      title: "University of Tartu",
      content: "The University of Tartu (1632) is one of the oldest universities in Northern Europe.",
      souvenir: {
        name: "Estonian Bread Recipe",
        description: "Traditional black bread recipe",
        downloadUrl: "/downloads/leib-recipe.pdf",
      },
      hint: "Learn about Estonian education",
    },
    quiz: [
      {
        id: 1,
        type: "multiple-choice",
        question: "What does 'hommik' mean?",
        options: ["Evening", "Morning", "Night", "Day"],
        answer: "Morning",
      },
    ],
    missionChallenge: {
      title: "Daily Schedule Challenge",
      description: "Create a daily schedule using Estonian time expressions",
      requirements: ["Use time adverbs", "Include 5 daily activities", "Share your schedule"],
      hint: "Practice time expressions",
    },
    mapPosition: { x: 58.4, y: 26.7 },
  },
  {
    id: 3,
    title: "Saaremaa Island",
    subtitle: "Family and Friends",
    level: "A1",
    duration: "3 hours",
    description: "Discover family vocabulary in the windmill-dotted landscapes of Estonia's largest island.",
    location: "Saaremaa",
    region: "Saare",
    videoUrl: "/videos/saaremaa-story.mp4",
    story: {
      text: "You arrive at a Saaremaa farmhouse, where windmills spin and traditional life continues...",
      hint: "Note family words and possessive pronouns.",
      characters: ["Liis", "You", "Family members"],
      mission: "Learn family vocabulary and possessive pronouns on Estonia's largest island.",
    },
    vocabulary: [
      { word: "Ema", translation: "Mother", example: "Minu ema on ilus.", audioUrl: "/audio/ema.mp3" },
      { word: "Isa", translation: "Father", example: "Minu isa on suur.", audioUrl: "/audio/isa.mp3" },
    ],
    grammar: {
      title: "Possessive Pronouns and Nominative Case",
      explanation: "Possessive pronouns indicate ownership and precede nouns.",
      rules: ["Possessive pronouns: minu (my), sinu (your), tema (his/her)", "No agreement needed with nouns"],
      examples: [
        { estonian: "Minu ema on ilus.", english: "My mother is beautiful." },
        { estonian: "Sinu vend on suur.", english: "Your brother is big." },
      ],
      exercises: [
        {
          type: "fill-blank",
          question: "___ ema on kodus.",
          answer: "Minu",
        },
      ],
    },
    pronunciation: {
      focus: "Family vocabulary and possessive pronouns",
      minimalPairs: ["ema vs. isa"],
      exercises: [
        {
          type: "shadow",
          instruction: "Repeat family words",
          content: "ema, isa, õde, vend",
        },
      ],
      content: "Audio with family vocabulary",
      hint: "Practice possessive pronouns",
    },
    listening: {
      audioUrl: "/audio/saaremaa-dialogue.mp3",
      transcript: "Dialogue about family members",
      questions: [
        {
          question: "Who is mentioned in the family?",
          type: "multiple-choice",
          options: ["Mother", "Father", "Both"],
          answer: "Both",
        },
      ],
      content: "MP3 with family dialogue",
      hint: "Listen for family vocabulary",
    },
    speaking: {
      exercises: [
        {
          type: "repeat",
          prompt: "Repeat family introductions",
          expectedResponse: "Minu ema on...",
        },
      ],
      content: "Speaking exercises for family",
      hint: "Practice family introductions",
    },
    reading: {
      text: "Short text about family life on Saaremaa",
      questions: [
        {
          question: "What is Saaremaa known for?",
          type: "short-answer",
          answer: "Windmills and traditional life",
        },
      ],
      hint: "Focus on family vocabulary",
    },
    writing: {
      exercises: [
        {
          type: "guided",
          prompt: "Write about your family",
          wordLimit: 60,
          hints: ["Use possessive pronouns", "Include family members"],
        },
      ],
      content: "Writing prompts for family",
      hint: "Use possessive pronouns",
    },
    cultural: {
      title: "Saaremaa Island Culture",
      content: "Saaremaa is Estonia's largest island, famous for its medieval windmills and strong family traditions.",
      souvenir: {
        name: "Estonian Folk Song - Mere Poeg",
        description: "Traditional song about the sea's son",
        downloadUrl: "/downloads/mere-poeg.mp3",
      },
      hint: "Learn about island traditions",
    },
    quiz: [
      {
        id: 1,
        type: "multiple-choice",
        question: "What does 'õde' mean?",
        options: ["Brother", "Sister", "Mother", "Friend"],
        answer: "Sister",
      },
    ],
    missionChallenge: {
      title: "Family Tree Challenge",
      description: "Create a family tree using Estonian family vocabulary",
      requirements: ["Use family vocabulary", "Include possessive pronouns", "Draw or describe relationships"],
      hint: "Practice family words",
    },
    mapPosition: { x: 58.2, y: 22.5 },
  },
]

// Export the modules (will be dynamic based on admin changes)
export const modules = getModules()
