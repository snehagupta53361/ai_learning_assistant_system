import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../../services/documentService.js";
import Spinner from "../../components/common/Spinner.jsx";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PageHeader from "../../components/common/PageHeader.jsx";
import Tabs from "../../components/common/Tabs.jsx";
import ChatInterface from "../../components/chat/ChatInterface.jsx";
import AIActions from "../../components/ai/AIActions.jsx";
import FlashcardManager from "../../components/flashcards/FlashcardManager.jsx";

const DocumentsDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error("Failed to fetch document details.");
      } finally {
        setLoading(false);
      }
    };
    fetchDocumentDetails();
  }, [id]);

  // Helper function to get the full pdf url
  const getPDFUrl = () => {
    if (!document?.data?.fileUrl) return null;

    const fileUrl = document.data.fileUrl;
    return fileUrl;
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }

    if (!document || !document.data || !document.data.fileUrl) {
      return <div className="text-center p-8 ">PDF not available.</div>;
    }
    const pdfUrl = getPDFUrl();

    return (
      <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300">
          <span className="text-sm font-medium text-gray">Document Viewer</span>
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
          >
            <ExternalLink size={16} />
            Open in new tab
          </a>
        </div>
        <div className="bg-gray-100 p-1">
          <iframe
            src={pdfUrl}
            className="w-full h-[70vh] bg-white rounded border border-gray-300"
            title="PDF viewer"
            frameBorder="0"
            style={{
              colorScheme: "light",
            }}
          />
        </div>
      </div>
    );
  };

  const renderChat = () => {
    return <ChatInterface />;
  };

  const renderAIActions = () => {
    return <AIActions />;
  };

  const renderFlashcardsTab = () => {
    return <FlashcardManager documentId={id} />;
  };
  const renderQuizzesTab = () => {
    return "renderQuizzesTab";
  };

  const tabs = [
    { name: "Content", label: "Content", content: renderContent() },
    { name: "Chat", label: "Chat", content: renderChat() },
    { name: "AIActions", label: "AIActions", content: renderAIActions() },
    { name: "Flashcards", label: "Flashcards", content: renderFlashcardsTab() },
    { name: "Quizzes", label: "Quizzes", content: renderQuizzesTab() },
  ];

  if (loading) {
    return <Spinner />;
  }

  if (!document) {
    return <div className="text-center p-8">Document not found.</div>;
  }
  return (
    <div>
      <div className="mb-4">
        <Link
          to={"/documents"}
          className="inline-flex items-center gap-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
        >
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>
      <PageHeader title={document.data.title} />
      <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default DocumentsDetailPage;
