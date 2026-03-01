import React, { useState } from 'react';
import { BookOpen, CheckCircle, FileText, Menu, X } from 'lucide-react';
import { documents, questions } from './data/questions';
import { QuestionType, Question } from './types';

export default function App() {
  const [selectedDoc, setSelectedDoc] = useState<string>(documents[0].id);
  const [selectedType, setSelectedType] = useState<QuestionType | 'all'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const filteredQuestions = questions.filter(q => 
    q.documentId === selectedDoc && 
    (selectedType === 'all' || q.type === selectedType)
  );

  const currentDoc = documents.find(d => d.id === selectedDoc);

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
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => {
                setSelectedDoc(doc.id);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${
                selectedDoc === doc.id 
                  ? 'bg-blue-50 text-blue-700 font-medium border border-blue-200' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              {doc.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center gap-4 sticky top-0 z-10">
          <button className="md:hidden text-slate-500" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-slate-800 truncate flex-1">
            {currentDoc?.title}
          </h2>
        </header>

        {/* Filters */}
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
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedType === type.id
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q, index) => (
                <QuestionCard key={q.id} question={q} index={index + 1} />
              ))
            ) : (
              <div className="text-center py-20 text-slate-500">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>该分类下暂无题目，请选择其他分类或题型。</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const QuestionCard: React.FC<{ question: Question; index: number }> = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | string[]>('');

  const handleOptionToggle = (option: string) => {
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

  const getTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'single': return '单选题';
      case 'multiple': return '多选题';
      case 'short_answer': return '简答题';
      case 'essay': return '论述题';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="flex-shrink-0 bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">
            {getTypeLabel(question.type)}
          </span>
          <h3 className="text-lg font-medium text-slate-800 leading-relaxed">
            {index}. {question.text}
          </h3>
        </div>

        {/* Options for Choice Questions */}
        {(question.type === 'single' || question.type === 'multiple') && question.options && (
          <div className="space-y-3 mt-4 pl-12">
            {question.options.map((option, i) => {
              const isSelected = question.type === 'single' 
                ? userAnswer === option 
                : Array.isArray(userAnswer) && userAnswer.includes(option);
              
              const isCorrect = question.type === 'single'
                ? question.answer === option
                : Array.isArray(question.answer) && question.answer.includes(option);

              let optionClass = "border-slate-200 hover:border-blue-300 hover:bg-blue-50";
              if (showAnswer) {
                if (isCorrect) optionClass = "border-green-500 bg-green-50 text-green-800";
                else if (isSelected && !isCorrect) optionClass = "border-red-300 bg-red-50 text-red-800";
              } else if (isSelected) {
                optionClass = "border-blue-500 bg-blue-50 text-blue-800";
              }

              return (
                <label 
                  key={i} 
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${optionClass}`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type={question.type === 'single' ? 'radio' : 'checkbox'}
                      name={`question-${question.id}`}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleOptionToggle(option)}
                      disabled={showAnswer}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-sm leading-tight">{option}</span>
                </label>
              );
            })}
          </div>
        )}

        {/* Textarea for Text Questions */}
        {(question.type === 'short_answer' || question.type === 'essay') && (
          <div className="mt-4 pl-12">
            <textarea
              className="w-full border border-slate-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-500"
              rows={4}
              placeholder="请在此输入您的答案..."
              value={userAnswer as string}
              onChange={(e) => setUserAnswer(e.target.value)}
              disabled={showAnswer}
            />
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 pl-12 flex justify-between items-center">
          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {showAnswer ? '隐藏答案' : '查看答案'}
          </button>
        </div>

        {/* Answer & Explanation */}
        {showAnswer && (
          <div className="mt-6 pl-12">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h4 className="text-emerald-800 font-bold mb-2 flex items-center gap-2">
                <CheckCircle size={18} />
                参考答案
              </h4>
              <p className="text-emerald-900 text-sm mb-4 whitespace-pre-wrap">
                {Array.isArray(question.answer) ? question.answer.join('，') : question.answer}
              </p>
              
              {question.explanation && (
                <>
                  <h4 className="text-slate-700 font-bold mb-2 text-sm">解析 / 依据</h4>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                    {question.explanation}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};