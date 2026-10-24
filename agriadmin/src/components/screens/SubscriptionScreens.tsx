import React, { useState, useEffect } from 'react';
import { Inbox, Milk, CheckCircle2, FastForward, Sprout, Bot, Mic, PhoneOff, Volume2, ArrowLeft } from 'lucide-react';
import { Subscription } from '../../../../agriapp/src/constants/mockData';
import { fetchSubscriptionsFromDB } from '../../data/mockData';

// 8. MY SUBSCRIPTIONS SCREEN
export const MySubscriptionsScreen: React.FC<{ 
  onBack: () => void;
}> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'Active' | 'Upcoming' | 'History'>('Active');
  const [subs, setSubs] = useState<Subscription[]>([]);

  useEffect(() => {
    fetchSubscriptionsFromDB().then(data => {
      if (data && Array.isArray(data)) setSubs(data);
    });
  }, []);

  const handleSkip = (id: string) => {
    setSubs(prev => prev.map(s => {
      if (s.id === id) {
        const today = new Date().toISOString().split('T')[0];
        const isSkipped = s.skippedDates.includes(today);
        return {
          ...s,
          skippedDates: isSkipped 
            ? s.skippedDates.filter(d => d !== today) 
            : [...s.skippedDates, today]
        };
      }
      return s;
    }));
  };

  const handlePauseToggle = (id: string) => {
    setSubs(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' };
      }
      return s;
    }));
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '18px', marginRight: '12px', cursor: 'pointer', color: '#2E7D32' }}>←</button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>My Farm Subscriptions</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        {(['Active', 'Upcoming', 'History'] as const).map(tab => (
          <div 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ flex: 1, padding: '12px 0', textAlign: 'center', fontSize: '12px', color: activeTab === tab ? '#2E7D32' : '#666', borderBottom: activeTab === tab ? '2px solid #2E7D32' : 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeTab === 'Active' && subs.filter(s => s.status !== 'Cancelled').map(sub => {
          const today = new Date().toISOString().split('T')[0];
          const isSkippedToday = sub.skippedDates.includes(today);

          return (
            <div 
              key={sub.id}
              style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #EFEBE9', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: '0', fontSize: '14px', color: '#2C3E2F' }}>{sub.product.name}</h4>
                <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px', backgroundColor: sub.status === 'Active' ? '#E8F5E9' : '#FFF9C4', color: sub.status === 'Active' ? '#2E7D32' : '#F57F17' }}>
                  {sub.status}
                </span>
              </div>
              <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>Quantity: {sub.quantity} {sub.product.unit} | Time Slot: {sub.deliveryTime}</p>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button 
                  onClick={() => handleSkip(sub.id)}
                  style={{ flex: 1, padding: '6px', borderRadius: '6px', fontSize: '11px', border: '1px solid #FF8F00', backgroundColor: isSkippedToday ? '#FFF8E1' : 'transparent', color: '#FF8F00', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {isSkippedToday ? 'Resume today' : 'Skip Today'}
                </button>
                <button 
                  onClick={() => handlePauseToggle(sub.id)}
                  style={{ flex: 1, padding: '6px', borderRadius: '6px', fontSize: '11px', border: '1px solid #1976D2', backgroundColor: sub.status === 'Paused' ? '#E3F2FD' : 'transparent', color: '#1976D2', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {sub.status === 'Paused' ? 'Resume Subscription' : 'Pause'}
                </button>
              </div>
            </div>
          );
        })}

        {activeTab !== 'Active' && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888' }}>
            <Inbox size={32} color="#888" style={{ marginBottom: 8 }} />
            <p style={{ fontSize: '13px', margin: '8px 0 0 0' }}>No {activeTab.toLowerCase()} subscriptions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// 9. DAILY DELIVERY CONFIRMATION SCREEN
export const DailyDeliveryConfirmationScreen: React.FC<{ 
  onBack: () => void;
  onNavigateSub: () => void; 
}> = ({ onBack, onNavigateSub }) => {
  const [status, setStatus] = useState<string>('PENDING'); // PENDING, CONFIRMED, SKIPPED

  return (
    <div style={{ flex: 1, backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #EFEBE9', backgroundColor: '#fff' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', marginRight: '12px', cursor: 'pointer', color: '#2E7D32', display: 'flex', alignItems: 'center' }}><ArrowLeft size={16} /></button>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#2C3E2F' }}>Morning Dispatch Checklist</span>
      </div>

      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '40px', backgroundColor: '#E8F5E9', border: '2px solid #81C784', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <Milk size={36} color="#2E7D32" />
        </div>
        
        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#2C3E2F' }}>Tomorrow's Milk Intake</h3>
        <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#666', lineHeight: 1.6 }}>Your regular 2 Litres of Organic Milk is scheduled to arrive tomorrow at <span style={{ fontWeight: 'bold', color: '#2E7D32' }}>6:30 AM</span>.</p>

        {status === 'PENDING' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => setStatus('CONFIRMED')}
              style={{ width: '100%', padding: '12px', borderRadius: '24px', backgroundColor: '#2E7D32', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              Confirm Delivery
            </button>
            <button 
              onClick={() => setStatus('SKIPPED')}
              style={{ width: '100%', padding: '12px', borderRadius: '24px', backgroundColor: 'transparent', color: '#FF8F00', border: '1px solid #FF8F00', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              Skip Delivery Today
            </button>
          </div>
        )}

        {status === 'CONFIRMED' && (
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#E8F5E9', border: '1px solid #81C784', width: '100%', boxSizing: 'border-box' }}>
            <CheckCircle2 size={24} color="#2E7D32" style={{ display: 'inline-block', marginBottom: 4 }} />
            <h4 style={{ margin: '4px 0', color: '#2E7D32' }}>Delivery Confirmed</h4>
            <p style={{ margin: '0', fontSize: '11px', color: '#7A8C7F' }}>Order dispatched under code RECUR-4921</p>
          </div>
        )}

        {status === 'SKIPPED' && (
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#FFF3E0', border: '1px solid #FFB74D', width: '100%', boxSizing: 'border-box' }}>
            <FastForward size={24} color="#E65100" style={{ display: 'inline-block', marginBottom: 4 }} />
            <h4 style={{ margin: '4px 0', color: '#E65100' }}>Delivery Skipped</h4>
            <p style={{ margin: '0', fontSize: '11px', color: '#E65100' }}>You will not be charged. Subscription remains active.</p>
          </div>
        )}

        <button 
          onClick={onNavigateSub}
          style={{ marginTop: '30px', background: 'none', border: 'none', color: '#2E7D32', textDecoration: 'underline', cursor: 'pointer', fontSize: '12px' }}
        >
          Manage All Subscriptions
        </button>
      </div>
    </div>
  );
};

// 10. WHATSAPP AI REMINDER SCREEN
export const WhatsAppAIScreen: React.FC = () => {
  const [messages, setMessages] = useState<Array<{ sender: 'AI' | 'USER'; text: string; time: string }>>([
    { sender: 'AI', text: 'Hi Ananya! Sourced fresh A2 Milk from our local farm for tomorrow\'s 6:30 AM drop. Would you like to confirm the standard 2L delivery?', time: '9:00 PM' }
  ]);
  const [aiIntent, setAiIntent] = useState<string | null>(null);

  const sendMessage = (text: string, intent: string) => {
    setMessages(prev => [
      ...prev,
      { sender: 'USER', text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    
    // Simulate AI parsing intent
    setTimeout(() => {
      setAiIntent(intent);
      const reply = intent === 'CONFIRM' 
        ? 'Great! Your delivery is locked in. Let the cream flow!' 
        : 'Understood. We skipped tomorrow\'s drop. Have a rest!';
      setMessages(prev => [
        ...prev,
        { sender: 'AI', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1000);
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#ECE5DD', display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'sans-serif' }}>
      {/* WhatsApp Bar */}
      <div style={{ backgroundColor: '#075E54', color: '#fff', padding: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Sprout size={20} color="#81C784" />
        <div>
          <h4 style={{ margin: '0', fontSize: '13px' }}>OrganicFlow AI Bot</h4>
          <span style={{ fontSize: '9px', opacity: 0.8 }}>Online | Verified Business</span>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((m, i) => (
          <div 
            key={i}
            style={{ 
              maxWidth: '80%',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              alignSelf: m.sender === 'AI' ? 'flex-start' : 'flex-end',
              backgroundColor: m.sender === 'AI' ? '#fff' : '#DCF8C6',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              position: 'relative'
            }}
          >
            <p style={{ margin: '0 0 4px 0', lineHeight: 1.4 }}>{m.text}</p>
            <span style={{ fontSize: '8px', color: '#777', float: 'right' }}>{m.time}</span>
          </div>
        ))}
      </div>

      {/* AI Debugger Overlay */}
      {aiIntent && (
        <div style={{ backgroundColor: '#f0f4f1', borderTop: '1px solid #78909c', padding: '8px 16px', fontSize: '10px', color: '#37474f', fontFamily: 'monospace' }}>
          <strong>[AI INTENT ENGINE]:</strong> detected: <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{aiIntent}</span> | Action execution success
        </div>
      )}

      {/* Interactive Options */}
      <div style={{ padding: '12px', backgroundColor: '#fff', borderTop: '1px solid #EFEBE9', display: 'flex', gap: '6px' }}>
        <button 
          onClick={() => sendMessage('Yes, confirm please.', 'CONFIRM')} 
          style={{ flex: 1, padding: '8px', borderRadius: '20px', border: '1px solid #128C7E', backgroundColor: 'transparent', color: '#128C7E', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}
        >
          "Confirm Delivery"
        </button>
        <button 
          onClick={() => sendMessage('Don\'t send milk tomorrow.', 'SKIP')} 
          style={{ flex: 1, padding: '8px', borderRadius: '20px', border: '1px solid #FF8F00', backgroundColor: 'transparent', color: '#FF8F00', fontWeight: 'bold', fontSize: '10px', cursor: 'pointer' }}
        >
          "Skip Tomorrow"
        </button>
      </div>
    </div>
  );
};

// 11. AI VOICE CALL SCREEN
export const AIVoiceCallScreen: React.FC = () => {
  const [callActive, setCallActive] = useState(true);
  const [dialogue, setDialogue] = useState<string>('Connecting call...');

  setTimeout(() => {
    if (dialogue === 'Connecting call...') {
      setDialogue('Voice AI: "Hello Ananya, the cows gathered milk for tomorrow at 6:30 AM. Do you confirm the delivery?"');
    }
  }, 2000);

  const simulateCustomerResponse = () => {
    setDialogue('Customer: "Yes, please confirm."');
    setTimeout(() => {
      setDialogue('Voice AI: "Great, your standard delivery is confirmed. Thank you."');
    }, 1500);
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#1A3323', display: 'flex', flexDirection: 'column', height: '100%', color: '#fff', fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: '#2E7D32', border: '3px solid #81C784', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <Bot size={48} color="#fff" />
        </div>
        <h3>OrganicFlow Voice AI</h3>
        <p style={{ fontSize: '13px', opacity: 0.7 }}>{callActive ? 'Voice verification active...' : 'Call ended'}</p>

        {callActive && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '4px', margin: '20px 0' }}>
            {/* Visualizer animation bar */}
            {[20, 50, 80, 40, 60, 30, 70, 40, 20].map((h, i) => (
              <div key={i} style={{ width: '4px', height: `${h}px`, backgroundColor: '#81C784', borderRadius: '2px', animation: 'pulse 1s infinite alternate' }} />
            ))}
          </div>
        )}

        <div style={{ width: '100%', height: '100px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', fontSize: '11px', color: '#A5D6A7', boxSizing: 'border-box', overflowY: 'auto' }}>
          {dialogue}
        </div>
      </div>

      <div style={{ padding: '24px', backgroundColor: 'rgba(0,0,0,0.2)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {callActive && (
          <>
            <button 
              onClick={simulateCustomerResponse}
              style={{ width: '100%', padding: '12px', borderRadius: '20px', border: 'none', backgroundColor: '#81C784', color: '#1A3323', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
            >
              Simulate Reply ("Yes, confirm")
            </button>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', alignItems: 'center' }}>
              <div style={{ textAlign: 'center' }}>
                <button style={{ width: '44px', height: '44px', borderRadius: '22px', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mic size={18} color="#fff" />
                </button>
                <p style={{ margin: '4px 0 0 0', fontSize: '9px', opacity: 0.8 }}>Mute</p>
              </div>
              <button 
                onClick={() => setCallActive(false)}
                style={{ width: '56px', height: '56px', borderRadius: '28px', border: 'none', backgroundColor: '#E53935', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <PhoneOff size={22} color="#fff" />
              </button>
              <div style={{ textAlign: 'center' }}>
                <button style={{ width: '44px', height: '44px', borderRadius: '22px', border: 'none', backgroundColor: 'rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Volume2 size={18} color="#fff" />
                </button>
                <p style={{ margin: '4px 0 0 0', fontSize: '9px', opacity: 0.8 }}>Speaker</p>
              </div>
            </div>
          </>
        )}

        {!callActive && (
          <button 
            onClick={() => { setCallActive(true); setDialogue('Connecting call...'); }}
            style={{ width: '100%', padding: '12px', borderRadius: '20px', border: 'none', backgroundColor: '#2E7D32', color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
          >
            Redial AI assistant
          </button>
        )}
      </div>
    </div>
  );
};
