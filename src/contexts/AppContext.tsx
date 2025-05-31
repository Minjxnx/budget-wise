"use client";

import type { Transaction, Budget, Category, UserSettings } from "@/libs/types";
import { defaultCategories } from "@/libs/data";
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from "react";
import { auth, db } from '@/libs/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  setDoc,
  Timestamp,
  getDoc
} from 'firebase/firestore';

const DEFAULT_CURRENCY = 'USD';
const DEFAULT_THEME = 'light';

interface AppContextType {
  user: FirebaseUser | null;
  authLoading: boolean;
  login: (email: string, pass: string) => Promise<FirebaseUser>;
  signup: (email: string, pass: string) => Promise<FirebaseUser>;
  signInWithGoogle: () => Promise<FirebaseUser | null>;
  logout: () => Promise<void>;
  transactions: Transaction[];
  budgets: Budget[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'> & { date?: string | Date }) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'startDate'> & { startDate?: string | Date }) => Promise<void>;
  updateBudget: (budget: Budget) => Promise<void>;
  deleteTransaction: (transactionId: string) => Promise<void>;
  deleteBudget: (budgetId: string) => Promise<void>;
  getCategoryById: (categoryId: string) => Category | undefined;

  theme: 'light' | 'dark'; // This will now be derived from userSettings
  // setTheme: (theme: 'light' | 'dark') => void; // This will be replaced by updateUserSetting

  dataLoading: boolean;
  userSettings: UserSettings | null;
  settingsLoading: boolean;
  updateUserSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => Promise<void>;
  currentCurrency: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories] = useState<Category[]>(defaultCategories); // Categories are static for now

  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  // Global theme state, managed by userSettings once loaded
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(DEFAULT_THEME);
  const [currentCurrency, setCurrentCurrency] = useState<string>(DEFAULT_CURRENCY);

