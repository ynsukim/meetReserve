import React, { useState } from 'react';
import { View, TextInput, Button, Text, ScrollView, StyleSheet } from 'react-native';
import { askChatbot } from '../lib/chatbot';

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async () => {
    setLoading(true);
    try {
      const reply = await askChatbot(input);
      setResponse(reply);
    } catch (error) {
      console.error("Error calling chatbot:", error);
      setResponse('Sorry, something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.pageContainer}>
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Chatbot</Text>
      </View>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Ask something:</Text>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type your question..."
          style={styles.input}
        />
        <Button title="Ask Bot" onPress={handleAsk} disabled={loading} />
        {loading ? <Text style={styles.loadingText}>Thinking...</Text> : null}
        {response ? (
          <Text style={styles.responseText}>{response}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
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
  contentContainer: {
    padding: 20,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    color: 'black',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    color: 'black',
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: 'gray',
  },
  responseText: {
    marginTop: 20,
    fontSize: 16,
    color: 'black',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
}); 