import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  MinusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Share2,
  Download,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  QrCode,
  Bike,
  Package,
  Flame,
  Home,
  User,
  Coffee,
  CheckCircle2,
  X,
  Copy,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Play tactile sound effect without external files
const playChime = (type = 'income') => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'income') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime); // E4
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18); // A3
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }

    if (navigator.vibrate) {
      navigator.vibrate(35);
    }
  } catch {
    // audio not allowed before user gesture
  }
};

// Thai Date Formatter
const formatThaiDate = (dateStr) => {
  const d = new Date(dateStr);
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
  const day = d.getDate();
  const month = thaiMonths[d.getMonth()];
  const year = d.getFullYear() + 543;
  const dayName = dayNames[d.getDay()];
  return { full: `วัน${dayName}ที่ ${day} ${month} ${year}`, short: `${day} ${month} ${year}` };
};

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Categories configuration
const INCOME_CATEGORIES = [
  { id: 'cash', name: 'ขายหน้าร้าน (สด)', icon: DollarSign, color: 'bg-emerald-500' },
  { id: 'qr', name: 'สแกน QR / โอน', icon: QrCode, color: 'bg-blue-500' },
  { id: 'delivery', name: 'เดลิเวอรี / ไรเดอร์', icon: Bike, color: 'bg-amber-500' },
  { id: 'wholesale', name: 'สั่งเหมา / ขายส่ง', icon: Package, color: 'bg-purple-500' },
];

const EXPENSE_CATEGORIES = [
  { id: 'food_supply', name: 'ของสด / วัตถุดิบ', icon: ShoppingBag, color: 'bg-rose-500' },
  { id: 'gas_oil', name: 'ค่าแก๊ส / น้ำมัน', icon: Flame, color: 'bg-orange-500' },
  { id: 'rent', name: 'ค่าเช่าที่ / ค่าแผง', icon: Home, color: 'bg-indigo-500' },
  { id: 'packaging', name: 'ถุง / กล่อง / แก้ว', icon: Package, color: 'bg-amber-600' },
  { id: 'personal', name: 'ใช้ส่วนตัว / จ้างลูกน้อง', icon: User, color: 'bg-teal-600' },
  { id: 'other', name: 'จิปาถะ / ซ่อมแซม', icon: Coffee, color: 'bg-slate-500' },
];

const QUICK_AMOUNTS = [20, 30, 40, 50, 100, 500];

