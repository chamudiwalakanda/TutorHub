import Material from '../models/Material.js';
import fs from 'fs';
import path from 'path';

// GET /api/materials
export async function listMaterials(req, res) {
  const materials = await Material.find({ classGroup: req.classGroupId }).sort({ createdAt: -1 });
  res.json(materials);
}

// POST /api/materials  (teacher only) - multipart/form-data, field name "file"
export async function uploadMaterial(req, res) {
  const { title, subject } = req.body;
  if (!req.file) return res.status(400).json({ message: 'A file is required' });
  if (!title || !subject) return res.status(400).json({ message: 'title and subject are required' });

  const material = await Material.create({
    classGroup: req.classGroupId,
    title,
    subject,
    fileUrl: `/uploads/${req.file.filename}`,
    fileName: req.file.originalname,
    uploadedBy: req.user._id,
  });
  res.status(201).json(material);
}

// DELETE /api/materials/:id  (teacher only)
export async function deleteMaterial(req, res) {
  const material = await Material.findOneAndDelete({ _id: req.params.id, classGroup: req.classGroupId });
  if (!material) return res.status(404).json({ message: 'Material not found' });

  const filePath = path.resolve('src' + material.fileUrl);
  fs.unlink(filePath, () => {}); // best-effort cleanup, ignore errors

  res.json({ message: 'Material deleted' });
}
