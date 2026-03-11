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
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  setDoc,
  getDoc,
  increment
} from 'firebase/firestore';

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

// --- Initial Data ---

const INITIAL_MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Inception',
    posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    genre: 'Sci-Fi',
    year: '2010',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.'
  },
  {
    id: '2',
    title: 'Interstellar',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E',
    genre: 'Adventure',
    year: '2014',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.'
  },
  {
    id: '3',
    title: 'The Dark Knight',
    posterUrl: 'https://images.unsplash.com/photo-1478720143022-10d0002856c3?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/EXeTwQWaywY',
    genre: 'Action',
    year: '2008',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.'
  },
  {
    id: '4',
    title: 'Dune: Part Two',
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=2056&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/Way9Dexny3w',
    genre: 'Sci-Fi',
    year: '2024',
    description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.'
  },
  {
    id: '5',
    title: 'Oppenheimer',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/uYPbbksJxIg',
    genre: 'Biography',
    year: '2023',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.'
  },
  {
    id: '6',
    title: 'The Matrix',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    videoUrl: 'https://www.youtube.com/embed/vKQi3bBA1y8',
    genre: 'Sci-Fi',
    year: '1999',
    description: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.'
  }
];

// --- Components ---

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [featuredMovieId, setFeaturedMovieId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'player'>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);

  // Check if Firebase is configured
  const isFirebaseConfigured = useMemo(() => {
    return !!import.meta.env.VITE_FIREBASE_API_KEY && 
           !!import.meta.env.VITE_FIREBASE_PROJECT_ID;
  }, []);

  // Initialize data from Firestore
  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsLoading(false);
      setDbError("Firebase configuration is missing. Please add your API keys in the Secrets menu.");
      return;
    }

    const moviesCol = collection(db, 'movies');
    
    // Listen for real-time updates
    const unsubscribe = onSnapshot(moviesCol, (snapshot) => {
      const moviesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Movie[];
      
      if (moviesList.length === 0 && isLoading) {
        // Seed initial data if empty (only on first load)
        INITIAL_MOVIES.forEach(async (movie) => {
          const { id, ...movieData } = movie;
          try {
            await addDoc(moviesCol, movieData);
          } catch (e) {
            console.error("Seeding error:", e);
          }
        });
      } else {
        setMovies(moviesList);
      }
      setIsLoading(false);
      setDbError(null);
    }, (error) => {
      console.error("Firestore error:", error);
      setDbError("Failed to connect to the database. You might be offline or your Firebase config is incorrect.");
      setIsLoading(false);
    });

    // Listen for featured movie ID changes
    const featuredDoc = doc(db, 'config', 'featured');
    const unsubscribeFeatured = onSnapshot(featuredDoc, (snap) => {
      if (snap.exists()) {
        setFeaturedMovieId(snap.data().movieId);
      }
    }, (error) => {
      console.error("Featured doc error:", error);
    });

    // Listen for reports
    const reportsCol = collection(db, 'reports');
    const unsubscribeReports = onSnapshot(reportsCol, (snapshot) => {
      const reportsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(reportsList);
    });

    return () => {
      unsubscribe();
      unsubscribeFeatured();
      unsubscribeReports();
    };
  }, [isFirebaseConfigured]);

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

  const filteredMovies = useMemo(() => {
    let list = movies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (currentView !== 'admin') {
      list = list.filter(m => m.status !== 'draft');
    }
    return list;
  }, [movies, searchQuery, currentView]);

  const handlePlayMovie = async (movie: Movie) => {
    setSelectedMovie(movie);
    setCurrentView('player');
    window.scrollTo(0, 0);
    
    // Increment view count
    try {
      const movieRef = doc(db, 'movies', movie.id);
      await updateDoc(movieRef, {
        views: increment(1)
      });
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
      await addDoc(collection(db, 'movies'), newMovie);
    } catch (error) {
      console.error("Error adding movie: ", error);
    }
  };

  const handleUpdateMovie = async (updatedMovie: Movie) => {
    try {
      const { id, ...movieData } = updatedMovie;
      const movieRef = doc(db, 'movies', id);
      await updateDoc(movieRef, movieData);
    } catch (error) {
      console.error("Error updating movie: ", error);
    }
  };

  const handleDeleteMovie = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'movies', id));
      if (featuredMovieId === id) {
        setFeaturedMovieId('');
        await setDoc(doc(db, 'config', 'featured'), { movieId: '' });
      }
    } catch (error) {
      console.error("Error deleting movie: ", error);
    }
  };

  const handleSetFeatured = async (id: string) => {
    try {
      setFeaturedMovieId(id);
      await setDoc(doc(db, 'config', 'featured'), { movieId: id });
    } catch (error) {
      console.error("Error setting featured: ", error);
    }
  };

  const handleReportBrokenLink = async (movie: Movie, reason: string) => {
    try {
      await addDoc(collection(db, 'reports'), {
        movieId: movie.id,
        movieTitle: movie.title,
        timestamp: new Date(),
        reason: reason
      });
      return true;
    } catch (error) {
      console.error("Error reporting broken link: ", error);
      return false;
    }
  };

  const handleBulkUpload = async (moviesData: any[]) => {
    try {
      const moviesCol = collection(db, 'movies');
      for (const movie of moviesData) {
        const movieToSave = {
          ...movie,
          status: movie.status || 'published',
          servers: movie.servers || (movie.videoUrl ? [{ name: 'Server 1', url: movie.videoUrl }] : [])
        };
        await addDoc(moviesCol, movieToSave);
      }
      return true;
    } catch (error) {
      console.error("Error in bulk upload: ", error);
      return false;
    }
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'reports', id));
    } catch (error) {
      console.error("Error deleting report: ", error);
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
            {!isFirebaseConfigured && (
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left space-y-4 max-w-lg">
                <h3 className="font-bold text-blue-400">How to fix this:</h3>
                <ol className="list-decimal list-inside text-sm text-gray-400 space-y-2">
                  <li>Open the <b>Settings</b> menu in AI Studio</li>
                  <li>Go to <b>Secrets</b></li>
                  <li>Add your Firebase keys (API_KEY, PROJECT_ID, etc.)</li>
                  <li>The app will automatically reconnect</li>
                </ol>
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
              />
            )}
            {currentView === 'player' && selectedMovie && (
              <PlayerView 
                movie={selectedMovie} 
                onBack={() => setCurrentView('home')} 
                relatedMovies={movies.filter(m => m.id !== selectedMovie.id && m.status !== 'draft').slice(0, 6)}
                onPlayRelated={handlePlayMovie}
                onReport={handleReportBrokenLink}
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
              <li className="hover:text-blue-500 cursor-pointer transition-colors">Movies</li>
              <li className="hover:text-blue-500 cursor-pointer transition-colors">TV Series</li>
              <li className="hover:text-blue-500 cursor-pointer transition-colors">New Releases</li>
              <li className="hover:text-blue-500 cursor-pointer transition-colors">Popular</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-gray-300">Support</h3>
            <ul className="space-y-2 text-gray-500 text-sm">
              <li className="hover:text-blue-500 cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-blue-500 cursor-pointer transition-colors">Terms of Service</li>
              <li className="hover:text-blue-500 cursor-pointer transition-colors">Privacy Policy</li>
              <li className="hover:text-blue-500 cursor-pointer transition-colors">Contact Us</li>
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
          © 2026 AYAT BD™. All rights reserved. Inspired by flixbd.org
        </div>
      </footer>
    </div>
  );
}

// --- Sub-Views ---

function HomeView({ featuredMovie, movies, onPlay }: { 
  featuredMovie: Movie, 
  movies: Movie[], 
  onPlay: (m: Movie) => void 
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

function PlayerView({ movie, onBack, relatedMovies, onPlayRelated, onReport }: { 
  movie: Movie, 
  onBack: () => void,
  relatedMovies: Movie[],
  onPlayRelated: (m: Movie) => void,
  onReport: (m: Movie, r: string) => Promise<boolean>
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

        <button 
          onClick={() => setIsReporting(true)}
          className="text-xs font-bold text-red-500/60 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <X size={14} />
          Report Broken Link
        </button>
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
            <button className="flex-1 bg-white/5 border border-white/10 py-3 rounded-xl font-bold hover:bg-white/10 transition-all">
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
  onBulkUpload
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
  onBulkUpload: (data: any[]) => Promise<boolean>
}) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState<'movies' | 'bulk' | 'reports'>('movies');
  const [bulkData, setBulkData] = useState('');
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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
      alert('Invalid JSON format. Please check your data.');
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
                {movies.map(movie => (
                  <tr key={movie.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={movie.posterUrl} className="w-10 h-14 rounded object-cover border border-white/10" referrerPolicy="no-referrer" />
                        <span className="font-bold">{movie.title}</span>
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
                          onClick={() => {
                            setEditingMovie(movie);
                            setIsModalOpen(true);
                          }}
                          className="p-2 hover:bg-blue-500/20 hover:text-blue-500 rounded-lg transition-colors text-gray-500"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this movie?')) {
                              onDelete(movie.id);
                            }
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
            onClose={() => setIsModalOpen(false)} 
            onSave={(data) => {
              if (editingMovie) {
                onUpdate({ ...editingMovie, ...data });
              } else {
                onAdd(data);
              }
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MovieModal({ movie, onClose, onSave }: { 
  movie: Movie | null, 
  onClose: () => void, 
  onSave: (data: Omit<Movie, 'id'>) => void 
}) {
  const [formData, setFormData] = useState({
    title: movie?.title || '',
    posterUrl: movie?.posterUrl || '',
    videoUrl: movie?.videoUrl || '',
    genre: movie?.genre || '',
    year: movie?.year || '',
    description: movie?.description || '',
    status: movie?.status || 'published',
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
      alert('ImgBB API Key is missing. Please add VITE_IMGBB_API_KEY to your secrets.');
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
      alert('Failed to upload image. Please try again.');
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
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Genre</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                value={formData.genre}
                onChange={e => setFormData({...formData, genre: e.target.value})}
              />
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
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Poster URL / Upload</label>
              <div className="flex gap-2">
                <input 
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
                  value={formData.posterUrl}
                  onChange={e => setFormData({...formData, posterUrl: e.target.value})}
                  placeholder="https://..."
                />
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-all flex items-center justify-center min-w-[48px]">
                  {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                </label>
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
