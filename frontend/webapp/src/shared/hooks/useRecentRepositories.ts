import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RecentRepository {
  id: string;
  name: string;
  lastAccessed: number;
}

const RECENT_REPOSITORIES_KEY = 'recent_repositories';
const MAX_RECENT_REPOSITORIES = 5;

export const useRecentRepositories = () => {
  const [recentRepositories, setRecentRepositories] = useState<RecentRepository[]>([]);
  const navigate = useNavigate();

  // Load recent repositories from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_REPOSITORIES_KEY);
      if (saved) {
        setRecentRepositories(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load recent repositories:', error);
    }
  }, []);

  // Save recent repositories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_REPOSITORIES_KEY, JSON.stringify(recentRepositories));
    } catch (error) {
      console.error('Failed to save recent repositories:', error);
    }
  }, [recentRepositories]);

  // Add a repository to recent list
  const addRecentRepository = (id: string, name: string) => {
    setRecentRepositories(prev => {
      // Remove if already exists
      const filtered = prev.filter(repo => repo.id !== id);
      
      // Add to beginning
      const updated = [
        { id, name, lastAccessed: Date.now() },
        ...filtered
      ];
      
      // Keep only MAX_RECENT_REPOSITORIES
      return updated.slice(0, MAX_RECENT_REPOSITORIES);
    });
  };

  // Get the most recent repository
  const getMostRecentRepository = (): RecentRepository | null => {
    return recentRepositories.length > 0 ? recentRepositories[0] : null;
  };

  // Navigate to most recent repository or show modal
  const navigateToRecentRepository = (onShowModal: () => void) => {
    const mostRecent = getMostRecentRepository();
    
    if (mostRecent) {
      navigate(`/repositories/${mostRecent.id}`);
    } else {
      onShowModal();
    }
  };

  // Navigate to repositories list
  const navigateToRepositories = () => {
    navigate('/repositories');
  };

  return {
    recentRepositories,
    addRecentRepository,
    getMostRecentRepository,
    navigateToRecentRepository,
    navigateToRepositories,
  };
};





