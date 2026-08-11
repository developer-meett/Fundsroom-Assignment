import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axios';

interface User { id: number; name: string; email: string; role: string; }
interface AuthContextType { user: User | null; loading: boolean; login: (user: User) => void; logout: () => Promise<void>; }

const AuthContext = createContext<AuthContextType | undefined>(undefined);
