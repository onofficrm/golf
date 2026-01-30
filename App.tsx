import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, User, JoinPost, MarketItem, Post, ManagerProfile, TopMember, JOIN_COST_POINTS, MAX_FREE_JOINS, REVIEW_REWARD_POINTS, Comment } from './types';
import { 
  MobileNavbar, Header, JoinCard, MarketCard, CommunityCard, 
  Modal, FloatingActionButton, ManagerProfileCard, TopMemberCard, StarRating
} from './components/Components';
import { Plus, Search, CheckCircle, Sparkles, MessageCircle, AlertCircle, Crown, Clock, Heart, Send, ThumbsUp } from 'lucide-react';
import { askGolfCoach, generatePostHelp } from './services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Mock Data (Korean) ---

const INITIAL_USER: User = {
  id: 'u1',
  name: '김골프',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop', 
  points: 1500,
  freeJoinsUsed: 2,
  location: '서울 강남구'
};

const INITIAL_MANAGERS: ManagerProfile[] = [
  { id: 'mg1', name: '박매니저', region: '경기 남부', joinCount: 128, rating: 4.9, image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop' },
  { id: 'mg2', name: '최실장', region: '경기 북부', joinCount: 85, rating: 4.8, image: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop' },
  { id: 'mg3', name: '김프로', region: '인천/서해', joinCount: 210, rating: 5.0, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop' },
  { id: 'mg4', name: '이팀장', region: '강원권', joinCount: 56, rating: 4.7, image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop' },
];

const INITIAL_TOP_MEMBERS: TopMember[] = [
  { id: 'tm1', name: '스마일골퍼', badge: '😁 분위기 메이커', description: '항상 밝게 웃으며 라운딩해요', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=150&auto=format&fit=crop' },
  { id: 'tm2', name: '매너왕이씨', badge: '🎩 젠틀맨', description: '동반자를 배려하는 매너 최고', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop' },
  { id: 'tm3', name: '룰마스터', badge: '📏 규칙준수', description: '정확한 룰 적용으로 깔끔하게', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop' },
  { id: 'tm4', name: '장타소녀', badge: '🚀 시원한샷', description: '답답함 없는 시원한 플레이', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop' },
  { id: 'tm5', name: '굿샷제조기', badge: '👏 칭찬봇', description: '동반자 기 살려주는 칭찬왕', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=150&auto=format&fit=crop' },
];

const INITIAL_JOINS: JoinPost[] = [
  { 
    id: 'j1', hostId: 'h1', hostName: '박매니저', 
    title: '[매니저] 스카이72 주말 황금시간', courseName: '스카이72 GC', 
    date: '10월 28일', time: '08:00', greenFee: 25, 
    location: '인천', currentPlayers: 3, maxPlayers: 4, 
    description: '검증된 매니저가 진행합니다. 매너 좋으신 분 환영!', tags: ['주말', '오전'],
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop',
    isManager: true, isUrgent: true, gender: 'any'
  },
  { 
    id: 'j2', hostId: 'h2', hostName: '이이글', 
    title: '내일 새벽 급구! 그린피 지원', courseName: '골드 CC', 
    date: '내일', time: '06:30', greenFee: 18, 
    location: '용인', currentPlayers: 2, maxPlayers: 4, 
    description: '갑자기 한 분이 빠지셔서 급하게 구합니다.', tags: ['평일', '새벽'],
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&auto=format&fit=crop',
    isUrgent: true, supportAmount: 30000, gender: 'male'
  },
  { 
    id: 'j3', hostId: 'h3', hostName: '최실장', 
    title: '여성 우대 명랑 골프', courseName: '안성 Q', 
    date: '11월 1일', time: '12:00', greenFee: 20, 
    location: '안성', currentPlayers: 1, maxPlayers: 4, 
    description: '부부 동반이나 여성 골퍼분 환영합니다.', tags: ['초보환영', '명랑'],
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop',
    isManager: true, gender: 'female'
  },
  { 
    id: 'j4', hostId: 'h4', hostName: '김싱글', 
    title: '남서울CC 명문 구장 조인', courseName: '남서울 CC', 
    date: '11월 3일', time: '13:00', greenFee: 28, 
    location: '성남', currentPlayers: 2, maxPlayers: 4, 
    description: '구력 3년 이상, 매너 좋으신 분 모십니다.', tags: ['주말', '오후'],
    image: 'https://images.unsplash.com/photo-1592919505780-30395071d480?q=80&w=800&auto=format&fit=crop',
    gender: 'any'
  },
  { 
    id: 'j5', hostId: 'h5', hostName: '장타자', 
    title: '가평베네스트 야간 라운드', courseName: '가평베네스트', 
    date: '11월 5일', time: '17:30', greenFee: 15, 
    location: '가평', currentPlayers: 1, maxPlayers: 4, 
    description: '시원하게 야간 치실 분! 끝나고 식사도 해요.', tags: ['야간', '뒷풀이'],
    image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?q=80&w=800&auto=format&fit=crop',
    gender: 'any'
  },
];

const INITIAL_MARKET: MarketItem[] = [
  { 
    id: 'm1', sellerId: 's1', sellerName: '타이거', 
    title: '캘러웨이 매버릭 드라이버', price: 250000, 
    image: 'https://images.unsplash.com/photo-1591491640784-3232eb748d4b?q=80&w=400&auto=format&fit=crop', 
    category: '클럽', status: 'available', location: '강남구' 
  },
  { 
    id: 'm2', sellerId: 's2', sellerName: '로리', 
    title: '타이틀리스트 Pro V1 (1더즌)', price: 45000, 
    image: 'https://images.unsplash.com/photo-1592659762303-90081d34b277?q=80&w=400&auto=format&fit=crop', 
    category: '용품', status: 'available', location: '서초구' 
  },
  { 
    id: 'm3', sellerId: 's3', sellerName: '스코티', 
    title: '풋조이 골프화 270mm', price: 80000, 
    image: 'https://images.unsplash.com/photo-1624637775532-348f3b25754f?q=80&w=400&auto=format&fit=crop', 
    category: '의류', status: 'sold', location: '송파구' 
  },
  { 
    id: 'm4', sellerId: 's4', sellerName: '골프왕', 
    title: '타이틀리스트 경량 스탠드백', price: 180000, 
    image: 'https://images.unsplash.com/photo-1623567341691-1f46b5e6d634?q=80&w=400&auto=format&fit=crop', 
    category: '용품', status: 'reserved', location: '분당구' 
  },
  { 
    id: 'm5', sellerId: 's5', sellerName: '퍼팅도사', 
    title: '스카티카메론 뉴포트2 34인치', price: 420000, 
    image: 'https://images.unsplash.com/photo-1591491719560-6f4e3c9d8137?q=80&w=400&auto=format&fit=crop', 
    category: '클럽', status: 'available', location: '판교' 
  },
  { 
    id: 'm6', sellerId: 's6', sellerName: '거리측정', 
    title: '부쉬넬 PRO XE 거리측정기', price: 350000, 
    image: 'https://images.unsplash.com/photo-1616259024095-234237140813?q=80&w=400&auto=format&fit=crop', 
    category: '용품', status: 'available', location: '하남' 
  },
  { 
    id: 'm7', sellerId: 's7', sellerName: '숏게임', 
    title: '보키 SM8 웨지 52도, 56도 일괄', price: 200000, 
    image: 'https://images.unsplash.com/photo-1535132011086-b8818f016104?q=80&w=400&auto=format&fit=crop', 
    category: '클럽', status: 'sold', location: '강동구' 
  },
  { 
    id: 'm8', sellerId: 's8', sellerName: '패션골퍼', 
    title: '말본 골프 버킷햇 (새상품)', price: 45000, 
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400&auto=format&fit=crop', 
    category: '의류', status: 'available', location: '용산구' 
  }
];

const INITIAL_POSTS: Post[] = [
  { id: 'p1', authorId: 'a1', authorName: '아이언맨', title: '슬라이스 교정 팁 좀 알려주세요', content: '드라이버만 잡으면 우측으로 터지네요 ㅠㅠ 드릴 추천 부탁드립니다.', date: '2시간 전', likes: 5, comments: 2, type: 'general', replies: [
    { id: 'c1', authorName: '레슨프로', content: '그립을 조금 더 강하게 잡아보세요.', date: '1시간 전' },
    { id: 'c2', authorName: '백돌이', content: '저도 같은 고민입니다..', date: '30분 전' }
  ] },
  { id: 'p2', authorId: 'a2', authorName: '퍼팅여왕', title: '스카이72 오션코스 다녀왔어요', content: '그린 스피드도 빠르고 관리 상태가 너무 좋았습니다. 강추!', date: '1일 전', likes: 24, comments: 1, type: 'review', rating: 5, replies: [
    { id: 'c3', authorName: '가고싶다', content: '부럽네요! 주말에 예약 힘든가요?', date: '어제' }
  ] },
  { id: 'p3', authorId: 'a3', authorName: '김프로지망생', title: '겨울 골프 복장 질문이요', content: '영하로 떨어진다는데 히트텍 두 개 입으면 스윙 불편할까요? 핫팩 위치 추천 좀 해주세요!', date: '3시간 전', likes: 8, comments: 0, type: 'general', replies: [] },
  { id: 'p4', authorId: 'a4', authorName: '주말골퍼', title: '베어크리크 포천 후기입니다', content: '역시 명문이네요. 잔디 상태 최상이고 캐디님도 너무 친절하셨습니다. 재방문의사 200%입니다.', date: '어제', likes: 32, comments: 5, type: 'review', rating: 5, replies: [] },
  { id: 'p5', authorId: 'a5', authorName: '비거리왕', title: '드라이버 비거리 20m 늘린 썰', content: '하체 리드에 집중하고 백스윙 때 힘을 뺐더니 갑자기 거리가 늘었네요. 다들 힘 빼세요!', date: '4시간 전', likes: 45, comments: 20, type: 'general', replies: [] },
  { id: 'p6', authorId: 'a6', authorName: '야간라운딩', title: '솔트베이 야간 조명 밝나요?', content: '퇴근하고 가보려고 하는데 공 찾기 쉬운지 궁금합니다. 모기는 좀 들어갔나요?', date: '6시간 전', likes: 2, comments: 8, type: 'general', replies: [] },
  { id: 'p7', authorId: 'a7', authorName: '보기플레이어', title: '남서울 CC 도전기 (눈물)', content: '그린 난이도가 역시 악명 높네요. 쓰리퍼트 남발하고 왔습니다 ㅠㅠ 멘탈 털렸어요.', date: '2일 전', likes: 15, comments: 7, type: 'review', rating: 3, replies: [] },
  { id: 'p8', authorId: 'a8', authorName: '골린이1호', title: '골프존 vs 카카오 스크린', content: '입문자인데 어디가 더 치기 편한가요? 추천 부탁드려요.', date: '오늘', likes: 3, comments: 11, type: 'general', replies: [] },
  { id: 'p9', authorId: 'a9', authorName: '장비병환자', title: '타이틀리스트 T100 어떤가요?', content: '중급자용 아이언으로 바꾸려고 하는데 난이도가 많이 어려울까요? 시타 해보신 분?', date: '5시간 전', likes: 6, comments: 4, type: 'general', replies: [] },
  { id: 'p10', authorId: 'a10', authorName: '싱글가즈아', title: '가평베네스트 가을 골프 최고네요', content: '단풍 구경 제대로 하고 왔습니다. 코스 관리 상태도 훌륭하고 날씨도 딱 좋았어요.', date: '3일 전', likes: 50, comments: 12, type: 'review', rating: 5, replies: [] },
];

type FilterType = 'ALL' | 'URGENT' | 'MANAGER' | 'FEMALE';

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [joins, setJoins] = useState<JoinPost[]>(INITIAL_JOINS);
  const [marketItems, setMarketItems] = useState<MarketItem[]>(INITIAL_MARKET);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  // Home Filters
  const [filter, setFilter] = useState<FilterType>('ALL');

  // Modals State
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [isChargeModalOpen, setChargeModalOpen] = useState(false);
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [selectedJoin, setSelectedJoin] = useState<JoinPost | null>(null);
  
  // Post Detail Modal
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentInput, setCommentInput] = useState('');

  // AI & Form State
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostRating, setNewPostRating] = useState(5);

  // --- Actions ---

  const handleChargePoints = (amount: number) => {
    setUser(prev => ({ ...prev, points: prev.points + amount }));
    setChargeModalOpen(false);
    alert(`${amount} 포인트가 충전되었습니다!`);
  };

  const handleJoinRequest = (post: JoinPost) => {
    setSelectedJoin(post);
    setJoinModalOpen(true);
  };

  const confirmJoin = () => {
    if (!selectedJoin) return;

    const isFree = user.freeJoinsUsed < MAX_FREE_JOINS;
    
    if (!isFree && user.points < JOIN_COST_POINTS) {
      alert("포인트가 부족합니다! 충전해주세요.");
      setJoinModalOpen(false);
      setChargeModalOpen(true);
      return;
    }

    // Process Join
    setUser(prev => ({
      ...prev,
      freeJoinsUsed: prev.freeJoinsUsed + 1,
      points: isFree ? prev.points : prev.points - JOIN_COST_POINTS
    }));

    setJoins(prev => prev.map(j => j.id === selectedJoin.id ? { ...j, currentPlayers: j.currentPlayers + 1 } : j));
    
    setJoinModalOpen(false);
    setSelectedJoin(null);
    alert(isFree ? `무료로 조인되었습니다! (남은 무료 횟수: ${MAX_FREE_JOINS - user.freeJoinsUsed - 1}회)` : `${JOIN_COST_POINTS} 포인트가 사용되었습니다.`);
  };

  const handleCreatePost = (type: 'general' | 'review') => {
    if (!newPostTitle || !newPostContent) return;

    const newPost: Post = {
      id: Date.now().toString(),
      authorId: user.id,
      authorName: user.name,
      title: newPostTitle,
      content: newPostContent,
      date: '방금 전',
      likes: 0,
      comments: 0,
      type: type,
      rating: type === 'review' ? newPostRating : undefined,
      replies: []
    };

    setPosts([newPost, ...posts]);
    
    // Reward for Review
    if (type === 'review') {
      setUser(prev => ({ ...prev, points: prev.points + REVIEW_REWARD_POINTS }));
      alert(`후기가 등록되었습니다! ${REVIEW_REWARD_POINTS} 포인트를 획득하셨습니다.`);
    }

    setPostModalOpen(false);
    setNewPostTitle('');
    setNewPostContent('');
    setAiResponse('');
    setNewPostRating(5);
  };

  const handleAddComment = () => {
    if (!selectedPost || !commentInput.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      authorName: user.name,
      content: commentInput,
      date: '방금 전'
    };

    const updatedPosts = posts.map(p => {
      if (p.id === selectedPost.id) {
        return {
          ...p,
          comments: p.comments + 1,
          replies: [newComment, ...(p.replies || [])]
        };
      }
      return p;
    });

    setPosts(updatedPosts);
    // Update currently selected post to reflect changes immediately in modal
    const updatedSelectedPost = updatedPosts.find(p => p.id === selectedPost.id) || null;
    setSelectedPost(updatedSelectedPost);
    setCommentInput('');
  };

  const triggerAiHelp = async (context: string) => {
    if (!context) return;
    setIsAiLoading(true);
    const result = await generatePostHelp(context, view === ViewState.REVIEWS ? 'community' : 'join');
    setAiResponse(result);
    setNewPostContent(prev => prev ? prev + "\n\n" + result : result);
    setIsAiLoading(false);
  };

  // --- Views ---

  const renderHome = () => {
    // Filter Logic
    const filteredJoins = joins.filter(join => {
      if (filter === 'URGENT') return join.isUrgent;
      if (filter === 'MANAGER') return join.isManager;
      if (filter === 'FEMALE') return join.gender === 'female';
      return true;
    });

    return (
      <div className="pb-24 pt-2">
        <div className="px-4 mb-5">
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-xl shadow-primary-500/20">
            <h2 className="font-bold text-lg mb-1 tracking-tight">라운딩 파트너 찾기</h2>
            <p className="text-primary-50 text-sm mb-6 font-light">{user.location} 근처 골퍼들과 함께하세요</p>
            <div className="flex gap-3">
               <div className="flex-1 bg-white/20 rounded-xl p-3 text-center backdrop-blur-md border border-white/20">
                  <span className="block text-xl font-bold">{Math.max(0, MAX_FREE_JOINS - user.freeJoinsUsed)}회</span>
                  <span className="text-[10px] text-white opacity-90 uppercase tracking-wider font-semibold">무료 조인</span>
               </div>
               <div className="flex-1 bg-white/20 rounded-xl p-3 text-center backdrop-blur-md border border-white/20">
                  <span className="block text-xl font-bold">{user.points.toLocaleString()}</span>
                  <span className="text-[10px] text-white opacity-90 uppercase tracking-wider font-semibold">보유 포인트</span>
               </div>
            </div>
          </div>
        </div>

        {/* Manager Section (Horizontal Scroll) */}
        <div className="mb-6">
          <div className="px-4 flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 text-lg tracking-tight flex items-center gap-1">
              <Crown size={18} className="text-yellow-500 fill-yellow-500" />
              이달의 우수 매니저
            </h3>
            <span className="text-xs text-gray-400">전체보기</span>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
            {INITIAL_MANAGERS.map(manager => (
              <ManagerProfileCard key={manager.id} manager={manager} />
            ))}
          </div>
        </div>

        {/* Top Members Section (Horizontal Scroll) */}
        <div className="mb-6">
          <div className="px-4 flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-900 text-lg tracking-tight flex items-center gap-1">
              <ThumbsUp size={18} className="text-primary-500 fill-primary-100" />
              이달의 매너왕
            </h3>
            <span className="text-xs text-gray-400">전체보기</span>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 no-scrollbar">
            {INITIAL_TOP_MEMBERS.map(member => (
              <TopMemberCard key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 mb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button 
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border ${filter === 'ALL' ? 'bg-gray-900 text-white border-gray-900 font-bold' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              전체
            </button>
            <button 
              onClick={() => setFilter('URGENT')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border flex items-center gap-1 ${filter === 'URGENT' ? 'bg-red-50 text-red-600 border-red-200 font-bold' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              <AlertCircle size={14} /> 임박특가
            </button>
            <button 
              onClick={() => setFilter('MANAGER')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border flex items-center gap-1 ${filter === 'MANAGER' ? 'bg-purple-50 text-purple-600 border-purple-200 font-bold' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              <Crown size={14} /> 매니저조인
            </button>
            <button 
              onClick={() => setFilter('FEMALE')}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors border flex items-center gap-1 ${filter === 'FEMALE' ? 'bg-pink-50 text-pink-600 border-pink-200 font-bold' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              <Heart size={14} /> 여성우대
            </button>
          </div>
        </div>
        
        <div className="px-4 mb-3 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg tracking-tight">
            {filter === 'ALL' ? '내 주변 조인 모집' : filter === 'URGENT' ? '마감 임박 조인' : filter === 'MANAGER' ? '믿고 가는 매니저 조인' : '여성/부부 우대 조인'}
          </h3>
        </div>
        
        <div className="px-4">
          {filteredJoins.length > 0 ? (
            filteredJoins.map(post => (
              <JoinCard key={post.id} post={post} onJoin={handleJoinRequest} />
            ))
          ) : (
             <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-gray-100 border-dashed">
                <p>조건에 맞는 조인이 없습니다.</p>
             </div>
          )}
        </div>
        <FloatingActionButton onClick={() => alert('조인 모집 기능은 준비중입니다!')} icon={Plus} />
      </div>
    );
  };

  const renderMarket = () => (
    <div className="pb-24 pt-2 px-4">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 text-gray-400" size={18} />
        <input 
          type="text" 
          placeholder="골프채, 용품, 의류 검색..." 
          className="w-full bg-white border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-sm shadow-sm"
        />
      </div>
      
      <h3 className="font-bold text-gray-900 mb-4 text-lg tracking-tight">인기 매물</h3>
      <div className="grid grid-cols-2 gap-4">
        {marketItems.map(item => (
          <MarketCard key={item.id} item={item} />
        ))}
      </div>
       <FloatingActionButton onClick={() => alert('물품 등록 기능은 준비중입니다!')} icon={Plus} />
    </div>
  );

  const renderCommunity = () => (
    <div className="pb-24 pt-2">
      <div className="px-4 mb-4 flex gap-2 overflow-x-auto no-scrollbar">
        {['전체', '자유게시판', '팁/노하우', '장비토크', '골프장 후기'].map((tab, i) => (
          <button key={tab} className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${i === 0 ? 'bg-primary-600 text-white font-bold shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}>
            {tab}
          </button>
        ))}
      </div>
      <div>
        {posts.filter(p => view === ViewState.REVIEWS ? p.type === 'review' : true).map(post => (
          <CommunityCard key={post.id} post={post} onClick={() => setSelectedPost(post)} />
        ))}
      </div>
      <FloatingActionButton 
        onClick={() => setPostModalOpen(true)} 
        icon={Plus} 
        label={view === ViewState.REVIEWS ? "후기 작성" : "글쓰기"} 
      />
    </div>
  );

  const renderProfile = () => {
    // Simple mock data for chart
    const data = [
      { name: '월', points: 400 },
      { name: '화', points: 300 },
      { name: '수', points: 300 },
      { name: '목', points: 200 },
      { name: '금', points: 278 },
      { name: '토', points: 189 },
      { name: '일', points: user.points },
    ];

    return (
      <div className="pb-24 px-4 pt-4">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mb-3 border-4 border-white shadow-lg">
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
          <p className="text-gray-500 text-sm flex items-center gap-1"><CheckCircle size={14} className="text-primary-600"/> 인증된 회원</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">포인트 내역</h3>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="points" stroke="#059669" fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <button 
            onClick={() => setChargeModalOpen(true)}
            className="w-full mt-4 bg-gray-900 text-white py-3 rounded-lg font-bold shadow-md active:scale-95 transition-transform"
          >
            포인트 충전
          </button>
        </div>

        <div className="space-y-3">
          <div className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
            <span className="text-gray-700">나의 조인</span>
            <span className="font-bold text-gray-900">{user.freeJoinsUsed + 5}회</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center shadow-sm">
            <span className="text-gray-700">작성한 후기</span>
            <span className="font-bold text-gray-900">12개</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans text-slate-800">
      <Header 
        user={user} 
        title={
          view === ViewState.HOME ? '당근골프' : 
          view === ViewState.MARKET ? '당근장터' : 
          view === ViewState.COMMUNITY ? '클럽하우스' : 
          view === ViewState.REVIEWS ? '골프장 후기' : '내 프로필'
        }
        onCharge={() => setChargeModalOpen(true)}
      />
      
      <main className="max-w-2xl mx-auto min-h-[calc(100vh-140px)]">
        {view === ViewState.HOME && renderHome()}
        {view === ViewState.MARKET && renderMarket()}
        {(view === ViewState.COMMUNITY || view === ViewState.REVIEWS) && renderCommunity()}
        {view === ViewState.PROFILE && renderProfile()}
      </main>

      <MobileNavbar currentView={view} setView={setView} />

      {/* --- Modals --- */}

      {/* Join Confirmation Modal */}
      <Modal 
        isOpen={isJoinModalOpen} 
        onClose={() => setJoinModalOpen(false)} 
        title="조인 확정"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
             <span className="font-bold text-gray-900">{selectedJoin?.title}</span>에 참여하시겠습니까?
          </p>
          <div className="bg-gray-50 p-4 rounded-lg text-sm border border-gray-100">
            <div className="flex justify-between mb-2">
              <span>주최자</span>
              <span className="font-medium">{selectedJoin?.hostName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>일시</span>
              <span className="font-medium">{selectedJoin?.date} {selectedJoin?.time}</span>
            </div>
            <div className="border-t border-gray-200 my-2 pt-2 flex justify-between text-primary-700 font-bold">
              <span>비용</span>
              <span>
                {user.freeJoinsUsed < MAX_FREE_JOINS ? '무료 (체험)' : `${JOIN_COST_POINTS} 포인트`}
              </span>
            </div>
            {selectedJoin?.supportAmount && (
               <div className="bg-green-50 text-green-700 p-2 rounded text-center font-bold mt-2">
                  🎁 지원금 {selectedJoin.supportAmount.toLocaleString()}원 지급
               </div>
            )}
          </div>
          <button 
            onClick={confirmJoin}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold text-lg shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
          >
            조인 확정하기
          </button>
        </div>
      </Modal>

      {/* Charge Points Modal */}
      <Modal 
        isOpen={isChargeModalOpen} 
        onClose={() => setChargeModalOpen(false)} 
        title="포인트 충전"
      >
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1000, 5000, 10000, 20000].map(amount => (
            <button 
              key={amount}
              onClick={() => handleChargePoints(amount)}
              className="border border-gray-200 hover:border-primary-600 hover:bg-primary-50 py-4 rounded-xl flex flex-col items-center transition-colors bg-white"
            >
              <span className="font-bold text-lg text-gray-900">{amount.toLocaleString()} P</span>
              <span className="text-xs text-gray-500">{amount.toLocaleString()}원</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-gray-400">안전한 결제 시스템 (테스트)</p>
      </Modal>

      {/* Create Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={() => setPostModalOpen(false)}
        title={view === ViewState.REVIEWS ? "후기 작성" : "새 글 쓰기"}
      >
        <div className="space-y-3">
          {view === ViewState.REVIEWS && (
            <div className="bg-orange-50 text-orange-800 px-3 py-2 rounded-lg text-xs flex items-center gap-2 border border-orange-100">
              <Sparkles size={14} />
              후기를 작성하고 {REVIEW_REWARD_POINTS} 포인트를 받으세요!
            </div>
          )}
          
          <input 
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-600 outline-none"
            placeholder="제목을 입력하세요"
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
          />

          {view === ViewState.REVIEWS && (
            <div className="flex items-center gap-2 px-1">
              <span className="text-sm font-bold text-gray-600">평점:</span>
              <StarRating rating={newPostRating} setRating={setNewPostRating} size={24} />
            </div>
          )}
          
          <div className="relative">
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:ring-2 focus:ring-primary-600 outline-none resize-none"
              placeholder={view === ViewState.REVIEWS ? "골프장은 어떠셨나요? 후기를 공유해주세요." : "자유롭게 이야기를 나누어보세요..."}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
            />
            {/* AI Assistant Button */}
            <button 
              onClick={() => triggerAiHelp(newPostTitle || "골프")}
              disabled={isAiLoading}
              className="absolute bottom-2 right-2 bg-primary-50 text-primary-800 text-xs px-2 py-1 rounded-md flex items-center gap-1 hover:bg-primary-100 transition-colors border border-primary-100"
            >
              <Sparkles size={12} />
              {isAiLoading ? '생성중...' : 'AI 도우미'}
            </button>
          </div>

          <button 
            onClick={() => handleCreatePost(view === ViewState.REVIEWS ? 'review' : 'general')}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold shadow-md"
          >
            등록
          </button>
        </div>
      </Modal>

      {/* Post Detail Modal */}
      <Modal 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
        title={selectedPost?.type === 'review' ? "후기 상세" : "게시글 상세"}
      >
        {selectedPost && (
          <div className="space-y-4">
             {/* Header */}
             <div className="flex gap-2 items-center mb-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedPost.type === 'review' ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-600'
                }`}>
                  {selectedPost.type === 'review' ? '후기' : '자유'}
                </span>
                <span className="text-sm text-gray-500">{selectedPost.authorName}</span>
                <span className="text-xs text-gray-400 ml-auto">{selectedPost.date}</span>
             </div>

             <div className="border-b border-gray-100 pb-4">
               <h3 className="font-bold text-xl text-gray-900 mb-2">{selectedPost.title}</h3>
               {selectedPost.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    <StarRating rating={selectedPost.rating} size={18} />
                    <span className="text-sm font-bold text-gray-600 ml-1">{selectedPost.rating}.0</span>
                  </div>
               )}
               <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
             </div>

             {/* Comments Section */}
             <div className="bg-gray-50 rounded-xl p-3">
               <div className="flex items-center gap-1 mb-3 text-sm font-bold text-gray-700">
                 <MessageCircle size={16} /> 댓글 {selectedPost.comments}
               </div>

               {/* List */}
               <div className="space-y-3 mb-4 max-h-[30vh] overflow-y-auto pr-1">
                 {selectedPost.replies && selectedPost.replies.length > 0 ? (
                   selectedPost.replies.map(reply => (
                     <div key={reply.id} className="bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm text-sm">
                       <div className="flex justify-between items-center mb-1">
                         <span className="font-bold text-gray-800">{reply.authorName}</span>
                         <span className="text-xs text-gray-400">{reply.date}</span>
                       </div>
                       <p className="text-gray-600">{reply.content}</p>
                     </div>
                   ))
                 ) : (
                   <p className="text-center text-gray-400 text-xs py-4">첫 댓글을 남겨주세요!</p>
                 )}
               </div>

               {/* Input */}
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={commentInput}
                   onChange={(e) => setCommentInput(e.target.value)}
                   onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                   placeholder="댓글을 입력하세요..."
                   className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary-500"
                 />
                 <button 
                   onClick={handleAddComment}
                   className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 transition-colors"
                 >
                   <Send size={16} />
                 </button>
               </div>
             </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
