import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert } from 'react-native';
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

  const handleSubmit = () => {
    if (!dailyQuestion) return;

    const correct = userAnswer.toLowerCase() === dailyQuestion.correct_answer.toLowerCase();
    setAttempts(attempts + 1);

    if (correct) {
      setMessage('Congratulations! You got it right!');
      Alert.alert('Correct!', 'Congratulations! You got it right!');
    } else if (attempts + 1 >= maxAttempts) {
      setMessage(`Out of attempts! The correct answer was: ${dailyQuestion.correct_answer}`);
      Alert.alert('Game Over', `Out of attempts! The correct answer was: ${dailyQuestion.correct_answer}`);
    } else {
      setMessage(`Incorrect! You have ${maxAttempts - (attempts + 1)} attempts left.`);
      Alert.alert('Incorrect', `You have ${maxAttempts - (attempts + 1)} attempts left.`);
    }
  };

  if (!dailyQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>{message || 'Loading daily question...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.questionText}>{dailyQuestion.question_text}</Text>
      <View style={styles.optionsContainer}>
        {dailyQuestion.answer_options.map((option, index) => (
          <Text key={index} style={styles.optionText}>{`${index + 1}. ${option}`}</Text>
        ))}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Your answer"
        value={userAnswer}
        onChangeText={setUserAnswer}
        editable={attempts < maxAttempts && message.indexOf('Congratulations') === -1}
      />
      <Button
        title="Submit Answer"
        onPress={handleSubmit}
        disabled={attempts >= maxAttempts || message.indexOf('Congratulations') !== -1}
      />
      <Text style={styles.message}>{message}</Text>
      {attempts < maxAttempts && message.indexOf('Congratulations') === -1 && (
        <Text style={styles.attemptsLeft}>Attempts left: {maxAttempts - attempts}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionText: {
    fontSize: 18,
    marginBottom: 5,
  },
  input: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    fontSize: 18,
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  attemptsLeft: {
    marginTop: 10,
    fontSize: 16,
    color: 'gray',
  },
});