export default function App() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const [activeTab, setActiveTab] = useState('income'); // 'income' | 'expense'
  const [amountStr, setAmountStr] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(INCOME_CATEGORIES[0].id);
  const [note, setNote] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [shopName, setShopName] = useState('ร้านของฉัน');

  // Load transactions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('merchant_transactions_v1');
    const savedShop = localStorage.getItem('merchant_shop_name');
    if (savedShop) setShopName(savedShop);

    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch {
        setTransactions([]);
      }
    } else {
      // Starter mock data for realistic demo
      const today = getTodayDateStr();
      const initial = [
        {
          id: '1',
          type: 'income',
          amount: 150,
          category: 'cash',
          categoryName: 'ขายหน้าร้าน (สด)',
          note: 'ลูกค้าโต๊ะ 1',
          date: today,
          time: '08:15',
          timestamp: Date.now() - 3600000 * 3
        },
        {
          id: '2',
          type: 'income',
          amount: 80,
          category: 'qr',
          categoryName: 'สแกน QR / โอน',
          note: 'สแกนคนละครึ่ง/พร้อมเพย์',
          date: today,
          time: '09:30',
          timestamp: Date.now() - 3600000 * 2
        },
        {
          id: '3',
          type: 'expense',
          amount: 320,
          category: 'food_supply',
          categoryName: 'ของสด / วัตถุดิบ',
          note: 'ซื้อหมู + ผักตลาดเช้า',
          date: today,
          time: '06:45',
          timestamp: Date.now() - 3600000 * 5
        }
      ];
      setTransactions(initial);
      localStorage.setItem('merchant_transactions_v1', JSON.stringify(initial));
    }
  }, []);

  // Save transactions to localStorage
  const saveTransactions = (newTx) => {
    setTransactions(newTx);
    localStorage.setItem('merchant_transactions_v1', JSON.stringify(newTx));
  };

  // Toast feedback
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Switch tab updates default category
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'income') {
      setSelectedCategory(INCOME_CATEGORIES[0].id);
    } else {
      setSelectedCategory(EXPENSE_CATEGORIES[0].id);
    }
  };

  // Keypad inputs
  const handleNumClick = (val) => {
    if (amountStr.length >= 7) return; // prevent overflow
    if (amountStr === '' && (val === '0' || val === '00')) return;
    setAmountStr((prev) => prev + val);
  };

  const handleBackspace = () => {
    setAmountStr((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setAmountStr('');
  };

  const handleQuickAdd = (num) => {
    const current = Number(amountStr) || 0;
    setAmountStr(String(current + num));
  };

  // Save new record
  const handleSaveTransaction = (e) => {
    e?.preventDefault();
    const amount = Number(amountStr);
    if (!amount || amount <= 0) {
      showToast('⚠️ กรุณาใส่จำนวนเงินก่อนบันทึก');
      return;
    }

    const categoryList = activeTab === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const catObj = categoryList.find((c) => c.id === selectedCategory) || categoryList[0];

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord = {
      id: Date.now().toString(),
      type: activeTab,
      amount: amount,
      category: catObj.id,
      categoryName: catObj.name,
      note: note.trim(),
      date: selectedDate,
      time: timeStr,
      timestamp: Date.now()
    };

    saveTransactions([newRecord, ...transactions]);
    playChime(activeTab);

    if (activeTab === 'income') {
      confetti({
        particleCount: 25,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#34d399', '#f59e0b']
      });
    }

    showToast(`✅ บันทึก${activeTab === 'income' ? 'รายรับ' : 'รายจ่าย'} ฿${amount.toLocaleString()} สำเร็จ!`);
    setAmountStr('');
    setNote('');
  };

  // Delete transaction
  const handleDelete = (id) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      const updated = transactions.filter((t) => t.id !== id);
      saveTransactions(updated);
      showToast('ลบรายการเรียบร้อย');
    }
  };

  // Filter transactions for selected date
  const dayTransactions = transactions.filter((t) => t.date === selectedDate);

  const totalIncome = dayTransactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = dayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Change date (previous / next)
  const adjustDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${yr}-${mo}-${da}`);
  };

  // Generate LINE share text
  const generateShareText = () => {
    const { full } = formatThaiDate(selectedDate);
    let text = `📊 สรุปยอดร้าน: ${shopName}\n📅 ${full}\n`;
    text += `-------------------------\n`;
    text += `🟢 รายรับรวม: ฿${totalIncome.toLocaleString()} (${dayTransactions.filter(t => t.type === 'income').length} รายการ)\n`;
    text += `🔴 รายจ่ายรวม: ฿${totalExpense.toLocaleString()} (${dayTransactions.filter(t => t.type === 'expense').length} รายการ)\n`;
    text += `-------------------------\n`;
    text += `💰 ${netProfit >= 0 ? 'กำไรสุทธิ' : 'ขาดทุน'}: ฿${Math.abs(netProfit).toLocaleString()}\n`;
    text += `-------------------------\n`;
    text += `📱 บันทึกด้วยแอปบันทึกร้านค้า`;
    return text;
  };

  const handleCopyShare = () => {
    navigator.clipboard.writeText(generateShareText());
    showToast('📋 คัดลอกข้อความสรุปยอดแล้ว! นำไปวางใน LINE ได้เลย');
  };

  const handleNativeShare = async () => {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `สรุปยอดร้านค้า ${selectedDate}`,
          text: text
        });
      } catch {
        handleCopyShare();
      }
    } else {
      handleCopyShare();
    }
  };

  const thaiDate = formatThaiDate(selectedDate);
  const isToday = selectedDate === getTodayDateStr();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center pb-24 font-['Prompt',sans-serif]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 z-50 px-5 py-3 bg-slate-900/95 text-white font-medium text-sm rounded-full shadow-2xl backdrop-blur-md border border-slate-700 animate-bounce flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="w-full max-w-md bg-emerald-700 text-white shadow-md pt-3 pb-4 px-4 sticky top-0 z-30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold text-lg shadow-inner">
              🏪
            </div>
            <div>
              <input
                type="text"
                value={shopName}
                onChange={(e) => {
                  setShopName(e.target.value);
                  localStorage.setItem('merchant_shop_name', e.target.value);
                }}
                className="bg-transparent font-bold text-base leading-tight text-white border-b border-white/20 hover:border-white focus:outline-none focus:border-white transition-colors"
                title="คลิกเพื่อแก้ไขชื่อร้าน"
              />
              <p className="text-emerald-100 text-[11px]">สมุดบันทึกรายรับรายจ่ายหน้าร้าน</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 bg-white/15 hover:bg-white/25 active:scale-95 rounded-xl text-white transition-all flex items-center gap-1 text-xs font-medium"
              title="ส่งสรุปเข้า LINE"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">สรุปยอด</span>
            </button>
            <button
              onClick={() => setShowPwaModal(true)}
              className="p-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 border border-emerald-400/40 rounded-xl text-white transition-all flex items-center gap-1 text-xs font-semibold shadow-sm"
              title="วิธีติดตั้งลงมือถือ"
            >
              <Download className="w-4 h-4 text-emerald-200" />
              <span>ติดจอโฮม</span>
            </button>
          </div>
        </div>

        {/* Date Selector Banner */}
        <div className="flex items-center justify-between bg-emerald-800/60 rounded-xl px-2 py-1.5 backdrop-blur-sm border border-emerald-600/50">
          <button
            onClick={() => adjustDate(-1)}
            className="p-1.5 hover:bg-white/20 active:scale-90 rounded-lg text-emerald-100 transition-all"
            aria-label="วันก่อนหน้า"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-center">
            <Calendar className="w-4 h-4 text-emerald-200" />
            <span className="font-semibold text-sm tracking-wide">
              {thaiDate.full}
            </span>
            {isToday && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                วันนี้
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isToday && (
              <button
                onClick={() => setSelectedDate(getTodayDateStr())}
                className="text-[11px] bg-white/20 px-2 py-1 rounded text-white font-medium hover:bg-white/30"
              >
                กลับวันนี้
              </button>
            )}
            <button
              onClick={() => adjustDate(1)}
              className="p-1.5 hover:bg-white/20 active:scale-90 rounded-lg text-emerald-100 transition-all"
              aria-label="วันถัดไป"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area - Mobile-First Container */}
      <main className="w-full max-w-md px-3 pt-3 flex flex-col gap-3">
        {/* 1. HERO DAILY SUMMARY CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 transition-all">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> สรุปกำไรวันนี้
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                netProfit >= 0
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {netProfit >= 0 ? '✨ กำไร' : '⚠️ ขาดทุน'}
            </span>
          </div>

          {/* Big Profit Display */}
          <div className="text-center py-2">
            <div className="text-xs text-slate-400 font-medium">กำไรสุทธิ (รับ - จ่าย)</div>
            <div
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {netProfit >= 0 ? '+' : '-'}฿{Math.abs(netProfit).toLocaleString()}
            </div>
          </div>

          {/* Income vs Expense Grid */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-emerald-800">รายรับทั้งหมด</p>
                <p className="text-lg font-bold text-emerald-700 leading-tight">
                  ฿{totalIncome.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2.5 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-rose-800">รายจ่ายทั้งหมด</p>
                <p className="text-lg font-bold text-rose-700 leading-tight">
                  ฿{totalExpense.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. FAST-ENTRY BOX (บันทึกด่วน ปุ่มใหญ่) */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
          {/* Large Type Toggle (รายรับ / รายจ่าย) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl mb-3">
            <button
              type="button"
              onClick={() => handleTabChange('income')}
              className={`py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
                activeTab === 'income'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-5 h-5" />
              <span>+ บันทึกรายรับ</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('expense')}
              className={`py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 ${
                activeTab === 'expense'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MinusCircle className="w-5 h-5" />
              <span>- บันทึกรายจ่าย</span>
            </button>
          </div>

          {/* Giant Amount Display */}
          <div className="mb-3">
            <div className="text-xs font-semibold text-slate-500 mb-1 flex justify-between">
              <span>จำนวนเงิน (บาท)</span>
              {amountStr && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-slate-400 hover:text-rose-500 font-medium text-xs underline"
                >
                  ล้างตัวเลข
                </button>
              )}
            </div>

            <div
              className={`w-full min-h-[64px] rounded-xl flex items-center justify-between px-4 py-2 border-2 transition-all ${
                activeTab === 'income'
                  ? 'border-emerald-300 bg-emerald-50/40 text-emerald-800 focus-within:border-emerald-600 focus-within:ring-2 focus-within:ring-emerald-200'
                  : 'border-rose-300 bg-rose-50/40 text-rose-800 focus-within:border-rose-600 focus-within:ring-2 focus-within:ring-rose-200'
              }`}
            >
              <span className="text-2xl font-bold text-slate-400">฿</span>
              <span className="text-4xl font-extrabold tracking-tight">
                {amountStr ? Number(amountStr).toLocaleString() : '0'}
              </span>
              <button
                type="button"
                onClick={handleBackspace}
                className="p-2 text-slate-400 hover:text-slate-700 active:scale-90"
                title="ลบตัวเลขตัวหลัง"
              >
                ⌫
              </button>
            </div>
          </div>

          {/* Quick-Add Chips for fast street food pricing */}
          <div className="mb-3">
            <div className="text-[11px] font-medium text-slate-400 mb-1.5">
              กดบวกยอดด่วน:
            </div>
            <div className="grid grid-cols-6 gap-1.5">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAdd(amt)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold border transition-all active:scale-90 ${
                    activeTab === 'income'
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* On-Screen Touch Numpad */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', 'C'].map((key) => {
              const isAction = key === 'C';
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'C') handleClear();
                    else handleNumClick(key);
                  }}
                  className={`h-12 rounded-xl text-xl font-bold shadow-sm transition-all active:scale-95 flex items-center justify-center ${
                    isAction
                      ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 active:bg-slate-300'
                  }`}
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Category Chips (ปุ่มหมวดหมู่สำเร็จรูป) */}
          <div className="mb-3">
            <div className="text-xs font-semibold text-slate-500 mb-1.5">
              เลือกหมวดหมู่ ({activeTab === 'income' ? 'รายรับ' : 'รายจ่าย'}):
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(activeTab === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all active:scale-95 ${
                      isSelected
                        ? activeTab === 'income'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-500 font-bold'
                          : 'border-rose-600 bg-rose-50 text-rose-900 ring-2 ring-rose-500 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-lg text-white flex items-center justify-center text-xs shrink-0 ${cat.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </span>
                    <span className="text-xs leading-tight truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note input */}
          <div className="mb-4">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม (ถ้ามี เช่น ลูกค้าโต๊ะ 2, ค่าหมู 2 โล)"
              className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50 placeholder-slate-400"
            />
          </div>

          {/* Large Submit Button */}
          <button
            type="button"
            onClick={handleSaveTransaction}
            className={`w-full py-4 rounded-xl text-white font-extrabold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 ${
              activeTab === 'income'
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
            }`}
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>
              บันทึก{activeTab === 'income' ? 'รายรับ' : 'รายจ่าย'}{' '}
              {amountStr ? `฿${Number(amountStr).toLocaleString()}` : ''}
            </span>
          </button>
        </div>

        {/* 3. TODAY'S TRANSACTIONS STREAM */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              📋 รายการวันนี้ ({dayTransactions.length} รายการ)
            </h3>
            <span className="text-xs text-slate-400">เรียงตามเวลาล่าสุด</span>
          </div>

          {dayTransactions.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                📝
              </div>
              <p>ยังไม่มีรายการบันทึกสำหรับวันนี้</p>
              <p className="text-slate-300">กดปุ่มสีเขียวหรือแดงด้านบนเพื่อบันทึกรายการแรกได้เลย!</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100 max-h-96 overflow-y-auto no-scrollbar">
              {dayTransactions.map((tx) => {
                const isIncome = tx.type === 'income';
                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/80 rounded-lg px-1 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${
                          isIncome
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-xs leading-snug">
                          {tx.categoryName}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>{tx.time} น.</span>
                          {tx.note && (
                            <>
                              <span>•</span>
                              <span className="text-slate-600 truncate max-w-[130px]">
                                {tx.note}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-extrabold text-sm sm:text-base ${
                          isIncome ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {isIncome ? '+' : '-'}฿{tx.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-slate-300 hover:text-rose-500 p-1.5 rounded-lg active:scale-90 transition-colors"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* MODAL: PWA ADD TO HOME SCREEN GUIDE */}
      {showPwaModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
                📲 วิธีเพิ่มลงหน้าจอโฮมมือถือ
              </h4>
              <button
                onClick={() => setShowPwaModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              ติดตั้งได้เลยโดยไม่ต้องเข้า App Store / Play Store ใช้งานได้เร็วและออฟไลน์!
            </p>

            <div className="space-y-3 mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-xs text-slate-800 mb-1 flex items-center gap-1.5">
                  🍏 สำหรับ iPhone (Safari)
                </p>
                <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1">
                  <li>กดปุ่ม <strong>แชร์ (Share)</strong> ที่แถบด้านล่าง Safari</li>
                  <li>เลื่อนลงมาเลือก <strong>"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen)</strong></li>
                  <li>กด <strong>"เพิ่ม" (Add)</strong> ที่มุมขวาบน จะมีไอคอนร้านค้าขึ้นที่หน้าจอมือถือทันที</li>
                </ol>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="font-bold text-xs text-slate-800 mb-1 flex items-center gap-1.5">
                  🤖 สำหรับ Android (Chrome)
                </p>
                <ol className="text-xs text-slate-600 list-decimal list-inside space-y-1">
                  <li>กดปุ่ม <strong>จุด 3 จุด (⋮)</strong> ที่มุมขวาบนของ Chrome</li>
                  <li>เลือก <strong>"ติดตั้งแอป" (Install App)</strong> หรือ <strong>"เพิ่มลงในหน้าจอหลัก"</strong></li>
                  <li>กดยืนยัน ติดตั้งเสร็จภายใน 3 วินาที</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowPwaModal(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm"
            >
              เข้าใจแล้ว ปิดหน้าต่างนี้
            </button>
          </div>
        </div>
      )}

      {/* MODAL: SHARE TO LINE */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
                💬 ส่งสรุปยอดประจำวันเข้า LINE
              </h4>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              ข้อความสรุปยอดพร้อมส่งเข้ากลุ่มครอบครัวหรือคู่ค้า:
            </p>

            <div className="bg-slate-100 rounded-xl p-3 text-xs font-mono text-slate-700 whitespace-pre-line border border-slate-200 mb-4 select-text max-h-48 overflow-y-auto">
              {generateShareText()}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyShare}
                className="py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Copy className="w-4 h-4" />
                <span>คัดลอกข้อความ</span>
              </button>

              <button
                onClick={handleNativeShare}
                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-md shadow-emerald-600/30"
              >
                <Share2 className="w-4 h-4" />
                <span>แชร์เข้า LINE / แอป</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
