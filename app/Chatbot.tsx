import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { askChatbot } from '../lib/chatbot';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleStartChat = async () => {
    setShowWelcome(false);
    const initialPrompt = '페르소나 선택, 그리고 대화시 유지';
    await handleInitialPrompt(initialPrompt);
    setIsInitialized(true);
  };

  useEffect(() => {
    // Send initial prompt to chatbot when component mounts
    if (!isInitialized) {
      const initialPrompt = '페르소나 선택, 그리고 대화시 유지';
      handleInitialPrompt(initialPrompt);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const handleInitialPrompt = async (prompt: string) => {
    setLoading(true);
    try {
      const reply = await askChatbot(prompt);
      setMessages([{ text: reply, isUser: false }]);
    } catch (error) {
      console.error("Error calling chatbot:", error);
      setMessages([{ text: 'Sorry, something went wrong.', isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change or loading state changes
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages, loading]);

  const lastAskTimeRef = useRef(Date.now());

  const handleAsk = async () => {
    const now = Date.now();
    if (!input.trim()) return;
    if (now - lastAskTimeRef.current < 3000) {
      setMessages(prev => [...prev, { text: '⚠️ 너무 빠르게 질문하고 있어요. 잠시만 기다려 주세요!', isUser: false }]);
      return;
    }
  
    lastAskTimeRef.current = now;
  
    setMessages(prev => [...prev, { text: input, isUser: true }]);
    setLoading(true);
    try {
      const reply = await askChatbot(input);
      setMessages(prev => [...prev, { text: reply, isUser: false }]);
    } catch (error) {
      console.error("Error calling chatbot:", error);
      setMessages(prev => [...prev, { text: 'Sorry, something went wrong.', isUser: false }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <View style={styles.pageContainer}>
      {showWelcome ? (
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>AI와 떠나는 롤플레잉 여행</Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartChat}
          >
            <Text style={styles.startButtonText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>Chatbot</Text>
          </View>
          
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
          >
            {messages.map((message, index) => (
              <View 
                key={index} 
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.botBubble
                ]}
              >
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            ))}
            {loading && (
              <View style={[styles.messageBubble, styles.botBubble]}>
                <Text style={styles.messageText}>Thinking...</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type your question..."
              style={styles.input}
            />
            <Button title="SEND" onPress={handleAsk} disabled={loading} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    width: '80%',
    alignSelf: 'center',
    paddingBottom: 50,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    height: 70,
  },
  topBarTitle: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesContent: {
    padding: 15,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  userBubble: {
    backgroundColor: '#d2e6fc',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#000000',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginRight: 10,
    borderRadius: 20,
    color: 'black',
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 