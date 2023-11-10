import express from 'express'
//import {getHello} from '../controller/hello.js'
import { signupUser, loginUser, newAccessToken, logoutUser} from '../controller/user-controller.js';
//import { verifyToken } from '../controller/jwt-controller.js';

const router = express.Router();

router.post('/register', signupUser);
router.post('/login', loginUser);
router.post('/refresh-token',  newAccessToken);
router.delete('/logout', logoutUser);


export default router