import React, { useEffect, useState } from "react";

function QuestionList() {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    prompt: "",
    answers: ["", "", "", ""],
    correctIndex: 0,
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/questions")
      .then((response) => response.json())
      .then((data) => setQuestions(data))
      .catch((error) => console.error("Error fetching questions:", error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({ ...newQuestion, [name]: value });
  };

  const handleAnswerChange = (index, value) => {
    const updatedAnswers = newQuestion.answers.map((answer, i) =>
      i === index ? value : answer
    );
    setNewQuestion({ ...newQuestion, answers: updatedAnswers });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch("http://localhost:4000/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newQuestion),
    })
      .then((response) => response.json())
      .then((data) => {
        setQuestions([...questions, data]);
        setShowForm(false);
        setNewQuestion({
          prompt: "",
          answers: ["", "", "", ""],
          correctIndex: 0,
        });
      })
      .catch((error) => console.error("Error adding question:", error));
  };

  const handleDelete = (id) => {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          setQuestions(questions.filter((question) => question.id !== id));
        } else {
          console.error("Error deleting question");
        }
      })
      .catch((error) => console.error("Error deleting question:", error));
  };

  const handleCorrectIndexChange = (id, correctIndex) => {
    fetch(`http://localhost:4000/questions/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ correctIndex }),
    })
      .then((response) => {
        if (response.ok) {
          setQuestions(questions.map((question) =>
            question.id === id ? { ...question, correctIndex } : question
          ));
        } else {
          console.error("Error updating correct index");
        }
      })
      .catch((error) => console.error("Error updating correct index:", error));
  };

  return (
    <section>
      <h1>Quiz Questions</h1>
      <ul>
        {questions.map((question) => (
          <li key={question.id}>
            {question.prompt}
            <button onClick={() => handleDelete(question.id)}>Delete</button>
            <label>Correct Answer: </label>
            <select
              value={question.correctIndex}
              onChange={(e) =>
                handleCorrectIndexChange(question.id, parseInt(e.target.value, 10))
              }
            >
              {question.answers.map((answer, index) => (
                <option key={index} value={index}>
                  {answer}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
      <button onClick={() => setShowForm(true)}>New Question</button>
      {showForm && (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Prompt: </label>
            <input
              type="text"
              name="prompt"
              value={newQuestion.prompt}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            {newQuestion.answers.map((answer, index) => (
              <div key={index}>
                <label>Answer {index + 1}: </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  required
                />
              </div>
            ))}
          </div>
          <div>
            <label>Correct Answer Index: </label>
            <input
              type="number"
              name="correctIndex"
              value={newQuestion.correctIndex}
              onChange={handleInputChange}
              min="0"
              max="3"
              required
            />
          </div>
          <button type="submit">Add Question</button>
        </form>
      )}
    </section>
  );
}

export default QuestionList;
