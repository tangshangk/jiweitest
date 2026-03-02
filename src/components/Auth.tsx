import React, { useState } from 'react';
import { User as UserIcon, Lock, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const getUsers = (): User[] => {
    const saved = localStorage.getItem('discipline_users');
    return saved ? JSON.parse(saved) : [];
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    const users = getUsers();

    if (isLogin) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('用户名或密码错误');
      }
    } else {
      if (users.some(u => u.username === username)) {
        setError('用户名已存在');
        return;
      }

      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        password,
        createdAt: Date.now()
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('discipline_users', JSON.stringify(updatedUsers));
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-500">
        <div className="bg-slate-800 p-10 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
            <ShieldCheck size={40} className="text-blue-400" />
          </div>
          <h2 className="text-2xl font-black mb-2 tracking-tight">纪检监察考试系统</h2>
          <p className="text-slate-400 text-sm font-medium">
            {isLogin ? '欢迎回来，请登录您的账号' : '创建一个新账号开始学习'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="p-10 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-xs font-bold p-4 rounded-2xl border border-red-100 animate-in shake duration-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">用户名</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-blue-500 focus:ring-0 outline-none transition-all"
                placeholder="请输入用户名"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-blue-500 focus:ring-0 outline-none transition-all"
                placeholder="请输入密码"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
            {isLogin ? '立即登录' : '注册账号'}
          </button>

          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
            >
              {isLogin ? '还没有账号？立即注册' : '已有账号？返回登录'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
