import React, { useContext } from 'react';
import WebFHandler from '@/context/WebFHandler';

export type ContextType = WebFHandler;

const GlobalContext = React.createContext<ContextType>(new WebFHandler(''));

const useGlobalContext = () => {
  return useContext(GlobalContext);
};

export default GlobalContext;

export { useGlobalContext };
