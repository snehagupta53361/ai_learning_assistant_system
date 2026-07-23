import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import quizService from "../../services/quizService.js";
import aiService from "../../services/aiService.js";
import Spinner from "../common/Spinner.jsx";
import Button from "../common/Button.jsx";
import Modal from "../common/Modal.jsx";
import QuizCard from "./QuizCard.jsx";
import EmptyState from "../common/EmptyState.jsx";

const QuizManager = ({ documentId }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGeneratingModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // fetch all the quizzes for the specific documentId
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const response = await quizService.getQuizzesForDoc(documentId);
      setQuizzes(response.data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch Quizzes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchQuizzes();
    }
  }, [documentId]);

  // generate quiz handler

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const response = await aiService.generateQuiz(documentId, {
        numQuestions,
      });
      toast.success("Quiz generated successfully!");
      setIsGeneratingModalOpen(false);
      fetchQuizzes();
      console.log(response);
    } catch (error) {
      toast.error(error.message || "Failed to generate quiz.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteRequest = (quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleteModalOpen(true);
  };

  const handlelConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      const response = await quizService.deleteQuiz(selectedQuiz._id);
      console.log(response);
      toast.success(`${selectedQuiz.title || "Quiz"} deleted successfully!`);
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      setQuizzes(quizzes.filter((q) => q._id !== selectedQuiz._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete quiz!");
    } finally {
      setDeleting(false);
    }
  };

  const renderQuizContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (quizzes.length === 0) {
      return (
        <EmptyState
          title="No Quizzes yet"
          description="Generate a quiz from your document to test your knowledge."
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} onDelete={handleDeleteRequest} />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6">
      <div className="flex justify-end gap-2 mb-4">
        <Button onClick={() => setIsGeneratingModalOpen(true)}>
          <Plus size={16} />
          Generate Quiz
        </Button>
      </div>

      {renderQuizContent()}

      {/* Generate Quiz */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGeneratingModalOpen(false)}
        title="Generate New Quiz"
      >
        <form onSubmit={handleGenerateQuiz} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1.5">
              Number of Questions
            </label>
            <input
              type="number"
              value={numQuestions}
              onChange={(e) =>
                setNumQuestions(Math.max(1, parseInt(e.target.value) || 1))
              }
              min="1"
              required
              className="w-full h-9 px-3 border border-neutral-200 rounded-lg bg-white text-sm text-neutral-900 placeholder-neutral-400 transition-colors duratin-200 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsGeneratingModalOpen(false)}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button type="submit" disable={generating}>
              {generating ? "Generating..." : "Generate Quiz"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delte confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Selected Quiz"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Are you sure you want to delete the quiz:{" "}
            <span className="font-semibold text-neutral-600">
              {selectedQuiz?.title || "this quiz"}
            </span>
            {"? "}
            This action can not be undone.
          </p>
          <div className="flex justify-end items-center gap-2 pt-2">
            <Button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              variant="outline"
              disabled={deleting}
            >
              Cancel
            </Button>
            <button
              onClick={handlelConfirmDelete}
              disabled={deleting}
              className="px-3 h-11 rounded-lg text-white text-sm font-semibold bg-red-500 hover:bg-red-600 active:bg-red-700 focus:ring-red-500 cursor-pointer flex justiy-center items-center gap-2"
            >
              {deleting ? "Deleting..." : "Delete Quiz"}
              {deleting ? (
                <div className="h-4 w-4 rounded-full border-3 border-white/30 border-t-white animate-spin" />
              ) : (
                ""
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuizManager;
