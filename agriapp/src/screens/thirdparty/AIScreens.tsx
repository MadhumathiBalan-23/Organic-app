import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import {
  Sprout, Zap, Mic, Send, Play, Pause, Bot,
  Volume2, PhoneOff, Milk, CircleCheck, Clock
} from 'lucide-react-native';

interface AIScreensProps {
  customerScreen: string;
  setCustomerScreen: (screen: string) => void;
}

export const AIScreens: React.FC<AIScreensProps> = ({ customerScreen, setCustomerScreen }) => {

  // 1. WHATSAPP AI ASSISTANT VIEW
  const WhatsAppAIView = () => {
    const [wsMessages, setWsMessages] = useState<any[]>([
      { id: 'm1', sender: 'AI', isVoice: false, text: 'Hi Ananya! Fresh organic A2 Milk (2L) is packed for tomorrow\'s 6:30 AM drop. Would you like to confirm delivery or send a voice note?', time: '9:00 PM' },
      { id: 'm2', sender: 'AI', isVoice: true, duration: '0:04', text: 'Voice Note: "Hello Ananya, milk dispatch ready for 6:30 AM."', time: '9:01 PM' }
    ]);
    const [intentLog, setIntentLog] = useState<string | null>('PYTHON WHISPER ASR & NLP READY');
    const [customInput, setCustomInput] = useState('');
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [recordingSecs, setRecordingSecs] = useState(3);
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

    const processAIIntent = (text: string, isVoiceInput = false) => {
      const lower = text.toLowerCase();
      let intent = 'GENERAL_QUERY';
      let replyText = 'Our Mathira Organic AI assistant is processing your request!';

      if (lower.includes('confirm') || lower.includes('yes') || lower.includes('send')) {
        intent = 'PYTHON WHISPER ASR -> INTENT: CONFIRM_DISPATCH (99.6% confidence)';
        replyText = 'Great! Your 2L Organic A2 Milk delivery is confirmed for 6:30 AM tomorrow. Track drop status live in app!';
      } else if (lower.includes('skip') || lower.includes('no') || lower.includes('stop')) {
        intent = 'PYTHON WHISPER ASR -> INTENT: SKIP_DELIVERY (98.9% confidence)';
        replyText = 'Understood! Tomorrow\'s milk drop has been skipped. Your wallet will not be charged.';
      } else if (lower.includes('price') || lower.includes('rate') || lower.includes('cost')) {
        intent = 'INTENT: PRODUCT_PRICE_QUERY';
        replyText = 'Organic A2 Cow Milk is ₹85/L. Pure Desi Cow Ghee is ₹680/500ml. Certified 100% pure!';
      } else {
        intent = 'INTENT: CUSTOM_NLP_PARSED';
        replyText = `Thanks! I've noted: "${text}". Our farm team will update your account shortly.`;
      }

      const userMsgId = 'usr_' + Date.now();
      setWsMessages(prev => [
        ...prev,
        {
          id: userMsgId,
          sender: 'USER',
          isVoice: isVoiceInput,
          duration: isVoiceInput ? `0:0${recordingSecs}` : undefined,
          text: isVoiceInput ? `Voice Note Transcript: "${text}"` : text,
          time: 'Now'
        }
      ]);
      setIntentLog('Running Python SpeechRecognition & Whisper ASR model...');

      setTimeout(() => {
        setIntentLog(intent);
        const aiMsgId = 'ai_' + Date.now();
        setWsMessages(prev => [
          ...prev,
          {
            id: aiMsgId,
            sender: 'AI',
            isVoice: isVoiceInput,
            duration: isVoiceInput ? '0:04' : undefined,
            text: isVoiceInput ? `AI Audio Reply: ${replyText}` : replyText,
            time: 'Now'
          }
        ]);
      }, 800);
    };

    const handleSendCustom = () => {
      if (!customInput.trim()) return;
      const text = customInput;
      setCustomInput('');
      processAIIntent(text, false);
    };

    const handleSendVoiceNote = () => {
      setIsRecordingVoice(false);
      processAIIntent('Please skip my milk delivery tomorrow', true);
    };

    const toggleAudioPlay = (id: string) => {
      if (playingAudioId === id) {
        setPlayingAudioId(null);
      } else {
        setPlayingAudioId(id);
        setTimeout(() => setPlayingAudioId(null), 3000);
      }
    };

    return (
      <View className="flex-1 bg-[#ECE5DD]">
        {/* WhatsApp Top Header Bar */}
        <View className="bg-[#075E54] p-3.5 flex-row items-center">
          <TouchableOpacity onPress={() => setCustomerScreen('HOME')} className="pr-2">
            <Text className="text-white text-lg font-bold">←</Text>
          </TouchableOpacity>
          <View className="ml-1 mr-1.5">
            <Sprout size={24} color="#A7F3D0" />
          </View>
          <View className="flex-1">
            <Text className="text-white text-sm font-bold">Mathira Organic AI Bot</Text>
            <View className="flex-row items-center gap-1">
              <Zap size={10} color="#A7F3D0" />
              <Text className="text-emerald-200 text-2xs">Automated Voice & Text Assistant | Verified</Text>
            </View>
          </View>
        </View>

        {/* Message Thread */}
        <ScrollView contentContainerClassName="p-4 gap-3" showsVerticalScrollIndicator={false}>
          {wsMessages.map((m: any) => (
            <View 
              key={m.id} 
              className={`max-w-[80%] p-3 rounded-xl my-1 shadow-sm ${m.sender === 'AI' ? 'self-start bg-white' : 'self-end bg-[#DCF8C6]'}`}
            >
              {/* WhatsApp Native Voice Note Player Component */}
              {m.isVoice ? (
                <View className="gap-1.5">
                  <View className="flex-row items-center gap-2.5">
                    <TouchableOpacity 
                      className={`w-8 h-8 rounded-full justify-center items-center ${m.sender === 'AI' ? 'bg-[#075E54]' : 'bg-[#128C7E]'}`}
                      onPress={() => toggleAudioPlay(m.id)}
                    >
                      {playingAudioId === m.id ? (
                        <Pause size={12} color="#FFF" />
                      ) : (
                        <Play size={12} color="#FFF" />
                      )}
                    </TouchableOpacity>

                    {/* Audio Waveform Bars */}
                    <View className="flex-row items-center gap-0.5 h-8 flex-1 px-1">
                      {[12, 22, 16, 28, 20, 32, 18, 26, 14, 24, 16].map((h, idx) => (
                        <View 
                          key={idx} 
                          style={{ height: playingAudioId === m.id ? Math.min(32, h + 8) : h }}
                          className={`w-0.5 rounded-sm ${playingAudioId === m.id ? 'bg-emerald-500' : 'bg-slate-500'}`}
                        />
                      ))}
                    </View>

                    <Text className="text-2xs font-bold text-slate-500">{m.duration || '0:05'}</Text>
                  </View>
                  <Text className="text-xs text-slate-700 italic mt-0.5">{m.text}</Text>
                </View>
              ) : (
                <Text className="text-xs text-slate-900 leading-4.5">{m.text}</Text>
              )}

              <Text className="text-2xs text-slate-500 self-end mt-1">{m.time} ✓✓</Text>
            </View>
          ))}
        </ScrollView>

        {/* AI Intent Engine Log */}
        {intentLog && (
          <View className="bg-slate-900 p-2.5 border-t border-slate-700 flex-row items-center gap-1.5">
            <Bot size={13} color="#15803D" />
            <Text className="text-2xs text-emerald-400 font-mono flex-1">
              [WHISPER ASR / INTENT]: {intentLog}
            </Text>
          </View>
        )}

        {/* Quick Action Chips */}
        <View className="p-3.5 bg-white border-t border-slate-200 flex-row gap-2">
          {[
            { label: 'Confirm Tomorrow Milk', text: 'Yes, confirm tomorrow milk delivery', color: '#128C7E' },
            { label: 'Skip Delivery', text: 'Please skip my delivery tomorrow', color: '#D97706' },
            { label: 'Check Ghee Offers', text: 'What are the current offers on Desi Ghee?', color: '#25D366' },
          ].map((chip, i) => (
            <TouchableOpacity 
              key={i}
              style={{ borderColor: chip.color }}
              className="flex-1 h-9 rounded-full border justify-center items-center px-1"
              onPress={() => processAIIntent(chip.text, false)}
            >
              <Text style={{ color: chip.color }} className="font-bold text-xs text-center" numberOfLines={1}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Interactive Voice Recorder / Text Input Bar */}
        {isRecordingVoice ? (
          <View className="p-2.5 bg-red-50 border-t border-red-300 flex-row gap-2.5 items-center">
            <View className="flex-row items-center gap-2 flex-1">
              <View className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <Text className="text-red-600 font-bold text-xs">Recording Audio Voice Note... 0:0{recordingSecs}</Text>
            </View>
            <TouchableOpacity className="px-2.5 py-1.5" onPress={() => setIsRecordingVoice(false)}>
              <Text className="text-slate-500 text-xs font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-emerald-700 px-3.5 py-2 rounded-2xl flex-row items-center gap-1.5" onPress={handleSendVoiceNote}>
              <Send size={12} color="#FFF" />
              <Text className="text-white font-bold text-xs">Send Voice</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-2.5 bg-white border-t border-slate-200 flex-row gap-2 items-center">
            <TextInput
              className="flex-1 h-10 bg-slate-100 rounded-full px-4 text-xs text-slate-900"
              placeholder="Type message or send voice note..."
              value={customInput}
              onChangeText={setCustomInput}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity className="w-9 h-9 rounded-full bg-slate-200 justify-center items-center" onPress={() => setIsRecordingVoice(true)}>
              <Mic size={17} color="#075E54" />
            </TouchableOpacity>
            <TouchableOpacity className="bg-[#075E54] px-4 py-2.5 rounded-full justify-center items-center flex-row gap-1" onPress={handleSendCustom}>
              <Send size={14} color="#FFF" />
              <Text className="text-white font-bold text-xs">Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // 2. VOICE AI CALL SIMULATOR VIEW
  const AIVoiceCallView = () => {
    const [callActive, setCallActive] = useState(true);
    const [dialogue, setDialogue] = useState('Voice AI: "Hello Ananya! This is Mathira Organic Voice AI. Your 2L A2 Milk drop is scheduled for tomorrow 6:30 AM. Do you confirm?"');
    const [language, setLanguage] = useState<'EN' | 'TA' | 'HI'>('EN');

    const switchLanguagePrompt = (lang: 'EN' | 'TA' | 'HI') => {
      setLanguage(lang);
      if (lang === 'TA') {
        setDialogue('Voice AI (Tamil): "வணக்கம் அனன்யா! நாளை காலை 6:30 மணிக்கு உங்கள் 2L ஆர்கானிக் பால் விநியோகம் உறுதி செய்யவா?"');
      } else if (lang === 'HI') {
        setDialogue('Voice AI (Hindi): "नमस्ते अनन्या! कल सुबह 6:30 बजे आपके 2 लीटर जैविक दूध की डिलीवरी पक्की करें?"');
      } else {
        setDialogue('Voice AI (English): "Hello Ananya! Your 2L Organic A2 Milk drop is scheduled for tomorrow 6:30 AM. Do you confirm?"');
      }
    };

    return (
      <View className="flex-1 bg-[#0D2B1D]">
        <View className="p-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => setCustomerScreen('HOME')}>
            <Text className="text-white text-sm font-bold">← End Call</Text>
          </TouchableOpacity>
          
          {/* Language Selector */}
          <View className="flex-row gap-1.5">
            {(['EN', 'TA', 'HI'] as const).map(l => (
              <TouchableOpacity
                key={l}
                className={`px-2.5 py-1 rounded-xl ${language === l ? 'bg-emerald-500' : 'bg-white/15'}`}
                onPress={() => switchLanguagePrompt(l)}
              >
                <Text className={`text-xs font-bold ${language === l ? 'text-white' : 'text-emerald-200'}`}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View className="flex-1 items-center justify-center p-6">
          <View className="w-20 h-20 rounded-full bg-emerald-700 border-2 border-emerald-300 items-center justify-center">
            <Mic size={40} color="#FFFFFF" />
          </View>
          <Text className="text-white text-lg font-bold mt-3">Mathira Voice AI Assistant</Text>
          <View className="flex-row items-center gap-1 mt-1">
            {callActive && <Zap size={12} color="#A7F3D0" />}
            <Text className="text-emerald-200 text-xs">
              {callActive ? 'Real-time Neural Voice Dispatch Active' : 'Call Ended'}
            </Text>
          </View>
          
          {callActive && (
            <View className="flex-row gap-2 my-6 items-center">
              {[28, 60, 42, 80, 50, 30, 70, 35].map((h, idx) => (
                <View key={idx} style={{ height: h }} className="w-1 bg-emerald-300 rounded-sm" />
              ))}
            </View>
          )}

          <View className="bg-white/10 rounded-xl p-3.5 w-full border border-white/15">
            <Text className="text-emerald-200 text-xs font-mono leading-5">{dialogue}</Text>
          </View>
        </View>

        {/* Call Controls */}
        <View className="p-5 bg-black/30 gap-3">
          {callActive ? (
            <>
              <TouchableOpacity 
                className="bg-emerald-300 py-3 rounded-full items-center justify-center flex-row gap-1.5"
                onPress={() => {
                  setDialogue('Customer Speech Detected: "Yes, confirm tomorrow delivery"');
                  setTimeout(() => {
                    setDialogue('Voice AI: "Thank you! 2L Organic Milk is confirmed for 6:30 AM tomorrow. Have a great day!"');
                  }, 1200);
                }}
              >
                <Volume2 size={15} color="#0D2B1D" />
                <Text className="text-[#0D2B1D] font-bold text-xs">Voice Response ("Yes, Confirm Delivery")</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-amber-100 py-3 rounded-full items-center justify-center flex-row gap-1.5"
                onPress={() => {
                  setDialogue('Customer Speech Detected: "Skip tomorrow drop"');
                  setTimeout(() => {
                    setDialogue('Voice AI: "Understood! Tomorrow\'s drop is cancelled. Your account won\'t be charged."');
                  }, 1200);
                }}
              >
                <Volume2 size={15} color="#B45309" />
                <Text className="text-amber-700 font-bold text-xs">Voice Response ("Skip Tomorrow Drop")</Text>
              </TouchableOpacity>

              <TouchableOpacity className="bg-red-600 py-3 rounded-full items-center justify-center flex-row gap-1.5" onPress={() => setCallActive(false)}>
                <PhoneOff size={16} color="#FFFFFF" />
                <Text className="text-white font-bold text-sm">Hang Up</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              className="bg-emerald-700 py-3 rounded-full items-center justify-center"
              onPress={() => {
                setCallActive(true);
                switchLanguagePrompt(language);
              }}
            >
              <Text className="text-white font-bold text-sm">Redial Voice AI Assistant</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // 3. DAILY CONFIRMATION CHECKLIST VIEW
  const DailyConfirmationView = () => {
    const [dailyStatus, setDailyStatus] = useState<'PENDING' | 'CONFIRMED' | 'SKIPPED'>('PENDING');

    return (
      <ScrollView contentContainerClassName="p-4">
        <TouchableOpacity onPress={() => setCustomerScreen('HOME')} className="mb-3">
          <Text className="text-emerald-700 text-xs font-bold">← Back to Home</Text>
        </TouchableOpacity>
        
        <View className="items-center py-5">
          <View className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 items-center justify-center">
            <Milk size={38} color="#15803D" />
          </View>
          <Text className="text-xl font-bold text-slate-900 mt-3">Tomorrow's Milk Dispatch</Text>
          <Text className="text-xs text-slate-500 text-center my-3 leading-5">
            Your regular 2 Litres of Fresh Organic Milk is scheduled to arrive tomorrow morning at <Text className="font-bold text-emerald-700">6:30 AM</Text>.
          </Text>

          {dailyStatus === 'PENDING' && (
            <View className="w-full gap-3 mt-2.5">
              <TouchableOpacity 
                className="w-full h-11 bg-emerald-700 rounded-full items-center justify-center" 
                onPress={() => setDailyStatus('CONFIRMED')}
              >
                <Text className="text-white text-sm font-bold">Confirm Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="w-full h-11 rounded-full border border-amber-600 items-center justify-center" 
                onPress={() => setDailyStatus('SKIPPED')}
              >
                <Text className="text-amber-600 text-sm font-bold">Skip Delivery Today</Text>
              </TouchableOpacity>
            </View>
          )}

          {dailyStatus === 'CONFIRMED' && (
            <View className="p-5 rounded-2xl bg-emerald-50 items-center w-full border border-emerald-300 my-3">
              <CircleCheck size={32} color="#15803D" />
              <Text className="text-emerald-700 font-bold text-sm my-1">Delivery Confirmed</Text>
              <Text className="text-slate-600 text-xs">Order dispatched under code RECUR-4921</Text>
            </View>
          )}

          {dailyStatus === 'SKIPPED' && (
            <View className="p-5 rounded-2xl bg-amber-50 items-center w-full border border-amber-200 my-3">
              <Clock size={32} color="#D97706" />
              <Text className="text-amber-600 font-bold text-sm my-1">Delivery Skipped</Text>
              <Text className="text-amber-600 text-xs">You will not be charged. Subscription remains active.</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => setCustomerScreen('MY_SUBSCRIPTIONS')} className="mt-6">
            <Text className="text-emerald-700 underline text-xs font-bold">Manage All Subscriptions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  switch (customerScreen) {
    case 'WHATSAPP_AI':
      return <WhatsAppAIView />;
    case 'AI_VOICE_CALL':
      return <AIVoiceCallView />;
    case 'DAILY_CONFIRMATION':
      return <DailyConfirmationView />;
    default:
      return null;
  }
};
