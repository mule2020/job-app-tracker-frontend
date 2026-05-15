import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/auth.api';
import { useAuthContext } from '../context/AuthContext';
import type { LoginRequest, RegisterRequest } from '../types/auth.types';

export const useAuth = () => {
  const { setAuth, logout, user, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (res) => {
      setAuth(
        res.accessToken!,
        res.refreshToken!,
        { email: res.email!, isVerified: res.isVerified! }
      );
      navigate('/dashboard');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => navigate('/verify-email'),
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation,
    register: registerMutation,
    logout: () => { logout(); navigate('/login'); },
  };
};