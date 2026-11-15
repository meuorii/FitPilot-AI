import { Redirect } from 'expo-router';

export default function IndexRoute() {
  return __DEV__ ? <Redirect href="/(app)/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
