import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, User, JoinPost, MarketItem, Post, JOIN_COST_POINTS, MAX_FREE_JOINS, REVIEW_REWARD_POINTS } from './types';
import { 
  MobileNavbar, Header, JoinCard, MarketCard, CommunityCard, 
  Modal, FloatingActionButton 
} from './components/Components';
import { Plus, Search, CheckCircle, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import { askGolfCoach, generatePostHelp } from './services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Mock Data (Korean) ---

const INITIAL_USER: User = {
  id: 'u1',
  name: '김골프',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop', // Verified avatar
  points: 1500,
  freeJoinsUsed: 2,
  location: '서울 강남구'
};

const INITIAL_JOINS: JoinPost[] = [
  { 
    id: 'j1', hostId: 'h1', hostName: '박프로', 
    title: '스카이72 주말 라운딩 급구', courseName: '스카이72 GC', 
    date: '10월 28일', time: '08:00', greenFee: 25, 
    location: '인천', currentPlayers: 3, maxPlayers: 4, 
    description: '한 분만 더 모십니다. 명랑 골프 하실 분!', tags: ['주말', '오전'],
    // Classic Golf Course Green
    image: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=800&auto=format&fit=crop' 
  },
  { 
    id: 'j2', hostId: 'h2', hostName: '이이글', 
    title: '평일 새벽반 특가 조인', courseName: '골드 CC', 
    date: '10월 30일', time: '06:30', greenFee: 18, 
    location: '용인', currentPlayers: 2, maxPlayers: 4, 
    description: '매너 게임 하실 분 환영합니다. 내기 없음.', tags: ['평일', '새벽'],
    // Scenic Course
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'j3', hostId: 'h3', hostName: '최버디', 
    title: '골린이 환영합니다!', courseName: '안성 Q', 
    date: '11월 1일', time: '12:00', greenFee: 20, 
    location: '안성', currentPlayers: 1, maxPlayers: 4, 
    description: '연습 겸 즐겁게 치실 분 오세요.', tags: ['초보환영', '명랑'],
    // Golfer putting/green
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'j4', hostId: 'h4', hostName: '김싱글', 
    title: '남서울CC 명문 구장 조인', courseName: '남서울 CC', 
    date: '11월 3일', time: '13:00', greenFee: 28, 
    location: '성남', currentPlayers: 2, maxPlayers: 4, 
    description: '구력 3년 이상, 매너 좋으신 분 모십니다.', tags: ['주말', '오후'],
    // Wide Fairway
    image: 'https://images.unsplash.com/photo-1592919505780-30395071d480?q=80&w=800&auto=format&fit=crop'
  },
  { 
    id: 'j5', hostId: 'h5', hostName: '장타자', 
    title: '가평베네스트 야간 라운드', courseName: '가평베네스트', 
    date: '11월 5일', time: '17:30', greenFee: 15, 
    location: '가평', currentPlayers: 1, maxPlayers: 4, 
    description: '시원하게 야간 치실 분! 끝나고 식사도 해요.', tags: ['야간', '뒷풀이'],
    // Sunset Golf
    image: 'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?q=80&w=800&auto=format&fit=crop'
  },
];

const INITIAL_MARKET: MarketItem[] = [
  { 
    id: 'm1', sellerId: 's1', sellerName: '타이거', 
    title: '캘러웨이 매버릭 드라이버', price: 250000, 
    // Golf Club Image
    image: 'https://images.unsplash.com/photo-1591491640784-3232eb748d4b?q=80&w=400&auto=format&fit=crop', 
    category: '클럽', status: 'available', location: '강남구' 
  },
  { 
    id: 'm2', sellerId: 's2', sellerName: '로리', 
    title: '타이틀리스트 Pro V1 (1더즌)', price: 45000, 
    // Golf Ball Image
    image: 'https://images.unsplash.com/photo-1592659762303-90081d34b277?q=80&w=400&auto=format&fit=crop', 
    category: '용품', status: 'available', location: '서초구' 
  },
  { 
    id: 'm3', sellerId: 's3', sellerName: '스코티', 
    title: '풋조이 골프화 270mm', price: 80000, 
    // Golf Shoes/Bag Image
    image: 'https://images.unsplash.com/photo-1624637775532-348f3b25754f?q=80&w=400&auto=format&fit=crop', 
    category: '의류', status: 'sold', location: '송파구' 
  },
  { 
    id: 'm4', sellerId: 's4', sellerName: '골프왕', 
    title: '타이틀리스트 경량 스탠드백', price: 180000, 
    // Golf Bag
    image: 'https://images.unsplash.com/photo-1623567341691-1f46b5e6d634?q=80&w=400&auto=format&fit=crop', 
    category: '용품', status: 'reserved', location: '분당구' 
  },
  { 
    id: 'm5', sellerId: 's5', sellerName: '퍼팅도사', 
    title: '스카티카메론 뉴포트2 34인치', price: 420000, 
    // Putter / Green
    image: 'https://images.unsplash.com/photo-1591491719560-6f4e3c9d8137?q=80&w=400&auto=format&fit=crop', 
    category: '클럽', status: 'available', location: '판교' 
  },
  { 
    id: 'm6', sellerId: 's6', sellerName: '거리측정', 
    title: '부쉬넬 PRO XE 거리측정기', price: 350000, 
    // Golf Gadget / Field
    image: 'https://images.unsplash.com/photo-1616259024095-234237140813?q=80&w=400&auto=format&fit=crop', 
    category: '용품', status: 'available', location: '하남' 
  },
  { 
    id: 'm7', sellerId: 's7', sellerName: '숏게임', 
    title: '보키 SM8 웨지 52도, 56도 일괄', price: 200000, 
    // Clubs
    image: 'https://images.unsplash.com/photo-1535132011086-b8818f016104?q=80&w=400&auto=format&fit=crop', 
    category: '클럽', status: 'sold', location: '강동구' 
  },
  { 
    id: 'm8', sellerId: 's8', sellerName: '패션골퍼', 
    title: '말본 골프 버킷햇 (새상품)', price: 45000, 
    // Hat
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=400&auto=format&fit=crop', 
    category: '의류', status: 'available', location: '용산구' 
  }
];

const INITIAL_POSTS: Post[] = [
  { id: 'p1', authorId: 'a1', authorName: '아이언맨', title: '슬라이스 교정 팁 좀 알려주세요', content: '드라이버만 잡으면 우측으로 터지네요 ㅠㅠ 드릴 추천 부탁드립니다.', date: '2시간 전', likes: 5, comments: 12, type: 'general' },
  { id: 'p2', authorId: 'a2', authorName: '퍼팅여왕', title: '스카이72 오션코스 다녀왔어요', content: '그린 스피드도 빠르고 관리 상태가 너무 좋았습니다. 강추!', date: '1일 전', likes: 24, comments: 3, type: 'review', rating: 5 },
  { id: 'p3', authorId: 'a3', authorName: '김프로지망생', title: '겨울 골프 복장 질문이요', content: '영하로 떨어진다는데 히트텍 두 개 입으면 스윙 불편할까요? 핫팩 위치 추천 좀 해주세요!', date: '3시간 전', likes: 8, comments: 15, type: 'general' },
  { id: 'p4', authorId: 'a4', authorName: '주말골퍼', title: '베어크리크 포천 후기입니다', content: '역시 명문이네요. 잔디 상태 최상이고 캐디님도 너무 친절하셨습니다. 재방문의사 200%입니다.', date: '어제', likes: 32, comments: 5, type: 'review', rating: 5 },
  { id: 'p5', authorId: 'a5', authorName: '비거리왕', title: '드라이버 비거리 20m 늘린 썰', content: '하체 리드에 집중하고 백스윙 때 힘을 뺐더니 갑자기 거리가 늘었네요. 다들 힘 빼세요!', date: '4시간 전', likes: 45, comments: 20, type: 'general' },
  { id: 'p6', authorId: 'a6', authorName: '야간라운딩', title: '솔트베이 야간 조명 밝나요?', content: '퇴근하고 가보려고 하는데 공 찾기 쉬운지 궁금합니다. 모기는 좀 들어갔나요?', date: '6시간 전', likes: 2, comments: 8, type: 'general' },
  { id: 'p7', authorId: 'a7', authorName: '보기플레이어', title: '남서울 CC 도전기 (눈물)', content: '그린 난이도가 역시 악명 높네요. 쓰리퍼트 남발하고 왔습니다 ㅠㅠ 멘탈 털렸어요.', date: '2일 전', likes: 15, comments: 7, type: 'review', rating: 3 },
  { id: 'p8', authorId: 'a8', authorName: '골린이1호', title: '골프존 vs 카카오 스크린', content: '입문자인데 어디가 더 치기 편한가요? 추천 부탁드려요.', date: '오늘', likes: 3, comments: 11, type: 'general' },
  { id: 'p9', authorId: 'a9', authorName: '장비병환자', title: '타이틀리스트 T100 어떤가요?', content: '중급자용 아이언으로 바꾸려고 하는데 난이도가 많이 어려울까요? 시타 해보신 분?', date: '5시간 전', likes: 6, comments: 4, type: 'general' },
  { id: 'p10', authorId: 'a10', authorName: '싱글가즈아', title: '가평베네스트 가을 골프 최고네요', content: '단풍 구경 제대로 하고 왔습니다. 코스 관리 상태도 훌륭하고 날씨도 딱 좋았어요.', date: '3일 전', likes: 50, comments: 12, type: 'review', rating: 5 },
];

export default function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [joins, setJoins] = useState<JoinPost[]>(INITIAL_JOINS);
  const [marketItems, setMarketItems] = useState<MarketItem[]>(INITIAL_MARKET);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  // Modals State
  const [isJoinModalOpen, setJoinModalOpen] = useState(false);
  const [isChargeModalOpen, setChargeModalOpen] = useState(false);
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [selectedJoin, setSelectedJoin] = useState<JoinPost | null>(null);

  // AI & Form State
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');

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
      rating: type === 'review' ? 5 : undefined
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

  const renderHome = () => (
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

      <div className="px-4 mb-3 flex justify-between items-center">
        <h3 className="font-bold text-gray-900 text-lg tracking-tight">내 주변 조인 모집</h3>
        <button className="text-primary-700 text-sm font-semibold bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm hover:bg-gray-50">필터</button>
      </div>
      
      <div className="px-4">
        {joins.map(post => (
          <JoinCard key={post.id} post={post} onJoin={handleJoinRequest} />
        ))}
      </div>
      <FloatingActionButton onClick={() => alert('조인 모집 기능은 준비중입니다!')} icon={Plus} />
    </div>
  );

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
          <CommunityCard key={post.id} post={post} />
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

    </div>
  );
}
