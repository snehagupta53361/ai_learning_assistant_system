import React, { useState, useEffect } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ArrowLeft,
  Sparkles,
  Brain,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

import flashcardService from "../../services/flashcardService.js";
import aiService from "../../services/aiService.js";
import Spinner from "../common/Spinner.jsx";
import Modal from "../common/Modal.jsx";
import Flashcard from "./Flashcard.jsx";

const FlashcardManager = ({ documentId }) => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [setToDelete, setSetToDelete] = useState(null);

  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getAllFlashcardSets(documentId);
      if (response.count !== 0) setFlashcardSets(response.data);
    } catch (error) {
      toast.error("Failed to fetch flashcards.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchFlashcardSets();
    }
  }, [documentId]);

  const handleGenerateFlashcards = async () => {
    setGenerating(true);
    try {
      await aiService.generateFlashcards(documentId);
      toast.success("Flashcards generated successfully.");
      fetchFlashcardSets();
    } catch (error) {
      toast.error(error.message || "Failed to generate Flashcards.");
    } finally {
      setGenerating(false);
    }
  };

  const handleNextCard = () => {
    if (selectedSet) {
      setCurrentCardIndex(
        (prevIndex) => (prevIndex + 1) % selectedSet.cards.length,
      );
      handleReview(currentCardIndex);
    }
  };
  const handlePrevCard = () => {
    if (selectedSet) {
      setCurrentCardIndex(
        (prevIndex) =>
          (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length,
      );
      handleReview(currentCardIndex);
    }
  };

  const handleReview = async (index) => {
    const currentCard = selectedSet?.cards[currentCardIndex];
    if (!currentCard) return;

    try {
      await flashcardService.reviewFlashcard(currentCard._id, index);
      toast.success("Flashcard reviewed!");
    } catch (error) {
      toast.error(error.message || "Failed to review flashcard.");
    }
  };

  const handleToggleStar = async (cardId) => {
    try {
      await flashcardService.toggleStarFlashcard(cardId);
      const updatedSets = flashcardSets.map((set) => {
        if (set._id === selectedSet._id) {
          const updatedCards = set.cards.map((card) =>
            card._id === cardId
              ? { ...card, isStarred: !card.isStarred }
              : card,
          );
          return { ...set, cards: updatedCards };
        }
        return set;
      });
      setFlashcardSets(updatedSets);
      setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));
      toast.success("Flashcard star status updated!");
    } catch (error) {
      toast.error(error.message || "Failed to update star status.");
    }
  };

  const handleDeleteRequest = (e, set) => {
    e.stopPropagation();
    setSetToDelete(set);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!setToDelete) return;

    setDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(setToDelete._id);
      toast.success("Flashcard deleted successfully");
      setIsDeleteModalOpen(false);
      setSetToDelete(null);
      setFlashcardSets(
        flashcardSets.filter((flashcard) => flashcard._id !== flashcard._id),
      );
    } catch (error) {
      toast.error(error.message || "Failed to delete flashcard set");
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectSet = (set) => {
    setSelectedSet(set);
    setCurrentCardIndex(0);
  };

  const renderFlashcardViewer = () => {
    const currentCard = selectedSet.cards[currentCardIndex];

    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => setSelectedSet(null)}
          className="group inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors duration-200"
        >
          <ArrowLeft
            className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200"
            strokeWidth={2}
          />
          Back to sets
        </button>

        {/* flashcard display */}
        <div className="flex flex-col items-center space-y-8">
          <div className="w-full max-w-lg">
            <Flashcard
              flashcard={currentCard}
              onToggleStar={handleToggleStar}
            />
          </div>
        </div>

        {/* Navigation controlls */}
        <div className="flex items-center justify-center gap-6">
          {/* to move to previous card in the current flashcard */}
          <button
            onClick={handlePrevCard}
            disabled={selectedSet.cards.length <= 1}
            className="group px-5 h-11 flex justify-center items-center gap-2 rounded-xl text-sm text-slate-700 font-medium bg-slate-200 hover:bg-slate-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer disabled:hover:bg-slate-100"
          >
            <ChevronLeft
              className="w-4 h-4 group-hover:-translate-x-0.5 transition-transfrom duration-200"
              strokeWidth={2.5}
            />
            Previous
          </button>

          <div className="px-4 py-2 bg-slate-50 border-2 border-slate-200 rounded-xl">
            <span className="text-sm text-slate-700 font-semibold">
              {currentCardIndex + 1} <span className="">/</span>{" "}
              {selectedSet.cards.length}
            </span>
          </div>
          {/* to move to the next card in the current flashcard set */}
          <button
            onClick={handleNextCard}
            disabled={selectedSet.cards.length <= 1}
            className="group px-5 h-11 flex justify-center items-center gap-2 rounded-xl text-sm text-slate-700 font-medium bg-slate-200 hover:bg-slate-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer disabled:hover:bg-slate-100"
          >
            Next
            <ChevronRight
              className="w-4 h-4 group-hover:translate-x-0.5 transition-transfrom duration-200"
              strokeWidth={2.5}
            />
          </button>
        </div>
      </div>
    );
  };

  const renderSetList = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      );
    }
    if (flashcardSets.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-emerald-100 to-teal-200 mb-6">
            <Brain className="w-8 h-8 text-emerald-600" strokeWidth={2} />
          </div>

          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            No flashcards yet
          </h3>
          <p className="text-sm font-medium text-slate-500 text-center max-w-sm mb-8">
            Generate flashcards from your document to start learning and
            reinforce your knowledge. .
          </p>

          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="group flex items-center justify-center gap-2 px-6 h-12 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 hover:scale-95 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 cursor-pointer active:scale-95 diabled:opacity-50 disabled:cursor-not-allowed disabled:active-scale-100"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" strokeWidth={2} />
                Generate Flahscards
              </>
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header with generate button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Your Flashcard Sets
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {flashcardSets.length}{" "}
              {flashcardSets.length === 1 ? "Set" : "Sets"} available
            </p>
          </div>
          <button
            onClick={handleGenerateFlashcards}
            disabled={generating}
            className="group inline-flex items-center justify-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 active:scale-95  cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:active-scale-100"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                Generate New Set
              </>
            )}
          </button>
        </div>

        {/* Flashcard sets grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcardSets.length > 0 &&
            flashcardSets.map((set, index) => (
              <div
                key={set._id}
                onClick={() => handleSelectSet(set)}
                className="p-6 rounded-2xl group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-emerald-300 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10"
              >
                {/* Delete Button */}
                <button
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100"
                  onClick={(e) => handleDeleteRequest(e, set)}
                >
                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                </button>

                {/* Set content */}
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-emerald-100 to-teal-100">
                    <Brain
                      className="w-6 h-6 text-emerald-600"
                      strokeWidth={2}
                    />
                  </div>

                  <div>
                    <h4 className="text-base font-semibold text-slate-900 mb-1">
                      Flashcard Set {index + 1}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Created at {moment(set.createdAt).format("MM, DD, YYYY")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="text-sm font-semibold text-emerald-700">
                        {set.cards.length}{" "}
                        {set.cards.length === 1 ? "Card" : "Cards"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/50 p-8">
        {selectedSet ? renderFlashcardViewer() : renderSetList()}
      </div>
      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Flashcard Set"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete this flashcard set? This action
            cannot be undone and all cards will be permanently removed.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={deleting}
              className="px-5 h-11 bg-linear-to-br from-slate-100 to-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm rounded-xl transition-all duration-200 shadow-lg shadow-slate-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleting}
              className={`px-5 h-11 bg-linear-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-rose-500/25 hover:scale-95 active:scale-95 cursor-pointer disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  {" "}
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deleting
                </span>
              ) : (
                "Delete Set"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FlashcardManager;
