'use client';
import { useState } from 'react';
import { gql } from '@apollo/client';
import { useMutation as apolloUseMutation } from '@apollo/client/react';

// Requêtes GraphQL pour l'authentification
const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      access_token
      user {
        id
        email
      }
    }
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
    register(input: { email: $email, password: $password, firstName: $firstName, lastName: $lastName }) {
      access_token
      user {
        id
        email
      }
    }
  }
`;

// Define types for the mutation responses
interface LoginResponse {
  login: {
    access_token: string;
    user: {
      id: string;
      email: string;
    };
  };
}

interface RegisterResponse {
  register: {
    id: string;
    email: string;
  };
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginMutation] = apolloUseMutation(LOGIN_MUTATION);
  const [registerMutation] = apolloUseMutation(REGISTER_MUTATION);

  const [logoutMutation] = apolloUseMutation(LOGOUT_MUTATION);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const variables = isLogin
        ? { email, password }
        : { email, password, firstName, lastName };

      const mutation = isLogin ? loginMutation : registerMutation;
      const { data } = await mutation({ variables });

      const result = isLogin
        ? (data as LoginResponse)?.login
        : (data as RegisterResponse)?.register;

      // Sauvegarder le token
      if ('access_token' in result) {
        localStorage.setItem('token', result.access_token);
      }

      // Notifier le succès
      onSuccess();

      // Réinitialiser le formulaire
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-green-800">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="votre@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Votre prénom"
                  required={!isLogin}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  placeholder="Votre nom"
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {loading 
              ? (isLogin ? 'Connexion...' : 'Inscription...') 
              : (isLogin ? 'Se connecter' : 'S\'inscrire')
            }
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-green-600 hover:text-green-800 underline"
          >
            {isLogin 
              ? 'Pas de compte ? S\'inscrire' 
              : 'Déjà un compte ? Se connecter'
            }
          </button>
        </div>

        {isLogin && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Compte de test :</strong><br />
              Email: test@example.com<br />
              Mot de passe: password
            </p>
          </div>
        )}
      </div>
    </div>
  );
}