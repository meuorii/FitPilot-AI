import { useEffect, type PropsWithChildren } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { focusManager, onlineManager } from '@tanstack/react-query';

export function QueryRuntime({ children }: PropsWithChildren) {
  useEffect(() => {
    onlineManager.setEventListener((setOnline) => NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    }));
    const onAppState = (status: AppStateStatus) => focusManager.setFocused(status === 'active');
    const subscription = AppState.addEventListener('change', onAppState);
    focusManager.setFocused(AppState.currentState === 'active');

    return () => {
      onlineManager.setEventListener(() => () => undefined);
      subscription.remove();
    };
  }, []);

  return children;
}