  // Function to apply theme to DOM and localStorage
  const applyTheme = useCallback((themeToApply: 'light' | 'dark') => {
    setCurrentTheme(themeToApply);
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(themeToApply);
      localStorage.setItem('theme', themeToApply); // Keep localStorage for initial non-authed load
    }
  }, []);

  // Effect for initial theme load from localStorage (before Firebase settings kick in)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        applyTheme(storedTheme);
      } else {
        applyTheme(DEFAULT_THEME);
      }
    }
  }, [applyTheme]);


  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        setTransactions([]);
        setBudgets([]);
        setUserSettings(null);
        setDataLoading(false);
        setSettingsLoading(false);
        applyTheme(localStorage.getItem('theme') as 'light' | 'dark' || DEFAULT_THEME); // Revert to localStorage theme or default
        setCurrentCurrency(DEFAULT_CURRENCY);
      }
    });
    return () => unsubscribe();
  }, [applyTheme]);

  // Firestore listener for user settings
  useEffect(() => {
    if (user && !authLoading) {
      setSettingsLoading(true);
      const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
      const unsubscribeSettings = onSnapshot(settingsRef, async (docSnap) => {
        if (docSnap.exists()) {
          const settingsData = docSnap.data() as UserSettings;
          setUserSettings(settingsData);
          applyTheme(settingsData.theme);
          setCurrentCurrency(settingsData.currency);
        } else {
          // No settings doc, create one with defaults
          const defaultSettings: UserSettings = { theme: DEFAULT_THEME, currency: DEFAULT_CURRENCY };
          try {
            await setDoc(settingsRef, defaultSettings);
            setUserSettings(defaultSettings);
            applyTheme(defaultSettings.theme);
            setCurrentCurrency(defaultSettings.currency);
          } catch (error) {
            console.error("Error creating default user settings:", error);
          }
        }
        setSettingsLoading(false);
      }, (error) => {
        console.error("Error fetching user settings: ", error);
        setUserSettings({ theme: DEFAULT_THEME, currency: DEFAULT_CURRENCY }); // Fallback
        applyTheme(DEFAULT_THEME);
        setCurrentCurrency(DEFAULT_CURRENCY);
        setSettingsLoading(false);
      });
      return () => unsubscribeSettings();
    } else {
      setSettingsLoading(false);
    }
  }, [user, authLoading, applyTheme]);


  // Firestore listeners for transactions and budgets
  useEffect(() => {
    if (user && !authLoading) {
      setDataLoading(true);
      const transactionsCol = collection(db, 'users', user.uid, 'transactions');
      const transactionsQuery = query(transactionsCol, orderBy('date', 'desc'));
      const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
        const fetchedTransactions = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: (data.date as Timestamp)?.toDate ? (data.date as Timestamp).toDate().toISOString() : new Date(data.date).toISOString(),
          } as Transaction;
        });
        setTransactions(fetchedTransactions);
        setDataLoading(false); // Combined loading state, primarily for transactions
      }, (error) => {
        console.error("Error fetching transactions: ", error);
        setDataLoading(false);
      });

      const budgetsCol = collection(db, 'users', user.uid, 'budgets');
      const unsubscribeBudgets = onSnapshot(budgetsCol, (snapshot) => {
        const fetchedBudgets = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: (data.startDate as Timestamp)?.toDate ? (data.startDate as Timestamp).toDate().toISOString() : new Date(data.startDate).toISOString(),
          } as Budget;
        });
        setBudgets(fetchedBudgets);
      }, (error) => {
        console.error("Error fetching budgets: ", error);
      });

      return () => {
        unsubscribeTransactions();
        unsubscribeBudgets();
      };
    } else {
      setTransactions([]);
      setBudgets([]);
      setDataLoading(false);
    }
  }, [user, authLoading]);


  const login = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  };

  const signup = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    return userCredential.user;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Google sign-in error", error);
      return null;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date'> & { date?: string | Date }) => {
    if (!user) throw new Error("User not authenticated");
    const transactionDate = transaction.date instanceof Date ? transaction.date : new Date(transaction.date || Date.now());
    await addDoc(collection(db, 'users', user.uid, 'transactions'), {
      ...transaction,
      date: Timestamp.fromDate(transactionDate),
      userId: user.uid,
    });
  };

  const addBudget = async (budget: Omit<Budget, 'id' | 'startDate'> & { startDate?: string | Date }) => {
    if (!user) throw new Error("User not authenticated");
    const budgetStartDate = budget.startDate instanceof Date
        ? budget.startDate
        : (budget.startDate ? new Date(budget.startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    await addDoc(collection(db, 'users', user.uid, 'budgets'), {
      ...budget,
      startDate: Timestamp.fromDate(budgetStartDate),
      userId: user.uid,
    });
  };

  const updateBudget = async (updatedBudget: Budget) => {
    if (!user) throw new Error("User not authenticated");
    const budgetRef = doc(db, 'users', user.uid, 'budgets', updatedBudget.id);
    const { id, ...budgetData } = updatedBudget;
    await setDoc(budgetRef, {
      ...budgetData,
      startDate: budgetData.startDate ? Timestamp.fromDate(new Date(budgetData.startDate)) : Timestamp.fromDate(new Date(budgetData.startDate)),
    }, { merge: true });
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!user) throw new Error("User not authenticated");
    await deleteDoc(doc(db, 'users', user.uid, 'transactions', transactionId));
  };

  const deleteBudget = async (budgetId: string) => {
    if (!user) throw new Error("User not authenticated");
    await deleteDoc(doc(db, 'users', user.uid, 'budgets', budgetId));
  };

  const getCategoryById = (categoryId: string) => {
    return categories.find(c => c.id === categoryId);
  };

  const updateUserSetting = async <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!user) throw new Error("User not authenticated for updating settings");
    const settingsRef = doc(db, 'users', user.uid, 'settings', 'preferences');
    try {
      await setDoc(settingsRef, { [key]: value }, { merge: true });
      // If theme is updated, apply it immediately
      if (key === 'theme') {
        applyTheme(value as 'light' | 'dark');
      }
      if (key === 'currency') {
        setCurrentCurrency(value as string);
      }
    } catch (error) {
      console.error(`Error updating user setting ${key}:`, error);
      // Potentially re-fetch settings or show an error toast
    }
  };

  const contextValue = useMemo(() => ({
    user,
    authLoading,
    dataLoading,
    login,
    signup,
    signInWithGoogle,
    logout,
    transactions,
    budgets,
    categories,
    addTransaction,
    addBudget,
    updateBudget,
    deleteTransaction,
    deleteBudget,
    getCategoryById,
    theme: currentTheme, // Use the derived currentTheme
    userSettings,
    settingsLoading,
    updateUserSetting,
    currentCurrency,
  }), [
    user, authLoading, dataLoading, transactions, budgets, categories,
    currentTheme, userSettings, settingsLoading, updateUserSetting, currentCurrency, applyTheme // ensure updateUserSetting stability
  ]);


  return (
      <AppContext.Provider value={contextValue}>
        {children}
      </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};