import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { supabase } from '../../supabaseClient';

export default function QuestionScreen() {
  const [dailyQuestion, setDailyQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [message, setMessage] = useState('');
  const maxAttempts = 3;

  useEffect(() => {
    const fetchDailyQuestion = async () => {
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('question_date', today)
        .single();

      if (error) {
        console.error('Error fetching daily question:', error);
        setMessage('Error loading question.');
      } else if (data) {
        setDailyQuestion(data);
        setAttempts(0);
        setMessage('');
        setUserAnswer('');
      } else {
        setMessage('No question found for today. Check back tomorrow!');
      }
    };

    fetchDailyQuestion();
  }, []);

  const handleSubmit = useCallback(() => {
    if (!dailyQuestion) return;
    if (userAnswer.trim() === '') {
      setMessage('Please enter an answer.');
      return;
    }

    const correct = userAnswer.toLowerCase() === dailyQuestion.correct_answer.toLowerCase();
    setAttempts(prevAttempts => prevAttempts + 1);

    if (correct) {
      setMessage('Congratulations! You got it right! See you tomorrow!');
    } else if (attempts + 1 >= maxAttempts) {
      setMessage(`Out of attempts! The correct answer was: ${dailyQuestion.correct_answer}. Better luck tomorrow!`);
    } else {
      setMessage(`Incorrect! You have ${maxAttempts - (attempts + 1)} attempts left.`);
    }
  }, [dailyQuestion, userAnswer, attempts, maxAttempts]);

  if (!dailyQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{message || 'Loading daily question...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.questionText}>{dailyQuestion.question_text}</Text>
        <View style={styles.optionsContainer}>
          {dailyQuestion.answer_options.map((option, index) => (
            <Text key={option} style={styles.optionText}>{`${index + 1}. ${option}`}</Text>
          ))}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Your answer"
          value={userAnswer}
          onChangeText={setUserAnswer}
          editable={attempts < maxAttempts && message.indexOf('Congratulations') === -1}
        />
        <View style={styles.submitButton}>
          <Button
            title="Submit Answer"
            onPress={handleSubmit}
            disabled={attempts >= maxAttempts || message.indexOf('Congratulations') !== -1}
            color="#4CAF50" // Green color for the button
          />
        </View>
        <Text style={[styles.message, message.includes('Congratulations') ? styles.correctMessage : message.includes('Incorrect') || message.includes('Out of attempts') ? styles.incorrectMessage : {}]}>{message}</Text>
        {attempts < maxAttempts && message.indexOf('Congratulations') === -1 && (
          <Text style={styles.attemptsLeft}>Attempts left: {maxAttempts - attempts}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  questionText: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  optionsContainer: {
    width: '90%',
    marginBottom: 25,
  },
  optionText: {
    fontSize: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  input: {
    width: '90%',
    padding: 15,
    borderWidth: 1,
    borderColor: '#a0a0a0',
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  submitButton: {
    width: '90%',
    borderRadius: 8,
    overflow: 'hidden', // Required for borderRadius on Button
  },
  message: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  correctMessage: {
    color: 'green',
  },
  incorrectMessage: {
    color: 'red',
  },
  attemptsLeft: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  adBanner: {
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});