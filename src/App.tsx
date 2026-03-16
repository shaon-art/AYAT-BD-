/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import 'plyr-react/plyr.css';
import { Plyr } from 'plyr-react';
import { 
  Search, 
  Play, 
  Plus, 
  Edit2, 
  Trash2, 
  Lock, 
  ChevronLeft, 
  ChevronRight, 
  X,
  Film,
  LayoutDashboard,
  LogOut,
  Home as HomeIcon,
  Star,
  Loader2,
  FileText,
  AlertCircle,
  Upload,
  Server,
  Tag,
  Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---

interface MovieServer {
  name: string;
  url: string;
}

interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  videoUrl: string; // Legacy support
  servers?: MovieServer[];
  genre: string;
  year: string;
  description: string;
  status?: 'published' | 'draft';
  views?: number;
}

interface Report {
  id: string;
  movieId: string;
  movieTitle: string;
  timestamp: any;
  reason: string;
}

interface Category {
  id: string;
  name: string;
}

interface Channel {
  id: string;
  name: string;
  logoUrl: string;
  streamUrl: string;
  category: string;
}

// --- Initial Data ---

const INITIAL_MOVIES: Movie[] = [
  // --- Bangla Movies (10) ---
  {
    id: 'b1',
    title: 'Hawa',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Movie',
    year: '2022',
    description: 'A mystery drama set in the deep sea where a group of fishermen find a mysterious girl in their net.'
  },
  {
    id: 'b2',
    title: 'Priyotoma',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Movie',
    year: '2023',
    description: 'An action-packed romantic drama starring Shakib Khan.'
  },
  {
    id: 'b3',
    title: 'Poran',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Movie',
    year: '2022',
    description: 'A heart-wrenching love story based on true events.'
  },
  {
    id: 'b4',
    title: 'Surongo',
    posterUrl: 'https://images.unsplash.com/photo-1478720143022-10d0002856c3?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Movie',
    year: '2023',
    description: 'A thrilling heist movie about a man who digs a tunnel to a bank vault.'
  },
  {
    id: 'b5',
    title: 'Aynabaji',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2056&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Movie',
    year: '2016',
    description: 'A man who makes a living by serving jail time for others gets caught in a dangerous game.'
  },
  {
    id: 'b6',
    title: 'Monpura',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Movie',
    year: '2009',
    description: 'A classic romantic tragedy set in a remote island.'
  },
  {
    id: 'b7',
    title: 'Dhaka Attack',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Movie',
    year: '2017',
    description: 'A high-octane police action thriller.'
  },
  {
    id: 'b8',
    title: 'Debi',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Movie',
    year: '2018',
    description: 'A mystery film based on Humayun Ahmed\'s famous character Misir Ali.'
  },
  {
    id: 'b9',
    title: 'Rehana Maryam Noor',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Movie',
    year: '2021',
    description: 'A powerful drama about a female doctor fighting for justice.'
  },
  {
    id: 'b10',
    title: 'Guerrilla',
    posterUrl: 'https://images.unsplash.com/photo-1478720143022-10d0002856c3?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Movie',
    year: '2011',
    description: 'A film set during the 1971 Liberation War of Bangladesh.'
  },

  // --- Tamil Bangla Dubbed (10) ---
  {
    id: 't1',
    title: 'Pushpa: The Rise (Bangla)',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2056&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Tamil Dubbed',
    year: '2021',
    description: 'A laborer rises through the ranks of a red sandalwood smuggling syndicate.'
  },
  {
    id: 't2',
    title: 'K.G.F: Chapter 1 (Bangla)',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Tamil Dubbed',
    year: '2018',
    description: 'Rocky, a high-ranking assassin, goes undercover as a slave laborer in the Kolar Gold Fields.'
  },
  {
    id: 't3',
    title: 'K.G.F: Chapter 2 (Bangla)',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Tamil Dubbed',
    year: '2022',
    description: 'The blood-soaked land of Kolar Gold Fields has a new overlord now - Rocky.'
  },
  {
    id: 't4',
    title: 'Vikram (Bangla)',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Tamil Dubbed',
    year: '2022',
    description: 'A high-octane action thriller starring Kamal Haasan.'
  },
  {
    id: 't5',
    title: 'Leo (Bangla)',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Tamil Dubbed',
    year: '2023',
    description: 'An action thriller starring Thalapathy Vijay.'
  },
  {
    id: 't6',
    title: 'Jailer (Bangla)',
    posterUrl: 'https://images.unsplash.com/photo-1478720143022-10d0002856c3?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Tamil Dubbed',
    year: '2023',
    description: 'A retired jailer goes on a mission to save his son.'
  },
  {
    id: 't7',
    title: 'Ponniyin Selvan: I (Bangla)',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2056&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Tamil Dubbed',
    year: '2022',
    description: 'An epic historical drama based on the Chola dynasty.'
  },
  {
    id: 't8',
    title: 'Master (Bangla)',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Tamil Dubbed',
    year: '2021',
    description: 'An alcoholic professor is sent to a juvenile school.'
  },
  {
    id: 't9',
    title: 'Beast (Bangla)',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Tamil Dubbed',
    year: '2022',
    description: 'A former RAW agent takes on terrorists in a mall.'
  },
  {
    id: 't10',
    title: 'Varisu (Bangla)',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Tamil Dubbed',
    year: '2023',
    description: 'A family drama about a son who returns to save his father\'s business.'
  },

  // --- Hindi Movies (10) ---
  {
    id: 'h1',
    title: 'Pathaan',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Hindi Movie',
    year: '2023',
    description: 'An exiled RAW agent comes back to save India from a terrorist group.'
  },
  {
    id: 'h2',
    title: 'Jawan',
    posterUrl: 'https://images.unsplash.com/photo-1478720143022-10d0002856c3?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Hindi Movie',
    year: '2023',
    description: 'A man is driven by a personal vendetta to rectify the wrongs in society.'
  },
  {
    id: 'h3',
    title: 'Animal',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2056&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Hindi Movie',
    year: '2023',
    description: 'A father-son relationship set against the backdrop of a violent underworld.'
  },
  {
    id: 'h4',
    title: 'Dangal',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Hindi Movie',
    year: '2016',
    description: 'A former wrestler trains his daughters to become world-class wrestlers.'
  },
  {
    id: 'h5',
    title: 'Baahubali 2: The Conclusion',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Hindi Movie',
    year: '2017',
    description: 'The conclusion to the epic saga of Baahubali.'
  },
  {
    id: 'h6',
    title: 'RRR',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Hindi Movie',
    year: '2022',
    description: 'A fictional story about two legendary revolutionaries.'
  },
  {
    id: 'h7',
    title: '3 Idiots',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Hindi Movie',
    year: '2009',
    description: 'Two friends search for their long-lost companion.'
  },
  {
    id: 'h8',
    title: 'PK',
    posterUrl: 'https://images.unsplash.com/photo-1478720143022-10d0002856c3?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Hindi Movie',
    year: '2014',
    description: 'An alien on Earth asks questions that no one has asked before.'
  },
  {
    id: 'h9',
    title: 'Bajrangi Bhaijaan',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2056&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Hindi Movie',
    year: '2015',
    description: 'A man with a magnanimous heart takes a young mute Pakistani girl back to her homeland.'
  },
  {
    id: 'h10',
    title: 'Sholay',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Hindi Movie',
    year: '1975',
    description: 'A classic action-adventure film about two criminals hired to capture a ruthless bandit.'
  },

  // --- Bangladeshi Natok (20) ---
  {
    id: 'n1',
    title: 'Bachelor Point (S4)',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2022',
    description: 'The popular comedy series about bachelors living in Dhaka.'
  },
  {
    id: 'n2',
    title: 'Female',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2023',
    description: 'A hilarious comedy drama.'
  },
  {
    id: 'n3',
    title: 'Punormilone',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2023',
    description: 'A touching family drama.'
  },
  {
    id: 'n4',
    title: 'Mayer Daak',
    posterUrl: 'https://images.unsplash.com/photo-1478720143022-10d0002856c3?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2021',
    description: 'A story about a mother\'s love and sacrifice.'
  },
  {
    id: 'n5',
    title: 'Taka',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2056&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2022',
    description: 'A drama about the influence of money in relationships.'
  },
  {
    id: 'n6',
    title: 'Buker Modhye Agun',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2023',
    description: 'A thrilling mystery drama.'
  },
  {
    id: 'n7',
    title: 'Networker Baire',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2021',
    description: 'A story about friends and their unexpected journey.'
  },
  {
    id: 'n8',
    title: 'Syndicate',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2022',
    description: 'A crime thriller about a powerful syndicate.'
  },
  {
    id: 'n9',
    title: 'Karagar',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2022',
    description: 'A mystery thriller set in a prison.'
  },
  {
    id: 'n10',
    title: 'Mohanagar',
    posterUrl: 'https://images.unsplash.com/photo-1478720143022-10d0002856c3?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2021',
    description: 'A gripping crime thriller set in Dhaka city.'
  },
  {
    id: 'n11',
    title: 'Kaiser',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2056&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2022',
    description: 'A mystery thriller about a detective.'
  },
  {
    id: 'n12',
    title: 'Pett Kata Shaw',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2022',
    description: 'A horror anthology series.'
  },
  {
    id: 'n13',
    title: 'Unoloukik',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2021',
    description: 'A psychological thriller anthology.'
  },
  {
    id: 'n14',
    title: 'Ladies & Gentlemen',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2021',
    description: 'A drama about gender issues in the workplace.'
  },
  {
    id: 'n15',
    title: 'Taqdeer',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2020',
    description: 'A thriller about a freezer van driver.'
  },
  {
    id: 'n16',
    title: 'Contract',
    posterUrl: 'https://images.unsplash.com/photo-1478720143022-10d0002856c3?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2021',
    description: 'An action thriller about a hitman.'
  },
  {
    id: 'n17',
    title: 'Mainkar Chipay',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2056&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2020',
    description: 'A dark comedy thriller.'
  },
  {
    id: 'n18',
    title: 'August 14',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2020',
    description: 'A crime thriller based on true events.'
  },
  {
    id: 'n19',
    title: 'Morichika',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2021',
    description: 'A thriller about a model\'s murder.'
  },
  {
    id: 'n20',
    title: 'Sabrina',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Bangla Natok',
    year: '2022',
    description: 'A drama about two women named Sabrina.'
  }
];

