import axiosInstance from "../utils/axiosInstance.js";
import { API_PATHS } from "../utils/apiPaths.js";

const uploadDocument = async (formData) => {
  try {
    const response = await axiosInstance.post(
      API_PATHS.DOCUMENTS.UPLOAD_DOCUMENT,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to upload Document." };
  }
};

const getDocuments = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.DOCUMENTS.GET_DOCUMENTS);
    return response.data?.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch documents." };
  }
};

const getDocumentById = async (id) => {
  try {
    const response = await axiosInstance.get(
      API_PATHS.DOCUMENTS.GET_DOCUMENT_BY_ID(id),
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch document details." }
    );
  }
};

const deleteDocument = async (id) => {
  try {
    const response = await axiosInstance.delete(
      API_PATHS.DOCUMENTS.DELETE_DOCUMENT(id),
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete document." };
  }
};

const documentService = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
};

export default documentService;
