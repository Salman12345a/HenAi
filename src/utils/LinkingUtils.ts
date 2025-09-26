import { Linking, Alert } from 'react-native';

export class LinkingUtils {
  static async openGeminiLogin(): Promise<void> {
    try {
      // Google/Gemini OAuth URL - you can customize this URL as needed
      const geminiLoginUrl = 'https://accounts.google.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=openid%20profile%20email';
      
      // For now, we'll just open Google's main page as an example
      const url = 'https://gemini.google.com/';
      
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open browser');
      }
    } catch (error) {
      console.error('Error opening Gemini login:', error);
      Alert.alert('Error', 'Failed to open browser');
    }
  }
}
