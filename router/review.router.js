
import express from "express";
import reviewController from "../controller/review.controller.js";
import {verifyToken} from "../middelware/auth.middleware.js";




const router = express.Router();


router.post('/',verifyToken,reviewController.createReview);
router.get('/:id',reviewController.getReviewByFilmId)
router.delete('/:id',reviewController.deleteReview)


export default router;