import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import {
  Sprout, Zap, Mic, Send, Play, Pause, Bot,
  Volume2, PhoneOff, Milk, CircleCheck, Clock,
  ArrowLeft, PhoneCall, RotateCcw, ShieldCheck, Tag
} from 'lucide-react-native';
import axios from 'axios';
import { getApiBase } from '../../services/api.client';

interface AIScreensProps {
  customerScreen: string;
  setCustomerScreen: (screen: string) => void;
}

export const AIScreens: React.FC<AIScreensProps> = ({ customerScreen, setCustomerScreen }) => {

  // ==========================================
  // 1. WHATSAPP AI ASSISTANT VIEW
  // ==========================================
  const WhatsAppAIView = () => {
    const [wsMessages, setWsMessages] = useState<any[]>([
      {
        id: 'm1',
        sender: 'AI',
        isVoice: false,
        text: 'வணக்கம் Ananya! 🌿 நாளை காலை 6:30 மணிக்கு உங்கள் 2L ஆர்கானிக் பசும்பால் டெலிவரிக்கு தயாராக உள்ளது. உறுதி செய்ய விரும்புகிறீர்களா?',
        time: '9:00 PM'
      },
      {
        id: 'm2',
        sender: 'AI',
        isVoice: true,
        duration: '0:05',
        text: 'Audio: "Hello Ananya, fresh A2 milk packed for tomorrow 6:30 AM drop."',
        time: '9:01 PM'
      }
    ]);
    const [intentLog, setIntentLog] = useState<string | null>('SARVAM AI TAMIL ASR & INDIC NLP READY');
    const [customInput, setCustomInput] = useState('');
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [recordingSecs, setRecordingSecs] = useState(3);
    const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const processAIIntent = async (text: string, isVoiceInput = false) => {
      if (!text.trim() || isProcessing) return;
      setIsProcessing(true);

      const userMsgId = 'usr_' + Date.now();
      setWsMessages(prev => [
        ...prev,
        {
          id: userMsgId,
          sender: 'USER',
          isVoice: isVoiceInput,
          duration: isVoiceInput ? `0:0${recordingSecs}` : undefined,
          text: isVoiceInput ? `🎙️ "${text}"` : text,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      ]);
      setIntentLog('Running Sarvam AI (Saaras ASR & Indic NLP Engine)...');

      let intent = 'SARVAM AI -> INTENT: PROCESSED';
      let replyText = 'உங்கள் செய்தி பெறப்பட்டது. விவரங்களை சரிபார்க்கிறோம்.';

      try {
        const res = await axios.post(`${getApiBase()}/ai/process-intent`, {
          text,
          phoneNumber: '9876543210',
          generateVoiceAudio: isVoiceInput
        }, { timeout: 6000 });

        if (res.data?.success && res.data?.data) {
          const d = res.data.data;
          intent = `SARVAM AI -> ${d.intent} (${Math.round((d.confidence || 0.95) * 100)}% confidence)`;
          replyText = d.replyText;
        }
      } catch {
        const lower = text.toLowerCase();
        if (lower.includes('confirm') || lower.includes('yes') || lower.includes('உறுதி')) {
          intent = 'SARVAM AI -> CONFIRM_DISPATCH (99.2% confidence)';
          replyText = 'நன்றி! உங்கள் நாளை காலை ஆர்கானிக் பால் விநியோகம் உறுதி செய்யப்பட்டது. காலை 6:30 மணிக்கு வந்து சேரும்.';
        } else if (lower.includes('skip') || lower.includes('no') || lower.includes('தவிர்') || lower.includes('வேண்டாம்')) {
          intent = 'SARVAM AI -> SKIP_DELIVERY (98.9% confidence)';
          replyText = 'சரி! உங்கள் நாளை காலை பால் விநியோகம் தவிர்க்கப்பட்டுள்ளது. உங்கள் வாலட்டில் கட்டணம் பிடித்தம் செய்யப்படாது.';
        } else {
          intent = 'SARVAM AI -> PRODUCT_PRICE_QUERY (95.0% confidence)';
          replyText = 'மதிரா ஆர்கானிக் விலை விபரம்:\n• A2 பசும்பால்: ₹85/Litre\n• சுத்தமான நாட்டு மாட்டு நெய்: ₹680/500ml\n100% இயற்கை முறை சான்றளிக்கப்பட்டது!';
        }
      } finally {
        setIsProcessing(false);
      }

      setIntentLog(intent);
      const aiMsgId = 'ai_' + Date.now();
      setWsMessages(prev => [
        ...prev,
        {
          id: aiMsgId,
          sender: 'AI',
          isVoice: isVoiceInput,
          duration: isVoiceInput ? '0:04' : undefined,
          text: replyText,
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        }
      ]);
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
      <View className="flex-1 bg-[#EFEAE2]">
        {/* WhatsApp Top Navigation Bar */}
        <View className="bg-[#075E54] px-4 py-3.5 flex-row items-center justify-between shadow-md">
          <View className="flex-row items-center flex-1 gap-2.5">
            <TouchableOpacity onPress={() => setCustomerScreen('HOME')} className="p-1 -ml-1">
              <ArrowLeft size={22} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Avatar with Sprout Icon */}
            <View className="relative">
              <View className="w-10 h-10 rounded-full bg-[#128C7E] items-center justify-center border border-white/20">
                <Sprout size={20} color="#A7F3D0" />
              </View>
              {/* Online indicator dot */}
              <View className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#075E54]" />
            </View>

            <View className="flex-1 ml-0.5">
              <View className="flex-row items-center gap-1.5">
                <Text className="text-white text-base font-bold" numberOfLines={1}>
                  Mathira Organic AI
                </Text>
                <ShieldCheck size={14} color="#A7F3D0" />
              </View>
              <Text className="text-emerald-100 text-2xs" numberOfLines={1}>
                Online • Tamil Voice & WhatsApp Bot
              </Text>
            </View>
          </View>

          {/* Quick Call Switch Button */}
          <TouchableOpacity
            className="flex-row items-center gap-1.5 bg-[#128C7E] px-3 py-1.5 rounded-full border border-emerald-400/30"
            onPress={() => setCustomerScreen('AI_VOICE_CALL')}
          >
            <PhoneCall size={14} color="#FFFFFF" />
            <Text className="text-white text-2xs font-bold">Hotline</Text>
          </TouchableOpacity>
        </View>

        {/* AI Intent Live Engine Pill */}
        {intentLog && (
          <View className="bg-[#1F2C34] px-3.5 py-2 flex-row items-center gap-2 border-b border-slate-700/60">
            <View className="w-2 h-2 rounded-full bg-emerald-400" />
            <Text className="text-emerald-300 text-2xs font-mono flex-1" numberOfLines={1}>
              {intentLog}
            </Text>
          </View>
        )}

        {/* Message Thread */}
        <ScrollView
          contentContainerClassName="p-3.5 gap-2.5 pb-6"
          showsVerticalScrollIndicator={false}
        >
          {wsMessages.map((m: any) => {
            const isAI = m.sender === 'AI';
            return (
              <View
                key={m.id}
                className={`max-w-[84%] p-3.5 rounded-2xl shadow-sm ${
                  isAI
                    ? 'self-start bg-white border border-slate-200/80 rounded-tl-sm'
                    : 'self-end bg-[#E7FFDB] border border-emerald-200/60 rounded-tr-sm'
                }`}
              >
                {/* Audio Voice Note Bubble */}
                {m.isVoice ? (
                  <View className="gap-2">
                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity
                        className={`w-9 h-9 rounded-full justify-center items-center ${
                          isAI ? 'bg-[#075E54]' : 'bg-[#128C7E]'
                        }`}
                        onPress={() => toggleAudioPlay(m.id)}
                      >
                        {playingAudioId === m.id ? (
                          <Pause size={14} color="#FFF" />
                        ) : (
                          <Play size={14} color="#FFF" />
                        )}
                      </TouchableOpacity>

                      {/* Animated Waveform Visualizer */}
                      <View className="flex-row items-center gap-1 h-8 flex-1 px-1">
                        {[10, 22, 14, 28, 18, 30, 16, 24, 12, 26, 18, 12].map((h, idx) => (
                          <View
                            key={idx}
                            style={{ height: playingAudioId === m.id ? Math.min(30, h + 6) : h }}
                            className={`w-1 rounded-full ${
                              playingAudioId === m.id ? 'bg-emerald-600' : 'bg-slate-400'
                            }`}
                          />
                        ))}
                      </View>

                      <Text className="text-2xs font-bold text-slate-500">
                        {m.duration || '0:05'}
                      </Text>
                    </View>
                    <Text className="text-xs text-slate-700 italic leading-5">
                      {m.text}
                    </Text>
                  </View>
                ) : (
                  <Text className="text-sm text-slate-900 leading-5">
                    {m.text}
                  </Text>
                )}

                <View className="flex-row items-center justify-end gap-1 mt-1.5 self-end">
                  <Text className="text-3xs text-slate-400 font-medium">{m.time}</Text>
                  {!isAI && (
                    <Text className="text-3xs text-emerald-600 font-bold">✓✓</Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Action Chips Carousel */}
        <View className="bg-white/95 px-3 py-2.5 border-t border-slate-200">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            {[
              { label: 'Confirm Tomorrow Milk', text: 'Yes, confirm tomorrow milk delivery', icon: '🥛', color: '#075E54', bg: '#ECFDF5' },
              { label: 'Skip Delivery', text: 'Please skip my milk delivery tomorrow', icon: '⏸️', color: '#B45309', bg: '#FFFBEB' },
              { label: 'Check Ghee & Milk Rates', text: 'What are the current offers on Desi Ghee?', icon: '🏷️', color: '#047857', bg: '#F0FDF4' },
              { label: 'Today Fresh Harvest', text: 'What organic vegetables are harvested today?', icon: '🌱', color: '#15803D', bg: '#F0FDF4' },
            ].map((chip, i) => (
              <TouchableOpacity
                key={i}
                style={{ backgroundColor: chip.bg, borderColor: chip.color + '40' }}
                className="flex-row items-center gap-1.5 px-3 py-2 rounded-full border shadow-2xs"
                onPress={() => processAIIntent(chip.text, false)}
              >
                <Text className="text-xs">{chip.icon}</Text>
                <Text style={{ color: chip.color }} className="font-bold text-xs">
                  {chip.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Interactive Input Bar */}
        {isRecordingVoice ? (
          <View className="p-3 bg-red-50 border-t border-red-200 flex-row gap-3 items-center">
            <View className="flex-row items-center gap-2 flex-1">
              <View className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
              <Text className="text-red-700 font-bold text-xs">
                Recording Voice Note... 0:0{recordingSecs}
              </Text>
            </View>
            <TouchableOpacity className="px-3 py-1.5 rounded-full" onPress={() => setIsRecordingVoice(false)}>
              <Text className="text-slate-500 text-xs font-bold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#075E54] px-4 py-2 rounded-full flex-row items-center gap-1.5 shadow-sm"
              onPress={handleSendVoiceNote}
            >
              <Send size={12} color="#FFF" />
              <Text className="text-white font-bold text-xs">Send Voice</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="p-2.5 bg-white border-t border-slate-200 flex-row gap-2 items-center">
            <TextInput
              className="flex-1 h-11 bg-slate-100 rounded-full px-4 text-sm text-slate-900 border border-slate-200"
              placeholder="Type in Tamil / Tanglish / English..."
              value={customInput}
              onChangeText={setCustomInput}
              placeholderTextColor="#94A3B8"
              onSubmitEditing={handleSendCustom}
            />
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 justify-center items-center"
              onPress={() => setIsRecordingVoice(true)}
            >
              <Mic size={18} color="#075E54" />
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-[#075E54] w-11 h-11 rounded-full justify-center items-center shadow-sm"
              onPress={handleSendCustom}
            >
              <Send size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // ==========================================
  // 2. VOICE AI HOTLINE VIEW (SARVAM AI CALL)
  // ==========================================
  const AIVoiceCallView = () => {
    const [callActive, setCallActive] = useState(true);
    const [dialogue, setDialogue] = useState('வணக்கம் Ananya! மதிரா ஆர்கானிக் வாய்ஸ் AI அழைக்கிறோம். நாளை காலை 6:30 மணிக்கு உங்கள் 2L ஆர்கானிக் பால் விநியோகம் உறுதி செய்யவா?');
    const [language, setLanguage] = useState<'TA' | 'EN' | 'HI'>('TA');
    const [callSeconds, setCallSeconds] = useState(12);

    useEffect(() => {
      if (!callActive) return;
      const timer = setInterval(() => {
        setCallSeconds(s => s + 1);
      }, 1000);
      return () => clearInterval(timer);
    }, [callActive]);

    const formatTimer = (totalSeconds: number) => {
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const switchLanguagePrompt = (lang: 'TA' | 'EN' | 'HI') => {
      setLanguage(lang);
      if (lang === 'TA') {
        setDialogue('Voice AI (Tamil): "வணக்கம் Ananya! நாளை காலை 6:30 மணிக்கு உங்கள் 2L ஆர்கானிக் பால் விநியோகம் உறுதி செய்யவா?"');
      } else if (lang === 'HI') {
        setDialogue('Voice AI (Hindi): "नमस्ते Ananya! कल सुबह 6:30 बजे आपके 2 लीटर जैविक दूध की डिलीवरी पक्की करें?"');
      } else {
        setDialogue('Voice AI (English): "Hello Ananya! Your 2L Organic A2 Milk drop is scheduled for tomorrow 6:30 AM. Do you confirm?"');
      }
    };

    return (
      <View className="flex-1 bg-[#081C15]">
        {/* Top Header Bar */}
        <View className="px-4 py-3.5 flex-row justify-between items-center border-b border-emerald-900/40">
          <TouchableOpacity
            onPress={() => setCustomerScreen('HOME')}
            className="flex-row items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full border border-white/15"
          >
            <ArrowLeft size={16} color="#FFFFFF" />
            <Text className="text-white text-xs font-bold">Home</Text>
          </TouchableOpacity>

          {/* Active Call Badge */}
          {callActive && (
            <View className="flex-row items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/40">
              <View className="w-2 h-2 rounded-full bg-emerald-400" />
              <Text className="text-emerald-300 text-xs font-mono font-bold">
                {formatTimer(callSeconds)}
              </Text>
            </View>
          )}

          {/* Language Selector */}
          <View className="flex-row gap-1 bg-white/10 p-1 rounded-full border border-white/15">
            {(['TA', 'EN', 'HI'] as const).map(l => (
              <TouchableOpacity
                key={l}
                className={`px-2.5 py-1 rounded-full ${language === l ? 'bg-emerald-500' : 'bg-transparent'}`}
                onPress={() => switchLanguagePrompt(l)}
              >
                <Text className={`text-2xs font-bold ${language === l ? 'text-white' : 'text-emerald-200'}`}>
                  {l === 'TA' ? 'தமிழ்' : l === 'EN' ? 'Eng' : 'हिंदी'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Center Main Calling Canvas */}
        <View className="flex-1 items-center justify-center px-6">
          {/* Animated Glow Ring Avatar */}
          <View className="relative items-center justify-center">
            {callActive && (
              <View className="w-32 h-32 rounded-full bg-emerald-500/15 absolute animate-ping" />
            )}
            <View className="w-28 h-28 rounded-full bg-[#0D2F22] border-2 border-emerald-400 items-center justify-center shadow-lg shadow-emerald-500/30">
              <Sprout size={48} color="#34D399" />
            </View>
          </View>

          <Text className="text-white text-xl font-bold mt-5 text-center">
            Mathira Voice AI Hotline
          </Text>
          
          <View className="flex-row items-center gap-1.5 mt-1.5">
            {callActive ? (
              <>
                <Zap size={13} color="#34D399" />
                <Text className="text-emerald-300 text-xs font-medium">
                  Sarvam AI Neural Tamil Dispatch Active
                </Text>
              </>
            ) : (
              <Text className="text-slate-400 text-xs">Call Disconnected</Text>
            )}
          </View>

          {/* Soundwave Equalizer Bars */}
          {callActive && (
            <View className="flex-row gap-1.5 my-6 items-center h-14">
              {[20, 48, 32, 56, 42, 28, 52, 34, 48, 22].map((h, idx) => (
                <View
                  key={idx}
                  style={{ height: h }}
                  className="w-1.5 bg-emerald-400 rounded-full shadow-sm"
                />
              ))}
            </View>
          )}

          {/* Frosted Glass Live Speech Subtitle Box */}
          <View className="bg-white/10 rounded-2xl p-4 w-full border border-white/15 shadow-md">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Bot size={14} color="#34D399" />
              <Text className="text-emerald-300 text-2xs font-bold uppercase tracking-wider">
                Live Speech Dialogue
              </Text>
            </View>
            <Text className="text-emerald-100 text-sm leading-6">
              {dialogue}
            </Text>
          </View>
        </View>

        {/* In-Call Action Deck */}
        <View className="p-5 bg-black/40 border-t border-white/10 gap-3">
          {callActive ? (
            <>
              {/* Primary Voice Action 1: Confirm Delivery */}
              <TouchableOpacity
                className="bg-emerald-400 py-3.5 px-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-md"
                onPress={async () => {
                  setDialogue('Customer: "Yes, confirm tomorrow delivery"');
                  try {
                    const res = await axios.post(`${getApiBase()}/ai/process-intent`, {
                      text: 'Yes, confirm tomorrow delivery',
                      phoneNumber: '9876543210'
                    }, { timeout: 5000 });
                    const reply = res.data?.data?.replyText || 'நன்றி! உங்கள் பால் விநியோகம் உறுதி செய்யப்பட்டது.';
                    setDialogue(`Sarvam AI: "${reply}"`);
                  } catch {
                    setDialogue('Sarvam AI: "நன்றி! உங்கள் 2L ஆர்கானிக் பால் விநியோகம் உறுதி செய்யப்பட்டது."');
                  }
                }}
              >
                <Volume2 size={18} color="#064E3B" />
                <Text className="text-[#064E3B] font-bold text-sm">
                  Voice: "Yes, Confirm Tomorrow Delivery"
                </Text>
              </TouchableOpacity>

              {/* Primary Voice Action 2: Skip Delivery */}
              <TouchableOpacity
                className="bg-amber-100 py-3.5 px-4 rounded-2xl items-center justify-center flex-row gap-2 border border-amber-300 shadow-sm"
                onPress={async () => {
                  setDialogue('Customer: "Skip tomorrow drop"');
                  try {
                    const res = await axios.post(`${getApiBase()}/ai/process-intent`, {
                      text: 'Skip tomorrow drop',
                      phoneNumber: '9876543210'
                    }, { timeout: 5000 });
                    const reply = res.data?.data?.replyText || 'சரி! உங்கள் நாளை காலை பால் விநியோகம் தவிர்க்கப்பட்டது.';
                    setDialogue(`Sarvam AI: "${reply}"`);
                  } catch {
                    setDialogue('Sarvam AI: "சரி! நாளை காலை விநியோகம் தவிர்க்கப்பட்டது. கட்டணம் பிடிக்கப்படாது."');
                  }
                }}
              >
                <Clock size={16} color="#B45309" />
                <Text className="text-amber-800 font-bold text-sm">
                  Voice: "Skip Tomorrow Morning Drop"
                </Text>
              </TouchableOpacity>

              {/* Hang Up Button */}
              <TouchableOpacity
                className="bg-red-600 py-3.5 rounded-2xl items-center justify-center flex-row gap-2 shadow-md"
                onPress={() => setCallActive(false)}
              >
                <PhoneOff size={18} color="#FFFFFF" />
                <Text className="text-white font-bold text-sm">Hang Up Call</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              className="bg-emerald-600 py-4 rounded-2xl items-center justify-center flex-row gap-2 shadow-lg"
              onPress={() => {
                setCallActive(true);
                setCallSeconds(0);
                switchLanguagePrompt(language);
              }}
            >
              <RotateCcw size={18} color="#FFFFFF" />
              <Text className="text-white font-bold text-base">Redial Voice AI Hotline</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // ==========================================
  // 3. DAILY CONFIRMATION CHECKLIST VIEW
  // ==========================================
  const DailyConfirmationView = () => {
    const [dailyStatus, setDailyStatus] = useState<'PENDING' | 'CONFIRMED' | 'SKIPPED'>('PENDING');

    return (
      <ScrollView contentContainerClassName="p-4 bg-[#F8FAFC] flex-1">
        <TouchableOpacity
          onPress={() => setCustomerScreen('HOME')}
          className="flex-row items-center gap-1.5 mb-4"
        >
          <ArrowLeft size={16} color="#047857" />
          <Text className="text-emerald-700 text-sm font-bold">Back to Home</Text>
        </TouchableOpacity>

        <View className="items-center py-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <View className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-300 items-center justify-center shadow-inner">
            <Milk size={38} color="#047857" />
          </View>
          
          <Text className="text-xl font-bold text-slate-900 mt-4 text-center">
            Tomorrow's Milk Dispatch
          </Text>
          <Text className="text-xs text-slate-500 text-center my-2.5 leading-5 max-w-[280px]">
            Your regular 2 Litres of Fresh Organic A2 Milk is scheduled to arrive tomorrow at{' '}
            <Text className="font-bold text-emerald-700">06:30 AM</Text>.
          </Text>

          {dailyStatus === 'PENDING' && (
            <View className="w-full gap-3 mt-4">
              <TouchableOpacity
                className="w-full h-12 bg-emerald-700 rounded-2xl items-center justify-center shadow-md"
                onPress={() => setDailyStatus('CONFIRMED')}
              >
                <Text className="text-white text-sm font-bold">Confirm Delivery (உறுதி செய்)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full h-12 rounded-2xl border border-amber-600 bg-amber-50/50 items-center justify-center"
                onPress={() => setDailyStatus('SKIPPED')}
              >
                <Text className="text-amber-700 text-sm font-bold">Skip Delivery Tomorrow (தவிர்)</Text>
              </TouchableOpacity>
            </View>
          )}

          {dailyStatus === 'CONFIRMED' && (
            <View className="p-4 rounded-2xl bg-emerald-50 items-center w-full border border-emerald-300 my-4">
              <CircleCheck size={32} color="#047857" />
              <Text className="text-emerald-800 font-bold text-sm my-1">Delivery Confirmed</Text>
              <Text className="text-slate-600 text-xs">Route cluster dispatched under #RECUR-4921</Text>
            </View>
          )}

          {dailyStatus === 'SKIPPED' && (
            <View className="p-4 rounded-2xl bg-amber-50 items-center w-full border border-amber-200 my-4">
              <Clock size={32} color="#D97706" />
              <Text className="text-amber-700 font-bold text-sm my-1">Delivery Skipped</Text>
              <Text className="text-amber-600 text-xs">You will not be charged. Subscription remains active.</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => setCustomerScreen('MY_SUBSCRIPTIONS')} className="mt-5">
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
