import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, CheckCircle, FileText, Menu, X, BarChart2, AlertCircle, Trash2, RotateCcw, Shuffle, LogOut, User as UserIcon } from 'lucide-react';
import { documents, questions } from './data/questions';
import { QuestionType, Question, UserRecord, QuestionStatus, Statistics, User } from './types';
import { Auth } from './components/Auth';

const RECORDS_PREFIX = 'discipline_records_';
const CURRENT_USER_KEY = 'discipline_current_user';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string>(documents[0].id);
  const [selectedType, setSelectedType] = useState<QuestionType | 'all'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'practice' | 'wrong' | 'stats' | 'random'>('practice');
  
  // 做题记录状态
  const [records, setRecords] = useState<Record<string, UserRecord>>({});
  
  // 随机题目状态
  const [randomQuestions, setRandomQuestions] = useState<Question[]>([]);

  // 初始化加载用户
  useEffect(() => {
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to load user', e);
      }
    }
  }, []);

  // 初始化加载记录 (当用户改变时)
  useEffect(() => {
    if (currentUser) {
      const storageKey = `${RECORDS_PREFIX}${currentUser.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          setRecords(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load records', e);
        }
      } else {
        setRecords({});
      }
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(CURRENT_USER_KEY);
    setRecords({});
  };

  // 保存记录
  const saveRecord = (questionId: string, status: QuestionStatus, userAnswer: any) => {
    if (!currentUser) return;

    const storageKey = `${RECORDS_PREFIX}${currentUser.id}`;
    const newRecords = {
      ...records,
      [questionId]: {
        userId: currentUser.id,
        questionId,
        status,
        userAnswer,
        timestamp: Date.now()
      }
    };
    setRecords(newRecords);
    localStorage.setItem(storageKey, JSON.stringify(newRecords));
  };

  // 开始随机抽题练习
  const startRandomPractice = (count: number = 20) => {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, questions.length));
    setRandomQuestions(selected);
    setViewMode('random');
    if (window.innerWidth < 768) setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 随机切换分库练习
  const switchToRandomDoc = () => {
    const randomDoc = documents[Math.floor(Math.random() * documents.length)];
    setSelectedDoc(randomDoc.id);
    setSelectedType('all');
    setViewMode('practice');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 清空记录
  const clearRecords = () => {
    if (!currentUser) return;
    if (confirm('确定要清空您的做题记录和错题本吗？此操作不可撤销。')) {
      const storageKey = `${RECORDS_PREFIX}${currentUser.id}`;
      setRecords({});
      localStorage.removeItem(storageKey);
    }
  };

  // 计算统计数据
  const stats = useMemo(() => {
    const total = questions.length;
    const recordsList = Object.values(records) as UserRecord[];
    const attempted = recordsList.length;
    const correct = recordsList.filter(r => r.status === 'correct').length;
    const wrong = recordsList.filter(r => r.status === 'wrong').length;
    
    return {
      total,
      attempted,
      correct,
      wrong,
      accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0,
      progress: Math.round((attempted / total) * 100)
    };
  }, [records]);

  // 计算每个文档的进度
  const docStats = useMemo(() => {
    const result: Record<string, { progress: number; accuracy: number }> = {};
    documents.forEach(doc => {
      const docQuestions = questions.filter(q => q.documentId === doc.id);
      const docRecords = docQuestions.map(q => records[q.id]).filter(Boolean) as UserRecord[];
      const attempted = docRecords.length;
      const correct = docRecords.filter(r => r.status === 'correct').length;
      
      result[doc.id] = {
        progress: Math.round((attempted / docQuestions.length) * 100),
        accuracy: attempted > 0 ? Math.round((correct / attempted) * 100) : 0
      };
    });
    return result;
  }, [records]);

  // 过滤题目
  const filteredQuestions = useMemo(() => {
    if (viewMode === 'wrong') {
      return questions.filter(q => records[q.id]?.status === 'wrong');
    }
    
    return questions.filter(q => 
      q.documentId === selectedDoc && 
      (selectedType === 'all' || q.type === selectedType)
    );
  }, [selectedDoc, selectedType, viewMode, records]);

  const currentDoc = documents.find(d => d.id === selectedDoc);

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 flex flex-col`}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-800 text-white">
          <h1 className="text-lg font-bold flex items-center gap-2">
            <BookOpen size={20} />
            纪检监察题库
          </h1>
          <button className="md:hidden text-slate-300 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        {/* 导航模式切换 */}
        <div className="p-4 space-y-1">
          <button 
            onClick={() => setViewMode('practice')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${viewMode === 'practice' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <FileText size={18} /> 练习模式
          </button>
          <button 
            onClick={() => startRandomPractice(20)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${viewMode === 'random' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Shuffle size={18} /> 随机抽题
          </button>
          <button 
            onClick={() => setViewMode('wrong')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${viewMode === 'wrong' ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <AlertCircle size={18} /> 错题本 ({stats.wrong})
          </button>
          <button 
            onClick={() => setViewMode('stats')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${viewMode === 'stats' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BarChart2 size={18} /> 统计看板
          </button>
        </div>

        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">分库练习</span>
          <button 
            onClick={switchToRandomDoc}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="随机切换分库"
          >
            <Shuffle size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0 space-y-2">
          {documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedDoc(doc.id);
                setViewMode('practice');
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all group ${
                selectedDoc === doc.id && viewMode === 'practice'
                  ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <span className="truncate flex-1 pr-2">{doc.title}</span>
                <span className="text-[10px] opacity-60">{docStats[doc.id].progress}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${selectedDoc === doc.id ? 'bg-blue-500' : 'bg-slate-400'}`} 
                  style={{ width: `${docStats[doc.id].progress}%` }}
                />
              </div>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <UserIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-slate-800 truncate">{currentUser.username}</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">在线学习中</div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="退出登录"
            >
              <LogOut size={16} />
            </button>
          </div>
          <button 
            onClick={clearRecords}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={14} /> 清空个人记录
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center gap-4 sticky top-0 z-10">
          <button className="md:hidden text-slate-500" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-slate-800 truncate">
              {viewMode === 'practice' ? currentDoc?.title : viewMode === 'wrong' ? '错题本' : viewMode === 'random' ? '随机抽题' : '统计看板'}
            </h2>
            {viewMode === 'practice' && (
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <CheckCircle size={12} className="text-emerald-500" />
                  正确率: {docStats[selectedDoc].accuracy}%
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <FileText size={12} className="text-blue-500" />
                  进度: {docStats[selectedDoc].progress}%
                </div>
              </div>
            )}
          </div>
          
          {/* 全局简要统计 (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">总进度</div>
              <div className="text-sm font-bold text-slate-700">{stats.progress}%</div>
            </div>
            <div className="w-px h-6 bg-slate-200" />
            <div className="text-center">
              <div className="text-[10px] text-slate-400 uppercase font-bold">正确率</div>
              <div className="text-sm font-bold text-emerald-600">{stats.accuracy}%</div>
            </div>
          </div>
        </header>

        {/* Filters (Only in Practice Mode) */}
        {viewMode === 'practice' && (
          <div className="bg-white px-6 py-3 border-b border-slate-200 flex gap-2 overflow-x-auto hide-scrollbar">
            {[
              { id: 'all', label: '全部题型' },
              { id: 'single', label: '单项选择题' },
              { id: 'multiple', label: '多项选择题' },
              { id: 'short_answer', label: '简答题' },
              { id: 'essay', label: '论述题' },
            ].map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id as any)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedType === type.id
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}

        {/* Questions List or Stats View */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <div className="max-w-4xl mx-auto">
            {viewMode === 'stats' ? (
              <StatsDashboard stats={stats} docStats={docStats} documents={documents} />
            ) : (viewMode === 'random' ? randomQuestions : filteredQuestions).length > 0 ? (
              <div className="space-y-6">
                {(viewMode === 'random' ? randomQuestions : filteredQuestions).map((q, index) => (
                  <QuestionCard 
                    key={q.id} 
                    question={q} 
                    index={index + 1} 
                    record={records[q.id]}
                    onSave={saveRecord}
                  />
                ))}
                {viewMode === 'random' && (
                  <div className="pt-8 pb-12 text-center">
                    <button 
                      onClick={() => startRandomPractice(20)}
                      className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all flex items-center justify-center gap-2 mx-auto"
                    >
                      <Shuffle size={20} /> 换一批题目
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-32 text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  {viewMode === 'wrong' ? <CheckCircle size={40} className="text-emerald-400" /> : <FileText size={40} className="text-slate-300" />}
                </div>
                <h3 className="text-lg font-medium text-slate-800 mb-2">
                  {viewMode === 'wrong' ? '太棒了！暂无错题' : '暂无题目'}
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  {viewMode === 'wrong' ? '您的错题本是空的，继续保持！' : '该分类下暂无题目，请选择其他分类或题型。'}
                </p>
                {viewMode === 'wrong' && (
                  <button 
                    onClick={() => setViewMode('practice')}
                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    去练习
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatsDashboard: React.FC<{ 
  stats: Statistics; 
  docStats: Record<string, { progress: number; accuracy: number }>;
  documents: any[];
}> = ({ stats, docStats, documents }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 全局大卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <FileText size={20} />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">总进度</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-800">{stats.progress}%</span>
            <span className="text-sm text-slate-400">({stats.attempted}/{stats.total})</span>
          </div>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${stats.progress}%` }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <CheckCircle size={20} />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">总正确率</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-emerald-600">{stats.accuracy}%</span>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-relaxed">
            基于已完成的 {stats.attempted} 道题目计算。
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
              <AlertCircle size={20} />
            </div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">错题数</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-red-600">{stats.wrong}</span>
            <span className="text-sm text-slate-400">道</span>
          </div>
          <p className="mt-4 text-xs text-slate-500 leading-relaxed">
            错题已自动加入错题本，建议重点复习。
          </p>
        </div>
      </div>

      {/* 分库详情列表 */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">分库学习详情</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {documents.map(doc => (
            <div key={doc.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 hover:bg-slate-50 transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 mb-1 truncate">{doc.title}</h4>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-400">进度: {docStats[doc.id].progress}%</span>
                  <span className={`text-xs font-bold ${docStats[doc.id].accuracy > 80 ? 'text-emerald-500' : docStats[doc.id].accuracy > 60 ? 'text-orange-500' : 'text-slate-400'}`}>
                    正确率: {docStats[doc.id].accuracy}%
                  </span>
                </div>
              </div>
              <div className="w-full md:w-48 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${docStats[doc.id].progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                  style={{ width: `${docStats[doc.id].progress}%` }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const QuestionCard: React.FC<{ 
  question: Question; 
  index: number;
  record?: UserRecord;
  onSave: (id: string, status: QuestionStatus, answer: any) => void;
}> = ({ question, index, record, onSave }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | string[]>(record?.userAnswer || '');
  const [isSubmitted, setIsSubmitted] = useState(!!record);

  // 当记录改变时同步状态 (例如切换视图)
  useEffect(() => {
    if (record) {
      setUserAnswer(record.userAnswer || '');
      setIsSubmitted(true);
    } else {
      setUserAnswer('');
      setIsSubmitted(false);
      setShowAnswer(false);
    }
  }, [record, question.id]);

  const handleOptionToggle = (option: string) => {
    if (isSubmitted) return;
    
    if (question.type === 'single') {
      setUserAnswer(option);
    } else if (question.type === 'multiple') {
      const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
      if (currentAnswers.includes(option)) {
        setUserAnswer(currentAnswers.filter(a => a !== option));
      } else {
        setUserAnswer([...currentAnswers, option]);
      }
    }
  };

  const handleSubmit = () => {
    if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
      alert('请先选择或输入答案');
      return;
    }

    let isCorrect = false;
    if (question.type === 'single') {
      isCorrect = userAnswer === question.answer;
    } else if (question.type === 'multiple') {
      const correctAnswers = Array.isArray(question.answer) ? question.answer : [];
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
      isCorrect = correctAnswers.length === userAnswers.length && 
                  correctAnswers.every(a => userAnswers.includes(a));
    } else {
      // 简答题和论述题默认标记为已尝试，不计入正确率统计或标记为正确
      isCorrect = true; 
    }

    onSave(question.id, isCorrect ? 'correct' : 'wrong', userAnswer);
    setIsSubmitted(true);
    setShowAnswer(true);
  };

  const handleReset = () => {
    setUserAnswer('');
    setIsSubmitted(false);
    setShowAnswer(false);
  };

  const getTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'single': return '单选题';
      case 'multiple': return '多选题';
      case 'short_answer': return '简答题';
      case 'essay': return '论述题';
    }
  };

  return (
    <div className={`bg-white rounded-3xl shadow-sm border transition-all duration-300 ${
      isSubmitted 
        ? record?.status === 'correct' 
          ? 'border-emerald-100 ring-1 ring-emerald-50' 
          : 'border-red-100 ring-1 ring-red-50'
        : 'border-slate-200'
    } overflow-hidden`}>
      <div className="p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-black text-slate-200 leading-none">#{index}</span>
            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
              {getTypeLabel(question.type)}
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 leading-relaxed pt-0.5">
            {question.text}
          </h3>
        </div>

        {/* Options for Choice Questions */}
        {(question.type === 'single' || question.type === 'multiple') && question.options && (
          <div className="space-y-3 mt-4 md:pl-12">
            {question.options.map((option, i) => {
              const isSelected = question.type === 'single' 
                ? userAnswer === option 
                : Array.isArray(userAnswer) && userAnswer.includes(option);
              
              const isCorrect = question.type === 'single'
                ? question.answer === option
                : Array.isArray(question.answer) && question.answer.includes(option);

              let optionClass = "border-slate-100 bg-slate-50/50 hover:border-blue-200 hover:bg-blue-50/30";
              if (isSubmitted) {
                if (isCorrect) optionClass = "border-emerald-500 bg-emerald-50 text-emerald-800";
                else if (isSelected && !isCorrect) optionClass = "border-red-300 bg-red-50 text-red-800";
                else optionClass = "border-slate-100 bg-slate-50 opacity-60";
              } else if (isSelected) {
                optionClass = "border-blue-500 bg-blue-50 text-blue-800";
              }

              return (
                <label 
                  key={i} 
                  className={`flex items-start gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${optionClass} ${isSubmitted ? 'cursor-default' : ''}`}
                >
                  <div className="flex items-center h-5 mt-0.5">
                    <input
                      type={question.type === 'single' ? 'radio' : 'checkbox'}
                      name={`question-${question.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleOptionToggle(option)}
                      disabled={isSubmitted}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-sm font-medium leading-relaxed">{option}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Textarea for Text Questions */}
        {(question.type === 'short_answer' || question.type === 'essay') && (
          <div className="mt-4 md:pl-12">
            <textarea
              className="w-full border-2 border-slate-100 bg-slate-50/50 rounded-2xl p-5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
              rows={6}
              placeholder="请在此输入您的答案..."
              value={userAnswer as string}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={isSubmitted}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 md:pl-12 flex flex-wrap items-center gap-4">
          {!isSubmitted ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              提交答案
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowAnswer(!showAnswer)}
                className={`px-6 py-3 text-sm font-bold rounded-2xl transition-all flex items-center gap-2 ${
                  showAnswer ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {showAnswer ? '隐藏解析' : '查看解析'}
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-white border-2 border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-100 text-sm font-bold rounded-2xl transition-all flex items-center gap-2"
              >
                <RotateCcw size={16} /> 重新练习
              </button>
            </>
          )}
          
          {isSubmitted && (
            <div className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
              record?.status === 'correct' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
            }`}>
              {record?.status === 'correct' ? (
                <><CheckCircle size={14} /> 回答正确</>
              ) : (
                <><AlertCircle size={14} /> 回答错误</>
              )}
            </div>
          )}
        </div>

        {/* Answer & Explanation */}
        {showAnswer && (
          <div className="mt-8 md:pl-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              
              <div className="relative z-10">
                <h4 className="text-blue-400 text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CheckCircle size={14} />
                  参考答案
                </h4>
                <div className="text-lg font-bold mb-8 pb-8 border-b border-white/10 leading-relaxed">
                  {Array.isArray(question.answer) ? question.answer.join('，') : question.answer}
                </div>
                
                {question.explanation && (
                  <>
                    <h4 className="text-slate-400 text-xs font-black uppercase tracking-widest mb-4">
                      解析 / 依据
                    </h4>
                    <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">
                      {question.explanation}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
