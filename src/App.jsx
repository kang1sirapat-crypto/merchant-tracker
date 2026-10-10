import React, { useState, useEffect, useMemo } from 'react';
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
  BarChart3,
  CalendarDays,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Award
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
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(329.63, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }

    if (navigator.vibrate) {
      navigator.vibrate(35);
    }
  } catch {
    // audio not allowed
  }
};

const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];
const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];
const THAI_DAYS_FULL = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

// Date Format Helpers
const formatThaiDate = (dateStr) => {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDate();
  const month = THAI_MONTHS_SHORT[d.getMonth()];
  const year = d.getFullYear() + 543;
  const dayName = THAI_DAYS_FULL[d.getDay()];
  return {
    full: `วัน${dayName}ที่ ${day} ${month} ${year}`,
    short: `${day} ${month} ${year}`,
    dayName: dayName,
    dayShort: THAI_DAYS_SHORT[d.getDay()]
  };
};

const getTodayDateStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDateString = (d) => {
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
  // Period Mode: 'day' | 'week' | 'month'
  const [periodMode, setPeriodMode] = useState('day');

  // Selected date reference for daily, weekly, monthly calculations
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());

  // Input states
  const [activeTab, setActiveTab] = useState('income');
  const [amountStr, setAmountStr] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(INCOME_CATEGORIES[0].id);
  const [note, setNote] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [shopName, setShopName] = useState('ร้านของฉัน');

  // Load transactions and initialize realistic sample dataset if empty
  useEffect(() => {
    const saved = localStorage.getItem('merchant_transactions_v2');
    const savedShop = localStorage.getItem('merchant_shop_name');
    if (savedShop) setShopName(savedShop);

    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch {
        setTransactions([]);
      }
    } else {
      // Build realistic starter data across current week for impressive initial charts
      const now = new Date();
      const initial = [];
      const sampleDays = [
        { dayOffset: 0, incomes: [{ amt: 850, cat: 'cash', n: 'หน้าร้านช่วงเช้า' }, { amt: 1200, cat: 'qr', n: 'ลูกค้าสแกนพร้อมเพย์' }], expenses: [{ amt: 650, cat: 'food_supply', n: 'ซื้อหมูสด+ผัก' }, { amt: 120, cat: 'packaging', n: 'ถุงหิ้ว+กล่อง' }] },
        { dayOffset: 1, incomes: [{ amt: 2100, cat: 'cash', n: 'ขายดีโต๊ะเต็ม' }, { amt: 850, cat: 'delivery', n: 'ออเดอร์ Grab 4 คิว' }], expenses: [{ amt: 900, cat: 'food_supply', n: 'ของสดตลาดเช้า' }, { amt: 250, cat: 'gas_oil', n: 'เติมแก๊ส 1 ถัง' }] },
        { dayOffset: 2, incomes: [{ amt: 1400, cat: 'cash', n: 'ขายหน้าร้าน' }, { amt: 950, cat: 'qr', n: 'สแกน QR' }], expenses: [{ amt: 750, cat: 'food_supply', n: 'ของสด' }] },
        { dayOffset: 3, incomes: [{ amt: 1950, cat: 'cash', n: 'ขายหน้าร้าน' }, { amt: 600, cat: 'wholesale', n: 'ออเดอร์ส่งจัดเลี้ยง' }], expenses: [{ amt: 820, cat: 'food_supply', n: 'วัตถุดิบ' }, { amt: 150, cat: 'other', n: 'น้ำยาล้างจาน+ฟองน้ำ' }] },
        { dayOffset: 4, incomes: [{ amt: 2500, cat: 'cash', n: 'เสาร์-อาทิตย์ ลูกค้าแน่น' }, { amt: 1400, cat: 'qr', n: 'สแกนจ่าย' }], expenses: [{ amt: 1100, cat: 'food_supply', n: 'ของสดรอบใหญ่' }, { amt: 300, cat: 'rent', n: 'ค่าเช่าแผงรายวัน' }] },
        { dayOffset: 5, incomes: [{ amt: 1800, cat: 'cash', n: 'ขายหน้าร้าน' }, { amt: 900, cat: 'delivery', n: 'ไรเดอร์ Lineman' }], expenses: [{ amt: 850, cat: 'food_supply', n: 'เนื้อสัตว์+ผัก' }] },
      ];

      sampleDays.forEach((group, idx) => {
        const d = new Date(now);
        d.setDate(d.getDate() - group.dayOffset);
        const dStr = toDateString(d);

        group.incomes.forEach((item, iIdx) => {
          const cat = INCOME_CATEGORIES.find((c) => c.id === item.cat) || INCOME_CATEGORIES[0];
          initial.push({
            id: `sample_in_${idx}_${iIdx}`,
            type: 'income',
            amount: item.amt,
            category: cat.id,
            categoryName: cat.name,
            note: item.n,
            date: dStr,
            time: '11:30',
            timestamp: d.getTime() + iIdx * 1000
          });
        });

        group.expenses.forEach((item, eIdx) => {
          const cat = EXPENSE_CATEGORIES.find((c) => c.id === item.cat) || EXPENSE_CATEGORIES[0];
          initial.push({
            id: `sample_ex_${idx}_${eIdx}`,
            type: 'expense',
            amount: item.amt,
            category: cat.id,
            categoryName: cat.name,
            note: item.n,
            date: dStr,
            time: '07:15',
            timestamp: d.getTime() + (eIdx + 10) * 1000
          });
        });
      });

      setTransactions(initial);
      localStorage.setItem('merchant_transactions_v2', JSON.stringify(initial));
    }
  }, []);

  const saveTransactions = (newTx) => {
    setTransactions(newTx);
    localStorage.setItem('merchant_transactions_v2', JSON.stringify(newTx));
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'income') {
      setSelectedCategory(INCOME_CATEGORIES[0].id);
    } else {
      setSelectedCategory(EXPENSE_CATEGORIES[0].id);
    }
  };

  const handleNumClick = (val) => {
    if (amountStr.length >= 7) return;
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

  const handleDelete = (id) => {
    if (window.confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) {
      const updated = transactions.filter((t) => t.id !== id);
      saveTransactions(updated);
      showToast('ลบรายการเรียบร้อย');
    }
  };

  // --- CALCULATION HELPERS FOR DAY, WEEK, MONTH ---

  // 1. DAY CALCULATION
  const dayTransactions = useMemo(() => {
    return transactions.filter((t) => t.date === selectedDate);
  }, [transactions, selectedDate]);

  const dayTotalIncome = useMemo(() => {
    return dayTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [dayTransactions]);

  const dayTotalExpense = useMemo(() => {
    return dayTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [dayTransactions]);

  const dayNetProfit = dayTotalIncome - dayTotalExpense;

  // 2. WEEK CALCULATION (Monday - Sunday)
  const weekInfo = useMemo(() => {
    const cur = new Date(selectedDate + 'T00:00:00');
    const dayOfWeek = cur.getDay(); // 0 is Sunday, 1 is Monday ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(cur);
    monday.setDate(cur.getDate() + diffToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(toDateString(d));
    }

    const startThai = formatThaiDate(toDateString(monday));
    const endThai = formatThaiDate(toDateString(sunday));

    return {
      mondayDate: toDateString(monday),
      sundayDate: toDateString(sunday),
      daysList: days,
      label: `${startThai.short} - ${endThai.short}`
    };
  }, [selectedDate]);

  const weekTransactions = useMemo(() => {
    const set = new Set(weekInfo.daysList);
    return transactions.filter((t) => set.has(t.date));
  }, [transactions, weekInfo]);

  const weekTotalIncome = useMemo(() => {
    return weekTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [weekTransactions]);

  const weekTotalExpense = useMemo(() => {
    return weekTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [weekTransactions]);

  const weekNetProfit = weekTotalIncome - weekTotalExpense;

  // Daily stats within this week (for the 7-day bar chart)
  const weekDailyStats = useMemo(() => {
    return weekInfo.daysList.map((dStr) => {
      const txs = transactions.filter((t) => t.date === dStr);
      const inc = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      const dObj = new Date(dStr + 'T00:00:00');
      return {
        dateStr: dStr,
        dayShort: THAI_DAYS_SHORT[dObj.getDay()],
        dayNum: dObj.getDate(),
        income: inc,
        expense: exp,
        net: inc - exp,
        isToday: dStr === getTodayDateStr(),
        isSelected: dStr === selectedDate
      };
    });
  }, [transactions, weekInfo, selectedDate]);

  // Max value for chart scaling
  const maxDailyIncomeInWeek = useMemo(() => {
    const max = Math.max(...weekDailyStats.map((d) => Math.max(d.income, d.expense)));
    return max > 0 ? max : 1000;
  }, [weekDailyStats]);

  // 3. MONTH CALCULATION
  const monthInfo = useMemo(() => {
    const cur = new Date(selectedDate + 'T00:00:00');
    const year = cur.getFullYear();
    const month = cur.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;

    return {
      year,
      month,
      prefix,
      totalDays: lastDay.getDate(),
      firstDayDate: toDateString(firstDay),
      lastDayDate: toDateString(lastDay),
      label: `${THAI_MONTHS_FULL[month]} ${year + 543}`
    };
  }, [selectedDate]);

  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(monthInfo.prefix));
  }, [transactions, monthInfo]);

  const monthTotalIncome = useMemo(() => {
    return monthTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const monthTotalExpense = useMemo(() => {
    return monthTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const monthNetProfit = monthTotalIncome - monthTotalExpense;

  // Breakdown by 4-5 weeks in this month
  const monthWeeklyBreakdown = useMemo(() => {
    const weeks = [];
    const totalDays = monthInfo.totalDays;
    let start = 1;
    let weekIndex = 1;

    while (start <= totalDays) {
      const end = Math.min(start + 6, totalDays);
      const daysInThisSegment = [];
      for (let day = start; day <= end; day++) {
        daysInThisSegment.push(`${monthInfo.prefix}-${String(day).padStart(2, '0')}`);
      }

      const txs = transactions.filter((t) => daysInThisSegment.includes(t.date));
      const inc = txs.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const exp = txs.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

      weeks.push({
        weekNum: weekIndex,
        label: `สัปดาห์ที่ ${weekIndex} (${start} - ${end} ${THAI_MONTHS_SHORT[monthInfo.month]})`,
        income: inc,
        expense: exp,
        net: inc - exp,
        count: txs.length
      });

      start += 7;
      weekIndex++;
    }
    return weeks;
  }, [transactions, monthInfo]);

  // Category Aggregator (For Week or Month)
  const getCategoryStats = (txList, type) => {
    const filtered = txList.filter((t) => t.type === type);
    const total = filtered.reduce((s, t) => s + t.amount, 0);
    const catMap = {};

    filtered.forEach((t) => {
      catMap[t.category] = (catMap[t.category] || 0) + t.amount;
    });

    const categoriesList = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    return categoriesList
      .map((cat) => {
        const amt = catMap[cat.id] || 0;
        const percent = total > 0 ? Math.round((amt / total) * 100) : 0;
        return {
          ...cat,
          amount: amt,
          percent: percent
        };
      })
      .filter((c) => c.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  };

  // Adjust Date based on current periodMode
  const adjustPeriod = (delta) => {
    const cur = new Date(selectedDate + 'T00:00:00');
    if (periodMode === 'day') {
      cur.setDate(cur.getDate() + delta);
    } else if (periodMode === 'week') {
      cur.setDate(cur.getDate() + delta * 7);
    } else if (periodMode === 'month') {
      cur.setMonth(cur.getMonth() + delta);
    }
    setSelectedDate(toDateString(cur));
  };

  const isCurrentPeriod = useMemo(() => {
    const today = getTodayDateStr();
    if (periodMode === 'day') {
      return selectedDate === today;
    } else if (periodMode === 'week') {
      return weekInfo.daysList.includes(today);
    } else if (periodMode === 'month') {
      return today.startsWith(monthInfo.prefix);
    }
    return false;
  }, [periodMode, selectedDate, weekInfo, monthInfo]);

  // Generate LINE Share text according to active periodMode
  const generateShareText = () => {
    let text = `📊 สรุปยอดร้าน: ${shopName}\n`;
    if (periodMode === 'day') {
      const { full } = formatThaiDate(selectedDate);
      text += `📅 ประจำ${full}\n`;
      text += `-------------------------\n`;
      text += `🟢 รายรับรวม: ฿${dayTotalIncome.toLocaleString()} (${dayTransactions.filter(t => t.type === 'income').length} รายการ)\n`;
      text += `🔴 รายจ่ายรวม: ฿${dayTotalExpense.toLocaleString()} (${dayTransactions.filter(t => t.type === 'expense').length} รายการ)\n`;
      text += `-------------------------\n`;
      text += `💰 ${dayNetProfit >= 0 ? 'กำไรสุทธิ' : 'ขาดทุน'}: ฿${Math.abs(dayNetProfit).toLocaleString()}\n`;
    } else if (periodMode === 'week') {
      text += `📆 สรุปยอดประจำสัปดาห์ (${weekInfo.label})\n`;
      text += `-------------------------\n`;
      text += `🟢 รายรับรวมทั้งสัปดาห์: ฿${weekTotalIncome.toLocaleString()}\n`;
      text += `🔴 รายจ่ายรวมทั้งสัปดาห์: ฿${weekTotalExpense.toLocaleString()}\n`;
      text += `-------------------------\n`;
      text += `💰 ${weekNetProfit >= 0 ? 'กำไรสุทธิ' : 'ขาดทุน'}: ฿${Math.abs(weekNetProfit).toLocaleString()}\n`;
      text += `📈 เฉลี่ยกำไรวันละ: ฿${Math.round(weekNetProfit / 7).toLocaleString()}\n`;
    } else if (periodMode === 'month') {
      text += `📊 สรุปยอดประจำเดือน (${monthInfo.label})\n`;
      text += `-------------------------\n`;
      text += `🟢 รายรับรวมทั้งเดือน: ฿${monthTotalIncome.toLocaleString()}\n`;
      text += `🔴 รายจ่ายรวมทั้งเดือน: ฿${monthTotalExpense.toLocaleString()}\n`;
      text += `-------------------------\n`;
      text += `💰 ${monthNetProfit >= 0 ? 'กำไรสุทธิ' : 'ขาดทุน'}: ฿${Math.abs(monthNetProfit).toLocaleString()}\n`;
      text += `📈 เฉลี่ยรายรับวันละ: ฿${Math.round(monthTotalIncome / monthInfo.totalDays).toLocaleString()}\n`;
    }
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
          title: `สรุปยอดร้านค้า - ${shopName}`,
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center pb-24 font-['Prompt',sans-serif]">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 z-50 px-5 py-3 bg-slate-900/95 text-white font-medium text-sm rounded-full shadow-2xl backdrop-blur-md border border-slate-700 animate-bounce flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="w-full max-w-md bg-emerald-700 text-white shadow-md pt-3 pb-3 px-4 sticky top-0 z-30">
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
              <span className="hidden sm:inline">ส่งสรุป</span>
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

        {/* PERIOD MODE SELECTOR: DAY / WEEK / MONTH */}
        <div className="grid grid-cols-3 gap-1 bg-emerald-900/60 p-1 rounded-xl mb-2.5 border border-emerald-600/40">
          <button
            type="button"
            onClick={() => setPeriodMode('day')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              periodMode === 'day'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>รายวัน</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodMode('week')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              periodMode === 'week'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>รายสัปดาห์</span>
          </button>

          <button
            type="button"
            onClick={() => setPeriodMode('month')}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              periodMode === 'month'
                ? 'bg-white text-emerald-900 shadow-sm'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>รายเดือน</span>
          </button>
        </div>

        {/* DATE / PERIOD NAVIGATION BANNER */}
        <div className="flex items-center justify-between bg-emerald-800/60 rounded-xl px-2 py-1.5 backdrop-blur-sm border border-emerald-600/50">
          <button
            onClick={() => adjustPeriod(-1)}
            className="p-1.5 hover:bg-white/20 active:scale-90 rounded-lg text-emerald-100 transition-all"
            aria-label="ย้อนหลัง"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-center">
            {periodMode === 'day' && (
              <>
                <Calendar className="w-4 h-4 text-emerald-200" />
                <span className="font-semibold text-sm tracking-wide">
                  {thaiDate.full}
                </span>
                {isCurrentPeriod && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    วันนี้
                  </span>
                )}
              </>
            )}

            {periodMode === 'week' && (
              <>
                <CalendarDays className="w-4 h-4 text-emerald-200" />
                <span className="font-semibold text-sm tracking-wide">
                  สัปดาห์: {weekInfo.label}
                </span>
                {isCurrentPeriod && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    สัปดาห์นี้
                  </span>
                )}
              </>
            )}

            {periodMode === 'month' && (
              <>
                <BarChart3 className="w-4 h-4 text-emerald-200" />
                <span className="font-semibold text-sm tracking-wide">
                  {monthInfo.label}
                </span>
                {isCurrentPeriod && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    เดือนนี้
                  </span>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            {!isCurrentPeriod && (
              <button
                onClick={() => setSelectedDate(getTodayDateStr())}
                className="text-[11px] bg-white/20 px-2 py-1 rounded text-white font-medium hover:bg-white/30"
              >
                ปัจจุบัน
              </button>
            )}
            <button
              onClick={() => adjustPeriod(1)}
              className="p-1.5 hover:bg-white/20 active:scale-90 rounded-lg text-emerald-100 transition-all"
              aria-label="ถัดไป"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-md px-3 pt-3 flex flex-col gap-3">
        {/* ============================================================== */}
        {/* 1. DAILY VIEW (หน้าสรุปรายวัน และปุ่มบันทึกด่วน) */}
        {/* ============================================================== */}
        {periodMode === 'day' && (
          <>
            {/* Daily Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 transition-all">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> สรุปกำไรวันนี้
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    dayNetProfit >= 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {dayNetProfit >= 0 ? '✨ กำไร' : '⚠️ ขาดทุน'}
                </span>
              </div>

              {/* Big Profit Display */}
              <div className="text-center py-2">
                <div className="text-xs text-slate-400 font-medium">กำไรสุทธิ (รับ - จ่าย)</div>
                <div
                  className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                    dayNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {dayNetProfit >= 0 ? '+' : '-'}฿{Math.abs(dayNetProfit).toLocaleString()}
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
                      ฿{dayTotalIncome.toLocaleString()}
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
                      ฿{dayTotalExpense.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fast-Entry Keypad Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              {/* Type Switcher */}
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
                      ? 'border-emerald-300 bg-emerald-50/40 text-emerald-800'
                      : 'border-rose-300 bg-rose-50/40 text-rose-800'
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

              {/* Quick-Add Chips */}
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

              {/* Touch Numpad */}
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

              {/* Category Chips */}
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

              {/* Optional Note */}
              <div className="mb-4">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติม (ถ้ามี เช่น ลูกค้าโต๊ะ 2, ค่าหมู 2 โล)"
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50 placeholder-slate-400"
                />
              </div>

              {/* Save Button */}
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

            {/* Daily Transactions Stream */}
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
          </>
        )}

        {/* ============================================================== */}
        {/* 2. WEEKLY VIEW (สรุปรายสัปดาห์ พร้อมกราฟแท่ง 7 วัน) */}
        {/* ============================================================== */}
        {periodMode === 'week' && (
          <>
            {/* Weekly Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> สรุปกำไรประจำสัปดาห์
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    weekNetProfit >= 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {weekNetProfit >= 0 ? '✨ กำไรทั้งสัปดาห์' : '⚠️ ขาดทุนทั้งสัปดาห์'}
                </span>
              </div>

              {/* Big Profit Display */}
              <div className="text-center py-2">
                <div className="text-xs text-slate-400 font-medium">กำไรสุทธิรวม 7 วัน</div>
                <div
                  className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                    weekNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {weekNetProfit >= 0 ? '+' : '-'}฿{Math.abs(weekNetProfit).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  เฉลี่ยกำไรวันละ{' '}
                  <span className="font-bold text-slate-700">
                    ฿{Math.round(weekNetProfit / 7).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Income vs Expense Grid */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5">
                  <p className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> รายรับรวมทั้งสัปดาห์
                  </p>
                  <p className="text-lg font-bold text-emerald-700 leading-tight mt-1">
                    ฿{weekTotalIncome.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-600/80">
                    เฉลี่ย ฿{Math.round(weekTotalIncome / 7).toLocaleString()}/วัน
                  </p>
                </div>

                <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2.5">
                  <p className="text-[11px] font-medium text-rose-800 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" /> รายจ่ายรวมทั้งสัปดาห์
                  </p>
                  <p className="text-lg font-bold text-rose-700 leading-tight mt-1">
                    ฿{weekTotalExpense.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-rose-600/80">
                    เฉลี่ย ฿{Math.round(weekTotalExpense / 7).toLocaleString()}/วัน
                  </p>
                </div>
              </div>
            </div>

            {/* 7-DAY MINI BAR CHART */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  📊 เปรียบเทียบรายรับ-รายจ่าย 7 วัน
                </h3>
                <span className="text-[11px] text-slate-400">แตะเพื่อดูวันนั้น</span>
              </div>

              {/* Chart Grid */}
              <div className="grid grid-cols-7 gap-1 pt-6 pb-2 items-end h-44 border-b border-slate-100">
                {weekDailyStats.map((item) => {
                  const incHeight = Math.max(Math.round((item.income / maxDailyIncomeInWeek) * 100), 4);
                  const expHeight = Math.max(Math.round((item.expense / maxDailyIncomeInWeek) * 100), 4);

                  return (
                    <button
                      key={item.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(item.dateStr);
                        setPeriodMode('day');
                      }}
                      className={`flex flex-col items-center justify-end h-full group p-0.5 rounded-lg transition-all ${
                        item.isSelected ? 'bg-slate-100 ring-2 ring-emerald-500' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-full flex items-end justify-center gap-1 h-28 mb-2">
                        {/* Income Bar (Green) */}
                        <div
                          style={{ height: `${incHeight}%` }}
                          className="w-2.5 sm:w-3.5 bg-emerald-500 rounded-t-sm transition-all group-hover:bg-emerald-600 relative"
                          title={`รายรับ: ฿${item.income.toLocaleString()}`}
                        />
                        {/* Expense Bar (Rose) */}
                        <div
                          style={{ height: `${expHeight}%` }}
                          className="w-2.5 sm:w-3.5 bg-rose-400 rounded-t-sm transition-all group-hover:bg-rose-500 relative"
                          title={`รายจ่าย: ฿${item.expense.toLocaleString()}`}
                        />
                      </div>

                      {/* Day Label */}
                      <span className="text-[11px] font-bold text-slate-700">
                        {item.dayShort}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {item.dayNum}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Legend & Quick Info */}
              <div className="flex justify-between items-center pt-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" /> รายรับ
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-400" /> รายจ่าย
                  </span>
                </div>
                <span className="text-slate-400">รวม {weekTransactions.length} รายการ</span>
              </div>
            </div>

            {/* CATEGORY BREAKDOWN FOR WEEK */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                🏆 หมวดหมู่สร้างรายได้ประจำสัปดาห์
              </h3>

              <div className="space-y-2.5">
                {getCategoryStats(weekTransactions, 'income').map((cat) => (
                  <div key={cat.id} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                      <span className="font-bold text-emerald-700">
                        ฿{cat.amount.toLocaleString()} ({cat.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}

                {getCategoryStats(weekTransactions, 'income').length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">ยังไม่มีข้อมูลรายรับในสัปดาห์นี้</p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                  🛒 ต้นทุน/รายจ่ายสูงสุดประจำสัปดาห์
                </h3>

                <div className="space-y-2.5">
                  {getCategoryStats(weekTransactions, 'expense').map((cat) => (
                    <div key={cat.id} className="text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-700">{cat.name}</span>
                        <span className="font-bold text-rose-700">
                          ฿{cat.amount.toLocaleString()} ({cat.percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-rose-500 h-2 rounded-full"
                          style={{ width: `${cat.percent}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {getCategoryStats(weekTransactions, 'expense').length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-2">ยังไม่มีข้อมูลรายจ่ายในสัปดาห์นี้</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ============================================================== */}
        {/* 3. MONTHLY VIEW (สรุปรายเดือน พร้อมสถิติ 4-5 สัปดาห์) */}
        {/* ============================================================== */}
        {periodMode === 'month' && (
          <>
            {/* Monthly Summary Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-purple-500" /> สรุปกำไรประจำเดือน
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    monthNetProfit >= 0
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {monthNetProfit >= 0 ? '✨ กำไรทั้งเดือน' : '⚠️ ขาดทุนทั้งเดือน'}
                </span>
              </div>

              {/* Big Profit Display */}
              <div className="text-center py-2">
                <div className="text-xs text-slate-400 font-medium">กำไรสุทธิตลอดเดือน {monthInfo.label}</div>
                <div
                  className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                    monthNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {monthNetProfit >= 0 ? '+' : '-'}฿{Math.abs(monthNetProfit).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 font-medium">
                  อัตรากำไร (Margin){' '}
                  <span className="font-bold text-slate-700">
                    {monthTotalIncome > 0
                      ? `${Math.round((monthNetProfit / monthTotalIncome) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>

              {/* Income vs Expense Grid */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5">
                  <p className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> รายรับรวมทั้งเดือน
                  </p>
                  <p className="text-lg font-bold text-emerald-700 leading-tight mt-1">
                    ฿{monthTotalIncome.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-emerald-600/80">
                    เฉลี่ย ฿{Math.round(monthTotalIncome / monthInfo.totalDays).toLocaleString()}/วัน
                  </p>
                </div>

                <div className="bg-rose-50/70 border border-rose-100 rounded-xl p-2.5">
                  <p className="text-[11px] font-medium text-rose-800 flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-rose-600" /> รายจ่ายรวมทั้งเดือน
                  </p>
                  <p className="text-lg font-bold text-rose-700 leading-tight mt-1">
                    ฿{monthTotalExpense.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-rose-600/80">
                    เฉลี่ย ฿{Math.round(monthTotalExpense / monthInfo.totalDays).toLocaleString()}/วัน
                  </p>
                </div>
              </div>
            </div>

            {/* BREAKDOWN BY WEEKS IN THIS MONTH */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                📆 สรุปยอดแยกแต่ละสัปดาห์ในเดือนนี้
              </h3>

              <div className="space-y-2">
                {monthWeeklyBreakdown.map((w) => (
                  <div
                    key={w.weekNum}
                    className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-xs text-slate-800">{w.label}</span>
                      <span
                        className={`text-xs font-extrabold ${
                          w.net >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {w.net >= 0 ? '+' : '-'}฿{Math.abs(w.net).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-emerald-700 font-medium">
                        รับ: ฿{w.income.toLocaleString()}
                      </span>
                      <span className="text-rose-700 font-medium">
                        จ่าย: ฿{w.expense.toLocaleString()}
                      </span>
                      <span className="text-slate-400">
                        {w.count} รายการ
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CATEGORY BREAKDOWN FOR MONTH */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4">
              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                📊 สัดส่วนรายรับตลอดเดือน
              </h3>

              <div className="space-y-2.5 mb-4">
                {getCategoryStats(monthTransactions, 'income').map((cat) => (
                  <div key={cat.id} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                      <span className="font-bold text-emerald-700">
                        ฿{cat.amount.toLocaleString()} ({cat.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5 pt-3 border-t border-slate-100">
                🛒 สัดส่วนต้นทุนตลอดเดือน
              </h3>

              <div className="space-y-2.5">
                {getCategoryStats(monthTransactions, 'expense').map((cat) => (
                  <div key={cat.id} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                      <span className="font-bold text-rose-700">
                        ฿{cat.amount.toLocaleString()} ({cat.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-2 rounded-full"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* FLOATING ACTION: QUICK SWITCH BACK TO RECORD TODAY */}
      {periodMode !== 'day' && (
        <div className="fixed bottom-4 z-40 max-w-md w-full px-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              setSelectedDate(getTodayDateStr());
              setPeriodMode('day');
            }}
            className="py-3 px-6 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-extrabold text-sm rounded-full shadow-xl shadow-emerald-700/40 border border-emerald-400/30 flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-5 h-5" />
            <span>+ บันทึกยอดขายวันนี้</span>
          </button>
        </div>
      )}

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
                💬 ส่งสรุปยอดเข้า LINE
              </h4>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              ข้อความสรุปยอด (ตามโหมด{' '}
              {periodMode === 'day'
                ? 'รายวัน'
                : periodMode === 'week'
                ? 'รายสัปดาห์'
                : 'รายเดือน'}
              ) พร้อมส่ง:
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
