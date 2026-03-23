import { Router } from 'express';
import { getExampleById, getExamples } from '../controllers/exampleController.js';

const exampleRouter = Router()

exampleRouter.get('/', (req, res) => {
    const examples = getExamples();
    res.json(examples);
});

exampleRouter.get('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const example = getExampleById(id);
    if (!example) {
        return res.status(404).json({ message: 'Example not found' });
    }
    res.json(example);
});


export default exampleRouter;