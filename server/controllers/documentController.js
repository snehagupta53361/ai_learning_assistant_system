import Document from "../models/Document.js";
import Flashcard from "../models/Flashcard.js";
import FlashCard from "../models/Flashcard.js";
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";
import cloudinary from "../config/cloudinary.js";

// @desc         upload PDF document
// @route POST   /api/documents/upload
// access       protect

export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }

    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    const { buffer, originalname } = req.file;
    const fileName = originalname.replace(/\.pdf$/i, "");

    // Upload PDFs as image assets so Cloudinary serves them inline and can generate
    // PDF page previews. The buffer still comes directly from Multer memory storage.
    const result = await uploadBuffer(buffer, {
      resource_type: "image",
      folder: process.env.CLOUDINARY_FOLDER || "pdfs",
      public_id: `${Date.now()}-${fileName}`,
      format: "pdf",
      access_mode: "public",
    });

    //create document record
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      fileUrl: result.secure_url,
      cloudinaryId: result.public_id,
      fileSize: req.file.size,
      status: "processing",
    });

    //process PDF in background (in production, use a queue like BULL)
    processPDF(document._id, buffer).catch((err) => {
      console.error("PDF processing error:", err);
    });

    res.status(200).json({
      success: true,
      data: document,
      message: "Document uploaded successfully, processing in progress....",
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to upload pdf on cloudinary
const uploadBuffer = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    uploadStream.end(buffer);
  });

//Helper function to process PDF
const processPDF = async (documentId, dataBuffer) => {
  try {
    const { text } = await extractTextFromPDF(dataBuffer);

    //create chunks
    const chunks = chunkText(text, 500, 50);

    //update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });
  } catch (error) {
    console.error(`Error processing document ${documentId}: `, error);

    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
  }
};

// @desc  get all user documents
// @route  GET /api/documents
// @access private

export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.aggregate([
      {
        $match: { userId: new mongoose.Types.ObjectId(req.user._id) },
      },
      {
        $lookup: {
          from: "flashcards",
          localField: "_id",
          foreignField: "documentId",
          as: "flashcardSets",
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "documentId",
          as: "quizzes",
        },
      },
      {
        $addFields: {
          flashcardCount: { $size: "$flashcardSets" },
          quizCount: { $size: "$quizzes" },
        },
      },
      {
        $project: {
          extractedText: 0,
          chunks: 0,
          flashcardSets: 0,
          quizzes: 0,
        },
      },
      {
        $sort: { uploadDate: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};

// @desc  Get single document with chunks
// @route GET /api/documents/:id
// @access private

export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    //check ownership and existence
    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    //get counts of associated flashcards and quizzes
    const flashcardCount = await Flashcard.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });
    const quizCount = await Quiz.countDocuments({
      documentId: document._id,
      userId: req.user._id,
    });

    //update last accessed
    document.lastAccessed = Date.now();
    await document.save();

    //combine document data with counts
    const documentData = document.toObject();
    documentData.flashcardCount = flashcardCount;
    documentData.quizCount = quizCount;

    res.status(200).json({
      success: true,
      data: documentData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc delete document
// @route DELETE /api/documents/:id
// @access private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: "Document not found",
        statusCode: 404,
      });
    }

    //delete file from file system
    await fs.unlink(document.filePath).catch(() => {});

    //delete document
    await document.deleteOne();
    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc  update document title
// @route PUT /api/documents/:id
// @access private

// export const updateDocument = async (req, res, next) => {

// }
