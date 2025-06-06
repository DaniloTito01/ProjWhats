import React from 'react';
import { Bars3Icon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { company } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Botão do menu (visível apenas em dispositivos móveis) */}
          <div className="flex items-center lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-creativity"
              onClick={onMenuClick}
            >
              <span className="sr-only">Abrir menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Logo da empresa (visível apenas em dispositivos móveis) */}
          <div className="flex flex-1 items-center justify-center lg:hidden">
            <div className="flex flex-shrink-0 items-center">
              {company?.logo ? (
                <img
                  className="h-8 w-auto"
                  src={`${process.env.REACT_APP_API_URL}/uploads/${company.logo}`}
                  alt={company.name}
                />
              ) : (
                <h1 className="text-xl font-bold text-purple-creativity">{company?.name || 'Zenni'}</h1>
              )}
            </div>
          </div>

          {/* Logo da empresa (visível apenas em desktop) */}
          <div className="hidden lg:flex lg:flex-1 lg:items-center">
            <div className="flex flex-shrink-0 items-center">
              {company?.logo ? (
                <img
                  className="h-8 w-auto"
                  src={`${process.env.REACT_APP_API_URL}/uploads/${company.logo}`}
                  alt={company.name}
                />
              ) : (
                <h1 className="text-xl font-bold text-purple-creativity">{company?.name || 'Zenni'}</h1>
              )}
            </div>
          </div>

          {/* Ícones de notificação */}
          <div className="flex items-center">
            <button
              type="button"
              className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-creativity focus:ring-offset-2"
            >
              <span className="sr-only">Ver notificações</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

