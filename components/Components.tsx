import React from 'react';
import { 
  Home, ShoppingBag, MessageCircle, Star, User as UserIcon, 
  MapPin, Calendar, Users, DollarSign, Plus, X, Search, Coins,
  Sparkles, Crown, Timer, Heart, Trophy, ThumbsUp
} from 'lucide-react';
import { ViewState, User, JoinPost, MarketItem, Post, ManagerProfile, TopMember, MAX_FREE_JOINS, JOIN_COST_POINTS } from '../types';

// --- Navigation ---

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const MobileNavbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: ViewState.HOME, icon: Home, label: '조인' },
    { id: ViewState.MARKET, icon: ShoppingBag, label: '장터' },
    { id: ViewState.COMMUNITY, icon: MessageCircle, label: '커뮤니티' },
    { id: ViewState.REVIEWS, icon: Star, label: '후기' },
    { id: ViewState.PROFILE, icon: UserIcon, label: '내정보' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 pb-safe flex justify-between items-center z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setView(item.id)}
          className={`flex flex-col items-center p-2 transition-colors ${
            currentView === item.id ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Header ---

export const Header: React.FC<{ user: User; title: string; onCharge: () => void }> = ({ user, title, onCharge }) => (
  <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-4 py-3 z-40 flex justify-between items-center shadow-sm">
    <h1 className="text-xl font-bold text-primary-800 tracking-tight">{title}</h1>
    
    <div className="flex items-center gap-3">
      <button 
        onClick={onCharge}
        className="flex items-center gap-1.5 bg-primary-50 px-3 py-1 rounded-full border border-primary-100 active:scale-95 transition-transform"
      >
        <Coins size={16} className="text-primary-600" />
        <span className="text-sm font-bold text-primary-700">{user.points.toLocaleString()} P</span>
      </button>
      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-gray-300">
        <img src={user.avatar} alt="User" className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </div>
    </div>
  </div>
);

// --- UI Helpers ---

export const StarRating: React.FC<{ rating: number; max?: number; size?: number; setRating?: (r: number) => void }> = ({ rating, max = 5, size = 16, setRating }) => {
  return (
    <div className="flex gap-1">
      {[...Array(max)].map((_, i) => (
        <button 
          key={i} 
          type="button"
          disabled={!setRating}
          onClick={() => setRating && setRating(i + 1)}
          className={`${setRating ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        >
          <Star 
            size={size} 
            className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-100'}`} 
          />
        </button>
      ))}
    </div>
  );
};

// --- Cards ---

export const JoinCard: React.FC<{ post: JoinPost; onJoin: (post: JoinPost) => void }> = ({ post, onJoin }) => (
  <div className={`bg-white rounded-xl shadow-sm border mb-5 overflow-hidden hover:shadow-md transition-shadow relative ${post.isManager ? 'border-purple-200' : 'border-gray-100'}`}>
    
    {/* Badges Overlay */}
    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
      {post.isManager && (
        <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-sm">
          <Crown size={10} fill="currentColor" /> 매니저
        </span>
      )}
      {post.isUrgent && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1 shadow-sm animate-pulse">
          <Timer size={10} /> 마감임박
        </span>
      )}
    </div>

    {/* Image Header */}
    <div className="h-32 w-full relative">
      <img src={post.image} alt={post.courseName} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
        <h3 className="font-bold text-white text-lg line-clamp-1 text-shadow flex items-center gap-2">
          {post.title}
        </h3>
      </div>
    </div>

    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <div className="text-primary-700 font-semibold text-sm flex items-center gap-1">
           <MapPin size={14} /> {post.courseName}
        </div>
        <span className="text-xs text-gray-400">{post.location}</span>
      </div>

      <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-gray-400" />
          {post.date} {post.time}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 font-bold text-xs flex justify-center items-center w-[14px]">₩</span>
          <span className={post.supportAmount ? "line-through text-gray-400 text-xs mr-1" : ""}>{post.greenFee.toLocaleString()}만원</span>
          {post.supportAmount && (
            <span className="text-red-500 font-bold text-xs">(-{(post.supportAmount/10000)}만)</span>
          )}
        </div>
        <div className="flex items-center gap-2 col-span-2">
          <Users size={14} className="text-gray-400" />
          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary-500 h-full rounded-full" 
              style={{ width: `${(post.currentPlayers / post.maxPlayers) * 100}%` }} 
            />
          </div>
          <span className="text-xs">{post.currentPlayers}/{post.maxPlayers} 명</span>
        </div>
        {post.gender && post.gender !== 'any' && (
           <div className="col-span-2 text-xs flex items-center gap-1 text-pink-600 bg-pink-50 px-2 py-1 rounded w-fit">
             <Heart size={10} fill="currentColor" /> 
             {post.gender === 'female' ? '여성우대' : post.gender === 'couple' ? '커플환영' : '남성'}
           </div>
        )}
      </div>

      <button 
        onClick={() => onJoin(post)}
        className={`w-full text-white py-2.5 rounded-lg font-semibold shadow-sm transition-colors flex justify-center items-center gap-2 ${post.isManager ? 'bg-gradient-to-r from-purple-600 to-primary-600' : 'bg-primary-600 hover:bg-primary-700'}`}
      >
        {post.isManager ? '매니저 조인 신청' : '조인 신청하기'}
      </button>
    </div>
  </div>
);

