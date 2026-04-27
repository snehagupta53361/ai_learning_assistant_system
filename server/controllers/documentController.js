import Document from '../models/Document.js';
import FlashCard from '../models/FlashCard.js';
import Quiz from "../models/Quiz.js";
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { chunkText } from '../utils/textChunker.js';
import fs from 'fs/promises';
import mongoose from 'mongoose';

// @desc         upload PDF document
// @route POST   /api/documents/upload
// access       protect

export const uploadDocument = async (req, res, next) => {
    try {
        
    } catch (error) {
        //clean up file on errror
        if(req.file){
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};


// @desc  get all user documents
// @route  GET /api/documents
// @access private

export const getDocuments = async (req, res, next) => {

}

// @desc  Get single document with chunks
// @route GET /api/documents/:id
// @access private

export const getDocument = async (req, res, next) => {

}

// @desc delete document 
// @route DELETE /api/documents/:id
// @access private
export const deleteDocument = async (req, res, next) => {

}

// @desc  update document
// @route PUT /api/documents/:id
// @access private

export const updateDocument = async (req, res, next) => {
    
}