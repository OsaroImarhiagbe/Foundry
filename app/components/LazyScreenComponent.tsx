import React, {ReactNode,Suspense } from 'react';
import { useColorScheme } from 'react-native';
import { useTheme } from 'react-native-paper';
import { ActivityIndicator } from 'react-native-paper';

type LazyScreenProps = {
  children: ReactNode;
};

const LazyScreenComponent = ({ children }: LazyScreenProps) => {
  const theme = useTheme();
  const dark_or_light = useColorScheme();

  return (
    <Suspense
      fallback={
        <ActivityIndicator
          size='large'
          color={dark_or_light ? '#ffff' : '#000'}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            backgroundColor: theme.colors.background,
          }}
        />
      }
    >
      {children}
    </Suspense>
  );
};

export default LazyScreenComponent;
