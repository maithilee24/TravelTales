import express from "express";

const router = express.Router();

router.get('/test',(req,res) => {
    res.send('Hello from test!');
});

export default router;