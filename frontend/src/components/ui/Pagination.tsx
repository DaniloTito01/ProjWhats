import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}) => {
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    
    // Sempre mostrar a primeira página
    pages.push(1);
    
    // Calcular o intervalo de páginas a serem mostradas
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adicionar elipses se necessário
    if (startPage > 2) {
      pages.push(-1); // -1 representa elipses
    }
    
    // Adicionar páginas do intervalo
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Adicionar elipses se necessário
    if (endPage < totalPages - 1) {
      pages.push(-2); // -2 representa elipses
    }
    
    // Sempre mostrar a última página se houver mais de uma página
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 ${className}`}>
      <div className="flex w-0 flex-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeftIcon className="mr-3 h-5 w-5" aria-hidden="true" />
          Anterior
        </button>
      </div>
      <div className="hidden md:flex">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === -1 || page === -2 ? (
              <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">
                ...
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
                  currentPage === page
                    ? 'border-purple-creativity text-purple-creativity'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex w-0 flex-1 justify-end">
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
          <ChevronRightIcon className="ml-3 h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;