export const ManagerProfileCard: React.FC<{ manager: ManagerProfile }> = ({ manager }) => (
  <div className="min-w-[140px] bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center">
    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-100 mb-2 shadow-sm">
      <img src={manager.image} alt={manager.name} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
    </div>
    <h4 className="font-bold text-sm text-gray-900">{manager.name}</h4>
    <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full mt-1 mb-2 font-medium">
      {manager.region}
    </span>
    <div className="flex items-center gap-1 text-[10px] text-gray-500">
      <Trophy size={10} className="text-yellow-500" />
      <span>{manager.joinCount}회 진행</span>
    </div>
    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-0.5">
       <Star size={10} className="text-yellow-400 fill-yellow-400" />
       <span>{manager.rating}</span>
    </div>
  </div>
);

export const TopMemberCard: React.FC<{ member: TopMember }> = ({ member }) => (
  <div className="min-w-[130px] bg-white rounded-xl p-3 border border-gray-100 shadow-sm flex flex-col items-center">
    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-100 mb-2 shadow-sm relative">
      <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 border border-gray-100 shadow-sm">
         <ThumbsUp size={12} className="text-primary-600 fill-primary-100" />
      </div>
    </div>
    <h4 className="font-bold text-sm text-gray-900">{member.name}</h4>
    <span className="text-[10px] text-primary-700 bg-primary-50 px-2 py-0.5 rounded-full mt-1 mb-1 font-medium border border-primary-100">
      {member.badge}
    </span>
    <p className="text-[10px] text-gray-400 text-center line-clamp-1 w-full">
      {member.description}
    </p>
  </div>
);

export const MarketCard: React.FC<{ item: MarketItem }> = ({ item }) => {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'reserved': return '예약중';
      case 'sold': return '판매완료';
      default: return '판매중';
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="relative aspect-square bg-gray-100">
        <img src={item.image} alt={item.title} className="w-full h-full object-cover" crossOrigin="anonymous" referrerPolicy="no-referrer" />
        {item.status !== 'available' && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm border-2 border-white px-2 py-1">
              {getStatusLabel(item.status)}
            </span>
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-1 flex-1">{item.title}</h3>
        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-gray-900">{item.price.toLocaleString()}원</span>
          <span className="text-xs text-gray-400">{item.location}</span>
        </div>
      </div>
    </div>
  );
};

export const CommunityCard: React.FC<{ post: Post; onClick?: () => void }> = ({ post, onClick }) => (
  <div 
    onClick={onClick} 
    className={`bg-white p-4 border-b border-gray-100 last:border-0 ${onClick ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
  >
    <div className="flex gap-2 items-center mb-2">
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
        post.type === 'review' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'
      }`}>
        {post.type === 'review' ? '후기' : '자유'}
      </span>
      {post.rating && (
        <div className="flex items-center gap-0.5">
          <StarRating rating={post.rating} size={12} />
        </div>
      )}
      <span className="text-xs text-gray-400 ml-auto">{post.date}</span>
    </div>
    <h3 className="font-bold text-gray-800 mb-1">{post.title}</h3>
    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{post.content}</p>
    <div className="flex items-center justify-between text-xs text-gray-400">
      <span>{post.authorName}</span>
      <div className="flex gap-3">
        <span className="flex items-center gap-1 text-gray-500">
          <MessageCircle size={12} /> {post.comments}
        </span>
      </div>
    </div>
  </div>
);

// --- Modals ---

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-5 max-h-[70vh] overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export const FloatingActionButton: React.FC<{ onClick: () => void; icon: React.ElementType; label?: string }> = ({ onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className="fixed bottom-20 right-4 bg-primary-600 text-white rounded-full p-4 shadow-lg shadow-primary-600/30 active:scale-95 transition-all flex items-center gap-2 z-40"
  >
    <Icon size={24} />
    {label && <span className="font-bold pr-1">{label}</span>}
  </button>
);
