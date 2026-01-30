export enum ViewState {
  HOME = 'HOME', // Golf Joins
  MARKET = 'MARKET',
  COMMUNITY = 'COMMUNITY',
  REVIEWS = 'REVIEWS',
  PROFILE = 'PROFILE'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  points: number;
  freeJoinsUsed: number;
  location: string;
}

export interface JoinPost {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  courseName: string;
  date: string;
  time: string;
  greenFee: number; // Cost in 10,000 KRW unit roughly
  location: string;
  currentPlayers: number;
  maxPlayers: number;
  description: string;
  tags: string[];
  image: string;
  
  // New Features inspired by Golmate
  isManager?: boolean; // Hosted by a verified manager
  isUrgent?: boolean; // Upcoming date
  gender?: 'any' | 'male' | 'female' | 'couple';
  supportAmount?: number; // Cash support in KRW
}

export interface MarketItem {
  id: string;
  sellerId: string;
  sellerName: string;
  title: string;
  price: number;
  image: string;
  category: string;
  status: 'available' | 'reserved' | 'sold';
  location: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
  type: 'general' | 'review';
  rating?: number; // Only for reviews
}

export interface ManagerProfile {
  id: string;
  name: string;
  region: string;
  joinCount: number;
  image: string;
  rating: number;
}

export const JOIN_COST_POINTS = 100;
export const MAX_FREE_JOINS = 5;
export const REVIEW_REWARD_POINTS = 50;
