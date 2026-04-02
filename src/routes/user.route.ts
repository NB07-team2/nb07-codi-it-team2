import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middlewares';
import { upload } from '../services/image.service';

const userRouter = Router();

userRouter.post('/', userController.register); 
userRouter.get('/me', authenticate, userController.getMe);
userRouter.patch('/me', authenticate, upload.single('image'), userController.updateMe); 
userRouter.get('/me/likes', authenticate, userController.getFavorites); 
userRouter.delete('/delete', authenticate, userController.deleteMe); 

export default userRouter;