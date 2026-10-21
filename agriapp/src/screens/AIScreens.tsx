import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';

interface AIScreensProps {
  customerScreen: string;
  setCustomerScreen: (screen: string) => void;
}

export const AIScreens: React.FC<AIScreensProps> = ({ customerScreen, setCustomerScreen }) => {

  // 1. WHATSAPP AI ASSISTANT VIEW
  const WhatsAppAIView = () => {
    const [wsMessages, setWsMessages] = useState<any[]>([
      { id: 'm1', sender: 'AI', isVoice: false, text: 'Hi Ananya! 👋 Fresh organic A2 Milk (2L) is packed for tomorrow\'s 6:30 AM drop. Would you like to confirm delivery or send a voice note?', time: '9:00 PM' },
      { id: 'm2', sender: 'AI', isVoice: true, duration: '0:04', text: '🎙️ Voice Note: "Hello Ananya, milk dispatch ready for 6:30 AM."', time: '9:01 PM' }
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
        replyText = '✅ Great! Your 2L Organic A2 Milk delivery is confirmed for 6:30 AM tomorrow. Track drop status live in app!';
      } else if (lower.includes('skip') || lower.includes('no') || lower.includes('stop')) {
        intent = 'PYTHON WHISPER ASR -> INTENT: SKIP_DELIVERY (98.9% confidence)';
        replyText = '⏭️ Understood! Tomorrow\'s milk drop has been skipped. Your wallet will not be charged.';
      } else if (lower.includes('price') || lower.includes('rate') || lower.includes('cost')) {
        intent = 'INTENT: PRODUCT_PRICE_QUERY';
        replyText = '🥛 Organic A2 Cow Milk is ₹85/L. Pure Desi Cow Ghee is ₹680/500ml. Certified 100% pure!';
      } else {
        intent = 'INTENT: CUSTOM_NLP_PARSED';
        replyText = `🌱 Thanks! I've noted: "${text}". Our farm team will update your account shortly.`;
      }

      const userMsgId = 'usr_' + Date.now();
      setWsMessages(prev => [
        ...prev,
        {
          id: userMsgId,
          sender: 'USER',
          isVoice: isVoiceInput,
          duration: isVoiceInput ? `0:0${recordingSecs}` : undefined,
          text: isVoiceInput ? `🎙️ Voice Note Transcript: "${text}"` : text,
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
            text: isVoiceInput ? `🎙️ AI Audio Reply: ${replyText}` : replyText,
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
      <View style={{ flex: 1, backgroundColor: '#ECE5DD' }}>
        {/* WhatsApp Top Header Bar */}
        <View style={styles.waHeader}>
          <TouchableOpacity onPress={() => setCustomerScreen('HOME')} style={{ paddingRight: 8 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 24, marginLeft: 4 }}>🌱</Text>
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>Mathira Organic AI Bot</Text>
            <Text style={{ color: '#A7F3D0', fontSize: 10 }}>⚡ Automated Voice & Text Assistant | Verified</Text>
          </View>
        </View>

        {/* Message Thread */}
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
          {wsMessages.map((m: any) => (
            <View 
              key={m.id} 
              style={[
                styles.chatMsgBubble, 
                m.sender === 'AI' ? styles.aiMsgBubble : styles.userMsgBubble
              ]}
            >
              {/* WhatsApp Native Voice Note Player Component */}
              {m.isVoice ? (
                <View style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity 
                      style={[styles.voicePlayBtn, { backgroundColor: m.sender === 'AI' ? '#075E54' : '#128C7E' }]}
                      onPress={() => toggleAudioPlay(m.id)}
                    >
                      <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>
                        {playingAudioId === m.id ? '⏸' : '▶'}
                      </Text>
                    </TouchableOpacity>

                    {/* Audio Waveform Bars */}
                    <View style={styles.audioWaveformTrack}>
                      {[12, 22, 16, 28, 20, 32, 18, 26, 14, 24, 16].map((h, idx) => (
                        <View 
                          key={idx} 
                          style={[
                            styles.audioWaveBar, 
                            { 
                              height: playingAudioId === m.id ? Math.min(32, h + 8) : h,
                              backgroundColor: playingAudioId === m.id ? '#10B981' : '#64748B'
                            }
                          ]} 
                        />
                      ))}
                    </View>

                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#64748B' }}>{m.duration || '0:05'}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: '#334155', fontStyle: 'italic', marginTop: 2 }}>{m.text}</Text>
                </View>
              ) : (
                <Text style={{ fontSize: 13, color: '#0F172A', lineHeight: 18 }}>{m.text}</Text>
              )}

              <Text style={{ fontSize: 9, color: '#64748B', alignSelf: 'flex-end', marginTop: 4 }}>{m.time} ✓✓</Text>
            </View>
          ))}
        </ScrollView>

        {/* AI Intent Engine Log */}
        {intentLog && (
          <View style={styles.intentLogBar}>
            <Text style={styles.intentLogText}>
              🤖 [WHISPER ASR / INTENT]: {intentLog}
            </Text>
          </View>
        )}

        {/* Quick Action Chips */}
        <View style={styles.waBottomChipsBar}>
          {[
            { label: 'Confirm Tomorrow Milk', text: 'Yes, confirm tomorrow milk delivery', color: '#128C7E' },
            { label: 'Skip Delivery', text: 'Please skip my delivery tomorrow', color: '#D97706' },
            { label: 'Check Ghee Offers', text: 'What are the current offers on Desi Ghee?', color: '#25D366' },
          ].map((chip, i) => (
            <TouchableOpacity 
              key={i}
              style={[styles.waChipBtn, { borderColor: chip.color }]}
              onPress={() => processAIIntent(chip.text, false)}
            >
              <Text style={{ color: chip.color, fontWeight: 'bold', fontSize: 11 }}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Interactive Voice Recorder / Text Input Bar */}
        {isRecordingVoice ? (
          <View style={styles.recordingBarBox}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={styles.recordingDot} />
              <Text style={{ color: '#DC2626', fontWeight: 'bold', fontSize: 12 }}>Recording Audio Voice Note... 0:0{recordingSecs}</Text>
            </View>
            <TouchableOpacity style={styles.cancelRecBtn} onPress={() => setIsRecordingVoice(false)}>
              <Text style={{ color: '#64748B', fontSize: 12, fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendVoiceNoteBtn} onPress={handleSendVoiceNote}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}>Send Voice 📤</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputBarBox}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type message or send voice note..."
              value={customInput}
              onChangeText={setCustomInput}
              placeholderTextColor="#94A3B8"
            />
            <TouchableOpacity style={styles.micBtn} onPress={() => setIsRecordingVoice(true)}>
              <Text style={{ fontSize: 16 }}>🎙️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sendBtn} onPress={handleSendCustom}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>Send</Text>
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
      <View style={{ flex: 1, backgroundColor: '#0D2B1D' }}>
        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => setCustomerScreen('HOME')}>
            <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' }}>← End Call</Text>
          </TouchableOpacity>
          
          {/* Language Selector */}
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['EN', 'TA', 'HI'] as const).map(l => (
              <TouchableOpacity
                key={l}
                style={[styles.langPill, language === l && styles.langPillActive]}
                onPress={() => switchLanguagePrompt(l)}
              >
                <Text style={[styles.langPillText, language === l && styles.langPillTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <View style={styles.voiceAvatarCircle}>
            <Text style={{ fontSize: 44 }}>🎙️</Text>
          </View>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginTop: 12 }}>Mathira Voice AI Assistant</Text>
          <Text style={{ color: '#A7F3D0', fontSize: 12, marginTop: 4 }}>
            {callActive ? '⚡ Real-time Neural Voice Dispatch Active' : 'Call Ended'}
          </Text>
          
          {callActive && (
            <View style={styles.waveVisualizerRow}>
              {[28, 60, 42, 80, 50, 30, 70, 35].map((h, idx) => (
                <View key={idx} style={[styles.waveBar, { height: h }]} />
              ))}
            </View>
          )}

          <View style={styles.voiceTranscriptBox}>
            <Text style={styles.voiceTranscriptText}>{dialogue}</Text>
          </View>
        </View>

        {/* Call Controls */}
        <View style={styles.voiceControlPanel}>
          {callActive ? (
            <>
              <TouchableOpacity 
                style={styles.simulateReplyBtn}
                onPress={() => {
                  setDialogue('Customer Speech Detected: "Yes, confirm tomorrow delivery"');
                  setTimeout(() => {
                    setDialogue('Voice AI: "✅ Thank you! 2L Organic Milk is confirmed for 6:30 AM tomorrow. Have a great day!"');
                  }, 1200);
                }}
              >
                <Text style={{ color: '#0D2B1D', fontWeight: 'bold', fontSize: 13 }}>🗣️ Voice Response ("Yes, Confirm Delivery")</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.simulateReplyBtn, { backgroundColor: '#FEF3C7' }]}
                onPress={() => {
                  setDialogue('Customer Speech Detected: "Skip tomorrow drop"');
                  setTimeout(() => {
                    setDialogue('Voice AI: "⏭️ Understood! Tomorrow\'s drop is cancelled. Your account won\'t be charged."');
                  }, 1200);
                }}
              >
                <Text style={{ color: '#B45309', fontWeight: 'bold', fontSize: 13 }}>🗣️ Voice Response ("Skip Tomorrow Drop")</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.endCallBtn} onPress={() => setCallActive(false)}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>Hang Up 📞</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.redialBtn}
              onPress={() => {
                setCallActive(true);
                switchLanguagePrompt(language);
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 }}>Redial Voice AI Assistant</Text>
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
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <TouchableOpacity onPress={() => setCustomerScreen('HOME')} style={{ marginBottom: 12 }}>
          <Text style={{ color: '#15803D', fontSize: 13, fontWeight: 'bold' }}>← Back to Home</Text>
        </TouchableOpacity>
        
        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
          <View style={styles.confirmIconCircle}>
            <Text style={{ fontSize: 40 }}>🥛</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginTop: 12 }}>Tomorrow's Milk Dispatch</Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginVertical: 12, lineHeight: 20 }}>
            Your regular 2 Litres of Fresh Organic Milk is scheduled to arrive tomorrow morning at <Text style={{ fontWeight: 'bold', color: '#15803D' }}>6:30 AM</Text>.
          </Text>

          {dailyStatus === 'PENDING' && (
            <View style={{ width: '100%', gap: 12, marginTop: 10 }}>
              <TouchableOpacity 
                style={styles.primaryConfirmBtn} 
                onPress={() => setDailyStatus('CONFIRMED')}
              >
                <Text style={styles.primaryConfirmText}>Confirm Delivery</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.secondarySkipBtn} 
                onPress={() => setDailyStatus('SKIPPED')}
              >
                <Text style={styles.secondarySkipText}>Skip Delivery Today</Text>
              </TouchableOpacity>
            </View>
          )}

          {dailyStatus === 'CONFIRMED' && (
            <View style={styles.statusBoxGreen}>
              <Text style={{ fontSize: 28 }}>✅</Text>
              <Text style={{ color: '#15803D', fontWeight: 'bold', fontSize: 15, marginVertical: 4 }}>Delivery Confirmed</Text>
              <Text style={{ color: '#475569', fontSize: 12 }}>Order dispatched under code RECUR-4921</Text>
            </View>
          )}

          {dailyStatus === 'SKIPPED' && (
            <View style={styles.statusBoxOrange}>
              <Text style={{ fontSize: 28 }}>⏭️</Text>
              <Text style={{ color: '#D97706', fontWeight: 'bold', fontSize: 15, marginVertical: 4 }}>Delivery Skipped</Text>
              <Text style={{ color: '#D97706', fontSize: 12 }}>You will not be charged. Subscription remains active.</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => setCustomerScreen('MY_SUBSCRIPTIONS')} style={{ marginTop: 24 }}>
            <Text style={{ color: '#15803D', textDecorationLine: 'underline', fontSize: 13, fontWeight: 'bold' }}>Manage All Subscriptions</Text>
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

const styles = StyleSheet.create({
  waHeader: {
    backgroundColor: '#075E54',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatMsgBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  aiMsgBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
  },
  userMsgBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
  },
  intentLogBar: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  intentLogText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#34D399',
  },
  waBottomChipsBar: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 8,
  },
  waChipBtn: {
    flex: 1,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceAvatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#15803D',
    borderWidth: 3,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveVisualizerRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 24,
    alignItems: 'center',
  },
  waveBar: {
    width: 4,
    backgroundColor: '#86EFAC',
    borderRadius: 2,
  },
  voiceTranscriptBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  voiceTranscriptText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  voiceControlPanel: {
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    gap: 12,
  },
  simulateReplyBtn: {
    backgroundColor: '#86EFAC',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  endCallBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  redialBtn: {
    backgroundColor: '#15803D',
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  confirmIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#86EFAC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryConfirmBtn: {
    width: '100%',
    height: 46,
    backgroundColor: '#15803D',
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryConfirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondarySkipBtn: {
    width: '100%',
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondarySkipText: {
    color: '#D97706',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusBoxGreen: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginVertical: 12,
  },
  statusBoxOrange: {
    padding: 20,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginVertical: 12,
  },
  inputBarBox: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#0F172A',
  },
  sendBtn: {
    backgroundColor: '#075E54',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  langPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  langPillActive: {
    backgroundColor: '#22C55E',
  },
  langPillText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: 'bold',
  },
  langPillTextActive: {
    color: '#FFFFFF',
  },
  voicePlayBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioWaveformTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 32,
    flex: 1,
    paddingHorizontal: 4,
  },
  audioWaveBar: {
    width: 3,
    borderRadius: 1.5,
  },
  recordingBarBox: {
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderTopWidth: 1,
    borderTopColor: '#FCA5A5',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  cancelRecBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sendVoiceNoteBtn: {
    backgroundColor: '#15803D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  micBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
