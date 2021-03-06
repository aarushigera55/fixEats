import * as express from 'express';
import * as constants from './utils/constants';
import { FoodClassificationService } from './service/FoodClassificationService';
import { FoodPredictionServiceClient } from './service/client/FoodPredictionServiceClient';
import { HttpClient } from './utils/httpClient';
import * as cors from 'cors';

const httpClient = new HttpClient({
    baseURL: constants.CUSTOM_VISION_URL,
    headers: {
        ...constants.DEFAULT_HEADERS,
        [constants.CUSTOM_VISION_KEY_HEADER_NAME]: constants.CUSTOM_VISION_KEY_HEADER_VALUE,
    }
});
const foodPredictionServiceClient = new FoodPredictionServiceClient(httpClient);
const foodClassificationService = new FoodClassificationService(foodPredictionServiceClient);

const app: express.Application = express();

app.set('port', 5000);
app.use(express.json()); // data serializer for PUT/POST requests
// app.use(cors());
// @ts-ignore
app.use(function (req, res, next) {
    res.header('Content-Type', 'application/json');
    next();
});

// router
const router: express.Router = express.Router();

// options for cors midddleware
const options: cors.CorsOptions = {
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'X-Access-Token'],
    credentials: true,
    methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
    origin: 'http://localhost:3000',
    preflightContinue: false
};

// use cors middleware
router.use(cors(options));

router.route('/classifyFood').post(async (request, response) => {
    return response.end(JSON.stringify(await foodClassificationService.classifyFoodBasedOnImage(request.body)));
});
// @ts-ignore
router.route('/').get((request, response) => {
    return response.end('Hello, welcome to fixEats!');
});
// enable pre-flight
router.options('*', cors(options));

app.use('/', router);

// initialize app
app.listen(app.get('port'), () => {
    console.log(`Server started on http://localhost:${app.get('port')}`);
});