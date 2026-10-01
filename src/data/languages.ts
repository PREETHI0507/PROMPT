export type SupportedLanguageCode =
  | 'ta-IN'
  | 'hi-IN'
  | 'te-IN'
  | 'bn-IN'
  | 'mr-IN'
  | 'kn-IN';

export interface LanguageConfig {
  code: SupportedLanguageCode;
  name: string;
  englishName: string;
  nativeScript: string;
  greetingText: string;
  explanationText: string;
  questionText: string;
  voiceName: string; // Prebuilt voice
  sampleQueries: {
    label: string;
    text: string;
    meaning: string;
  }[];
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  {
    code: 'ta-IN',
    name: 'தமிழ்',
    englishName: 'Tamil',
    nativeScript: 'தமிழ்',
    greetingText: 'வணக்கம். நான் உங்களுக்கு உதவ வந்திருக்கிறேன்.',
    explanationText: 'அரசு திட்டத்தின் பெயர் உங்களுக்கு தெரிய வேண்டிய அவசியமில்லை.',
    questionText: 'உங்களுக்கு என்ன உதவி வேண்டும் என்று சொல்லுங்கள். நான் உங்களை படிப்படியாக வழிகாட்டுகிறேன்.',
    voiceName: 'Kore',
    sampleQueries: [
      {
        label: 'மகள் படிப்பு உதவி',
        text: 'என் மகளுக்கு படிப்புக்கு அரசு உதவி வேண்டும்.',
        meaning: 'I need government scholarship/education help for my daughter.',
      },
      {
        label: 'சிறு தொழில் உதவி',
        text: 'நான் வீட்டில் இருந்தே ஒரு சிறிய தொழில் தொடங்க விரும்புகிறேன்.',
        meaning: 'I want to start a small livelihood business at home.',
      },
      {
        label: 'பிரசவ / தாய்மை உதவி',
        text: 'நான் கர்ப்பமாக இருக்கிறேன். எனக்கு அரசு மருத்துவ உதவி கிடைக்குமா?',
        meaning: 'I am pregnant and looking for maternal nutrition and medical assistance.',
      },
      {
        label: 'விவசாய உதவி',
        text: 'எங்கள் விவசாய நிலத்திற்கு அல்லது பயிர்களுக்கு அரசு நிதி உதவி உள்ளதா?',
        meaning: 'Are there agriculture subsidies or financial support for rural women farmers?',
      },
    ],
  },
  {
    code: 'hi-IN',
    name: 'हिन्दी',
    englishName: 'Hindi',
    nativeScript: 'हिन्दी',
    greetingText: 'नमस्ते। मैं आपकी सहायता करने के लिए यहाँ हूँ।',
    explanationText: 'आपको किसी सरकारी योजना का नाम याद रखने की ज़रूरत नहीं है।',
    questionText: 'आप बस अपनी ज़रूरत बताइए। मैं आपको हर कदम पर समझाऊँगी।',
    voiceName: 'Zephyr',
    sampleQueries: [
      {
        label: 'बेटी की पढ़ाई',
        text: 'मेरी बेटी की पढ़ाई के लिए सरकारी छात्रवृत्ति या सहायता चाहिए।',
        meaning: 'I need government education scholarship support for my daughter.',
      },
      {
        label: 'छोटा कारोबार',
        text: 'मैं सिलाई या छोटा व्यापार शुरू करना चाहती हूँ, क्या मदद मिल सकती है?',
        meaning: 'I want to start tailoring or a small trade, what help is available?',
      },
      {
        label: 'मातृत्व व पोषण सहायता',
        text: 'मैं गर्भवती हूँ, क्या सरकार से पौष्टिक आहार और आर्थिक मदद मिलती है?',
        meaning: 'I am pregnant, does the government provide maternal nutrition help?',
      },
      {
        label: 'पक्का मकान / आवास',
        text: 'मुझे अपने परिवार के लिए पक्के मकान की सरकारी सहायता चाहिए।',
        meaning: 'I need government rural housing assistance for my family.',
      },
    ],
  },
  {
    code: 'te-IN',
    name: 'తెలుగు',
    englishName: 'Telugu',
    nativeScript: 'తెలుగు',
    greetingText: 'నమస్కారం. నేను మీకు సహాయం చేయడానికి ఇక్కడే ఉన్నాను.',
    explanationText: 'మీకు ప్రభుత్వ పథకం పేరు తెలియాల్సిన అవసరం లేదు.',
    questionText: 'మీకు ఎలాంటి సహాయం కావాలో చెప్పండి. నేను మీకు సులభంగా వివరిస్తాను.',
    voiceName: 'Kore',
    sampleQueries: [
      {
        label: 'కూతురి చదువు',
        text: 'నా కూతురి ఉన్నత చదువు కోసం ప్రభుత్వ ఆర్థిక సహాయం కావాలి.',
        meaning: 'I need government education help for my daughter.',
      },
      {
        label: 'స్వయం ఉపాధి / రుణం',
        text: 'నేను స్వయం సహాయక సంఘం ద్వారా వ్యాపారం ప్రారంభించాలనుకుంటున్నాను.',
        meaning: 'I want to start a business through a Self Help Group.',
      },
      {
        label: 'గర్భిణీ స్త్రీల సహాయం',
        text: 'గర్భిణీ స్త్రీలకు ప్రభుత్వం ఇచ్చే పోషకాహార పథకాలు ఏమిటి?',
        meaning: 'What are the government nutritional schemes for pregnant women?',
      },
    ],
  },
  {
    code: 'bn-IN',
    name: 'বাংলা',
    englishName: 'Bengali',
    nativeScript: 'বাংলা',
    greetingText: 'নমস্কার। আমি আপনাকে সাহায্য করতে এসেছি।',
    explanationText: 'আপনাকে কোনো সরকারি প্রকল্পের নাম মনে রাখতে হবে না।',
    questionText: 'আপনার কী সাহায্য দরকার শুধু বলুন। আমি ধাপে ধাপে বুঝিয়ে দেব।',
    voiceName: 'Zephyr',
    sampleQueries: [
      {
        label: 'মেয়ের পড়াশোনা',
        text: 'আমার মেয়ের উচ্চশিক্ষার জন্য সরকারি বৃত্তির সুবিধা চাই।',
        meaning: 'I need government scholarship for my daughter’s higher education.',
      },
      {
        label: 'ছোট ব্যবসা ও ঋণ',
        text: 'আমি স্বনির্ভর গোষ্ঠী থেকে ছোট কাজ শুরু করতে সাহায্য চাই।',
        meaning: 'I want help from self-help groups to start a small venture.',
      },
      {
        label: 'মাতৃত্বকালীন সহায়তা',
        text: 'গর্ভবতী মহিলাদের জন্য কী কী সরকারি সহায়তা পাওয়া যায়?',
        meaning: 'What government maternal support schemes are available?',
      },
    ],
  },
  {
    code: 'mr-IN',
    name: 'मराठी',
    englishName: 'Marathi',
    nativeScript: 'मराठी',
    greetingText: 'नमस्कार. मी तुम्हाला मदत करण्यासाठी येथे आहे.',
    explanationText: 'तुम्हाला कोणत्याही सरकारी योजनेचे नाव माहित असण्याची गरज नाही.',
    questionText: 'तुम्हाला नेमकी काय मदत हवी आहे ते सांगा. मी तुम्हाला मार्गदर्शन करेन.',
    voiceName: 'Zephyr',
    sampleQueries: [
      {
        label: 'मुलीचे शिक्षण',
        text: 'माझ्या मुलीच्या शिक्षणासाठी सरकारी शिष्यवृत्ती हवी आहे.',
        meaning: 'I need government scholarship for my daughter’s education.',
      },
      {
        label: 'लघुउद्योग / बचत गट',
        text: 'मला बचत गटाच्या माध्यमातून स्वतःचा व्यवसाय सुरू करायचा आहे.',
        meaning: 'I want to start my own livelihood business through a savings group.',
      },
      {
        label: 'मातृत्व व आरोग्य योजना',
        text: 'गरोदर महिलांसाठी शासनाकडून मिळणाऱ्या आर्थिक व पोषण मदतीबद्दल सांगा.',
        meaning: 'Tell me about financial and nutritional schemes for pregnant mothers.',
      },
    ],
  },
  {
    code: 'kn-IN',
    name: 'ಕನ್ನಡ',
    englishName: 'Kannada',
    nativeScript: 'ಕನ್ನಡ',
    greetingText: 'ನಮಸ್ಕಾರ. ನಾನು ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇನೆ.',
    explanationText: 'ಸರ್ಕಾರದ ಯೋಜನೆಯ ಹೆಸರು ನಿಮಗೆ ತಿಳಿದಿರಬೇಕಾಗಿಲ್ಲ.',
    questionText: 'ನಿಮಗೆ ಯಾವ ರೀತಿಯ ನೆರವು ಬೇಕು ಎಂದು ಮಾತನಾಡಿ. ನಾನು ಹಂತ ಹಂತವಾಗಿ ಮಾರ್ಗದರ್ಶನ ಮಾಡುತ್ತೇನೆ.',
    voiceName: 'Kore',
    sampleQueries: [
      {
        label: 'ಮಗಳ ಶಿಕ್ಷಣ',
        text: 'ನನ್ನ ಮಗಳ ಶಿಕ್ಷಣಕ್ಕಾಗಿ ಸರ್ಕಾರದ ನೆರವು ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನ ಬೇಕಾಗಿದೆ.',
        meaning: 'I need government education scholarship for my daughter.',
      },
      {
        label: 'ಸ್ವಯಂ ಉದ್ಯೋಗ',
        text: 'ಮನೆಯಲ್ಲೇ ಸಣ್ಣ ವ್ಯಾಪಾರ ಪ್ರಾರಂಭಿಸಲು ಸರ್ಕಾರದ ಸಾಲ ಮತ್ತು ತರಬೇತಿ ಸಿಗುತ್ತದೆಯೇ?',
        meaning: 'Can I get government loan and training for a home enterprise?',
      },
      {
        label: 'ಗರ್ಭಿಣಿಯರ ಸಹಾಯ',
        text: 'ಗರ್ಭಿಣಿಯರಿಗೆ ಸಿಗುವ ಸರ್ಕಾರದ ಪೌಷ್ಟಿಕಾಂಶ ಮತ್ತು ಆರ್ಥಿಕ ನೆರವು ಯಾವುದು?',
        meaning: 'What nutritional and cash support is provided for pregnant women?',
      },
    ],
  },
];

export function getLanguageConfig(code: SupportedLanguageCode): LanguageConfig {
  const found = SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
  return found || SUPPORTED_LANGUAGES[0];
}
