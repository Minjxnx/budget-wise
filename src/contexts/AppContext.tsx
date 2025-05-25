
"use client";

import type { Transaction, Budget, Category } from "@/lib/types";
import { defaultCategories } from "@/lib/data"; // Sample data removed for Firestore integration
import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from '@/lib/firebase'; // Firebase auth and db import
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
  serverTimestamp, // For setting server-side timestamps if needed
  writeBatch,
  setDoc,
  Timestamp,
  getDocs,
  where
} from 'firebase/firestore';

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
  theme: string;
  setTheme: (theme: 'light' | 'dark') => void;
  dataLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  
  const [theme, setThemeState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'light';
    }
    return 'light';
  });

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        // Clear data if user logs out
        setTransactions([]);
        setBudgets([]);
        setDataLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

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
            // Firestore Timestamps need to be converted
            date: (data.date as Timestamp)?.toDate ? (data.date as Timestamp).toDate().toISOString() : new Date(data.date).toISOString(),
          } as Transaction;
        });
        setTransactions(fetchedTransactions);
        setDataLoading(false);
      }, (error) => {
        console.error("Error fetching transactions: ", error);
        setDataLoading(false);
      });

      const budgetsCol = collection(db, 'users', user.uid, 'budgets');
      // Consider ordering budgets if necessary, e.g., by category name or amount
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
        // Potentially set another dataLoading flag for budgets if needed
      }, (error) => {
        console.error("Error fetching budgets: ", error);
      });

      return () => {
        unsubscribeTransactions();
        unsubscribeBudgets();
      };
    } else {
      // No user, clear data and stop loading
      setTransactions([]);
      setBudgets([]);
      setDataLoading(false);
    }
  }, [user, authLoading]);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
  }, []);

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
      // Handle specific errors, e.g., popup closed by user
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
      date: Timestamp.fromDate(transactionDate), // Store as Firestore Timestamp
      userId: user.uid, // Optional: denormalize userId if needed for rules/queries
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
    const { id, ...budgetData } = updatedBudget; // Exclude id from data to be set
    await setDoc(budgetRef, {
      ...budgetData,
      // Ensure date fields are Timestamps if they are being updated
      startDate: budgetData.startDate instanceof Date ? Timestamp.fromDate(budgetData.startDate) : Timestamp.fromDate(new Date(budgetData.startDate)),
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
    theme,
    setTheme
  }), [user, authLoading, dataLoading, transactions, budgets, categories, theme, setTheme, getCategoryById]);


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
