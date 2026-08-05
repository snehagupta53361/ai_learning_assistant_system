import React, { useState, useEffect } from "react";
import flashcardService from "../../services/flashcardService.js";
import pageHeader from "../../components/common/PageHeader.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import FlashcardSetCard from "../../components/flashcards/FlashcardSetCard.jsx";
import toast from "react-hot-toast";
import PageHeader from "../../components/common/PageHeader.jsx";

const FlashcardListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();
        setFlashcardSets(response.data);
        console.log(response);
      } catch (error) {
        toast.error("Failed to fetch flashcard sets");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSets();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="">
          <Spinner />
        </div>
      );
    }

    if (flashcardSets.length === 0) {
      return (
        <EmptyState
          title="No flashcard Sets Found."
          description="You haven't generated any flashcards yet. Go to a document to create your first set"
        />
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    );
  };
  return (
    <div>
      <PageHeader title="All flashcard Sets" />
      {renderContent()}
    </div>
  );
};

export default FlashcardListPage;