// --- Components ---

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [featuredMovieId, setFeaturedMovieId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'player' | 'livetv'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [initialEditMovie, setInitialEditMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info';
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    message: '',
  });
  const [dbError, setDbError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [sortBy, setSortBy] = useState<'none' | 'newest' | 'popular'>('none');
  const [supportModal, setSupportModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({
    isOpen: false,
    title: '',
    content: '',
  });

  // Initialize data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesRes, featuredRes, reportsRes, categoriesRes, channelsRes] = await Promise.all([
          fetch('/api/movies'),
          fetch('/api/config/featured'),
          fetch('/api/reports'),
          fetch('/api/categories'),
          fetch('/api/channels')
        ]);

        const moviesList = await moviesRes.json();
        const featuredData = await featuredRes.json();
        const reportsList = await reportsRes.json();
        const categoriesList = await categoriesRes.json();
        const channelsList = await channelsRes.json();

        if (moviesList.length < INITIAL_MOVIES.length && isLoading) {
          // Seed initial data if missing some
          const existingTitles = new Set(moviesList.map((m: any) => m.title));
          for (const movie of INITIAL_MOVIES) {
            if (!existingTitles.has(movie.title)) {
              const { id, ...movieData } = movie;
              await fetch('/api/movies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieData)
              });
            }
          }
          // Re-fetch after seeding
          const reFetchRes = await fetch('/api/movies');
          setMovies(await reFetchRes.json());
        } else {
          setMovies(moviesList);
        }

        // Seed initial channels if empty
        if (channelsList.length === 0 && isLoading) {
          const initialChannels = [
            { name: 'Somoy TV', logoUrl: 'https://images.unsplash.com/photo-1585829365234-781fcd5013d9?q=80&w=200&h=200&auto=format&fit=crop', streamUrl: 'https://www.youtube.com/embed/YoHD9XEInc0', category: 'News' },
            { name: 'Independent TV', logoUrl: 'https://images.unsplash.com/photo-1585829365234-781fcd5013d9?q=80&w=200&h=200&auto=format&fit=crop', streamUrl: 'https://www.youtube.com/embed/YoHD9XEInc0', category: 'News' },
            { name: 'Channel i', logoUrl: 'https://images.unsplash.com/photo-1585829365234-781fcd5013d9?q=80&w=200&h=200&auto=format&fit=crop', streamUrl: 'https://www.youtube.com/embed/YoHD9XEInc0', category: 'Entertainment' },
            { name: 'NTV', logoUrl: 'https://images.unsplash.com/photo-1585829365234-781fcd5013d9?q=80&w=200&h=200&auto=format&fit=crop', streamUrl: 'https://www.youtube.com/embed/YoHD9XEInc0', category: 'Entertainment' },
          ];
          for (const channel of initialChannels) {
            await fetch('/api/channels', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(channel)
            });
          }
          const reFetchChannels = await fetch('/api/channels');
          setChannels(await reFetchChannels.json());
        } else {
          setChannels(channelsList);
        }

        setFeaturedMovieId(featuredData.movieId);
        setReports(reportsList);
        
        // Seed categories if missing
        const requiredCategories = ['Bangla Movie', 'Tamil Dubbed', 'Hindi Movie', 'Bangla Natok'];
        const existingCategoryNames = new Set(categoriesList.map((c: any) => c.name));
        for (const catName of requiredCategories) {
          if (!existingCategoryNames.has(catName)) {
            await fetch('/api/categories', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: catName })
            });
          }
        }
        
        // Re-fetch categories if any were added
        if (requiredCategories.some(cat => !existingCategoryNames.has(cat))) {
          const reFetchCats = await fetch('/api/categories');
          setCategories(await reFetchCats.json());
        } else {
          setCategories(categoriesList);
        }

        setIsLoading(false);
        setDbError(null);
      } catch (error) {
        console.error("API error:", error);
        setDbError("Failed to connect to the server. Please ensure the backend is running.");
        setIsLoading(false);
      }
    };

    fetchData();
    
    // Polling for "real-time" updates (optional, but good for demo)
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-logout feature (10 minutes of inactivity)
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    let logoutTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        setIsAdminLoggedIn(false);
        setCurrentView('home');
        console.log('Admin logged out due to 10 minutes of inactivity.');
      }, 10 * 60 * 1000); // 10 minutes
    };

    // Initial timer start
    resetTimer();

    // Event listeners to detect activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetTimer));

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      events.forEach(event => document.removeEventListener(event, resetTimer));
    };
  }, [isAdminLoggedIn]);

  // Secret Admin Route Listener
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#control-panel-ayat-') {
        setCurrentView('admin');
        // Clear hash after entering to keep it somewhat hidden from the address bar
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const featuredMovie = useMemo(() => 
    movies.find(m => m.id === featuredMovieId) || movies[0], 
    [movies, featuredMovieId]
  );

  const categoryNames = useMemo(() => {
    return ['All', ...categories.map(c => c.name)];
  }, [categories]);

  const filteredMovies = useMemo(() => {
    let list = movies.filter(m => 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (selectedCategory !== 'All') {
      list = list.filter(m => m.genre.includes(selectedCategory));
    }

    if (currentView !== 'admin') {
      list = list.filter(m => m.status !== 'draft');
    }

    if (sortBy === 'newest') {
      list = [...list].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    } else if (sortBy === 'popular') {
      list = [...list].sort((a, b) => (b.views || 0) - (a.views || 0));
    }

    return list;
  }, [movies, searchQuery, selectedCategory, currentView, sortBy]);

  const handlePlayMovie = async (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentView('player');
    window.scrollTo(0, 0);
    
    // Increment view count
    try {
      await fetch(`/api/movies/${movie.id}/view`, { method: 'POST' });
    } catch (error) {
      console.error("Error incrementing views:", error);
    }
  };

  const handleAdminLogin = (password: string) => {
    if (password === '2242') {
      setIsAdminLoggedIn(true);
      return true;
    }
    return false;
  };

  const handleAddMovie = async (newMovie: Omit<Movie, 'id'>) => {
    try {
      const res = await fetch('/api/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMovie)
      });
      const data = await res.json();
      setMovies(prev => [...prev, data]);
    } catch (error) {
      console.error("Error adding movie: ", error);
    }
  };

  const handleUpdateMovie = async (updatedMovie: Movie) => {
    try {
      setMovies(prev => prev.map(m => m.id === updatedMovie.id ? updatedMovie : m));
      await fetch(`/api/movies/${updatedMovie.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMovie)
      });
    } catch (error) {
      console.error("Error updating movie: ", error);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    try {
      setMovies(prev => prev.filter(m => m.id !== id));
      await fetch(`/api/movies/${id}`, { method: 'DELETE' });
      if (featuredMovieId === id) {
        setFeaturedMovieId('');
        await fetch('/api/config/featured', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ movieId: '' })
        });
      }
    } catch (error) {
      console.error("Error deleting movie: ", error);
    }
  };

  const handleSetFeatured = async (id: string) => {
    try {
      setFeaturedMovieId(id);
      await fetch('/api/config/featured', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ movieId: id })
      });
    } catch (error) {
      console.error("Error setting featured: ", error);
    }
  };

  const handleReportBrokenLink = async (movie: Movie, reason: string) => {
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          movieId: movie.id,
          movieTitle: movie.title,
          reason: reason
        })
      });
      return true;
    } catch (error) {
      console.error("Error reporting broken link: ", error);
      return false;
    }
  };

  const handleBulkUpload = async (moviesData: any[]) => {
    try {
      for (const movie of moviesData) {
        await fetch('/api/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(movie)
        });
      }
      return true;
    } catch (error) {
      console.error("Error in bulk upload: ", error);
      return false;
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await fetch(`/api/reports/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.error("Error deleting report: ", error);
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      if (res.ok) {
        setCategories(prev => [...prev, data]);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const data = await res.json();
      setCategories(prev => prev.map(c => c.id === id ? data : c));
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const handleAddChannel = async (channel: Omit<Channel, 'id'>) => {
    try {
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channel)
      });
      const data = await res.json();
      setChannels(prev => [...prev, data]);
      setNotification({ isOpen: true, type: 'success', message: 'Channel added successfully' });
    } catch (error) {
      console.error('Failed to add channel:', error);
    }
  };

  const handleUpdateChannel = async (id: string, channel: Omit<Channel, 'id'>) => {
    try {
      const res = await fetch(`/api/channels/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(channel)
      });
      const data = await res.json();
      setChannels(prev => prev.map(c => c.id === id ? data : c));
      setNotification({ isOpen: true, type: 'success', message: 'Channel updated successfully' });
    } catch (error) {
      console.error('Failed to update channel:', error);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    try {
      await fetch(`/api/channels/${id}`, { method: 'DELETE' });
      setChannels(prev => prev.filter(c => c.id !== id));
      setNotification({ isOpen: true, type: 'success', message: 'Channel deleted successfully' });
    } catch (error) {
      console.error('Failed to delete channel:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/5 px-4 md:px-8 py-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setCurrentView('home')}
        >
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
            <Film className="text-white" size={24} />
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tighter">
            AYAT <span className="text-blue-500">BD™</span>
          </h1>
        </div>

        <div className="hidden md:flex flex-1 max-w-xl mx-8 relative group/search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search movies, series..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {/* Search Suggestions */}
          {searchQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
              {movies
                .filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) && m.status !== 'draft')
                .slice(0, 5)
                .map(movie => (
                  <button
                    key={movie.id}
                    onClick={() => {
                      handlePlayMovie(movie);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                  >
                    <img src={movie.posterUrl} className="w-8 h-12 object-cover rounded" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <div className="text-sm font-bold text-white line-clamp-1">{movie.title}</div>
                      <div className="text-[10px] text-gray-500">{movie.genre} • {movie.year}</div>
                    </div>
                  </button>
                ))}
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) && m.status !== 'draft').length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500">No results found</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentView('livetv')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
          >
            <Tv size={16} className="text-blue-500" />
            Live TV
          </button>
          <button 
            onClick={() => setCurrentView('admin')}
            className="hidden md:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95"
          >
            <LayoutDashboard size={16} className="text-blue-500" />
            Admin Panel
          </button>
          <button className="hidden md:block bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-semibold transition-all active:scale-95">
            Sign In
          </button>
        </div>
      </nav>

      {/* Mobile Search */}
      <div className="md:hidden px-4 py-3 border-b border-white/5">
        <div className="relative group/search">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text"
            placeholder="Search..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          {/* Search Suggestions */}
          {searchQuery.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50">
              {movies
                .filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) && m.status !== 'draft')
                .slice(0, 5)
                .map(movie => (
                  <button
                    key={movie.id}
                    onClick={() => {
                      handlePlayMovie(movie);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                  >
                    <img src={movie.posterUrl} className="w-8 h-12 object-cover rounded" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <div className="text-sm font-bold text-white line-clamp-1">{movie.title}</div>
                      <div className="text-[10px] text-gray-500">{movie.genre} • {movie.year}</div>
                    </div>
                  </button>
                ))}
              {movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()) && m.status !== 'draft').length === 0 && (
                <div className="p-4 text-center text-xs text-gray-500">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>

      <main>
        {dbError ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
              <X className="text-red-500" size={40} />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-2xl font-bold text-white">Connection Error</h2>
              <p className="text-gray-400">{dbError}</p>
            </div>
            {dbError && (
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left space-y-4 max-w-lg">
                <h3 className="font-bold text-blue-400">Troubleshooting:</h3>
                <p className="text-sm text-gray-400">
                  The application is now using a local SQLite database because Firebase setup was declined. 
                  If you see this error, ensure the development server is running correctly.
                </p>
              </div>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full font-bold transition-all"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-500" size={48} />
            <p className="text-gray-500 font-medium">Loading AYAT BD™ Library...</p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <HomeView 
                featuredMovie={featuredMovie} 
                movies={filteredMovies} 
                onPlay={handlePlayMovie} 
                categories={categoryNames}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}
            {currentView === 'livetv' && (
              <LiveTVView 
                channels={channels}
                selectedChannel={selectedChannel}
                onSelectChannel={setSelectedChannel}
              />
            )}
            {currentView === 'player' && selectedMovie && (
              <PlayerView 
                movie={selectedMovie} 
                onBack={() => setCurrentView('home')} 
                relatedMovies={movies.filter(m => m.id !== selectedMovie.id && m.status !== 'draft').slice(0, 6)}
                onPlayRelated={handlePlayMovie}
                onReport={handleReportBrokenLink}
                isAdmin={isAdminLoggedIn}
                onEdit={() => {
                  setInitialEditMovie(selectedMovie);
                  setCurrentView('admin');
                }}
                onDelete={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: 'Delete Movie',
                    message: 'Are you sure you want to delete this movie? This action cannot be undone.',
                    onConfirm: () => {
                      handleDeleteMovie(selectedMovie.id);
                      setCurrentView('home');
                    }
                  });
                }}
                onDownload={() => {
                  const url = selectedMovie.servers?.[0]?.url || selectedMovie.videoUrl;
                  if (url) {
                    window.open(url, '_blank');
                  }
                }}
              />
            )}
            {currentView === 'admin' && (
              <AdminView 
                isLoggedIn={isAdminLoggedIn}
                onLogin={handleAdminLogin}
                onLogout={() => setIsAdminLoggedIn(false)}
                movies={movies}
                onAdd={handleAddMovie}
                onUpdate={handleUpdateMovie}
                onDelete={handleDeleteMovie}
                featuredId={featuredMovieId}
                onSetFeatured={handleSetFeatured}
                reports={reports}
                onDeleteReport={handleDeleteReport}
                onBulkUpload={handleBulkUpload}
                categories={categories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                channels={channels}
                onAddChannel={handleAddChannel}
                onUpdateChannel={handleUpdateChannel}
                onDeleteChannel={handleDeleteChannel}
                initialEditMovie={initialEditMovie}
                onClearInitialEdit={() => setInitialEditMovie(null)}
                onPlayMovie={handlePlayMovie}
                onConfirm={(title, message, action) => {
                  setConfirmModal({
                    isOpen: true,
                    title,
                    message,
                    onConfirm: action
                  });
                }}
                onNotify={(type, message) => {
                  setNotification({ isOpen: true, type, message });
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-12 px-4 md:px-8 bg-black/40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold italic">AYAT BD™</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              Premium movie streaming experience. Watch the latest blockbusters and series in high definition.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-300">Browse</h3>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li 
                onClick={() => { setCurrentView('home'); setSelectedCategory('All'); setSortBy('none'); window.scrollTo(0, 0); }}
                className="hover:text-blue-500 cursor-pointer transition-colors"
              >
                Movies
              </li>
              <li 
                onClick={() => { setCurrentView('home'); setSelectedCategory('TV Series'); setSortBy('none'); window.scrollTo(0, 0); }}
                className="hover:text-blue-500 cursor-pointer transition-colors"
              >
                TV Series
              </li>
              <li 
                onClick={() => { setCurrentView('home'); setSortBy('newest'); window.scrollTo(0, 0); }}
                className="hover:text-blue-500 cursor-pointer transition-colors"
              >
                New Releases
              </li>
              <li 
                onClick={() => { setCurrentView('home'); setSortBy('popular'); window.scrollTo(0, 0); }}
                className="hover:text-blue-500 cursor-pointer transition-colors"
              >
                Popular
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-300">Support</h3>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li 
                onClick={() => setSupportModal({
                  isOpen: true,
                  title: 'Help Center',
                  content: 'Welcome to our Help Center. Here you can find answers to common questions about streaming, account management, and technical issues.\n\nFor immediate assistance, please use the Contact Us option.'
                })}
                className="hover:text-blue-500 cursor-pointer transition-colors"
              >
                Help Center
              </li>
              <li 
                onClick={() => setSupportModal({
                  isOpen: true,
                  title: 'Terms of Service',
                  content: 'By using our service, you agree to the following terms:\n\n1. You must be at least 13 years old.\n2. Content is for personal use only.\n3. Respect copyright and intellectual property.\n4. We reserve the right to modify the service at any time.'
                })}
                className="hover:text-blue-500 cursor-pointer transition-colors"
              >
                Terms of Service
              </li>
              <li 
                onClick={() => setCurrentView('admin')}
                className="hover:text-blue-500 cursor-pointer transition-colors flex items-center gap-1"
              >
                <Lock size={12} /> Admin Login
              </li>
              <li 
                onClick={() => setSupportModal({
                  isOpen: true,
                  title: 'Contact Us',
                  content: 'Have questions or feedback? We\'d love to hear from you!\n\nEmail: support@footfylive.com\nOwner: Tamim Hasan Shaon\n\nWe typically respond within 24-48 hours.'
                })}
                className="hover:text-blue-500 cursor-pointer transition-colors"
              >
                Contact Us
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-300">Newsletter</h3>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm flex-1 focus:outline-none focus:border-blue-500"
              />
              <button className="bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
          © 2026 Tamim Hasan Shaon. All rights reserved. Inspired By AYAT BD™
        </div>
      </footer>
      <ConfirmModal 
        {...confirmModal} 
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} 
      />
      <SupportModal 
        {...supportModal}
        onClose={() => setSupportModal(prev => ({ ...prev, isOpen: false }))}
      />
      <Notification 
        {...notification} 
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))} 
      />
    </div>
  );
}

// --- Sub-Views ---

function HomeView({ featuredMovie, movies, onPlay, categories, selectedCategory, onSelectCategory }: { 
  featuredMovie: Movie, 
  movies: Movie[], 
  onPlay: (m: Movie) => void,
  categories: string[],
  selectedCategory: string,
  onSelectCategory: (c: string) => void
}) {
  const top10 = useMemo(() => {
    return [...movies]
      .filter(m => m.status !== 'draft')
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);
  }, [movies]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      {/* Hero Section */}
      {featuredMovie && (
        <section className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={featuredMovie.posterUrl} 
              alt={featuredMovie.title}
              className="w-full h-full object-cover scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0c] via-transparent to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 p-6 md:p-16 max-w-3xl space-y-4 md:space-y-6">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2 text-blue-500 font-bold tracking-widest text-xs uppercase"
            >
              <Star size={14} fill="currentColor" />
              Featured Movie
            </motion.div>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-7xl font-black leading-none"
            >
              {featuredMovie.title}
            </motion.h2>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 text-sm text-gray-300"
            >
              <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded border border-blue-500/30 font-bold">{featuredMovie.year}</span>
              <span>{featuredMovie.genre}</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full" />
              <span>HD Quality</span>
            </motion.div>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-gray-400 text-sm md:text-lg line-clamp-3 max-w-xl"
            >
              {featuredMovie.description}
            </motion.p>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 pt-4"
            >
              <button 
                onClick={() => onPlay(featuredMovie)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 group"
              >
                <Play size={20} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                Watch Now
              </button>
            </motion.div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="px-4 md:px-8 overflow-x-auto flex gap-3 pb-2 custom-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-6 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${
              selectedCategory === cat 
              ? 'bg-blue-600 border-blue-500 text-white' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </section>

      {/* Top 10 Today Section */}
      {top10.length > 0 && (
        <section className="px-4 md:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <span className="text-blue-500">#</span> Top 10 Trending
            </h3>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x">
            {top10.map((movie, index) => (
              <motion.div 
                key={movie.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onPlay(movie)}
                className="flex-none w-[280px] md:w-[320px] relative group cursor-pointer snap-start"
              >
                <div className="flex items-center gap-4">
                  <div className="text-6xl md:text-8xl font-black text-white/10 group-hover:text-blue-500/20 transition-colors">
                    {index + 1}
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all flex items-center gap-4 p-3">
                    <img 
                      src={movie.posterUrl} 
                      className="w-16 h-24 object-cover rounded-lg shadow-lg" 
                      alt="" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm line-clamp-2">{movie.title}</h4>
                      <p className="text-[10px] text-gray-500">{movie.genre} • {movie.year}</p>
                      <div className="flex items-center gap-1 text-[10px] text-blue-400 font-bold">
                        <Play size={10} fill="currentColor" />
                        {(movie.views || 0).toLocaleString()} views
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Movie Grid */}
      <section className="px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            Recently Added
          </h3>
          <div className="flex gap-2">
            <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"><ChevronLeft size={20} /></button>
            <button className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"><ChevronRight size={20} /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} onClick={() => onPlay(movie)} />
          ))}
        </div>

        {movies.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Search className="text-gray-600" size={32} />
            </div>
            <p className="text-gray-500">No movies found matching your search.</p>
          </div>
        )}
      </section>
    </motion.div>
  );
}

function MovieCard({ movie, onClick }: { movie: Movie, onClick: () => void, key?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group relative cursor-pointer"
      onClick={onClick}
    >
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-white/5 border border-white/5 shadow-2xl relative">
        <img 
          src={movie.posterUrl} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play size={24} fill="currentColor" className="ml-1" />
          </div>
        </div>

        {/* Badge */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold border border-white/10">
          HD
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h4 className="font-bold text-sm line-clamp-1 group-hover:text-blue-500 transition-colors">{movie.title}</h4>
        <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
          <span>{movie.year}</span>
          <span className="text-blue-500/50">{movie.genre}</span>
        </div>
      </div>
    </motion.div>
  );
}

function LiveTVView({ channels, selectedChannel, onSelectChannel }: { 
  channels: Channel[], 
  selectedChannel: Channel | null,
  onSelectChannel: (c: Channel) => void
}) {
  const categories = useMemo(() => {
    const cats = new Set(channels.map(c => c.category));
    return ['All', ...Array.from(cats)];
  }, [channels]);

  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredChannels = useMemo(() => {
    if (selectedCategory === 'All') return channels;
    return channels.filter(c => c.category === selectedCategory);
  }, [channels, selectedCategory]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-4 md:px-8 space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3">
            <Tv className="text-blue-500" size={32} />
            Live TV <span className="text-blue-500">Channels</span>
          </h2>
          <p className="text-gray-500 mt-1">Watch your favorite TV channels live in high quality.</p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                selectedCategory === cat 
                ? 'bg-blue-600 border-blue-500 text-white' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Player Section */}
        <div className="lg:col-span-2 space-y-4">
          {selectedChannel ? (
            <div className="space-y-4">
              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative group">
                <iframe 
                  src={selectedChannel.streamUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
                <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                  Live
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl">
                <img src={selectedChannel.logoUrl} className="w-12 h-12 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                <div>
                  <h3 className="text-xl font-bold">{selectedChannel.name}</h3>
                  <p className="text-sm text-blue-400 font-medium">{selectedChannel.category}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-white/5 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center text-blue-500">
                <Tv size={40} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Select a Channel</h3>
                <p className="text-gray-500 max-w-xs mx-auto">Click on any channel from the list to start watching live stream.</p>
              </div>
            </div>
          )}
        </div>

        {/* Channel List Section */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-400 uppercase tracking-widest text-xs px-2">Channel List</h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredChannels.map(channel => (
              <button
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`w-full flex items-center gap-4 p-3 rounded-xl border transition-all text-left group ${
                  selectedChannel?.id === channel.id
                  ? 'bg-blue-600/10 border-blue-500/50'
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className="relative">
                  <img src={channel.logoUrl} className="w-12 h-12 rounded-lg object-cover" alt="" referrerPolicy="no-referrer" />
                  {selectedChannel?.id === channel.id && (
                    <div className="absolute inset-0 bg-blue-600/20 rounded-lg flex items-center justify-center">
                      <Play size={16} fill="currentColor" className="text-blue-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold text-sm ${selectedChannel?.id === channel.id ? 'text-blue-400' : 'text-white'}`}>
                    {channel.name}
                  </h4>
                  <p className="text-[10px] text-gray-500">{channel.category}</p>
                </div>
                {selectedChannel?.id === channel.id && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PlayerView({ movie, onBack, relatedMovies, onPlayRelated, onReport, isAdmin, onEdit, onDelete, onDownload }: { 
  movie: Movie, 
  onBack: () => void,
  relatedMovies: Movie[],
  onPlayRelated: (m: Movie) => void,
  onReport: (m: Movie, r: string) => Promise<boolean>,
  isAdmin?: boolean,
  onEdit?: () => void,
  onDelete?: () => void,
  onDownload?: () => void
}) {
  const [isReporting, setIsReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  
  // Multi-server state
  const movieServers = useMemo(() => {
    if (movie.servers && movie.servers.length > 0) return movie.servers;
    return [{ name: 'Default Server', url: movie.videoUrl }];
  }, [movie]);
  
  const [activeServer, setActiveServer] = useState(movieServers[0]);

  useEffect(() => {
    setActiveServer(movieServers[0]);
  }, [movieServers]);

  const handleReport = async () => {
    if (!reportReason.trim()) return;
    const success = await onReport(movie, reportReason);
    if (success) {
      setReportSuccess(true);
      setTimeout(() => {
        setIsReporting(false);
        setReportSuccess(false);
        setReportReason('');
      }, 2000);
    }
  };

  const isEmbed = (url: string) => {
    return url.includes('youtube.com') || url.includes('vimeo.com') || url.includes('flixbd') || url.includes('embed') || url.includes('iframe');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button 
                onClick={onEdit}
                className="bg-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Edit2 size={14} />
                Edit Movie
              </button>
              <button 
                onClick={onDelete}
                className="bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
          <button 
            onClick={() => setIsReporting(true)}
            className="text-xs font-bold text-red-500/60 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <X size={14} />
            Report Broken Link
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative group/player">
          {isEmbed(activeServer.url) ? (
            <iframe 
              src={activeServer.url} 
              className="w-full h-full"
              allowFullScreen
              title={movie.title}
            />
          ) : (
            <Plyr
              source={{
                type: 'video',
                sources: [
                  {
                    src: activeServer.url,
                    type: 'video/mp4',
                  },
                ],
              }}
              options={{
                controls: [
                  'play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'settings', 'pip', 'airplay', 'fullscreen'
                ],
                quality: { default: 1080, options: [4320, 2880, 2160, 1440, 1080, 720, 576, 480, 360, 240] }
              }}
            />
          )}
        </div>

        {/* Server Selection */}
        <div className="flex flex-wrap items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 text-gray-400 text-sm font-bold mr-2">
            <Server size={16} className="text-blue-500" />
            SELECT SERVER:
          </div>
          {movieServers.map((server, idx) => (
            <button
              key={idx}
              onClick={() => setActiveServer(server)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeServer.url === server.url 
                ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {server.name}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isReporting && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 space-y-4 overflow-hidden"
          >
            {reportSuccess ? (
              <p className="text-green-500 font-bold text-center py-4">Report submitted successfully. Thank you!</p>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-red-500">Report Broken Link</h3>
                  <button onClick={() => setIsReporting(false)}><X size={18} /></button>
                </div>
                <p className="text-sm text-gray-400">Please describe the issue (e.g., video not loading, wrong movie, etc.)</p>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Describe the issue..." 
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 focus:outline-none focus:border-red-500/50"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                  <button 
                    onClick={handleReport}
                    className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl font-bold transition-all"
                  >
                    Submit Report
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black">{movie.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="text-blue-500 font-bold">{movie.year}</span>
              <span>{movie.genre}</span>
              <span>2h 14m</span>
            </div>
          </div>
          <p className="text-gray-400 leading-relaxed text-lg">
            {movie.description}
          </p>
          <div className="flex gap-4">
            <button 
              onClick={onDownload}
              className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
            >
              Download
            </button>
            <button className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
              Share
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold">Related Movies</h3>
          <div className="space-y-4">
            {relatedMovies.map(m => (
              <div 
                key={m.id} 
                className="flex gap-4 group cursor-pointer"
                onClick={() => onPlayRelated(m)}
              >
                <div className="w-24 aspect-[2/3] rounded-lg overflow-hidden flex-shrink-0">
                  <img src={m.posterUrl} alt={m.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" referrerPolicy="no-referrer" />
                </div>
                <div className="py-1 space-y-1">
                  <h4 className="font-bold text-sm group-hover:text-blue-500 transition-colors">{m.title}</h4>
                  <p className="text-xs text-gray-500">{m.year} • {m.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AdminView({ 
  isLoggedIn, 
  onLogin, 
  onLogout, 
  movies, 
  onAdd, 
  onUpdate, 
  onDelete,
  featuredId,
  onSetFeatured,
  reports,
  onDeleteReport,
  onBulkUpload,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  channels,
  onAddChannel,
  onUpdateChannel,
  onDeleteChannel,
  initialEditMovie,
  onClearInitialEdit,
  onPlayMovie,
  onConfirm,
  onNotify
}: { 
  isLoggedIn: boolean, 
  onLogin: (p: string) => boolean,
  onLogout: () => void,
  movies: Movie[],
  onAdd: (m: Omit<Movie, 'id'>) => void,
  onUpdate: (m: Movie) => void,
  onDelete: (id: string) => void,
  featuredId: string,
  onSetFeatured: (id: string) => void,
  reports: Report[],
  onDeleteReport: (id: string) => void,
  onBulkUpload: (data: any[]) => Promise<boolean>,
  categories: Category[],
  onAddCategory: (name: string) => void,
  onUpdateCategory: (id: string, name: string) => void,
  onDeleteCategory: (id: string) => void,
  channels: Channel[],
  onAddChannel: (c: Omit<Channel, 'id'>) => void,
  onUpdateChannel: (id: string, c: Omit<Channel, 'id'>) => void,
  onDeleteChannel: (id: string) => void,
  initialEditMovie?: Movie | null,
  onClearInitialEdit?: () => void,
  onPlayMovie: (m: Movie) => void,
  onConfirm: (title: string, message: string, action: () => void) => void,
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState<'movies' | 'categories' | 'channels' | 'bulk' | 'reports'>('movies');
  const [bulkData, setBulkData] = useState('');
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [movieSearch, setMovieSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [isChannelUploading, setIsChannelUploading] = useState(false);
  const [channelFormData, setChannelFormData] = useState({
    name: '',
    logoUrl: '',
    streamUrl: '',
    category: ''
  });

  useEffect(() => {
    if (editingChannel) {
      setChannelFormData({
        name: editingChannel.name,
        logoUrl: editingChannel.logoUrl,
        streamUrl: editingChannel.streamUrl,
        category: editingChannel.category
      });
    } else {
      setChannelFormData({
        name: '',
        logoUrl: '',
        streamUrl: '',
        category: ''
      });
    }
  }, [editingChannel]);

  const handleChannelImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      onNotify('error', 'ImgBB API Key is missing. Please add VITE_IMGBB_API_KEY to your secrets.');
      return;
    }

    setIsChannelUploading(true);
    const body = new FormData();
    body.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: body,
      });
      const data = await response.json();
      if (data.success) {
        setChannelFormData(prev => ({ ...prev, logoUrl: data.data.url }));
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onNotify('error', 'Failed to upload image. Please try again.');
    } finally {
      setIsChannelUploading(false);
    }
  };

  useEffect(() => {
    if (initialEditMovie) {
      setEditingMovie(initialEditMovie);
      setIsModalOpen(true);
      if (onClearInitialEdit) onClearInitialEdit();
    }
  }, [initialEditMovie]);

  const filteredMovies = useMemo(() => {
    return movies.filter(m => {
      const matchesSearch = m.title.toLowerCase().includes(movieSearch.toLowerCase()) ||
                           m.genre.toLowerCase().includes(movieSearch.toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [movies, movieSearch, statusFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin(password)) {
      setError('');
    } else {
      setError('Invalid password. Access denied.');
    }
  };

  const handleBulkSubmit = async () => {
    try {
      setBulkStatus('loading');
      const data = JSON.parse(bulkData);
      if (!Array.isArray(data)) throw new Error('Data must be an array');
      const success = await onBulkUpload(data);
      if (success) {
        setBulkStatus('success');
        setBulkData('');
        setTimeout(() => setBulkStatus('idle'), 3000);
      } else {
        setBulkStatus('error');
      }
    } catch (e) {
      setBulkStatus('error');
      onNotify('error', 'Invalid JSON format. Please check your data.');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#121214] p-8 rounded-3xl border border-white/5 w-full max-w-md shadow-2xl"
        >
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-blue-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Admin Access</h2>
          <p className="text-gray-500 text-center text-sm mb-8">Enter password to manage AYAT BD™</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="password"
              placeholder="Enter Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <button className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20">
              Unlock Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black">Admin Dashboard</h2>
          <p className="text-gray-500">Manage your movie library and featured content</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setEditingMovie(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all"
          >
            <Plus size={20} />
            Add New Movie
          </button>
          <button 
            onClick={onLogout}
            className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all text-gray-400 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 pb-1">
        <button 
          onClick={() => setActiveTab('movies')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'movies' ? 'border-blue-600 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Movies
        </button>
        <button 
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'categories' ? 'border-blue-600 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Categories
        </button>
        <button 
          onClick={() => setActiveTab('channels')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'channels' ? 'border-blue-600 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Channels
        </button>
        <button 
          onClick={() => setActiveTab('bulk')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'bulk' ? 'border-blue-600 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Bulk Upload
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'reports' ? 'border-blue-600 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Reports
          {reports.length > 0 && (
            <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
              {reports.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'movies' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text"
                placeholder="Search movies to edit or delete..."
                className="w-full bg-[#121214] border border-white/5 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500/50 transition-all"
                value={movieSearch}
                onChange={(e) => setMovieSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 bg-[#121214] p-1 rounded-xl border border-white/5">
              {(['all', 'published', 'draft'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    statusFilter === s 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Movie</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Genre</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Featured</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMovies.map(movie => (
                  <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 group/thumb relative">
                        <div className="relative w-10 h-14 flex-shrink-0">
                          <img src={movie.posterUrl} className="w-full h-full rounded object-cover border border-white/10" referrerPolicy="no-referrer" />
                          <button 
                            onClick={() => {
                              setEditingMovie(movie);
                              setIsModalOpen(true);
                            }}
                            className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center rounded"
                            title="Change Thumbnail"
                          >
                            <Edit2 size={14} className="text-white" />
                          </button>
                        </div>
                        <span className="font-bold truncate max-w-[200px]">{movie.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{movie.genre}</td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onUpdate({ ...movie, status: movie.status === 'draft' ? 'published' : 'draft' })}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${movie.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}
                      >
                        {movie.status || 'published'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onSetFeatured(movie.id)}
                        className={`p-2 rounded-lg transition-all ${featuredId === movie.id ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                      >
                        <Star size={18} fill={featuredId === movie.id ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => onPlayMovie(movie)}
                          className="p-2 hover:bg-green-500/20 hover:text-green-500 rounded-lg transition-colors text-gray-500"
                          title="View Movie"
                        >
                          <Play size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingMovie(movie);
                            setIsModalOpen(true);
                          }}
                          className="p-2 hover:bg-blue-500/20 hover:text-blue-500 rounded-lg transition-colors text-gray-500"
                          title="Edit Movie"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            onConfirm(
                              'Delete Movie',
                              'Are you sure you want to delete this movie? This action cannot be undone.',
                              () => onDelete(movie.id)
                            );
                          }}
                          className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors text-gray-500"
                          title="Delete Movie"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Tag className="text-blue-500" size={24} />
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <div className="flex gap-4">
              <input 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                placeholder="Category Name (e.g. Action, Drama)"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
              <button 
                onClick={() => {
                  if (!newCategoryName.trim()) return;
                  if (editingCategory) {
                    onUpdateCategory(editingCategory.id, newCategoryName);
                    setEditingCategory(null);
                  } else {
                    onAddCategory(newCategoryName);
                  }
                  setNewCategoryName('');
                }}
                className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-xl font-bold transition-all"
              >
                {editingCategory ? 'Update' : 'Add'}
              </button>
              {editingCategory && (
                <button 
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategoryName('');
                  }}
                  className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#121214] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">Category Name</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold">{cat.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditingCategory(cat);
                            setNewCategoryName(cat.name);
                          }}
                          className="p-2 hover:bg-blue-500/20 hover:text-blue-500 rounded-lg transition-colors text-gray-500"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            onConfirm(
                              'Delete Category',
                              `Are you sure you want to delete "${cat.name}"? This will not delete the movies in this category.`,
                              () => onDeleteCategory(cat.id)
                            );
                          }}
                          className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded-lg transition-colors text-gray-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Manage Live TV Channels</h3>
            <button 
              onClick={() => {
                setEditingChannel(null);
                setIsChannelModalOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all text-sm"
            >
              <Plus size={18} />
              Add Channel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map(channel => (
              <div key={channel.id} className="bg-[#121214] border border-white/5 p-4 rounded-2xl flex items-center gap-4 group/channel">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <img src={channel.logoUrl} className="w-full h-full rounded-xl object-cover border border-white/10" alt="" referrerPolicy="no-referrer" />
                  <button 
                    onClick={() => {
                      setEditingChannel(channel);
                      setIsChannelModalOpen(true);
                    }}
                    className="absolute inset-0 bg-blue-600/60 opacity-0 group-hover/channel:opacity-100 transition-opacity flex items-center justify-center rounded-xl"
                    title="Change Logo"
                  >
                    <Edit2 size={18} className="text-white" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold truncate">{channel.name}</h4>
                  <p className="text-xs text-gray-500">{channel.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button 
                      onClick={() => {
                        setEditingChannel(channel);
                        setIsChannelModalOpen(true);
                      }}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-blue-400 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => onConfirm('Delete Channel', `Are you sure you want to delete ${channel.name}?`, () => onDeleteChannel(channel.id))}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {isChannelModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#121214] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black">{editingChannel ? 'Edit Channel' : 'Add Channel'}</h3>
                  <button onClick={() => setIsChannelModalOpen(false)} className="text-gray-500 hover:text-white"><X size={24} /></button>
                </div>

                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  if (editingChannel) {
                    onUpdateChannel(editingChannel.id, channelFormData);
                  } else {
                    onAddChannel(channelFormData);
                  }
                  setIsChannelModalOpen(false);
                }}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Channel Name</label>
                    <input 
                      value={channelFormData.name}
                      onChange={e => setChannelFormData({...channelFormData, name: e.target.value})}
                      required 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500/50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logo URL / Upload</label>
                    <div className="flex gap-4">
                      {channelFormData.logoUrl && (
                        <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                          <img src={channelFormData.logoUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                          <input 
                            value={channelFormData.logoUrl}
                            onChange={e => setChannelFormData({...channelFormData, logoUrl: e.target.value})}
                            required 
                            placeholder="https://..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500/50 text-sm" 
                          />
                          <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-all flex items-center justify-center min-w-[48px]">
                            {isChannelUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                            <input type="file" className="hidden" accept="image/*" onChange={handleChannelImageUpload} disabled={isChannelUploading} />
                          </label>
                        </div>
                        <p className="text-[10px] text-gray-500 italic">Paste a URL or upload an image</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Stream URL (YouTube Embed or M3U8)</label>
                    <input 
                      value={channelFormData.streamUrl}
                      onChange={e => setChannelFormData({...channelFormData, streamUrl: e.target.value})}
                      required 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500/50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                    <input 
                      value={channelFormData.category}
                      onChange={e => setChannelFormData({...channelFormData, category: e.target.value})}
                      required 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500/50" 
                    />
                  </div>
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all">
                    {editingChannel ? 'Update Channel' : 'Add Channel'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </div>
      )}
      {activeTab === 'bulk' && (
        <div className="bg-[#121214] border border-white/5 rounded-3xl p-8 space-y-6 shadow-xl">
          <div className="space-y-2">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="text-blue-500" size={24} />
              Bulk Movie Import
            </h3>
            <p className="text-gray-500 text-sm">Paste a JSON array of movie objects to import multiple movies at once.</p>
          </div>
          <textarea 
            className="w-full bg-black/40 border border-white/10 rounded-2xl p-6 h-[400px] font-mono text-xs focus:outline-none focus:border-blue-500/50"
            placeholder='[
  {
    "title": "Movie Title",
    "posterUrl": "...",
    "videoUrl": "...",
    "genre": "Action",
    "year": "2024",
    "description": "...",
    "status": "published"
  }
]'
            value={bulkData}
            onChange={(e) => setBulkData(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">Make sure the JSON format is correct before clicking Import.</p>
            <button 
              onClick={handleBulkSubmit}
              disabled={bulkStatus === 'loading'}
              className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${bulkStatus === 'success' ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {bulkStatus === 'loading' ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              {bulkStatus === 'success' ? 'Imported Successfully!' : 'Start Bulk Import'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <AlertCircle className="text-red-500" size={24} />
              Broken Link Reports
            </h3>
            <span className="text-sm text-gray-500">{reports.length} pending reports</span>
          </div>
          
          {reports.length === 0 ? (
            <div className="bg-[#121214] border border-white/5 rounded-3xl p-20 text-center space-y-4">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <Star className="text-green-500" size={32} />
              </div>
              <p className="text-gray-500">No broken links reported. Everything is working fine!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reports.map(report => (
                <motion.div 
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#121214] border border-red-500/20 rounded-2xl p-6 flex items-start justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Broken Link</span>
                      <h4 className="font-bold text-white">{report.movieTitle}</h4>
                    </div>
                    <p className="text-sm text-gray-400 italic">"{report.reason}"</p>
                    <p className="text-[10px] text-gray-600">{new Date(report.timestamp?.seconds * 1000).toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => onDeleteReport(report.id)}
                    className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <MovieModal 
            movie={editingMovie} 
            categories={categories}
            onClose={() => setIsModalOpen(false)} 
            onSave={(data) => {
              if (editingMovie) {
                onUpdate({ ...editingMovie, ...data });
              } else {
                onAdd(data);
              }
              setIsModalOpen(false);
            }}
            onNotify={onNotify}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MovieModal({ movie, categories, onClose, onSave, onNotify }: { 
  movie: Movie | null, 
  categories: Category[],
  onClose: () => void, 
  onSave: (data: Omit<Movie, 'id'>) => void,
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void
}) {
  const [formData, setFormData] = useState({
    title: movie?.title || '',
    posterUrl: movie?.posterUrl || '',
    videoUrl: movie?.videoUrl || '',
    genre: movie?.genre || '',
    year: movie?.year || '',
    description: movie?.description || '',
    status: movie?.status || 'published',
    views: movie?.views || 0,
    servers: movie?.servers || [{ name: 'Server 1', url: movie?.videoUrl || '' }]
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleAddServer = () => {
    setFormData(prev => ({
      ...prev,
      servers: [...prev.servers, { name: `Server ${prev.servers.length + 1}`, url: '' }]
    }));
  };

  const handleRemoveServer = (index: number) => {
    if (formData.servers.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      servers: prev.servers.filter((_, i) => i !== index)
    }));
  };

  const handleServerChange = (index: number, field: 'name' | 'url', value: string) => {
    const newServers = [...formData.servers];
    newServers[index] = { ...newServers[index], [field]: value };
    setFormData(prev => ({ ...prev, servers: newServers }));
  };

  const handleSave = () => {
    // Sync first server URL to legacy videoUrl for compatibility
    const dataToSave = {
      ...formData,
      videoUrl: formData.servers[0]?.url || formData.videoUrl
    };
    onSave(dataToSave);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) {
      onNotify('error', 'ImgBB API Key is missing. Please add VITE_IMGBB_API_KEY to your secrets.');
      return;
    }

    setIsUploading(true);
    const body = new FormData();
    body.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: body,
      });
      const data = await response.json();
      if (data.success) {
        setFormData(prev => ({ ...prev, posterUrl: data.data.url }));
      } else {
        throw new Error(data.error?.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      onNotify('error', 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-2xl p-8 relative z-10 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-white/5 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <h3 className="text-2xl font-black mb-8">{movie ? 'Edit Movie' : 'Add New Movie'}</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Title</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Genre / Category</label>
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  value={formData.genre}
                  onChange={e => setFormData({...formData, genre: e.target.value})}
                  placeholder="Select or type..."
                />
                <select 
                  className="bg-white/5 border border-white/10 rounded-xl px-2 focus:outline-none focus:border-blue-500 text-xs"
                  onChange={e => {
                    if (e.target.value) {
                      const current = formData.genre ? formData.genre.split(',').map(g => g.trim()) : [];
                      if (!current.includes(e.target.value)) {
                        setFormData({...formData, genre: [...current, e.target.value].join(', ')});
                      }
                    }
                  }}
                  value=""
                >
                  <option value="" disabled>Quick Select</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.name} className="bg-[#121214]">{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Year</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Status</label>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 appearance-none"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as 'published' | 'draft'})}
                >
                  <option value="published" className="bg-[#121214]">Published</option>
                  <option value="draft" className="bg-[#121214]">Draft</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Views</label>
              <input 
                type="number"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                value={formData.views}
                onChange={e => setFormData({...formData, views: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Poster URL / Upload</label>
              <div className="flex gap-4">
                {formData.posterUrl && (
                  <div className="w-16 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 bg-white/5">
                    <img src={formData.posterUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <input 
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 text-sm"
                      value={formData.posterUrl}
                      onChange={e => setFormData({...formData, posterUrl: e.target.value})}
                      placeholder="https://..."
                    />
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-all flex items-center justify-center min-w-[48px]">
                      {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                    </label>
                  </div>
                  <p className="text-[10px] text-gray-500 italic">Paste a URL or upload an image (via ImgBB)</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Video Embed URL</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                value={formData.videoUrl}
                onChange={e => setFormData({...formData, videoUrl: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Description</label>
              <textarea 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 h-[108px] resize-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Multi-Server Section */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold flex items-center gap-2">
              <Server size={18} className="text-blue-500" />
              Streaming Servers
            </h4>
            <button 
              onClick={handleAddServer}
              className="text-xs bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
            >
              + Add Server
            </button>
          </div>
          
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
            {formData.servers.map((server, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-white/[0.02] p-3 rounded-xl border border-white/5">
                <div className="w-1/4">
                  <input 
                    placeholder="Server Name"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    value={server.name}
                    onChange={e => handleServerChange(idx, 'name', e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <input 
                    placeholder="Streaming URL (Direct or Embed)"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                    value={server.url}
                    onChange={e => handleServerChange(idx, 'url', e.target.value)}
                  />
                </div>
                {formData.servers.length > 1 && (
                  <button 
                    onClick={() => handleRemoveServer(idx)}
                    className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-4 mt-10">
          <button 
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-xl font-bold transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            {movie ? 'Save Changes' : 'Add Movie'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Notification({ isOpen, type, message, onClose }: {
  isOpen: boolean;
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-8 right-8 z-[300] ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px]`}
    >
      {type === 'error' ? <AlertCircle size={20} /> : <Loader2 size={20} className={type === 'info' ? 'animate-spin' : ''} />}
      <p className="font-bold">{message}</p>
      <button onClick={onClose} className="ml-auto p-1 hover:bg-white/10 rounded-full transition-all">
        <X size={16} />
      </button>
    </motion.div>
  );
}

function SupportModal({ isOpen, title, content, onClose }: {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-zinc-900 border border-white/10 p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black">{title}</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="text-gray-400 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
            <button 
              onClick={onClose}
              className="w-full bg-white text-black py-4 rounded-2xl font-black hover:bg-gray-200 transition-all"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function ConfirmModal({ isOpen, title, message, onConfirm, onClose }: {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-[#121214] border border-white/10 rounded-3xl w-full max-w-md p-8 relative z-10 shadow-2xl text-center"
      >
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="text-red-500" size={32} />
        </div>
        <h3 className="text-2xl font-black mb-2">{title}</h3>
        <p className="text-gray-400 mb-8">{message}</p>
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-bold transition-all"
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}
