/**
 * Rotas de WhatsApp
 * 
 * Este arquivo define as rotas para operações relacionadas ao WhatsApp,
 * como iniciar sessões, enviar mensagens e gerenciar conexões.
 */

const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');
const authMiddleware = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../src/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Todas as rotas de WhatsApp requerem autenticação
router.use(authMiddleware);

// Rota para iniciar uma sessão do WhatsApp
router.post('/session/init', whatsappController.initSession);

// Rota para verificar o status da sessão do WhatsApp
router.get('/session/status', whatsappController.checkSessionStatus);

// Rota para fechar a sessão do WhatsApp
router.post('/session/close', whatsappController.closeSession);

// Rota para enviar uma mensagem de texto
router.post('/send/text', whatsappController.sendText);

// Rota para enviar uma mensagem com mídia
router.post('/send/media', upload.single('media'), whatsappController.sendMedia);

// Rota para enviar uma mensagem com botões
router.post('/send/buttons', whatsappController.sendButtons);

// Rota para obter informações do perfil
router.get('/profile', whatsappController.getProfileInfo);

module.exports = router;

