/**
 * Rotas de Contatos
 * 
 * Este arquivo define as rotas relacionadas aos contatos,
 * como listar, criar, atualizar, excluir e importar contatos.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const contactController = require('../controllers/contactController');
const { authenticate } = require('../middlewares/auth');

// Configuração do Multer para upload de arquivos CSV
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'contacts-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceita apenas arquivos CSV
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV são permitidos'));
    }
  }
});

// Todas as rotas de contatos requerem autenticação
router.use(authenticate);

// Rotas para gerenciamento de contatos
router.get('/', contactController.getAllContacts);
router.get('/:id', contactController.getContact);
router.post('/', contactController.createContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);
router.post('/import', upload.single('file'), contactController.importContacts);

module.exports = router;

