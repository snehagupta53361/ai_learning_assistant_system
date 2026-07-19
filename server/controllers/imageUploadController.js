import cloudinary from "../config/cloudinary.js";

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

const createPdfPreviewUrl = ({ public_id: publicId, version }) =>
  cloudinary.url(publicId, {
    resource_type: "image",
    type: "upload",
    format: "pdf",
    version,
    secure: true,
  });

const imageUploadController = async (req, res, next) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please provide a PDF in the file field." });
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

    const previewUrl = createPdfPreviewUrl(result);

    console.log({
      message: "PDF uploaded successfully.",
      publicId: result.public_id,
      url: result.secure_url,
      // Use this URL as an iframe/object source in the application.
      previewUrl: previewUrl,
      bytes: result.bytes,
    });

    return res.status(201).json({
      message: "PDF uploaded successfully.",
      publicId: result.public_id,
      url: result.secure_url,
      // Use this URL as an iframe/object source in the application.
      previewUrl: previewUrl,
      bytes: result.bytes,
    });
  } catch (error) {
    next(error);
  }
};

export { imageUploadController };
