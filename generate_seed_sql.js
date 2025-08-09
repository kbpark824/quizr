const fs = require('fs');
const triviaData = require('./trivia_data.json');

const outputFilePath = './supabase/migrations/20250809031600_seed_trivia_questions.sql';

let sql = '';
const batchSize = 100;

for (let i = 0; i < triviaData.length; i += batchSize) {
  const batch = triviaData.slice(i, i + batchSize);
  const values = batch.map(question => {
    const questionText = question.question_text.replace(/'/g, "''");
    const correctAnswer = question.correct_answer.replace(/'/g, "''");
    const answerOptions = '{' + question.answer_options.map(option => option.replace(/'/g, "''")).join(',') + '}';
    const questionDate = question.question_date;
    return `(
      '${questionText}',
      '${answerOptions}',
      '${correctAnswer}',
      '${questionDate}'
    )`;
  }).join(',');

  sql += `INSERT INTO questions (question_text, answer_options, correct_answer, question_date) VALUES
${values};
`;
}

fs.writeFileSync(outputFilePath, sql);

console.log(`SQL seed file generated at ${outputFilePath}`);