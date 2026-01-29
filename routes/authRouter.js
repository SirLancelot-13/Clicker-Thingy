const authController=require('../controllers/authController.js');
const {Router}=require('express');
const router=Router();
router.get('/google',authController.AuthenticateUser);
router.get('/google/callback',authController.otherThingy);

module.exports=router;