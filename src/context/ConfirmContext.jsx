import { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';
import '../components/ConfirmModal.css';

const ConfirmContext = createContext(null);

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: 'Are you sure?',
    message: '',
    isPassword: false,
    resolve: null
  });

  const confirm = useCallback((options) => {
    const isString = typeof options === 'string';
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: isString ? 'Are you sure?' : (options.title || 'Are you sure?'),
        message: isString ? options : options.message,
        isPassword: !isString && !!options.isPassword,
        resolve
      });
    });
  }, []);

  const handleClose = (result) => {
    if (confirmState.resolve) {
      confirmState.resolve(result);
    }
    setConfirmState({ isOpen: false, message: '', resolve: null });
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState.isOpen && (
        <ConfirmModal 
          title={confirmState.title}
          message={confirmState.message}
          isPassword={confirmState.isPassword}
          onConfirm={(val) => handleClose(val)}
          onCancel={() => handleClose(false)}
        />
      )}
    </ConfirmContext.Provider>
  );
};
