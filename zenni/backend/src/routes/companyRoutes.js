/**
 * Rotas de Empresas
 * 
 * Este arquivo define as rotas relacionadas às empresas,
 * como obter, atualizar e gerenciar configurações da empresa.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const companyController = require('../controllers/companyController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'logo-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB por padrão
  },
  fileFilter: (req, file, cb) => {
    // Aceita apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Todas as rotas de empresas requerem autenticação
router.use(authenticate);

// Rotas para gerenciamento da empresa
router.get('/', companyController.getCompany);
router.put('/', isAdmin, companyController.updateCompany);
router.post('/logo', isAdmin, upload.single('logo'), companyController.uploadLogo);
router.delete('/logo', isAdmin, companyController.removeLogo);

module.exports = router;

