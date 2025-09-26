import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';

type PromptScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'PromptScreen'
>;

type PromptScreenRouteProp = RouteProp<RootStackParamList, 'PromptScreen'>;

interface Props {
  navigation: PromptScreenNavigationProp;
  route: PromptScreenRouteProp;
}

const PromptScreen: React.FC<Props> = ({ navigation, route }) => {
  const { promptId, prompt, title, imageUrl } = route.params;

  // Get the image source - prioritize API imageUrl, fallback to local images
  const getImageSource = () => {
    if (imageUrl && imageUrl.trim() !== '') {
      // Use dynamic image URL from API
      console.log('🖼️ Using API image URL:', imageUrl);
      return { uri: imageUrl };
    } else {
      // Fallback to local images for backward compatibility
      console.log('🖼️ Using local fallback image for ID:', promptId);
      const imageMap: { [key: string]: any } = {
        '1': require('../../src/Asset/image/s1.png'),
        '2': require('../../src/Asset/image/s2.png'),
        '3': require('../../src/Asset/image/s3.png'),
        '4': require('../../src/Asset/image/s4.png'),
        '5': require('../../src/Asset/image/s5.png'),
        '6': require('../../src/Asset/image/s6.png'),
        '7': require('../../src/Asset/image/s7.png'),
        '8': require('../../src/Asset/image/s8.png'),
        '9': require('../../src/Asset/image/s9.png'),
        '10': require('../../src/Asset/image/s10.png'),
        '11': require('../../src/Asset/image/s11.png'),
        'fallback-1': require('../../src/Asset/image/s1.png'), // Fallback for sample style
      };
      return imageMap[promptId] || null;
    }
  };

  const currentImageSource = getImageSource();

  const handleGenerateWithGemini = async () => {
    try {
      // Encode the prompt for URL - keep it reasonable length
      const encodedPrompt = encodeURIComponent(prompt);
      
      console.log('🚀 Starting Gemini browser opening...');
      console.log('📝 Original prompt length:', prompt.length);
      console.log('🔗 Encoded prompt length:', encodedPrompt.length);
      
      // If prompt is too long, truncate it to avoid URL length issues
      const maxLength = 1500; // Conservative URL length limit
      const finalPrompt = encodedPrompt.length > maxLength 
        ? encodeURIComponent(prompt.substring(0, 800) + '...')
        : encodedPrompt;
      
      console.log('✂️ Final prompt length:', finalPrompt.length);
      
      // Try multiple Gemini URL formats
      const geminiUrls = [
        `https://gemini.google.com/app?q=${finalPrompt}`,
        `https://gemini.google.com/?q=${finalPrompt}`,
        `https://bard.google.com/?q=${finalPrompt}`,
        'https://gemini.google.com/', // Direct Gemini without query
      ];
      
      console.log('🌐 Attempting to open Gemini URLs...');
      
      // Check if we can open URLs first
      const canOpenURL = await Linking.canOpenURL('https://google.com');
      console.log('🔍 Can open URLs:', canOpenURL);
      
      if (!canOpenURL) {
        throw new Error('URL opening not supported');
      }
      
      // Try each URL until one works
      let urlOpened = false;
      for (let i = 0; i < geminiUrls.length; i++) {
        const url = geminiUrls[i];
        console.log(`🌐 Trying URL ${i + 1}:`, url.substring(0, 50) + '...');
        
        try {
          const result = await Linking.openURL(url);
          console.log('✅ Linking.openURL result:', result);
          urlOpened = true;
          break; // Success! Exit the loop
        } catch (urlError) {
          console.log(`❌ URL ${i + 1} failed:`, urlError);
          // Continue to next URL
        }
      }
      
      if (!urlOpened) {
        throw new Error('All Gemini URLs failed');
      }
      
      // Since browser opens successfully, automatically copy prompt for user
      console.log('✅ Browser opened successfully, copying prompt...');
      copyPromptToClipboard();
      
    } catch (error) {
      console.log('❌ Primary Gemini URL failed:', error);
      openGoogleFallback(encodeURIComponent(prompt.substring(0, 500)));
    }
  };

  const openGoogleFallback = async (encodedPrompt: string) => {
    try {
      console.log('🔄 Trying Google fallback...');
      // Try to open Gemini directly without query parameters first
      const directGeminiUrl = 'https://gemini.google.com/';
      console.log('🌐 Trying direct Gemini URL:', directGeminiUrl);
      
      await Linking.openURL(directGeminiUrl);
      console.log('✅ Direct Gemini URL successful!');
      
      Alert.alert(
        'Opened Gemini', 
        'Gemini should be opening now. You can paste your prompt there manually.',
        [
          { 
            text: 'Copy Prompt', 
            onPress: () => copyPromptToClipboard()
          },
          { text: 'OK' }
        ]
      );
      
    } catch (directError) {
      console.log('❌ Direct Gemini failed, trying Google search:', directError);
      
      try {
        // Fallback to Google search for "Gemini AI"
        const googleUrl = 'https://www.google.com/search?q=Gemini+AI';
        console.log('🌐 Opening Google search for Gemini:', googleUrl);
        
        await Linking.openURL(googleUrl);
        console.log('✅ Google search successful!');
        
        Alert.alert(
          'Opened Google Search', 
          'Opened Google search for Gemini AI. Click on the first result to open Gemini, then paste your prompt.',
          [
            { 
              text: 'Copy Prompt', 
              onPress: () => copyPromptToClipboard()
            },
            { text: 'OK' }
          ]
        );
        
      } catch (googleError) {
        console.log('❌ Google search also failed:', googleError);
        Alert.alert(
          'Browser Issue', 
          'Unable to open any browser. Please copy the prompt and open Gemini manually.',
          [
            { 
              text: 'Copy Prompt', 
              onPress: () => copyPromptToClipboard(),
              style: 'default'
            },
            { text: 'OK' }
          ]
        );
      }
    }
  };

  const openGoogleSearch = async (encodedPrompt: string) => {
    try {
      const googleUrl = `https://www.google.com/search?q=${encodedPrompt}`;
      console.log('Opening Google Search:', googleUrl);
      await Linking.openURL(googleUrl);
    } catch (error) {
      console.log('Google search also failed:', error);
    }
  };

  const copyPromptToClipboard = async () => {
    try {
      // Use React Native's built-in clipboard (available from RN 0.60+)
      const { Clipboard } = require('react-native');
      await Clipboard.setString(prompt);
      console.log('📋 Prompt copied to clipboard successfully');
      
      Alert.alert(
        'Prompt Copied! 📋', 
        'The AI prompt has been copied to your clipboard. Paste it in Gemini to generate your image.',
        [{ text: 'Got it!' }]
      );
    } catch (error) {
      console.log('❌ Copy failed:', error);
      // Fallback: show the prompt in an alert for manual copy
      Alert.alert(
        'Copy Manually', 
        `Please copy this prompt manually:\n\n${prompt.substring(0, 200)}...`,
        [
          { text: 'Show Full Prompt', onPress: () => showFullPrompt() },
          { text: 'OK' }
        ]
      );
    }
  };

  const showFullPrompt = () => {
    Alert.alert(
      'Full AI Prompt',
      prompt,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          
          {/* Header Image */}
          {currentImageSource && (
            <View style={styles.headerImageContainer}>
              <Image 
                source={currentImageSource} 
                style={styles.headerImage} 
                resizeMode="cover"
                onError={(error) => {
                  console.log('❌ Image failed to load:', error.nativeEvent.error);
                }}
                onLoad={() => {
                  console.log('✅ Image loaded successfully');
                }}
              />
              <View style={styles.headerOverlay}>
                <Text style={styles.headerTitle}>{title}</Text>
                <Text style={styles.headerSubtitle}>AI Image Generation</Text>
              </View>
            </View>
          )}
        </View>

        {/* Prompt Content */}
        <View style={styles.content}>
          <View style={styles.promptContainer}>
            <View style={styles.promptHeader}>
              <Text style={styles.promptLabel}>Gemini Nano Prompt:</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={copyPromptToClipboard}
                activeOpacity={0.7}>
                <Text style={styles.copyButtonText}>📋 Copy</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.promptBox}>
              <Text style={styles.promptText}>{prompt}</Text>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>How it works:</Text>
            <Text style={styles.instructionsText}>
              • Tap "Generate with Gemini" below{'\n'}
              • Browser will open with your prompt ready{'\n'}
              • Upload your image in Gemini{'\n'}
              • Click Generate to create your AI image
            </Text>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={handleGenerateWithGemini}
            activeOpacity={0.8}>
            <Text style={styles.generateButtonText}>Generate with Gemini</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    position: 'relative',
    paddingVertical: 0,
    paddingHorizontal: 0,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 50,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 25,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  headerImageContainer: {
    width: '100%',
    height: 240,
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 40,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    padding: 24,
  },
  promptContainer: {
    marginBottom: 32,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  copyButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0d0d0',
  },
  copyButtonText: {
    fontSize: 14,
    color: '#4285f4',
    fontWeight: '600',
  },
  promptBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  promptText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  generateButton: {
    backgroundColor: '#4285f4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  instructionsContainer: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#4285f4',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 16,
    color: '#4a5568',
    lineHeight: 24,
  },
  emulatorNote: {
    fontSize: 14,
    color: '#e53e3e',
    fontStyle: 'italic',
  },
});

export default PromptScreen;
